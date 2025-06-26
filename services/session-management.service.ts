import { supabase } from '@/lib/supabase/client';
import { SecurityMonitoringService } from './security-monitoring.service';
import { SecurityEvent } from '@/types';

export interface DeviceInfo {
  fingerprint: string;
  name: string;
  platform: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
}

export interface SessionConfig {
  autoLockTimeout: number; // milliseconds
  maxConcurrentSessions: number;
  requireDeviceVerification: boolean;
  trackLocation: boolean;
  enableSuspiciousActivityDetection: boolean;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  device_fingerprint: string;
  device_name: string;
  device_info: DeviceInfo;
  ip_address?: string;
  user_agent?: string;
  location_info?: Record<string, any>;
  is_active: boolean;
  last_activity: string;
  auto_lock_timeout: number;
  created_at: string;
  expires_at?: string;
  terminated_at?: string;
  termination_reason?: string;
}

/**
 * Advanced Session Management Service
 * Handles multi-device sessions, configurable timeouts, and security monitoring
 */
export class SessionManagementService {
  private static readonly DEFAULT_CONFIG: SessionConfig = {
    autoLockTimeout: 15 * 60 * 1000, // 15 minutes
    maxConcurrentSessions: 5,
    requireDeviceVerification: false,
    trackLocation: false,
    enableSuspiciousActivityDetection: true
  };

  private static currentSession: UserSession | null = null;
  private static sessionTimeoutId: NodeJS.Timeout | null = null;
  private static activityCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize a new user session
   */
  static async initializeSession(
    userId: string,
    config?: Partial<SessionConfig>
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const sessionConfig = { ...this.DEFAULT_CONFIG, ...config };
      const deviceInfo = this.getDeviceInfo();
      const sessionId = this.generateSessionId();

      // Check for existing active sessions
      const activeSessions = await this.getActiveSessions(userId);
      
      // Enforce concurrent session limit
      if (activeSessions.length >= sessionConfig.maxConcurrentSessions) {
        // Terminate oldest session
        const oldestSession = activeSessions
          .sort((a, b) => new Date(a.last_activity).getTime() - new Date(b.last_activity).getTime())[0];
        
        await this.terminateSession(oldestSession.session_id, 'concurrent_limit_exceeded');
      }

      // Create new session record
      const sessionData: Omit<UserSession, 'id'> = {
        user_id: userId,
        session_id: sessionId,
        device_fingerprint: deviceInfo.fingerprint,
        device_name: deviceInfo.name,
        device_info: deviceInfo,
        ip_address: await this.getClientIP(),
        user_agent: this.getUserAgent(),
        location_info: await this.getLocationInfo(),
        is_active: true,
        last_activity: new Date().toISOString(),
        auto_lock_timeout: sessionConfig.autoLockTimeout,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString() // 24 hours
      };

      const { data, error } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create session:', error);
        return { success: false, error: error.message };
      }

      this.currentSession = data;
      this.setupSessionMonitoring(sessionConfig);

      // Log security event
      await SecurityMonitoringService.logSecurityEvent(
        userId,
        SecurityEvent.LOGIN,
        {
          session_id: sessionId,
          device_fingerprint: deviceInfo.fingerprint,
          device_name: deviceInfo.name
        },
        'low'
      );

      return { success: true, session: data };
    } catch (err) {
      console.error('Session initialization error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to initialize session'
      };
    }
  }

  /**
   * Update session activity
   */
  static async updateActivity(
    sessionId?: string,
    activityType: string = 'general',
    activityData?: Record<string, any>
  ): Promise<void> {
    try {
      const targetSessionId = sessionId || this.currentSession?.session_id;
      if (!targetSessionId || !supabase) return;

      const now = new Date().toISOString();

      // Update session last activity
      await supabase
        .from('user_sessions')
        .update({ last_activity: now })
        .eq('session_id', targetSessionId);

      // Log activity
      await supabase
        .from('session_activities')
        .insert({
          user_id: this.currentSession?.user_id,
          session_id: targetSessionId,
          activity_type: activityType,
          activity_data: activityData || {},
          device_info: this.currentSession?.device_info || {},
          ip_address: await this.getClientIP(),
          user_agent: this.getUserAgent(),
          timestamp: now
        });

      // Update current session if it matches
      if (this.currentSession && this.currentSession.session_id === targetSessionId) {
        this.currentSession.last_activity = now;
      }

      // Track activity in security monitoring
      if (this.currentSession?.user_id) {
        SecurityMonitoringService.trackSessionActivity(
          this.currentSession.user_id,
          activityType,
          activityData
        );
      }

      // Reset auto-lock timer
      this.resetAutoLockTimer();
    } catch (err) {
      console.error('Failed to update session activity:', err);
    }
  }

  /**
   * Get all active sessions for user
   */
  static async getActiveSessions(userId: string): Promise<UserSession[]> {
    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Failed to fetch active sessions:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to get active sessions:', err);
      return [];
    }
  }

  /**
   * Terminate a specific session
   */
  static async terminateSession(
    sessionId: string,
    reason: string = 'user_logout'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          terminated_at: now,
          termination_reason: reason
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Failed to terminate session:', error);
        return { success: false, error: error.message };
      }

      // If terminating current session, clear local state
      if (this.currentSession?.session_id === sessionId) {
        this.clearCurrentSession();
      }

      // Log security event
      if (this.currentSession?.user_id) {
        await SecurityMonitoringService.logSecurityEvent(
          this.currentSession.user_id,
          SecurityEvent.LOGOUT,
          {
            session_id: sessionId,
            termination_reason: reason
          },
          'low'
        );
      }

      return { success: true };
    } catch (err) {
      console.error('Session termination error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to terminate session'
      };
    }
  }

  /**
   * Terminate all sessions for user (except current)
   */
  static async terminateAllOtherSessions(
    userId: string,
    keepCurrentSession: boolean = true
  ): Promise<{ success: boolean; terminatedCount: number; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const currentSessionId = this.currentSession?.session_id;
      const now = new Date().toISOString();

      let query = supabase
        .from('user_sessions')
        .update({
          is_active: false,
          terminated_at: now,
          termination_reason: 'terminated_by_user'
        })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Exclude current session if requested
      if (keepCurrentSession && currentSessionId) {
        query = query.neq('session_id', currentSessionId);
      }

      const { data, error } = await query.select();

      if (error) {
        console.error('Failed to terminate sessions:', error);
        return { success: false, terminatedCount: 0, error: error.message };
      }

      const terminatedCount = data?.length || 0;

      // Log security event
      await SecurityMonitoringService.logSecurityEvent(
        userId,
        SecurityEvent.LOGOUT,
        {
          action: 'terminate_all_sessions',
          terminated_count: terminatedCount,
          kept_current: keepCurrentSession
        },
        'medium'
      );

      return { success: true, terminatedCount };
    } catch (err) {
      console.error('Failed to terminate all sessions:', err);
      return {
        success: false,
        terminatedCount: 0,
        error: err instanceof Error ? err.message : 'Failed to terminate sessions'
      };
    }
  }

  /**
   * Check if session is valid and active
   */
  static async validateSession(sessionId: string): Promise<{
    isValid: boolean;
    session?: UserSession;
    reason?: string;
  }> {
    try {
      if (!supabase) {
        return { isValid: false, reason: 'Supabase not initialized' };
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isValid: false, reason: 'Session not found or inactive' };
      }

      const session = data as UserSession;
      const now = Date.now();
      const lastActivity = new Date(session.last_activity).getTime();
      const timeSinceActivity = now - lastActivity;

      // Check if session has expired due to inactivity
      if (timeSinceActivity > session.auto_lock_timeout) {
        await this.terminateSession(sessionId, 'auto_expired_inactivity');
        return { isValid: false, reason: 'Session expired due to inactivity' };
      }

      // Check if session has expired absolutely
      if (session.expires_at && new Date(session.expires_at).getTime() < now) {
        await this.terminateSession(sessionId, 'auto_expired_absolute');
        return { isValid: false, reason: 'Session expired' };
      }

      return { isValid: true, session };
    } catch (err) {
      console.error('Session validation error:', err);
      return { isValid: false, reason: 'Validation error' };
    }
  }

  /**
   * Update session configuration
   */
  static async updateSessionConfig(
    userId: string,
    config: Partial<SessionConfig>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Update current session timeout if specified
      if (config.autoLockTimeout && this.currentSession) {
        const { error } = await supabase
          .from('user_sessions')
          .update({ auto_lock_timeout: config.autoLockTimeout })
          .eq('session_id', this.currentSession.session_id);

        if (error) {
          console.error('Failed to update session config:', error);
          return { success: false, error: error.message };
        }

        this.currentSession.auto_lock_timeout = config.autoLockTimeout;
        this.resetAutoLockTimer();
      }

      // Log security event
      await SecurityMonitoringService.logSecurityEvent(
        userId,
        SecurityEvent.UNLOCK, // Using generic event for config changes
        {
          action: 'session_config_update',
          config_changes: config
        },
        'low'
      );

      return { success: true };
    } catch (err) {
      console.error('Failed to update session config:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update session config'
      };
    }
  }

  /**
   * Get current session info
   */
  static getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  /**
   * Get session statistics for user
   */
  static async getSessionStatistics(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    devicesUsed: number;
    lastActivity: string | null;
    averageSessionDuration: number;
  }> {
    try {
      if (!supabase) {
        return {
          totalSessions: 0,
          activeSessions: 0,
          devicesUsed: 0,
          lastActivity: null,
          averageSessionDuration: 0
        };
      }

      const [sessionsResult, activesResult] = await Promise.all([
        supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
      ]);

      const allSessions = sessionsResult.data || [];
      const activeSessions = activesResult.data || [];

      const uniqueDevices = new Set(
        allSessions.map(session => session.device_fingerprint)
      ).size;

      const lastActivity = allSessions.length > 0 
        ? allSessions[0].last_activity 
        : null;

      // Calculate average session duration for completed sessions
      const completedSessions = allSessions.filter(s => s.terminated_at);
      const averageSessionDuration = completedSessions.length > 0
        ? completedSessions.reduce((sum, session) => {
            const start = new Date(session.created_at).getTime();
            const end = new Date(session.terminated_at!).getTime();
            return sum + (end - start);
          }, 0) / completedSessions.length
        : 0;

      return {
        totalSessions: allSessions.length,
        activeSessions: activeSessions.length,
        devicesUsed: uniqueDevices,
        lastActivity,
        averageSessionDuration
      };
    } catch (err) {
      console.error('Failed to get session statistics:', err);
      return {
        totalSessions: 0,
        activeSessions: 0,
        devicesUsed: 0,
        lastActivity: null,
        averageSessionDuration: 0
      };
    }
  }

  /**
   * Setup session monitoring and auto-lock
   */
  private static setupSessionMonitoring(config: SessionConfig): void {
    this.clearSessionMonitoring();

    // Setup auto-lock timer
    this.resetAutoLockTimer();

    // Setup periodic activity checking
    this.activityCheckInterval = setInterval(() => {
      this.checkSessionHealth();
    }, 60000); // Check every minute

    // Setup activity listeners
    if (typeof window !== 'undefined') {
      const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleActivity = () => {
        this.updateActivity('user_interaction');
      };

      // Debounced activity handler
      let activityTimeout: NodeJS.Timeout;
      const debouncedActivityHandler = () => {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(handleActivity, 30000); // Update every 30 seconds of activity
      };

      activityEvents.forEach(event => {
        document.addEventListener(event, debouncedActivityHandler, { passive: true });
      });

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        this.clearCurrentSession();
      });

      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.updateActivity('tab_hidden');
        } else {
          this.updateActivity('tab_visible');
        }
      });
    }
  }

  /**
   * Reset auto-lock timer
   */
  private static resetAutoLockTimer(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    if (this.currentSession) {
      this.sessionTimeoutId = setTimeout(() => {
        this.autoLockSession();
      }, this.currentSession.auto_lock_timeout);
    }
  }

  /**
   * Auto-lock session due to inactivity
   */
  private static async autoLockSession(): Promise<void> {
    if (this.currentSession) {
      await this.terminateSession(this.currentSession.session_id, 'auto_locked_inactivity');
      
      // Emit event for UI to react
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sessionAutoLocked', {
          detail: { reason: 'inactivity' }
        }));
      }
    }
  }

  /**
   * Check session health and validity
   */
  private static async checkSessionHealth(): Promise<void> {
    if (!this.currentSession) return;

    const validation = await this.validateSession(this.currentSession.session_id);
    
    if (!validation.isValid) {
      this.clearCurrentSession();
      
      // Emit event for UI to react
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sessionInvalidated', {
          detail: { reason: validation.reason }
        }));
      }
    }
  }

  /**
   * Clear current session and monitoring
   */
  private static clearCurrentSession(): void {
    this.currentSession = null;
    this.clearSessionMonitoring();
  }

  /**
   * Clear session monitoring timers
   */
  private static clearSessionMonitoring(): void {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }

    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  /**
   * Helper methods for device and environment info
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private static getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        fingerprint: 'server-side',
        name: 'Server',
        platform: 'server',
        userAgent: 'server',
        screenResolution: '0x0',
        timezone: 'UTC',
        language: 'en'
      };
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 10, 10);
    const canvasFingerprint = canvas.toDataURL();

    const fingerprint = btoa(
      navigator.userAgent + 
      navigator.language + 
      screen.width + 'x' + screen.height + 
      canvasFingerprint
    ).substring(0, 32);

    return {
      fingerprint,
      name: this.generateDeviceName(),
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }

  private static generateDeviceName(): string {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('win')) return 'Windows PC';
    if (platform.includes('mac')) return 'Mac';
    if (platform.includes('linux')) return 'Linux PC';
    if (userAgent.includes('iphone')) return 'iPhone';
    if (userAgent.includes('ipad')) return 'iPad';
    if (userAgent.includes('android')) return 'Android Device';
    
    return 'Unknown Device';
  }

  private static async getClientIP(): Promise<string | undefined> {
    // In a real application, you'd get this from your server
    return 'client-side-unknown';
  }

  private static getUserAgent(): string | undefined {
    return typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
  }

  private static async getLocationInfo(): Promise<Record<string, any> | undefined> {
    // In a real application, you might use a geolocation service
    // For now, return basic timezone info
    if (typeof window === 'undefined') return undefined;

    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      timestamp: Date.now()
    };
  }
} 
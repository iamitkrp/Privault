import { supabase } from '@/lib/supabase/client';
import { SecurityEvent } from '@/types';

export interface SecurityEventLog {
  id?: string;
  user_id: string;
  event_type: SecurityEvent;
  event_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
}

export interface SecurityAlert {
  id?: string;
  user_id: string;
  alert_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface FailedAttempt {
  user_id: string;
  attempt_type: 'login' | 'vault_unlock' | 'password_change';
  timestamp: number;
  ip_address?: string;
  user_agent?: string;
}

export interface SessionActivity {
  user_id: string;
  session_start: number;
  last_activity: number;
  activities: Array<{
    type: string;
    timestamp: number;
    details?: Record<string, any>;
  }>;
  device_info?: Record<string, any>;
}

/**
 * Security Monitoring Service
 * Comprehensive security event tracking and threat detection
 */
export class SecurityMonitoringService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 10;
  
  // In-memory cache for performance
  private static failedAttemptsCache = new Map<string, FailedAttempt[]>();
  private static sessionActivities = new Map<string, SessionActivity>();

  /**
   * Log a security event
   */
  static async logSecurityEvent(
    userId: string,
    eventType: SecurityEvent,
    eventData: Record<string, any> = {},
    severity: SecurityEventLog['severity'] = 'low'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const securityEvent: Omit<SecurityEventLog, 'id'> = {
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        ip_address: await this.getClientIP(),
        user_agent: this.getUserAgent(),
        timestamp: new Date().toISOString(),
        severity,
        source: 'client'
      };

      const { error } = await supabase
        .from('security_events')
        .insert(securityEvent);

      if (error) {
        console.error('Failed to log security event:', error);
        return { success: false, error: error.message };
      }

      // Check for suspicious patterns
      await this.analyzeSuspiciousActivity(userId, eventType, eventData);

      return { success: true };
    } catch (err) {
      console.error('Security event logging error:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to log security event' 
      };
    }
  }

  /**
   * Record a failed attempt
   */
  static recordFailedAttempt(
    userId: string,
    attemptType: FailedAttempt['attempt_type'],
    additionalData?: Record<string, any>
  ): void {
    const now = Date.now();
    const failedAttempt: FailedAttempt = {
      user_id: userId,
      attempt_type: attemptType,
      timestamp: now,
      ip_address: this.getClientIPSync(),
      user_agent: this.getUserAgent()
    };

    // Get existing attempts for this user
    const userAttempts = this.failedAttemptsCache.get(userId) || [];
    
    // Clean old attempts (older than lockout duration)
    const recentAttempts = userAttempts.filter(
      attempt => now - attempt.timestamp < this.LOCKOUT_DURATION
    );

    // Add new attempt
    recentAttempts.push(failedAttempt);
    this.failedAttemptsCache.set(userId, recentAttempts);

    // Log the security event
    this.logSecurityEvent(
      userId,
      SecurityEvent.FAILED_UNLOCK_ATTEMPT,
      {
        attempt_type: attemptType,
        attempt_count: recentAttempts.length,
        ...additionalData
      },
      recentAttempts.length >= this.MAX_FAILED_ATTEMPTS ? 'high' : 'medium'
    );

    // Check if user should be locked out
    if (recentAttempts.length >= this.MAX_FAILED_ATTEMPTS) {
      this.triggerSecurityAlert(
        userId,
        'account_lockout',
        `Account locked due to ${this.MAX_FAILED_ATTEMPTS} failed ${attemptType} attempts`,
        'high'
      );
    }
  }

  /**
   * Check if user is currently locked out
   */
  static isUserLockedOut(userId: string): boolean {
    const userAttempts = this.failedAttemptsCache.get(userId) || [];
    const now = Date.now();

    // Clean old attempts
    const recentAttempts = userAttempts.filter(
      attempt => now - attempt.timestamp < this.LOCKOUT_DURATION
    );

    this.failedAttemptsCache.set(userId, recentAttempts);

    return recentAttempts.length >= this.MAX_FAILED_ATTEMPTS;
  }

  /**
   * Clear failed attempts (on successful authentication)
   */
  static clearFailedAttempts(userId: string): void {
    this.failedAttemptsCache.delete(userId);
    
    this.logSecurityEvent(
      userId,
      SecurityEvent.LOGIN,
      { cleared_failed_attempts: true },
      'low'
    );
  }

  /**
   * Get lockout info for user
   */
  static getLockoutInfo(userId: string): {
    isLockedOut: boolean;
    attemptCount: number;
    timeRemaining: number;
  } {
    const userAttempts = this.failedAttemptsCache.get(userId) || [];
    const now = Date.now();

    const recentAttempts = userAttempts.filter(
      attempt => now - attempt.timestamp < this.LOCKOUT_DURATION
    );

    const isLockedOut = recentAttempts.length >= this.MAX_FAILED_ATTEMPTS;
    const timeRemaining = isLockedOut && recentAttempts.length > 0
      ? Math.max(0, this.LOCKOUT_DURATION - (now - recentAttempts[0].timestamp))
      : 0;

    return {
      isLockedOut,
      attemptCount: recentAttempts.length,
      timeRemaining
    };
  }

  /**
   * Track session activity
   */
  static trackSessionActivity(
    userId: string,
    activityType: string,
    details?: Record<string, any>
  ): void {
    const now = Date.now();
    let session = this.sessionActivities.get(userId);

    if (!session) {
      session = {
        user_id: userId,
        session_start: now,
        last_activity: now,
        activities: [],
        device_info: this.getDeviceInfo()
      };
    }

    session.last_activity = now;
    session.activities.push({
      type: activityType,
      timestamp: now,
      details
    });

    // Keep only last 100 activities for performance
    if (session.activities.length > 100) {
      session.activities = session.activities.slice(-100);
    }

    this.sessionActivities.set(userId, session);

    // Log significant activities
    if (this.isSignificantActivity(activityType)) {
      this.logSecurityEvent(
        userId,
        this.getSecurityEventForActivity(activityType),
        { activity_type: activityType, ...details },
        'low'
      );
    }
  }

  /**
   * Get session activity for user
   */
  static getSessionActivity(userId: string): SessionActivity | null {
    return this.sessionActivities.get(userId) || null;
  }

  /**
   * Clear session activity
   */
  static clearSessionActivity(userId: string): void {
    this.sessionActivities.delete(userId);
    
    this.logSecurityEvent(
      userId,
      SecurityEvent.LOGOUT,
      { session_cleared: true },
      'low'
    );
  }

  /**
   * Create security alert
   */
  static async triggerSecurityAlert(
    userId: string,
    alertType: string,
    description: string,
    severity: SecurityAlert['severity']
  ): Promise<void> {
    try {
      if (!supabase) {
        console.warn('Cannot create security alert - Supabase not initialized');
        return;
      }

      const alert: Omit<SecurityAlert, 'id'> = {
        user_id: userId,
        alert_type: alertType,
        description,
        severity,
        is_resolved: false,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('security_alerts')
        .insert(alert);

      if (error) {
        console.error('Failed to create security alert:', error);
      }

      // Log the alert creation
      await this.logSecurityEvent(
        userId,
        SecurityEvent.UNLOCK, // Using generic event for alerts
        {
          alert_type: alertType,
          alert_description: description,
          alert_severity: severity
        },
        severity
      );

      console.warn(`🚨 Security Alert [${severity.toUpperCase()}]: ${alertType} - ${description}`);
    } catch (err) {
      console.error('Failed to trigger security alert:', err);
    }
  }

  /**
   * Get recent security events for user
   */
  static async getSecurityEvents(
    userId: string,
    limit: number = 50
  ): Promise<SecurityEventLog[]> {
    try {
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch security events:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to get security events:', err);
      return [];
    }
  }

  /**
   * Get active security alerts for user
   */
  static async getActiveAlerts(userId: string): Promise<SecurityAlert[]> {
    try {
      if (!supabase) {
        return [];
      }

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch security alerts:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to get security alerts:', err);
      return [];
    }
  }

  /**
   * Analyze suspicious activity patterns
   */
  private static async analyzeSuspiciousActivity(
    userId: string,
    eventType: SecurityEvent,
    eventData: Record<string, any>
  ): Promise<void> {
    // Get recent events for pattern analysis
    const recentEvents = await this.getSecurityEvents(userId, 20);
    
    // Check for rapid-fire events (potential bot activity)
    const last5Minutes = Date.now() - (5 * 60 * 1000);
    const recentEventCount = recentEvents.filter(
      event => new Date(event.timestamp).getTime() > last5Minutes
    ).length;

    if (recentEventCount > this.SUSPICIOUS_ACTIVITY_THRESHOLD) {
      await this.triggerSecurityAlert(
        userId,
        'suspicious_activity',
        `Unusual activity detected: ${recentEventCount} events in 5 minutes`,
        'medium'
      );
    }

    // Check for unusual IP address changes
    const uniqueIPs = new Set(
      recentEvents
        .filter(event => event.ip_address)
        .map(event => event.ip_address)
    );

    if (uniqueIPs.size > 3) {
      await this.triggerSecurityAlert(
        userId,
        'multiple_ip_addresses',
        `Access from ${uniqueIPs.size} different IP addresses detected`,
        'medium'
      );
    }

    // Check for failed attempts followed by success (potential brute force)
    const hasRecentFailures = recentEvents.some(
      event => event.event_type === SecurityEvent.FAILED_UNLOCK_ATTEMPT
    );
    
    if (hasRecentFailures && eventType === SecurityEvent.UNLOCK) {
      await this.triggerSecurityAlert(
        userId,
        'successful_after_failures',
        'Successful vault unlock after recent failed attempts',
        'medium'
      );
    }
  }

  /**
   * Helper methods
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // In a real application, you'd get this from your server
      // For client-side, we can't reliably get the real IP
      return 'client-side-unknown';
    } catch {
      return undefined;
    }
  }

  private static getClientIPSync(): string | undefined {
    return 'client-side-unknown';
  }

  private static getUserAgent(): string | undefined {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent;
    }
    return undefined;
  }

  private static getDeviceInfo(): Record<string, any> {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    };
  }

  private static isSignificantActivity(activityType: string): boolean {
    const significantActivities = [
      'vault_unlock',
      'vault_lock',
      'password_create',
      'password_update',
      'password_delete',
      'vault_export',
      'vault_import',
      'password_change'
    ];
    return significantActivities.includes(activityType);
  }

  private static getSecurityEventForActivity(activityType: string): SecurityEvent {
    switch (activityType) {
      case 'vault_unlock':
        return SecurityEvent.UNLOCK;
      case 'vault_lock':
        return SecurityEvent.LOCK;
      case 'password_change':
        return SecurityEvent.MASTER_PASSWORD_CHANGE;
      default:
        return SecurityEvent.UNLOCK; // Generic fallback
    }
  }

  /**
   * Generate security report for user
   */
  static async generateSecurityReport(userId: string): Promise<{
    events: SecurityEventLog[];
    alerts: SecurityAlert[];
    sessionInfo: SessionActivity | null;
    lockoutInfo: ReturnType<typeof SecurityMonitoringService.getLockoutInfo>;
    summary: {
      totalEvents: number;
      activeAlerts: number;
      lastActivity: string | null;
      riskLevel: 'low' | 'medium' | 'high';
    };
  }> {
    const [events, alerts] = await Promise.all([
      this.getSecurityEvents(userId, 100),
      this.getActiveAlerts(userId)
    ]);

    const sessionInfo = this.getSessionActivity(userId);
    const lockoutInfo = this.getLockoutInfo(userId);

    // Calculate risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high' || alert.severity === 'critical').length;
    const recentFailures = events.filter(
      event => event.event_type === SecurityEvent.FAILED_UNLOCK_ATTEMPT &&
      new Date(event.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    ).length;

    if (highSeverityAlerts > 0 || lockoutInfo.isLockedOut) {
      riskLevel = 'high';
    } else if (alerts.length > 2 || recentFailures > 3) {
      riskLevel = 'medium';
    }

    return {
      events,
      alerts,
      sessionInfo,
      lockoutInfo,
      summary: {
        totalEvents: events.length,
        activeAlerts: alerts.length,
        lastActivity: sessionInfo ? new Date(sessionInfo.last_activity).toISOString() : null,
        riskLevel
      }
    };
  }
} 
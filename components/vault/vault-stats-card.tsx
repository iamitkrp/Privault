'use client';

import type { VaultStats } from '@/types';

interface VaultStatsCardProps {
  stats: VaultStats;
  className?: string;
}

export default function VaultStatsCard({ stats, className = '' }: VaultStatsCardProps) {
  const getStrengthColor = (average: number) => {
    if (average >= 3.5) return 'text-green-700 bg-gradient-to-br from-green-100 to-green-50';
    if (average >= 2.5) return 'text-blue-700 bg-gradient-to-br from-blue-100 to-blue-50';
    if (average >= 1.5) return 'text-yellow-700 bg-gradient-to-br from-yellow-100 to-yellow-50';
    return 'text-red-700 bg-gradient-to-br from-red-100 to-red-50';
  };

  const getHealthScore = () => {
    const weakPenalty = (stats.weakPasswords / Math.max(stats.totalPasswords, 1)) * 30;
    const reusedPenalty = (stats.reusedPasswords / Math.max(stats.totalPasswords, 1)) * 25;
    const oldPenalty = (stats.oldPasswords / Math.max(stats.totalPasswords, 1)) * 20;
    const strengthBonus = stats.averagePasswordStrength * 25;
    
    return Math.max(0, Math.min(100, strengthBonus - weakPenalty - reusedPenalty - oldPenalty));
  };

  const healthScore = getHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-white/20 p-8 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-light text-gray-900">Vault <span className="font-medium">Overview</span></h3>
        <div className="flex items-center bg-white/50 backdrop-blur-lg rounded-2xl px-4 py-2 border border-white/30">
          <span className="text-sm text-gray-600 mr-3 font-medium">Health Score</span>
          <span className={`text-xl font-medium ${getHealthColor(healthScore)}`}>
            {Math.round(healthScore)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Total Passwords */}
        <div className="text-center group">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-105 transition-transform duration-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-3xl font-light text-gray-900 mb-1">{stats.totalPasswords}</p>
          <p className="text-sm text-gray-600 font-medium">Total</p>
        </div>

        {/* Weak Passwords */}
        <div className="text-center group">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-105 transition-transform duration-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-3xl font-light text-red-600 mb-1">{stats.weakPasswords}</p>
          <p className="text-sm text-gray-600 font-medium">Weak</p>
        </div>

        {/* Reused Passwords */}
        <div className="text-center group">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-105 transition-transform duration-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-light text-orange-600 mb-1">{stats.reusedPasswords}</p>
          <p className="text-sm text-gray-600 font-medium">Reused</p>
        </div>

        {/* Old Passwords */}
        <div className="text-center group">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-105 transition-transform duration-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-light text-yellow-600 mb-1">{stats.oldPasswords}</p>
          <p className="text-sm text-gray-600 font-medium">Old (90+ days)</p>
        </div>
      </div>

      {/* Password Strength Average */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-medium text-gray-700">Average Password Strength</span>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStrengthColor(stats.averagePasswordStrength)}`}>
            {stats.averagePasswordStrength.toFixed(1)}/4.0
          </span>
        </div>
        <div className="w-full bg-gray-200/50 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${(stats.averagePasswordStrength / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      {(stats.weakPasswords > 0 || stats.reusedPasswords > 0 || stats.oldPasswords > 0) && (
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Recommended Actions</h4>
          <ul className="text-sm text-gray-600 space-y-3">
            {stats.weakPasswords > 0 && (
              <li className="flex items-center">
                <span className="w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full mr-3"></span>
                <span className="font-medium">Update {stats.weakPasswords} weak password{stats.weakPasswords > 1 ? 's' : ''}</span>
              </li>
            )}
            {stats.reusedPasswords > 0 && (
              <li className="flex items-center">
                <span className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mr-3"></span>
                <span className="font-medium">Replace {stats.reusedPasswords} reused password{stats.reusedPasswords > 1 ? 's' : ''}</span>
              </li>
            )}
            {stats.oldPasswords > 0 && (
              <li className="flex items-center">
                <span className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mr-3"></span>
                <span className="font-medium">Refresh {stats.oldPasswords} old password{stats.oldPasswords > 1 ? 's' : ''}</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentlyAdded > 0 && (
        <div className="mt-6 text-center">
          <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200/50 font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {stats.recentlyAdded} added this week
          </span>
        </div>
      )}
    </div>
  );
} 
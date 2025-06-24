'use client';

import type { VaultStats } from '@/types';

interface VaultStatsCardProps {
  stats: VaultStats;
  className?: string;
}

export default function VaultStatsCard({ stats, className = '' }: VaultStatsCardProps) {
  const getStrengthColor = (average: number) => {
    if (average >= 3.5) return 'text-green-600 bg-green-100';
    if (average >= 2.5) return 'text-blue-600 bg-blue-100';
    if (average >= 1.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vault Overview</h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Health Score:</span>
          <span className={`text-lg font-bold ${getHealthColor(healthScore)}`}>
            {Math.round(healthScore)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Passwords */}
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPasswords}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>

        {/* Weak Passwords */}
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.weakPasswords}</p>
          <p className="text-sm text-gray-600">Weak</p>
        </div>

        {/* Reused Passwords */}
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.reusedPasswords}</p>
          <p className="text-sm text-gray-600">Reused</p>
        </div>

        {/* Old Passwords */}
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.oldPasswords}</p>
          <p className="text-sm text-gray-600">Old (90+ days)</p>
        </div>
      </div>

      {/* Password Strength Average */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Average Password Strength</span>
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${getStrengthColor(stats.averagePasswordStrength)}`}>
            {stats.averagePasswordStrength.toFixed(1)}/4.0
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stats.averagePasswordStrength / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      {(stats.weakPasswords > 0 || stats.reusedPasswords > 0 || stats.oldPasswords > 0) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Actions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {stats.weakPasswords > 0 && (
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Update {stats.weakPasswords} weak password{stats.weakPasswords > 1 ? 's' : ''}
              </li>
            )}
            {stats.reusedPasswords > 0 && (
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Replace {stats.reusedPasswords} reused password{stats.reusedPasswords > 1 ? 's' : ''}
              </li>
            )}
            {stats.oldPasswords > 0 && (
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Refresh {stats.oldPasswords} old password{stats.oldPasswords > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Recent Activity */}
      {stats.recentlyAdded > 0 && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {stats.recentlyAdded} added this week
          </span>
        </div>
      )}
    </div>
  );
} 
/**
 * Health Score Component - Stub
 */

import React from 'react';

export interface HealthScoreProps {
  score: number;
  weakCount: number;
  reusedCount: number;
  expiredCount: number;
}

export const HealthScore: React.FC<HealthScoreProps> = ({
  score,
  weakCount,
  reusedCount,
  expiredCount,
}) => {
  return (
    <div className="p-6 border rounded-lg">
      {/* TODO: Implement health score visualization */}
      <p className="text-muted-foreground">Health Score - To be implemented</p>
      <p className="text-2xl font-bold">{score}/100</p>
    </div>
  );
};


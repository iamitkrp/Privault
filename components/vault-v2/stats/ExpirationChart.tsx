/**
 * Expiration Chart Component - Stub
 */

import React from 'react';

export interface ExpirationChartProps {
  activeCount: number;
  expiringSoonCount: number;
  expiredCount: number;
}

export const ExpirationChart: React.FC<ExpirationChartProps> = ({
  activeCount,
  expiringSoonCount,
  expiredCount,
}) => {
  return (
    <div className="p-6 border rounded-lg">
      {/* TODO: Implement expiration chart */}
      <p className="text-muted-foreground">Expiration Chart - To be implemented</p>
    </div>
  );
};


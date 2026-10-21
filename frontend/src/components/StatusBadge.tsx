import React from 'react';
import { MarketStatus } from '@/lib/contracts/types';

interface StatusBadgeProps {
  status: MarketStatus;
  verdict?: ''| 'YES' | 'NO' | 'INVALID';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, verdict, size = 'sm' }) => {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  if (status === 'open') {
    return (
      <span className={`inline-flex items-center font-sans font-medium rounded-full bg-[#EFECE6] text-[#4A4742] ${sizeClasses}`}>
        OPEN
      </span>
    );
  }

  if (status === 'resolved') {
    return (
      <span className={`inline-flex items-center font-sans font-medium rounded-full bg-[#FFF5E6] text-[#B85C00] border border-[#FFE6BF] ${sizeClasses}`}>
        RESOLVED {verdict ? `(${verdict})` : ''}
      </span>
    );
  }

  if (status === 'finalized') {
    if (verdict === 'INVALID') {
      return (
        <span className={`inline-flex items-center font-sans font-medium rounded-full bg-[#FDF2F2] text-[#B91C1C] border border-[#FECACA] ${sizeClasses}`}>
          FINALIZED (INVALID)
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center font-sans font-medium rounded-full bg-[#EEF8F1] text-[#166534] border border-[#D0F0DB] ${sizeClasses}`}>
        FINALIZED {verdict ? `(${verdict})` : ''}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-sans font-medium rounded-full bg-[#FDF2F2] text-[#B91C1C] border border-[#FECACA] ${sizeClasses}`}>
      INVALID
    </span>
  );
};

export const VerdictTag: React.FC<{ verdict: 'YES' | 'NO' | 'INVALID'; size?: 'sm' | 'md' }> = ({ verdict, size = 'sm' }) => {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  if (verdict === 'YES') {
    return (
      <span className={`inline-flex items-center font-sans font-bold rounded-full bg-[#121212] text-white ${sizeClasses}`}>
        YES
      </span>
    );
  }
  if (verdict === 'NO') {
    return (
      <span className={`inline-flex items-center font-sans font-bold rounded-full bg-[#121212] text-white ${sizeClasses}`}>
        NO
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center font-sans font-bold rounded-full bg-[#FFF5E6] text-[#B85C00] border border-[#FFE6BF] ${sizeClasses}`}>
      INVALID
    </span>
  );
};

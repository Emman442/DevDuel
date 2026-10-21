import React, { useState } from 'react';
import { Market } from '@/lib/contracts/types';
import { StatusBadge } from './StatusBadge';
import { formatGEN, formatTimeRemaining, truncateUrl } from '../utils/format';
import { ExternalLink, Copy, Check, ArrowRight, Clock } from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onSelect: (marketId: string) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onSelect }) => {
  const [copied, setCopied] = useState(false);
  const timeInfo = formatTimeRemaining(market.deadline, market.status);
  const isResolvable = timeInfo.isResolvable && market.status === 'open';

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(market.source_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      onClick={() => onSelect(market.market_id)}
      className="group bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#E8E5DF] hover:border-[#D6D2C8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all cursor-pointer"
    >
      {/* Top Meta Row: Status Badge & Deadline / Resolvable */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <StatusBadge
            status={market.status}
            verdict={
              market.verdict === 'YES' ||
              market.verdict === 'NO' ||
              market.verdict === 'INVALID'
                ? market.verdict
                : undefined
            }
          />

          {isResolvable ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5A1F] bg-[#FFF3EE] px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
              Resolvable
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-[#666460] font-medium">
              <Clock className="w-3.5 h-3.5 text-[#949089]" />
              <span>{timeInfo.isPast ? timeInfo.text : `${timeInfo.text} remaining`}</span>
            </span>
          )}
        </div>

        <span className="text-xs text-[#949089] font-mono">
          #{market.market_id.replace('mkt_', '')}
        </span>
      </div>

      {/* Claim Heading (Bold) */}
      <h3 className="font-sans font-bold text-base sm:text-lg text-[#121212] group-hover:text-black leading-snug mb-3 line-clamp-2">
        {market.claim}
      </h3>

      {/* Short Source URL */}
      <div className="flex items-center gap-2 text-xs text-[#666460] mb-5">
        <span className="text-[#949089]">Source:</span>
        <span className="font-mono text-[11px] text-[#121212] bg-[#F7F5F2] px-2 py-0.5 rounded-md truncate max-w-[280px] sm:max-w-md">
          {truncateUrl(market.source_url, 38)}
        </span>
        <button
          onClick={handleCopyUrl}
          className="text-[#949089] hover:text-[#121212] p-0.5 transition-colors cursor-pointer"
          title="Copy source URL"
        >
          {copied ? (
            <span className="text-[11px] text-[#166534] font-medium">Copied</span>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Bottom Row: YES / NO amounts in GEN (simple text, no big bars) + Total Pot + Action */}
      <div className="pt-4 border-t border-[#F0EDE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Simple text amounts for YES & NO pools */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-[#666460]">
          <div>
            <span className="text-[#949089]">YES:</span>{' '}
            <span className="font-bold text-[#121212] tabular-nums">
              {formatGEN(market.yes_pool)}
            </span>
          </div>
          <span className="text-[#D8D4CC]">·</span>
          <div>
            <span className="text-[#949089]">NO:</span>{' '}
            <span className="font-bold text-[#121212] tabular-nums">
              {formatGEN(market.no_pool)}
            </span>
          </div>
          <span className="text-[#D8D4CC]">·</span>
          <div>
            <span className="text-[#949089]">Total:</span>{' '}
            <span className="font-semibold text-[#121212] tabular-nums">
              {formatGEN((market.yes_pool + market.no_pool))}
            </span>
          </div>
        </div>

        {/* Action Button Pill */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-xs font-semibold text-[#121212] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>{isResolvable ? 'Resolve' : 'View'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

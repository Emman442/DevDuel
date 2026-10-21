import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Side } from '@/lib/contracts/types';
import { StatusBadge, VerdictTag } from './StatusBadge';
import {
  formatGEN,
  formatTimeRemaining,
  truncateAddress,
} from '../utils/format';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Clock,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import {
  useMarket,
  useMarketPositions,
  useStake,
  useResolveMarket,
  useFinalizeMarket,
  useDisputeResolution,
} from '@/lib/hooks/useDevDuel';
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/genlayer/client';
import { useWallet } from '@/lib/genlayer/wallet';

interface MarketDetailProps {
  marketId?: string;
  onBack?: () => void;
}

export const MarketDetail: React.FC<MarketDetailProps> = ({
  marketId: propMarketId,
  onBack,
}) => {
  const { marketId: routeMarketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const effectiveMarketId = propMarketId || routeMarketId || null;

  const { data: market } = useMarket(effectiveMarketId);
  const { data: positions = [] } = useMarketPositions(effectiveMarketId);
  const { address } = useWallet();

  const { mutate: stake, isPending: isSubmittingStake } = useStake();
  const { mutate: resolveMarket, isResolving, resolvingMarketId } = useResolveMarket();
  const { mutate: finalizeMarket, isFinalizing } = useFinalizeMarket();

  const [selectedSide, setSelectedSide] = useState<Side>('YES');
  const [stakeAmount, setStakeAmount] = useState<string>('50');
  const [stakeError, setStakeError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCriteria, setCopiedCriteria] = useState(false);

  const { mutate: disputeResolution, isAppealing } = useDisputeResolution();
  const [appealContext, setAppealContext] = useState('');
  const [appealError, setAppealError] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/markets');
  };

  const { data: userBalance = 0 } = useQuery({
    queryKey: ['genBalance', address],
    queryFn: async () => {
      const client = await getClient();
      if (!client || !address) return 0;
      const wei = await client.getBalance({ address: address as `0x${string}` });
      return Number(wei) / 1e18;
    },
    enabled: !!address,
    staleTime: 5000,
  });

  if (!market) {
    return (
      <div className="bg-[#FFFFFF] rounded-2xl p-10 text-center border border-[#E8E5DF] max-w-xl mx-auto my-12 space-y-3">
        <p className="text-base font-semibold text-[#121212]">Market not found</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-full bg-[#121212] text-white text-xs font-semibold cursor-pointer"
        >
          ← Back to Markets
        </button>
      </div>
    );
  }

  const timeInfo = formatTimeRemaining(market.deadline, market.status);
  const isResolvingThis = isResolving && resolvingMarketId === market.market_id;
  const isResolvable = market.status === 'open' && market.deadline > 0 && Date.now() >= market.deadline;
  const parsedStake = parseInt(stakeAmount, 10) || 0;

  const handleStakeSubmit = () => {
    setStakeError(null);
    if (!address) {
      setStakeError('Please connect your wallet first.');
      return;
    }
    if (parsedStake <= 0) {
      setStakeError('Stake amount must be a whole GEN integer ≥ 1.');
      return;
    }
    if (parsedStake > userBalance) {
      setStakeError(`Insufficient balance. You currently hold ${userBalance.toFixed(2)} GEN.`);
      return;
    }
    if (Date.now() >= market.deadline) {
      setStakeError('Market deadline has passed. Staking is closed.');
      return;
    }

    stake(
      { marketId: market.market_id, side: selectedSide, stakeGen: parsedStake },
      {
        onError: (err: any) => {
          setStakeError(err?.message || 'Failed to submit stake.');
        },
      }
    );
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(market.source_url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1600);
  };

  const handleCopyCriteria = () => {
    navigator.clipboard.writeText(market.criteria);
    setCopiedCriteria(true);
    setTimeout(() => setCopiedCriteria(false), 1600);
  };

  const myPositions = positions.filter(
    (p) => p.staker.toLowerCase() === address?.toLowerCase()
  );

  const canAppeal =
    market != null &&
    market.status === 'resolved' &&
    market.appeal_deadline > 0 &&
    Date.now() < market.deadline &&
    myPositions?.length > 0;
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#666460] hover:text-[#121212] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Markets</span>
        </button>
      </div>

      {/* Main card */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={market.status} verdict={market.verdict} size="md" />
            <span className="text-xs text-[#949089] font-mono">
              #{market.market_id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#666460] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#949089]" />
            <span>
              Deadline: {new Date(market.deadline).toUTCString().replace('GMT', 'UTC')}
            </span>
            <span className="font-semibold text-[#121212]">({timeInfo.text})</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121212] font-sans leading-snug">
          {market.claim}
        </h1>

        <div className="p-4 rounded-2xl bg-[#F7F5F2] border border-[#E8E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#949089] font-medium shrink-0">Source URL:</span>
            <a
              href={market.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#121212] font-mono font-medium hover:underline truncate flex items-center gap-1"
            >
              <span className="truncate">{market.source_url}</span>
              <ExternalLink className="w-3 h-3 shrink-0 text-[#949089]" />
            </a>
          </div>

          <button
            onClick={handleCopyUrl}
            className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#EFECE6] text-[11px] font-semibold text-[#121212] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            {copiedUrl ? <Check className="w-3 h-3 text-[#166534]" /> : <Copy className="w-3 h-3 text-[#949089]" />}
            <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">
              Settlement Criteria
            </span>
            <button
              onClick={handleCopyCriteria}
              className="text-xs font-semibold text-[#666460] hover:text-[#121212] cursor-pointer"
            >
              {copiedCriteria ? 'Copied Criteria' : 'Copy'}
            </button>
          </div>
          <div className="p-4 rounded-2xl bg-[#F7F5F2] border border-[#E8E5DF] font-mono text-xs text-[#121212] leading-relaxed whitespace-pre-wrap">
            {market.criteria}
          </div>
          <p className="text-[11px] text-[#949089]">
            The HTTPS source URL is permanently frozen. Validators fetch it directly on resolve.
          </p>
        </div>
      </div>

      {/* Verdict banner */}
      {(market.status === 'resolved' || market.status === 'finalized') && (
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">
                Verdict:
              </span>
              <VerdictTag verdict={market.verdict || 'INVALID'} size="md" />
            </div>

            {market.status === 'resolved' && (
              <span className="text-xs font-semibold text-[#B85C00] bg-[#FFF5E6] px-3 py-1 rounded-full">
                Ready for Finalization
              </span>
            )}

            {canAppeal && (
              <div className="pt-3 border-t border-[#F0EDE8] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#949089]">
                  Appeal this verdict
                </div>
                <textarea
                  rows={3}
                  value={appealContext}
                  onChange={(e) => setAppealContext(e.target.value)}
                  placeholder="Explain why the verdict should be overturned. Reference the source and criteria."
                  className="w-full bg-[#F7F5F2] border border-[#E8E5DF] rounded-2xl p-4 text-xs text-[#121212] placeholder-[#949089] focus:outline-none focus:border-[#121212]"
                />
                {appealError && (
                  <div className="text-xs text-[#B91C1C] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{appealError}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setAppealError(null);
                    if (appealContext.trim().length < 10) {
                      setAppealError('Please give more context (at least 10 characters).');
                      return;
                    }
                    disputeResolution(
                      { marketId: market.market_id, context: appealContext.trim() },
                      {
                        onError: (err: any) => setAppealError(err?.message || 'Appeal failed.'),
                      }
                    );
                  }}
                  disabled={isAppealing}
                  className="px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAppealing ? 'Submitting appeal…' : 'Submit Appeal'}
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-[#4A4742] leading-relaxed">
            {market.reasoning || 'Validator consensus verified the source against criteria.'}
          </p>

          {market.status === 'resolved' && (
            <div className="pt-3 border-t border-[#F0EDE8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#666460]">
                Anyone can call finalize to distribute the winning pool.
              </span>
              <button
                onClick={() => finalizeMarket(market.market_id)}
                disabled={isFinalizing}
                className="px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isFinalizing ? 'Finalizing…' : 'Execute Finalize'}
              </button>
            </div>
          )}
        </div>

      )}

      {/* Resolvable banner */}
      {isResolvable && (
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#FFD5C2] space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-[#FF5A1F] font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
            <span>Market Deadline Reached — Awaiting Resolution</span>
          </div>

          <p className="text-xs text-[#666460] leading-relaxed">
            The deadline has passed. Staking is closed. Anyone can now trigger validators to fetch the frozen source URL and settle.
          </p>

          {isResolvingThis ? (
            <div className="p-4 rounded-2xl bg-[#FFF3EE] border border-[#FFD5C2]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF5A1F]">
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Resolving…</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => resolveMarket(market.market_id)}
              className="px-6 py-3 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <RotateCw className="w-4 h-4" />
              <span>Call Resolve</span>
            </button>
          )}
        </div>
      )}

      {/* YES / NO pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => setSelectedSide('YES')}
          className={`bg-[#FFFFFF] rounded-3xl p-6 border transition-all cursor-pointer space-y-4 ${selectedSide === 'YES'
            ? 'border-[#121212] shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            : 'border-[#E8E5DF] hover:border-[#D6D2C8]'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">Outcome Side</span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${selectedSide === 'YES' ? 'bg-[#121212] text-white' : 'bg-[#F7F5F2] text-[#121212]'
                }`}
            >
              YES
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#121212] tabular-nums">
              {formatGEN(market.yes_pool)}
            </div>
            <div className="text-xs text-[#666460] mt-1">Current YES pool</div>
          </div>
        </div>

        <div
          onClick={() => setSelectedSide('NO')}
          className={`bg-[#FFFFFF] rounded-3xl p-6 border transition-all cursor-pointer space-y-4 ${selectedSide === 'NO'
            ? 'border-[#121212] shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            : 'border-[#E8E5DF] hover:border-[#D6D2C8]'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">Outcome Side</span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${selectedSide === 'NO' ? 'bg-[#121212] text-white' : 'bg-[#F7F5F2] text-[#121212]'
                }`}
            >
              NO
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#121212] tabular-nums">
              {formatGEN(market.no_pool)}
            </div>
            <div className="text-xs text-[#666460] mt-1">Current NO pool</div>
          </div>
        </div>
      </div>

      {/* Stake form */}
      {market.status === 'open' && Date.now() < market.deadline && (
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">Place Stake</span>
            <span className="text-xs text-[#666460]">
              Wallet balance:{' '}
              <span className="font-bold text-[#121212] tabular-nums">{formatGEN(userBalance)}</span>
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={stakeAmount}
                  onChange={(e) => {
                    setStakeAmount(e.target.value);
                    setStakeError(null);
                  }}
                  className={`w-full bg-[#F7F5F2] border rounded-full px-5 py-3 text-sm font-semibold text-[#121212] placeholder-[#949089] focus:outline-none ${stakeError ? 'border-[#B91C1C]' : 'border-[#E8E5DF] focus:border-[#121212]'
                    }`}
                  placeholder="Amount in GEN"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#949089]">GEN</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {[25, 50, 100, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStakeAmount(amt.toString())}
                    className="px-3 py-2 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] border border-[#E8E5DF] text-xs font-semibold text-[#121212] cursor-pointer"
                  >
                    +{amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setStakeAmount(Math.floor(userBalance).toString())}
                  className="px-3 py-2 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] border border-[#E8E5DF] text-xs font-bold text-[#121212] cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {stakeError && (
              <div className="text-xs text-[#B91C1C] flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{stakeError}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleStakeSubmit}
            disabled={isSubmittingStake}
            className="w-full py-3.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmittingStake ? 'Submitting Stake…' : `Stake ${parsedStake} GEN on ${selectedSide}`}
          </button>
        </div>
      )}

      {/* Positions */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#121212] font-sans">Positions on this Market</h3>
          <span className="text-xs text-[#949089]">
            {positions.length} participant{positions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#F0EDE8] text-[#949089] text-[11px] font-semibold uppercase">
                  <th className="py-2.5 px-3">Wallet</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3 text-right">Stake</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F2]">
                {positions.map((pos) => {
                  const isMine = pos.staker.toLowerCase() === address?.toLowerCase();
                  return (
                    <tr key={pos.position_id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-[#121212]">
                          {truncateAddress(pos.staker, 4)}
                        </span>
                        {isMine && (
                          <span className="ml-1.5 text-[10px] bg-[#EFECE6] text-[#121212] px-1.5 py-0.5 rounded-full font-semibold">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#121212]">{pos.side}</td>
                      <td className="py-3 px-3 text-right font-semibold text-[#121212] tabular-nums">
                        {formatGEN(pos.amount)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {pos.claimed ? (
                          <span className="text-[#166534] font-semibold">Claimed</span>
                        ) : market.status === 'finalized' ? (
                          <span className="text-[#949089]">Settled</span>
                        ) : (
                          <span className="text-[#666460]">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#949089] py-4 text-center">No stakes placed yet.</p>
        )}
      </div>
    </div>
  );
};
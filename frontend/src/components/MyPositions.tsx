import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { formatGEN } from '../utils/format';
import { CheckCircle2 } from 'lucide-react';
import { useWallet } from '@/lib/genlayer/wallet';
import { useMarkets, useUserPositions } from '@/lib/hooks/useDevDuel';

export const MyPositions: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { data: markets = [] } = useMarkets();
  const { data: userPositions = [] } = useUserPositions(address);

  const stats = useMemo(() => {
    let totalStaked = 0;
    let activeAtRisk = 0;
    let claimableCount = 0;

    userPositions.forEach((pos) => {
      const market = markets.find((m) => m.market_id === pos.market_id);
      totalStaked += pos.amount;

      if (!market) return;

      if (pos.claimed) {
        // already settled
      } else if (market.status === 'finalized') {
        if (market.verdict === 'INVALID' || market.verdict === pos.side) {
          claimableCount++;
        }
      } else {
        activeAtRisk += pos.amount;
      }
    });

    return {
      totalStaked,
      activeAtRisk,
      claimableCount,
    };
  }, [userPositions, markets]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121212] font-sans">
            My Positions
          </h1>
          <p className="text-sm text-[#666460]">
            Wallet:{' '}
            <span className="font-mono text-[#121212]">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Not connected'}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#949089] uppercase font-bold tracking-wider mb-1">
            Total Staked
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#121212] tabular-nums">
            {formatGEN(stats.totalStaked)}
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#949089] uppercase font-bold tracking-wider mb-1">
            Active at Risk
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#121212] tabular-nums">
            {formatGEN(stats.activeAtRisk)}
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E8E5DF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#949089] uppercase font-bold tracking-wider mb-1">
            Settled
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#121212] tabular-nums">
            {stats.claimableCount}
          </div>
        </div>
      </div>

      {userPositions.length > 0 ? (
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#121212] font-sans">
              Staked Milestones
            </h3>
            <span className="text-xs text-[#949089]">
              {userPositions.length} position{userPositions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[#F0EDE8] text-[#949089] text-[11px] font-semibold uppercase">
                  <th className="py-2.5 px-3">Market Claim</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3 text-right">Stake</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F5F2]">
                {userPositions.map((pos) => {
                  const market = markets.find((m) => m.market_id === pos.market_id);
                  if (!market) return null;

                  return (
                    <tr key={pos.position_id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-3 max-w-sm">
                        <button
                          onClick={() => navigate(`/market/${market.market_id}`)}
                          className="font-bold text-xs text-[#121212] hover:underline text-left block line-clamp-1 cursor-pointer"
                        >
                          {market.claim}
                        </button>
                        <span className="text-[11px] text-[#949089]">
                          #{market.market_id.slice(-6)} · {market.source_url}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-[#121212]">{pos.side}</td>

                      <td className="py-3 px-3 text-right font-semibold text-[#121212] tabular-nums">
                        {formatGEN(pos.amount)}
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={market.status} verdict={market.verdict} />
                      </td>

                      <td className="py-3 px-3 text-right">
                        {pos.claimed ? (
                          <span className="text-[#166534] font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Settled</span>
                          </span>
                        ) : market.status === 'finalized' ? (
                          <span className="text-[#949089]">Settled</span>
                        ) : (
                          <button
                            onClick={() => navigate(`/market/${market.market_id}`)}
                            className="px-3 py-1 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] border border-[#E8E5DF] text-[#121212] text-[11px] font-semibold cursor-pointer transition-colors"
                          >
                            View →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-3xl p-10 text-center border border-[#E8E5DF] space-y-3">
          <p className="text-base font-semibold text-[#121212]">
            You have no active stakes yet.
          </p>
          <p className="text-xs text-[#666460]">
            Explore open developer milestones and stake whole GEN on either YES or NO.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/markets')}
              className="px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              Explore Open Markets
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
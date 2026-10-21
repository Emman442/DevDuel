import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatGEN, formatTimeRemaining } from '../utils/format';
import { MarketCard } from './MarketCard';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useMarkets } from '@/lib/hooks/useDevDuel';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { data: markets} = useMarkets();
  

  const { openCount, openPot, resolvableCount, resolvablePot } = useMemo(() => {
    let openCount = 0;
    let openPot = 0;
    let resolvableCount = 0;
    let resolvablePot = 0;

    const now = Date.now();
    markets?.forEach((m) => {
      const pot = m.yes_pool + m.no_pool;
      const isResolvable = m.status === 'open' && m.deadline > 0 && now >= m.deadline;

      if (isResolvable) {
        resolvableCount++;
        resolvablePot += pot;
      } else if (m.status === 'open') {
        openCount++;
        openPot += pot;
      }
    });

    return { openCount, openPot, resolvableCount, resolvablePot };
  }, [markets]);

  
  const featuredMarkets = useMemo(() => {
    return markets?.filter((m) => m.status === 'open').slice(0, 3);
  }, [markets]);

  return (
    <div className="space-y-10 py-6 sm:py-10 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E5DF] text-xs font-semibold text-[#666460] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
          <span>GenLayer Optimistic Consensus</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#121212] font-sans">
          DevDuel
        </h1>

        <p className="text-base sm:text-lg text-[#666460] font-sans font-normal leading-relaxed">
          Prediction markets for GitHub milestones that settle when validators agree on the source.
        </p>
      </div>

      {/* Entry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
     
        <div
          onClick={() => navigate('/markets?filter=open')}
          className="group relative bg-[#FFFFFF] rounded-3xl p-7 sm:p-8 border border-[#E8E5DF] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-[#D6D2C8] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">
                Live Staking
              </span>
              <div className="w-9 h-9 rounded-full bg-[#F7F5F2] flex items-center justify-center text-[#121212] group-hover:bg-[#121212] group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] mb-3">
              Open Markets
            </h2>
            <p className="text-sm text-[#666460] leading-relaxed mb-6">
              Stake whole GEN on pull requests, release tags, and repo milestones currently accepting predictions.
            </p>

            <div className="space-y-1.5 mb-8">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#121212] tabular-nums">
                {openCount}{' '}
                <span className="text-base sm:text-lg font-medium text-[#949089]">active markets</span>
              </div>
              <div className="text-xs text-[#949089]">
                Total Staked:{' '}
                <span className="font-semibold text-[#121212]">{formatGEN(openPot)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/markets?filter=open');
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#121212] hover:bg-black text-white text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs flex items-center justify-center gap-2 group-hover:scale-[1.01]"
          >
            <span>Enter Open Markets</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Resolvable */}
        <div
          onClick={() => navigate('/markets?filter=resolvable')}
          className="group relative bg-[#FFFFFF] rounded-3xl p-7 sm:p-8 border border-[#E8E5DF] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-[#D6D2C8] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F]">
                  Awaiting Consensus
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#F7F5F2] flex items-center justify-center text-[#121212] group-hover:bg-[#121212] group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121212] mb-3">
              Resolvable
            </h2>
            <p className="text-sm text-[#666460] leading-relaxed mb-6">
              Deadlines reached. Anyone can trigger GenLayer validators to fetch the frozen source URL and settle.
            </p>

            <div className="space-y-1.5 mb-8">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#121212] tabular-nums">
                {resolvableCount}{' '}
                <span className="text-base sm:text-lg font-medium text-[#949089]">ready to resolve</span>
              </div>
              <div className="text-xs text-[#949089]">
                Pending Pool:{' '}
                <span className="font-semibold text-[#121212]">{formatGEN(resolvablePot)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/markets?filter=resolvable');
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#121212] hover:bg-black text-white text-sm font-semibold transition-colors cursor-pointer text-center shadow-xs flex items-center justify-center gap-2 group-hover:scale-[1.01]"
          >
            <span>Enter Resolvable</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured */}
      <div className="space-y-4 px-2 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#121212] font-sans">
            Active Developer Milestones
          </h3>
          <button
            onClick={() => navigate('/markets')}
            className="text-xs font-semibold text-[#666460] hover:text-[#121212] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View all {markets?.length} markets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {featuredMarkets?.map((market) => (
            <MarketCard
              key={market.market_id}
              market={market}
              onSelect={(id) => navigate(`/market/${id}`)}
            />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E8E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mx-2">
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#121212]">
            Immutable GitHub Endpoint Consensus
          </div>
          <div className="text-xs text-[#666460]">
            The source URL is permanently frozen on creation. No one can inject an outcome. Protocol fee on finalization; INVALID refunds everyone.
          </div>
        </div>

        <button
          onClick={() => navigate('/create')}
          className="shrink-0 px-4 py-2 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] border border-[#E8E5DF] text-xs font-semibold text-[#121212] transition-colors cursor-pointer"
        >
          Create New Market &rarr;
        </button>
      </div>
    </div>
  );
};
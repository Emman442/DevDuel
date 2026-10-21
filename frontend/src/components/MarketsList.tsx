import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MarketCard } from './MarketCard';
import { Search, Plus, X } from 'lucide-react';
import { useMarkets } from '@/lib/hooks/useDevDuel';
import type { Market } from '@/lib/contracts/types';

type FilterTab = 'all' | 'open' | 'resolvable' | 'finalized';
type SortOption = 'deadline' | 'pot' | 'positions' | 'newest';

export const MarketsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: markets = [] } = useMarkets();

  const filterParam = searchParams.get('filter') as FilterTab | null;
  const [activeTab, setActiveTab] = useState<FilterTab>(filterParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('deadline');

  useEffect(() => {
    if (filterParam && ['all', 'open', 'resolvable', 'finalized'].includes(filterParam)) {
      setActiveTab(filterParam);
    }
  }, [filterParam]);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    if (tab === 'all') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filter: tab });
    }
  };

  const counts = useMemo(() => {
    let openCount = 0;
    let resolvableCount = 0;
    let finalizedCount = 0;
    const now = Date.now();

    markets.forEach((m) => {
      const isResolvable = m.status === 'open' && m.deadline > 0 && now >= m.deadline;

      if (m.status === 'finalized' || m.status === 'resolved' || m.status === 'cancelled') {
        finalizedCount++;
      } else if (isResolvable) {
        resolvableCount++;
      } else if (m.status === 'open') {
        openCount++;
      }
    });

    return {
      all: markets.length,
      open: openCount,
      resolvable: resolvableCount,
      finalized: finalizedCount,
    };
  }, [markets]);

  const filteredMarkets = useMemo(() => {
    const now = Date.now();

    return markets
      .filter((m) => {
        const isResolvable = m.status === 'open' && m.deadline > 0 && now >= m.deadline;

        if (activeTab === 'open') {
          if (m.status !== 'open' || isResolvable) return false;
        } else if (activeTab === 'resolvable') {
          if (!isResolvable) return false;
        } else if (activeTab === 'finalized') {
          if (m.status !== 'finalized' && m.status !== 'resolved' && m.status !== 'cancelled') return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchClaim = m.claim.toLowerCase().includes(q);
          const matchSource = m.source_url.toLowerCase().includes(q);
          const matchCriteria = m.criteria.toLowerCase().includes(q);
          const matchId = m.market_id.toLowerCase().includes(q);
          if (!matchClaim && !matchSource && !matchCriteria && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return a.deadline - b.deadline;
        }
        if (sortBy === 'pot') {
          const potA = a.yes_pool + a.no_pool;
          const potB = b.yes_pool + b.no_pool;
          return potB - potA;
        }
        if (sortBy === 'positions') {
          return (b.positions?.length ?? 0) - (a.positions?.length ?? 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });
  }, [markets, activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121212] font-sans">
            Prediction Markets
          </h1>
          <p className="text-sm text-[#666460]">
            Explore and stake whole GEN on verifiable GitHub milestone contracts.
          </p>
        </div>

        <button
          onClick={() => navigate('/create')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Market</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#121212] text-white font-semibold shadow-xs'
                : 'bg-[#FFFFFF] text-[#666460] hover:text-[#121212] border border-[#E8E5DF] font-medium'
            }`}
          >
            All <span className="ml-1 opacity-70 tabular-nums">({counts.all})</span>
          </button>

          <button
            onClick={() => handleTabChange('open')}
            className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'open'
                ? 'bg-[#121212] text-white font-semibold shadow-xs'
                : 'bg-[#FFFFFF] text-[#666460] hover:text-[#121212] border border-[#E8E5DF] font-medium'
            }`}
          >
            Open <span className="ml-1 opacity-70 tabular-nums">({counts.open})</span>
          </button>

          <button
            onClick={() => handleTabChange('resolvable')}
            className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'resolvable'
                ? 'bg-[#121212] text-white font-semibold shadow-xs'
                : counts.resolvable > 0
                ? 'bg-[#FFF3EE] text-[#FF5A1F] border border-[#FFD5C2] font-semibold'
                : 'bg-[#FFFFFF] text-[#666460] hover:text-[#121212] border border-[#E8E5DF] font-medium'
            }`}
          >
            <span>Resolvable</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                activeTab === 'resolvable' ? 'bg-white/20 text-white' : 'bg-[#FF5A1F] text-white'
              }`}
            >
              {counts.resolvable}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('finalized')}
            className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'finalized'
                ? 'bg-[#121212] text-white font-semibold shadow-xs'
                : 'bg-[#FFFFFF] text-[#666460] hover:text-[#121212] border border-[#E8E5DF] font-medium'
            }`}
          >
            Finalized <span className="ml-1 opacity-70 tabular-nums">({counts.finalized})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#949089]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search milestone or repo..."
              className="w-full bg-[#FFFFFF] border border-[#E8E5DF] rounded-full pl-9 pr-8 py-2 text-xs font-sans text-[#121212] placeholder-[#949089] focus:outline-none focus:border-[#121212]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#949089] hover:text-[#121212] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#FFFFFF] border border-[#E8E5DF] rounded-full px-3.5 py-2 text-xs font-sans font-medium text-[#666460] hover:text-[#121212] focus:outline-none focus:border-[#121212] cursor-pointer"
            >
              <option value="deadline">Soonest Deadline</option>
              <option value="pot">Highest Pot</option>
              <option value="positions">Most Active</option>
              <option value="newest">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {filteredMarkets.length > 0 ? (
        <div className="space-y-3.5">
          {filteredMarkets.map((market: Market) => (
            <MarketCard
              key={market.market_id}
              market={market}
              onSelect={(id) => navigate(`/market/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl p-10 text-center border border-[#E8E5DF] space-y-3">
          <p className="text-base font-semibold text-[#121212]">
            {searchQuery
              ? `No markets found matching "${searchQuery}".`
              : activeTab === 'resolvable'
              ? 'No markets awaiting resolution.'
              : 'No open markets at the moment.'}
          </p>
          <p className="text-xs text-[#666460] max-w-md mx-auto">
            Anyone can create a prediction market with a public HTTPS GitHub endpoint and deadline.
          </p>
          <div className="pt-2">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] text-xs font-semibold text-[#121212] transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            ) : (
              <button
                onClick={() => navigate('/create')}
                className="px-5 py-2.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Create First Market
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
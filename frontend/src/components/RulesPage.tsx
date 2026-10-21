import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#121212] font-sans">
          Protocol Rules & Settlement
        </h1>
        <p className="text-sm text-[#666460]">
          How DevDuel uses GenLayer optimistic consensus to settle developer prediction markets.
        </p>
      </div>

      {/* Rules Cards in Hive Light Aesthetic */}
      <div className="space-y-4">
        {/* Rule 1 */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            <h2 className="text-lg font-bold text-[#121212]">
              Market Creation & Frozen Source URL
            </h2>
          </div>
          <p className="text-sm text-[#666460] leading-relaxed pl-8">
            Anyone can create a prediction market by providing a claim, exact settlement criteria, a public HTTPS source URL (typically a GitHub API endpoint), and a deadline. The source URL is permanently frozen at creation in contract bytecode. No one can inject an outcome or alter the endpoint.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            <h2 className="text-lg font-bold text-[#121212]">
              Whole GEN Staking on YES or NO
            </h2>
          </div>
          <p className="text-sm text-[#666460] leading-relaxed pl-8">
            Participants stake whole GEN tokens on either YES or NO. All stakes enter non-custodial pools. Staking is automatically closed the exact second the deadline is reached.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            <h2 className="text-lg font-bold text-[#121212]">
              Validator Resolution via Consensus
            </h2>
          </div>
          <p className="text-sm text-[#666460] leading-relaxed pl-8">
            After the deadline, anyone can call <span className="font-semibold text-[#121212]">resolve</span>. GenLayer decentralized validators execute deterministic fetches of the exact frozen source URL. Validators compare the response headers and payload against the criteria and must agree on <span className="font-semibold text-[#121212]">YES</span>, <span className="font-semibold text-[#121212]">NO</span>, or <span className="font-semibold text-[#121212]">INVALID</span>.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#121212] text-white flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            <h2 className="text-lg font-bold text-[#121212]">
              Finalization, Pool Distribution & Refunds
            </h2>
          </div>
          <div className="text-sm text-[#666460] leading-relaxed pl-8 space-y-2">
            <p>
              On finalize: winners split the losing pool proportionally to their stake (minus a small 2.0% protocol fee).
            </p>
            <p>
              If an outcome is ruled <span className="font-semibold text-[#121212]">INVALID</span> (such as upstream 404, deleted repo, or ambiguous criteria), 100% of all stakes are refunded with zero fees.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate('/markets')}
          className="px-6 py-3 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-2"
        >
          <span>Explore Open Markets</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-3 rounded-full bg-[#FFFFFF] hover:bg-[#EFECE6] border border-[#E8E5DF] text-xs font-bold text-[#121212] transition-colors cursor-pointer"
        >
          Create Market
        </button>
      </div>
    </div>
  );
};

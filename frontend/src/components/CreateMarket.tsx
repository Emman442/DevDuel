import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Market } from '@/lib/contracts/types';
import { MarketCard } from './MarketCard';
import { getDomainFromUrl } from '../utils/format';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useWallet } from '@/lib/genlayer/wallet';
import { useCreateMarket } from '@/lib/hooks/useDevDuel';

interface CreateMarketProps {
  onMarketCreated?: (marketId: string) => void;
  onCancel?: () => void;
}

export const CreateMarket: React.FC<CreateMarketProps> = ({ onMarketCreated, onCancel }) => {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { createMarket, isCreating } = useCreateMarket();

  const [claim, setClaim] = useState('');
  const [criteria, setCriteria] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [durationHours, setDurationHours] = useState<number>(24);

  const [formError, setFormError] = useState<string | null>(null);

  const handleTemplate = (type: 'pr' | 'release' | 'stars') => {
    if (type === 'pr') {
      setClaim('facebook/react merges PR #31204 (Compiler SSR hydration opt)');
      setCriteria('Endpoint: https://api.github.com/repos/facebook/react/pulls/31204\nCondition: "merged": true in JSON response with "merged_at" before deadline.\nResolution: YES if merged; NO otherwise.');
      setSourceUrl('https://api.github.com/repos/facebook/react/pulls/31204');
    } else if (type === 'release') {
      setClaim('vercel/next.js releases v16.0.0 on GitHub releases');
      setCriteria('Endpoint: https://api.github.com/repos/vercel/next.js/releases/tags/v16.0.0\nCondition: HTTP 200 with prerelease=false before deadline.\nResolution: YES if official tag exists; NO otherwise.');
      setSourceUrl('https://api.github.com/repos/vercel/next.js/releases/tags/v16.0.0');
    } else {
      setClaim('tailwindlabs/tailwindcss exceeds 85,000 GitHub stars');
      setCriteria('Endpoint: https://api.github.com/repos/tailwindlabs/tailwindcss\nCondition: "stargazers_count" >= 85000 sampled at deadline timestamp.\nResolution: YES if met; NO if below.');
      setSourceUrl('https://api.github.com/repos/tailwindlabs/tailwindcss');
    }
  };

  const isClaimValid = claim.trim().length >= 10;
  const isCriteriaValid = criteria.trim().length >= 20;
  const isUrlValid = sourceUrl.trim().startsWith('https://');
  const isFormValid = isClaimValid && isCriteriaValid && isUrlValid;

  const previewMarket: Market = useMemo(() => {
    const deadline = Date.now() + durationHours * 3600 * 1000;
    return {
      market_id: 'preview',
      creator: address || '',
      claim: claim.trim() || 'Example: kubernetes/kubernetes merges PR #128442',
      criteria: criteria.trim() || 'Endpoint must return merged=true before deadline.',
      source_url: sourceUrl.trim() || 'https://api.github.com/repos/kubernetes/kubernetes/pulls/128442',
      deadline,
      status: 'open',
      verdict: '',
      reasoning: '',
      yes_pool: 0,
      no_pool: 0,
      created_at: new Date().toISOString(),
      resolved_at: '',
      protocol_fee_bps: 200,
    };
  }, [claim, criteria, sourceUrl, durationHours, address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isConnected || !address) {
      setFormError('Please connect your wallet first.');
      return;
    }

    if (!isFormValid) {
      setFormError('Please complete all fields with valid values.');
      return;
    }

    createMarket(
      {
        claim: claim.trim(),
        criteria: criteria.trim(),
        sourceUrl: sourceUrl.trim(),
        durationSeconds: durationHours * 3600,
      },
      {
        onSuccess: (receipt: any) => {
          // If the receipt contains the new market id, navigate to it.
          // Otherwise fall back to the markets list.
          const newId = receipt?.data?.market_id || receipt?.market_id;
          if (newId && onMarketCreated) {
            onMarketCreated(newId);
          } else {
            navigate('/markets');
          }
        },
        onError: (err: any) => {
          setFormError(err?.message || 'Failed to create market.');
        },
      }
    );
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate('/markets');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121212] font-sans">
            Create Prediction Market
          </h1>
          <p className="text-sm text-[#666460]">
            Propose a milestone settled by GenLayer validators fetching the source URL.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[#949089]">Fill example:</span>
          <button
            type="button"
            onClick={() => handleTemplate('pr')}
            className="px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#EFECE6] text-xs font-semibold text-[#121212] transition-colors cursor-pointer"
          >
            Pull Request
          </button>
          <button
            type="button"
            onClick={() => handleTemplate('release')}
            className="px-2.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E5DF] hover:bg-[#EFECE6] text-xs font-semibold text-[#121212] transition-colors cursor-pointer"
          >
            Release Tag
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-[#FDF2F2] border border-[#FECACA] text-xs font-medium text-[#B91C1C] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#E8E5DF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#949089]">
            1. Milestone Claim
          </label>
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="e.g. Torvalds tags Linux v6.18 before Sunday 23:59 UTC"
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] focus:border-[#121212] rounded-2xl px-4 py-3 text-sm font-semibold text-[#121212] placeholder-[#949089] focus:outline-none"
          />
          <p className="text-[11px] text-[#949089]">
            A clear, unambiguous statement about a developer milestone or repository event.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#949089]">
            2. Settlement Criteria
          </label>
          <textarea
            rows={4}
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Endpoint: https://api.github.com/repos/...\nCondition: JSON response must contain 'merged': true\nResolution: YES if merged before deadline. NO otherwise."
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] focus:border-[#121212] rounded-2xl p-4 font-mono text-xs text-[#121212] placeholder-[#949089] focus:outline-none leading-relaxed"
          />
          <p className="text-[11px] text-[#949089]">
            Exact rules evaluated by validators when inspecting the response payload.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#949089]">
            3. Public HTTPS Source URL
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://api.github.com/repos/org/repo/pulls/123"
            className="w-full bg-[#F7F5F2] border border-[#E8E5DF] focus:border-[#121212] rounded-2xl px-4 py-3 text-xs font-mono text-[#121212] placeholder-[#949089] focus:outline-none"
          />
          <p className="text-[11px] text-[#949089]">
            Must be a public HTTPS endpoint (such as the GitHub REST API) that validators can query.
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#F0EDE8]">
          <label className="text-xs font-bold uppercase tracking-wider text-[#949089]">
            4. Duration Preset
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '1h', hours: 1 },
              { label: '6h', hours: 6 },
              { label: '1d', hours: 24 },
              { label: '7d', hours: 168 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDurationHours(p.hours)}
                className={`py-2 text-center text-xs rounded-full transition-colors cursor-pointer font-semibold ${
                  durationHours === p.hours
                    ? 'bg-[#121212] text-white shadow-xs'
                    : 'bg-[#F7F5F2] text-[#666460] hover:text-[#121212] border border-[#E8E5DF]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
         
        </div>

        <div className="pt-4 border-t border-[#F0EDE8] flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] text-xs font-semibold text-[#666460] hover:text-[#121212] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isFormValid || isCreating}
            className={`px-6 py-3 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
              isFormValid && !isCreating
                ? 'bg-[#121212] hover:bg-black text-white'
                : 'bg-[#EFECE6] text-[#949089] cursor-not-allowed'
            }`}
          >
            <span>{isCreating ? 'Deploying Market…' : 'Create Market'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#949089]">
            Live Market Card Preview
          </span>
          <span className="text-xs text-[#949089]">Displays as shown in the feed</span>
        </div>
        <MarketCard market={previewMarket} onSelect={() => {}} />
      </div>
    </div>
  );
};
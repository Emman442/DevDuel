import React from 'react';
import { X, ShieldCheck, Terminal, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface ProtocolRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolRulesModal: React.FC<ProtocolRulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-none p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl border border-[#242428] bg-[#111113] p-5 font-mono text-xs text-[#FAFAFA] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242428] pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00E5A0]" />
            <span className="font-sans font-semibold text-sm text-[#FAFAFA]">
              DevDuel Protocol Specification & Settlement Rules
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#FAFAFA] p-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Rules List */}
        <div className="space-y-3 text-xs leading-relaxed text-[#A1A1AA]">
          <div className="p-3 bg-[#0A0A0B] border border-[#242428] space-y-1.5">
            <div className="text-[#00E5A0] font-semibold flex items-center gap-1.5">
              <span>01. Market Creation & Frozen URL</span>
            </div>
            <p>
              Anyone can deploy a prediction market by providing a claim, settlement criteria, duration, and a public HTTPS source URL (e.g. GitHub REST/GraphQL API). The source URL and hash are permanently frozen at contract deployment. No administrator or user can alter the source endpoint.
            </p>
          </div>

          <div className="p-3 bg-[#0A0A0B] border border-[#242428] space-y-1.5">
            <div className="text-[#00E5A0] font-semibold flex items-center gap-1.5">
              <span>02. Staking Mechanics</span>
            </div>
            <p>
              Stakers commit whole GEN tokens to either YES or NO. Pools are non-custodial and dynamically recalculate implied multiplier odds. Staking permanently closes the exact second the deadline is reached.
            </p>
          </div>

          <div className="p-3 bg-[#0A0A0B] border border-[#242428] space-y-1.5">
            <div className="text-[#C9932B] font-semibold flex items-center gap-1.5">
              <span>03. Validator Consensus & Resolution</span>
            </div>
            <p>
              After the deadline passes, any participant or keeper can trigger <span className="text-[#FAFAFA]">resolve</span>. GenLayer decentralized validators execute deterministic HTTPS fetches against the frozen source URL. Validators compare the cryptographic response payload against criteria and vote <span className="text-[#00E5A0]">YES</span>, <span className="text-[#D2554D]">NO</span>, or <span className="text-[#C9932B]">INVALID</span>.
            </p>
          </div>

          <div className="p-3 bg-[#0A0A0B] border border-[#242428] space-y-1.5">
            <div className="text-[#FAFAFA] font-semibold flex items-center gap-1.5">
              <span>04. Finalization, Fees & Refunds</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-[#A1A1AA]">
              <li>
                <strong className="text-[#FAFAFA]">Winning Outcome (YES / NO):</strong> Winners receive their original stake back plus a proportional share of the entire opposing pool, minus a flat 2.0% protocol fee.
              </li>
              <li>
                <strong className="text-[#FAFAFA]">INVALID Outcome:</strong> If the endpoint is deleted, returned 404/500, or criteria were ambiguous, 100% of all stakes are refunded with 0% fees.
              </li>
            </ul>
          </div>
        </div>

        {/* Settlement Formula Box */}
        <div className="border border-[#242428] bg-[#17171A] p-3 text-[11px] space-y-1">
          <div className="text-[#71717A] uppercase tracking-wider">Settlement Formula:</div>
          <div className="text-[#FAFAFA] font-mono">
            Payout = Stake + (Stake / Winning_Pool) &times; (Losing_Pool &times; 0.98)
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-[#242428]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-[#242428] bg-[#17171A] hover:bg-[#242428] text-xs font-semibold text-[#FAFAFA] transition-colors cursor-pointer"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};

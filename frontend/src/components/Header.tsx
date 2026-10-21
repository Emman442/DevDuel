import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatGEN, truncateAddress } from '../utils/format';
import { Logo } from './Logo';
import { ChevronDown, Plus, RotateCcw, Copy, Check } from 'lucide-react';
import { useUserPositions } from '@/lib/hooks/useDevDuel';
import { useWallet } from '@/lib/genlayer/WalletProvider';
import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/genlayer/client';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { address: wallet, connectWallet, disconnectWallet, isConnected } = useWallet();
  const {data: userPositions} = useUserPositions(wallet)
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const pathname = location.pathname;
  const isHome = pathname === '/';
  const isMarkets = pathname.startsWith('/markets') || pathname.startsWith('/market/');
  const isCreate = pathname === '/create';
  const isPositions = pathname === '/positions';
  const isRules = pathname === '/rules';

   const { data: userBalance = 0 } = useQuery({
    queryKey: ["genBalance", wallet],
    queryFn: async () => {
      const client = await getClient();
      if (!client || !wallet) return 0;
      const wei = await client.getBalance({ address: wallet as `0x${string}` });
      return Number(wei) / 1e18;
    },
    enabled: !!wallet,
    staleTime: 5000,
  });


  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(wallet!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userPositionsCount = userPositions?.length ?? 0

  return (
    <header className="sticky top-4 z-40 px-3 sm:px-6 w-full max-w-5xl mx-auto">
      {/* Soft rounded floating pill-shaped navigation bar */}
      <div className="bg-[#FFFFFF]/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#E8E5DF] flex items-center justify-between gap-4">
        {/* Left: Logo with 3D Orange Cube + bold black wordmark */}
        <Link
          to="/"
          className="cursor-pointer focus:outline-none flex items-center group"
          title="DevDuel Home"
        >
          <Logo size="md" />
        </Link>

        {/* Center: Navigation Links with Hive pill style */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-sans">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold ${
              isHome
                ? 'bg-[#121212] text-white shadow-xs'
                : 'text-[#666460] hover:text-[#121212]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/markets"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold ${
              isMarkets
                ? 'bg-[#121212] text-white shadow-xs'
                : 'text-[#666460] hover:text-[#121212]'
            }`}
          >
            Markets
          </Link>
          <Link
            to="/create"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold ${
              isCreate
                ? 'bg-[#121212] text-white shadow-xs'
                : 'text-[#666460] hover:text-[#121212]'
            }`}
          >
            Create
          </Link>
          <Link
            to="/positions"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
              isPositions
                ? 'bg-[#121212] text-white shadow-xs'
                : 'text-[#666460] hover:text-[#121212]'
            }`}
          >
            <span>Positions</span>
            {userPositionsCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  isPositions
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EFECE6] text-[#4A4742]'
                }`}
              >
                {userPositionsCount}
              </span>
            )}
          </Link>
          <Link
            to="/rules"
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold ${
              isRules
                ? 'bg-[#121212] text-white shadow-xs'
                : 'text-[#666460] hover:text-[#121212]'
            }`}
          >
            Rules
          </Link>
        </nav>

        {/* Right: Wallet Action Pill */}
        <div className="flex items-center gap-2 relative">
          {isConnected ? (
            <div className="relative">
              <button
                onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F5F2] hover:bg-[#EFECE6] border border-[#E8E5DF] text-xs font-sans text-[#121212] transition-colors cursor-pointer"
              >
                <span className="tabular-nums font-bold text-[#121212]">
                  {formatGEN(userBalance)}
                </span>
                <span className="text-[#C8C5BD]">·</span>
                <span className="text-[#666460] font-medium font-mono text-[11px]">
                  {truncateAddress(wallet, 3)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#666460]" />
              </button>

              {isWalletMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E8E5DF] bg-[#FFFFFF] p-3.5 shadow-xl z-50 font-sans text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[11px] text-[#949089] uppercase tracking-wider font-semibold mb-1">
                    Connected Wallet
                  </div>
                  <div className="flex items-center justify-between bg-[#F7F5F2] rounded-xl px-2.5 py-2 mb-3 border border-[#E8E5DF]">
                    <span className="text-[11px] text-[#121212] font-mono truncate">
                      {wallet}
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-[#666460] hover:text-[#121212] ml-1 shrink-0 p-1 cursor-pointer"
                      title="Copy Address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#166534]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-[11px] text-[#949089] uppercase tracking-wider font-semibold mb-1">
                    GEN Balance
                  </div>
                  <div className="text-base font-bold text-[#121212] tabular-nums mb-3">
                    {formatGEN(userBalance)}
                  </div>

                  <div className="space-y-1.5 border-t border-[#E8E5DF] pt-3">
                    <button
                      onClick={() => {
                        navigate("https://testnet-faucet.genlayer.foundation/")
                        setIsWalletMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#121212] text-white hover:bg-black font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Get $GEN tokens</span>
                    </button>

                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsWalletMenuOpen(false);
                      }}
                      className="w-full py-1 text-center text-[#B91C1C] hover:underline text-xs cursor-pointer font-medium"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-1.5 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile menu link toggle */}
          <div className="flex md:hidden items-center gap-1">
            <Link
              to="/markets"
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                isMarkets ? 'bg-[#121212] text-white' : 'text-[#666460]'
              }`}
            >
              Markets
            </Link>
            <Link
              to="/create"
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                isCreate ? 'bg-[#121212] text-white' : 'text-[#666460]'
              }`}
            >
              Create
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { MarketsList } from './components/MarketsList';
import { MarketDetail } from './components/MarketDetail';
import { CreateMarket } from './components/CreateMarket';
import { MyPositions } from './components/MyPositions';
import { RulesPage } from './components/RulesPage';

import { WalletProvider } from '@/lib/genlayer/WalletProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#121212] flex flex-col font-sans selection:bg-[#FF5A1F]/20 selection:text-[#FF5A1F]">
      {/* Soft rounded floating navigation bar */}
      <Header />

      {/* Main Viewport */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/markets" element={<MarketsList />} />
          <Route path="/market/:marketId" element={<MarketDetail />} />
          <Route path="/create" element={<CreateMarket />} />
          <Route path="/positions" element={<MyPositions />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Minimal Warm Light Footer */}
      <footer className="border-t border-[#E8E5DF] py-6 px-4 sm:px-6 text-xs text-[#949089]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#121212]">DevDuel</span>
            <span>·</span>
            <span>GenLayer Optimistic Consensus Protocol</span>
          </div>

          <div className="flex items-center gap-4 text-[#666460]">
            <Link
              to="/rules"
              className="hover:text-[#121212] transition-colors cursor-pointer"
            >
              Protocol Rules
            </Link>
            <span>·</span>
            <Link
              to="/markets"
              className="hover:text-[#121212] transition-colors cursor-pointer"
            >
              All Markets
            </Link>
            <span>·</span>
            <span>2% Protocol Fee</span>
            <span>·</span>
            <span className="font-mono text-[#121212]">Chain 421614</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2000,
      refetchOnWindowFocus: false,
    },
  },
});
  return (
    <BrowserRouter>
      <WalletProvider>
        <QueryClientProvider client = {queryClient}>
          <AppLayout />
        </QueryClientProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}

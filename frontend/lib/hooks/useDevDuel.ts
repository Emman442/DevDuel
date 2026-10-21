"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import DevDuel from "../contracts/DevDuel";
import { getContractAddress } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { success, error, configError } from "../utils/toast";
import type {
  Market,
  Position,
  Side,
  CreateMarketParams
} from "../contracts/types";

const MARKETS_KEY = ["markets"] as const;
const OPEN_MARKETS_KEY = ["openMarkets"] as const;

function invalidateMarketQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  marketId?: string
) {
  queryClient.invalidateQueries({ queryKey: MARKETS_KEY });
  queryClient.invalidateQueries({ queryKey: OPEN_MARKETS_KEY });
  queryClient.invalidateQueries({ queryKey: ["totalMarkets"] });

  if (marketId) {
    queryClient.invalidateQueries({ queryKey: ["market", marketId] });
    queryClient.invalidateQueries({ queryKey: ["marketPositions", marketId] });
  }
}

export function useDevDuelContract(): DevDuel | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();

  return useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Set VITE_CONTRACT_ADDRESS in your .env file."
      );
      return null;
    }
    return new DevDuel(contractAddress, address);
  }, [contractAddress, address]);
}

export function useMarkets() {
  const contract = useDevDuelContract();
  return useQuery<Market[], Error>({
    queryKey: MARKETS_KEY,
    queryFn: () => (contract ? contract.getAllMarkets() : Promise.resolve([])),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function useOpenMarkets() {
  const contract = useDevDuelContract();
  return useQuery<Market[], Error>({
    queryKey: OPEN_MARKETS_KEY,
    queryFn: () => (contract ? contract.getOpenMarkets() : Promise.resolve([])),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function useMarket(marketId: string | null) {
  const contract = useDevDuelContract();
  return useQuery<Market | null, Error>({
    queryKey: ["market", marketId],
    queryFn: () => (contract && marketId ? contract.getMarket(marketId) : Promise.resolve(null)),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract && !!marketId,
  });
}

export function useUserPositions(wallet: string | null) {
  const contract = useDevDuelContract();
  return useQuery<Position[], Error>({
    queryKey: ["userPositions", wallet],
    queryFn: () =>
      contract && wallet ? contract.getUserPositions(wallet) : Promise.resolve([]),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract && !!wallet,
  });
}

export function useMarketPositions(marketId: string | null) {
  const contract = useDevDuelContract();
  return useQuery<Position[], Error>({
    queryKey: ["marketPositions", marketId],
    queryFn: () =>
      contract && marketId ? contract.getMarketPositions(marketId) : Promise.resolve([]),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract && !!marketId,
  });
}

export function useTotalMarkets() {
  const contract = useDevDuelContract();
  return useQuery<number, Error>({
    queryKey: ["totalMarkets"],
    queryFn: () => (contract ? contract.getTotalMarkets() : Promise.resolve(0)),
    enabled: !!contract,
    staleTime: 2000,
  });
}

export function useConfig() {
  const contract = useDevDuelContract();
  return useQuery<{ admin: string; protocol_fee_bps: number }, Error>({
    queryKey: ["config"],
    queryFn: () =>
      contract
        ? contract.getConfig()
        : Promise.resolve({ admin: "", protocol_fee_bps: 0 }),
    enabled: !!contract,
    staleTime: 10_000,
  });
}

export function useCreateMarket() {
  const contract = useDevDuelContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const mutation = useMutation({
    mutationFn: async (params: CreateMarketParams) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsCreating(true);
      return contract.createMarket(params);
    },
    onSuccess: () => {
      invalidateMarketQueries(queryClient);
      setIsCreating(false);
      success("Market created", {
        description: "Your market is live and accepting stakes.",
      });
    },
    onError: (err: any) => {
      setIsCreating(false);
      error("Failed to create market", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isCreating,
    createMarket: mutation.mutate,
    createMarketAsync: mutation.mutateAsync,
  };
}

export function useStake() {
  const contract = useDevDuelContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isStaking, setIsStaking] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({
      marketId,
      side,
      stakeGen,
    }: {
      marketId: string;
      side: Side;
      stakeGen: number | bigint;
    }) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsStaking(true);
      return contract.stake(marketId, side, stakeGen);
    },
    onSuccess: (_data, variables) => {
      invalidateMarketQueries(queryClient, variables.marketId);
      setIsStaking(false);
      success("Stake placed", {
        description: "Your position has been recorded on-chain.",
      });
    },
    onError: (err: any) => {
      setIsStaking(false);
      error("Failed to stake", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isStaking,
    stake: mutation.mutate,
    stakeAsync: mutation.mutateAsync,
  };
}

export function useResolveMarket() {
  const contract = useDevDuelContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingMarketId, setResolvingMarketId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (marketId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsResolving(true);
      setResolvingMarketId(marketId);
      return contract.resolveMarket(marketId);
    },
    onSuccess: (_data, marketId) => {
      invalidateMarketQueries(queryClient, marketId);
      setIsResolving(false);
      setResolvingMarketId(null);
      success("Market resolved", {
        description: "The verdict has been recorded.",
      });
    },
    onError: (err: any) => {
      setIsResolving(false);
      setResolvingMarketId(null);
      error("Failed to resolve market", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isResolving,
    resolvingMarketId,
    resolveMarket: mutation.mutate,
    resolveMarketAsync: mutation.mutateAsync,
  };
}

export function useFinalizeMarket() {
  const contract = useDevDuelContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const mutation = useMutation({
    mutationFn: async (marketId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      setIsFinalizing(true);
      return contract.finalizeMarket(marketId);
    },
    onSuccess: (_data, marketId) => {
      invalidateMarketQueries(queryClient, marketId);
      setIsFinalizing(false);
      success("Market finalized", {
        description: "Payouts and refunds have been sent.",
      });
    },
    onError: (err: any) => {
      setIsFinalizing(false);
      error("Failed to finalize market", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    isFinalizing,
    finalizeMarket: mutation.mutate,
    finalizeMarketAsync: mutation.mutateAsync,
  };
}

export function useCancelMarket() {
  const contract = useDevDuelContract();
  const { address } = useWallet();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (marketId: string) => {
      if (!contract) throw new Error("Contract not configured.");
      if (!address) throw new Error("Wallet not connected.");
      return contract.cancelMarket(marketId);
    },
    onSuccess: (_data, marketId) => {
      invalidateMarketQueries(queryClient, marketId);
      success("Market cancelled", {
        description: "No stakes were placed.",
      });
    },
    onError: (err: any) => {
      error("Failed to cancel market", {
        description: err?.message || "Please try again.",
      });
    },
  });

  return {
    ...mutation,
    cancelMarket: mutation.mutate,
    cancelMarketAsync: mutation.mutateAsync,
  };
}
/**
 * TypeScript types for Dev Duel contract
 */
export type Side = "YES" | "NO";
export type MarketStatus = "open" | "resolved" | "finalized" | "cancelled";
export type Verdict = "" | "YES" | "NO" | "INVALID";

export interface Market {
  market_id: string;
  creator: string;
  claim: string;
  criteria: string;
  source_url: string;
  deadline: number;
  status: MarketStatus;
  verdict: Verdict;
  reasoning: string;
  yes_pool: number;
  no_pool: number;
  created_at: string;
  resolved_at: string;
  protocol_fee_bps: number;
  appeal_deadline: number;  
  positions?: Position[];
}

export interface Position {
  position_id: string;
  market_id: string;
  staker: string;
  side: Side;
  amount: number;
  claimed: boolean;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}


export interface CreateMarketParams {
  claim: string;
  criteria: string;
  sourceUrl: string;
  durationSeconds: number;
}
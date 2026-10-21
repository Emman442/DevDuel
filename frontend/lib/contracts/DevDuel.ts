import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { parseEther } from "viem";
import type {
  Market,
  Position,
  Side,
  MarketStatus,
  Verdict,
  TransactionReceipt,
} from "./types";

export interface CreateMarketParams {
  claim: string;
  criteria: string;
  sourceUrl: string;
  durationSeconds: number;
}

function asRecord(value: unknown): Record<string, any> {
  if (!value) return {};
  if (value instanceof Map) {
    return Object.fromEntries(
      Array.from(value.entries()).map(([key, inner]) => [String(key), inner])
    );
  }
  if (Array.isArray(value)) {
    const [
      market_id,
      creator,
      claim,
      criteria,
      source_url,
      deadline,
      status,
      verdict,
      reasoning,
      yes_pool,
      no_pool,
      created_at,
      resolved_at,
      protocol_fee_bps,
    ] = value;
    if (typeof market_id === "string" && typeof creator === "string") {
      return {
        market_id,
        creator,
        claim,
        criteria,
        source_url,
        deadline,
        status,
        verdict,
        reasoning,
        yes_pool,
        no_pool,
        created_at,
        resolved_at,
        protocol_fee_bps,
      };
    }
  }
  if (typeof value === "object") return value as Record<string, any>;
  return {};
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function idList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (value instanceof Map) return Array.from(value.values()).map(String).filter(Boolean);
  return [];
}

function normalizeMarket(raw: unknown): Market {
  const data = asRecord(raw);
  return {
    market_id: toStringValue(data.market_id),
    creator: toStringValue(data.creator),
    claim: toStringValue(data.claim),
    criteria: toStringValue(data.criteria),
    source_url: toStringValue(data.source_url),
    deadline: toNumber(data.deadline),
    status: toStringValue(data.status, "open") as MarketStatus,
    verdict: toStringValue(data.verdict) as Verdict,
    reasoning: toStringValue(data.reasoning),
    yes_pool: toNumber(data.yes_pool),
    no_pool: toNumber(data.no_pool),
    created_at: toStringValue(data.created_at),
    resolved_at: toStringValue(data.resolved_at),
    protocol_fee_bps: toNumber(data.protocol_fee_bps),
    appeal_deadline: toNumber(data.appeal_deadline),  // add this
    positions: [],
  };
}

function normalizePosition(raw: unknown): Position {
  const data = asRecord(raw);
  return {
    position_id: toStringValue(data.position_id),
    market_id: toStringValue(data.market_id),
    staker: toStringValue(data.staker),
    side: toStringValue(data.side, "YES") as Side,
    amount: toNumber(data.amount),
    claimed: Boolean(data.claimed),
  };
}

function unwrap<T>(input: any): T {
  return input?.params ?? input;
}

class DevDuel {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(contractAddress: string, address?: string | null, studioUrl?: string) {
    this.contractAddress = contractAddress as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    if (studioUrl) config.endpoint = studioUrl;
    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    this.client = createClient({
      chain: studionet,
      account: address as `0x${string}`,
    });
  }

  private async read<T>(functionName: string, args: any[] = []): Promise<T> {
    return this.client.readContract({
      address: this.contractAddress,
      functionName,
      args,
    }) as Promise<T>;
  }

  private async write(
    functionName: string,
    args: any[],
    value: bigint
  ): Promise<TransactionReceipt> {
    await this.client.connect("studionet");
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName,
      args,
      value,
    });
    const receipt = await this.client.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.ACCEPTED,
      retries: 48,
      interval: 5000,
    });
    return receipt as TransactionReceipt;
  }

  async getPosition(positionId: string): Promise<Position> {
    return normalizePosition(await this.read("get_position", [positionId]));
  }

  async hydrateMarket(raw: unknown): Promise<Market> {
    const market = normalizeMarket(raw);
    const positions: Position[] = [];
    const rawPositions = await this.read<unknown>("get_market_positions", [market.market_id]);
    const list = Array.isArray(rawPositions)
      ? rawPositions
      : rawPositions instanceof Map
        ? Array.from(rawPositions.values())
        : [];
    for (const row of list) {
      positions.push(normalizePosition(row));
    }
    market.positions = positions;
    return market;
  }

  async getMarket(marketId: string): Promise<Market> {
    return this.hydrateMarket(await this.read("get_market", [marketId]));
  }


  async getAllMarkets(): Promise<Market[]> {
    const raw = await this.read<unknown>("get_all_markets", []);
    const list = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    const out: Market[] = [];
    for (const row of list) out.push(await this.hydrateMarket(row));
    return out;
  }


  async getOpenMarkets(): Promise<Market[]> {
    const raw = await this.read<unknown>("get_open_markets", []);
    const list = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    const out: Market[] = [];
    for (const row of list) out.push(await this.hydrateMarket(row));
    return out;
  }

  async getMarketPositions(marketId: string): Promise<Position[]> {
    const raw = await this.read<unknown>("get_market_positions", [marketId]);
    const list = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    return list.map(normalizePosition);
  }

  async getUserPositions(wallet: string): Promise<Position[]> {
    const raw = await this.read<unknown>("get_user_positions", [wallet]);
    const list = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
    return list.map(normalizePosition);
  }



  async getTotalMarkets(): Promise<number> {
    return toNumber(await this.read("get_total_markets", []));
  }

  async getAdmin(): Promise<string> {
    return toStringValue(await this.read("get_admin", []));
  }

  async getConfig(): Promise<{ admin: string; protocol_fee_bps: number }> {
    const raw = asRecord(await this.read("get_config", []));
    return {
      admin: toStringValue(raw.admin),
      protocol_fee_bps: toNumber(raw.protocol_fee_bps),
    };
  }

  async createMarket(input: CreateMarketParams | { params: CreateMarketParams }) {
    const params = unwrap<CreateMarketParams>(input);
    return this.write(
      "create_market",
      [params.claim, params.criteria, params.sourceUrl, params.durationSeconds],
      0n
    );
  }

  async stake(marketId: string, side: Side, stakeGen: number | bigint) {
    return this.write("stake", [marketId, side], parseEther(stakeGen.toString()));
  }

  async resolveMarket(marketId: string) {
    return this.write("resolve_market", [marketId], 0n);
  }

  async disputeResolution(marketId: string, appealContext: string) {
    return this.write("dispute_resolution", [marketId, appealContext], 0n);
  }

  async finalizeMarket(marketId: string) {
    return this.write("finalize_market", [marketId], 0n);
  }

  async cancelMarket(marketId: string) {
    return this.write("cancel_market", [marketId], 0n);
  }
}

export default DevDuel;
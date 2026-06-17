import type { SuiGrpcClient } from "@mysten/sui/grpc";
import type { Transaction } from "@mysten/sui/transactions";

export type SimulationMode = "dryRun" | "devInspect";

export interface SimulateTxParams {
  client: SuiGrpcClient;
  transaction: Transaction;
}

export interface SimulationResult {
  ok: boolean;
  mode: SimulationMode;
  error?: string;
  status?: string;
  commandResults?: unknown;
}

type SimulateResponse = {
  $kind: string;
  FailedTransaction?: { status?: { error?: unknown } };
};

function extractSimulationError(result: SimulateResponse): string | undefined {
  if (result.$kind === "FailedTransaction") {
    const failed = result.FailedTransaction as { status?: { error?: unknown } };
    const err = failed.status?.error;
    if (err === undefined) {
      return "Simulation failed";
    }
    if (typeof err === "string") {
      return err;
    }
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  }
  return undefined;
}

export async function dryRunTransaction(params: SimulateTxParams): Promise<SimulationResult> {
  const { client, transaction } = params;

  try {
    const result = await client.core.simulateTransaction({
      transaction,
      checksEnabled: true,
      include: { effects: true },
    });

    const error = extractSimulationError(result);
    return {
      ok: result.$kind === "Transaction",
      mode: "dryRun",
      error,
      status: result.$kind,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "dryRun",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function devInspectTransaction(params: SimulateTxParams): Promise<SimulationResult> {
  const { client, transaction } = params;

  try {
    const result = await client.core.simulateTransaction({
      transaction,
      checksEnabled: false,
      include: { commandResults: true, effects: true },
    });

    const error = extractSimulationError(result);
    return {
      ok: result.$kind === "Transaction",
      mode: "devInspect",
      error,
      status: result.$kind,
      commandResults: "commandResults" in result ? result.commandResults : undefined,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "devInspect",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

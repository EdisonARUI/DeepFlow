import { createSuiJsonRpcClient } from "@/lib/sui/network";

export type LimitOrderExecutionOutcome = "filled" | "placed" | "unknown";

type RpcEvent = {
  type?: string;
  parsedJson?: Record<string, unknown>;
};

type RpcTransactionBlock = {
  events?: RpcEvent[];
};

function eventName(type: string): string {
  const parts = type.split("::");
  return parts[parts.length - 1] ?? type;
}

export async function resolveLimitOrderExecutionOutcome(
  digest: string,
): Promise<LimitOrderExecutionOutcome> {
  try {
    const client = createSuiJsonRpcClient();
    const tx = await client.call<RpcTransactionBlock>("sui_getTransactionBlock", [
      digest,
      { showEvents: true },
    ]);

    const events = tx.events ?? [];

    if (
      events.some((event) => eventName(event.type ?? "").includes("OrderFullyFilled"))
    ) {
      return "filled";
    }

    const orderInfo = events.find((event) =>
      eventName(event.type ?? "").includes("OrderInfo"),
    );

    if (orderInfo?.parsedJson && orderInfo.parsedJson.order_inserted === true) {
      return "placed";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

export function formatLimitOrderExecutionNote(
  outcome: LimitOrderExecutionOutcome,
): string | undefined {
  if (outcome === "filled") {
    return "Limit order filled immediately";
  }
  if (outcome === "placed") {
    return "Limit order placed on book";
  }
  return undefined;
}

import type { MockPtb, RouteOperation, RoutePlan } from "../types.ts";

export function buildMockPtb(routePlan: RoutePlan): MockPtb {
  const operations: RouteOperation[] = [
    ...routePlan.sourceOperations,
    routePlan.tradeOperation,
    ...routePlan.settlementOperations
  ];

  if (routePlan.feeOperation) {
    operations.push(routePlan.feeOperation);
  }

  return {
    kind: "mock-ptb",
    routePlanId: routePlan.id,
    atomic: true,
    rollbackGuarantee: "all-or-nothing",
    commands: operations.map((operation) => ({
      op: operation.type,
      description: describeOperation(operation)
    }))
  };
}

function describeOperation(operation: RouteOperation): string {
  const destination = operation.destination ? ` to ${operation.destination}` : "";

  return `${operation.type} ${operation.amount.toString()} ${operation.asset} via ${operation.protocol}${destination}`;
}

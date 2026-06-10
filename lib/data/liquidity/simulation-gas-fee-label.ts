import type { SimulationStatus } from "./use-supply-withdraw-simulation";

export function getSimulationGasFeeLabel(status: SimulationStatus): string {
  if (status === "simulating") {
    return "...";
  }
  if (status === "success") {
    return "Ready";
  }
  return "-";
}

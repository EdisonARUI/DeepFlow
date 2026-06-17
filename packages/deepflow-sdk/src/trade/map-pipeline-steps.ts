import type { MockPtb } from "../types.ts";
import type { DeepbookQuoteInput } from "./types.ts";

export type PipelineStepStatus = "pending" | "active" | "done" | "error";

export type PipelineStep = {
  id: string;
  label: string;
  status: PipelineStepStatus;
  description?: string;
};

const DEFAULT_LABELS = [
  "WITHDRAW",
  "DEEPBOOK_TRADE",
  "SETTLE",
  "REDEPOSIT",
] as const;

const OP_LABELS: Record<string, string> = {
  withdraw: "WITHDRAW",
  deepbook_trade: "DEEPBOOK_TRADE",
  settle: "SETTLE",
  redeposit: "REDEPOSIT",
  return: "RETURN",
  fee: "FEE",
};

export function buildIdlePipelineSteps(): PipelineStep[] {
  return DEFAULT_LABELS.map((label, index) => ({
    id: `step-${index}`,
    label,
    status: "pending",
  }));
}

export function buildBootstrapSuccessPipelineSteps(): PipelineStep[] {
  return [
    { id: "step-0", label: "SUPPLY", status: "done", description: "NAVI supply SUI" },
    { id: "step-1", label: "WITHDRAW", status: "done", description: "NAVI withdraw SUI" },
    { id: "step-2", label: "DEEPBOOK_TRADE", status: "done", description: "Swap SUI→USDC" },
    { id: "step-3", label: "REDEPOSIT", status: "done", description: "NAVI supply USDC" },
  ];
}

export function buildWalletNaviSwapSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-1",
      label: "REDEPOSIT",
      status: "done",
      description: `NAVI supply ${outputAsset}`,
    },
  ];
}

export function buildWalletSwapSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-1",
      label: "RETURN",
      status: "done",
      description: `Transfer ${outputAsset} to wallet`,
    },
  ];
}

export function buildNaviRoundTripSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "WITHDRAW",
      status: "done",
      description: `NAVI withdraw ${inputAsset}`,
    },
    {
      id: "step-1",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-2",
      label: "REDEPOSIT",
      status: "done",
      description: `NAVI supply ${outputAsset}`,
    },
  ];
}

export function buildNaviReturnSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "WITHDRAW",
      status: "done",
      description: `NAVI withdraw ${inputAsset}`,
    },
    {
      id: "step-1",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-2",
      label: "RETURN",
      status: "done",
      description: `Transfer ${outputAsset} to wallet`,
    },
  ];
}

export function buildWalletSuilendSwapSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-1",
      label: "REDEPOSIT",
      status: "done",
      description: `Suilend supply ${outputAsset}`,
    },
  ];
}

export function buildSuilendRoundTripSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "WITHDRAW",
      status: "done",
      description: `Suilend withdraw ${inputAsset}`,
    },
    {
      id: "step-1",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-2",
      label: "REDEPOSIT",
      status: "done",
      description: `Suilend supply ${outputAsset}`,
    },
  ];
}

export function buildSuilendReturnSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "WITHDRAW",
      status: "done",
      description: `Suilend withdraw ${inputAsset}`,
    },
    {
      id: "step-1",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-2",
      label: "RETURN",
      status: "done",
      description: `Transfer ${outputAsset} to wallet`,
    },
  ];
}

export function buildNaviSuilendSwapSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "WITHDRAW",
      status: "done",
      description: `NAVI withdraw ${inputAsset}`,
    },
    {
      id: "step-1",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-2",
      label: "REDEPOSIT",
      status: "done",
      description: `Suilend supply ${outputAsset}`,
    },
  ];
}

export function buildSuilendNaviSwapSuccessPipelineSteps(
  inputAsset = "SUI",
  outputAsset = "USDC",
): PipelineStep[] {
  return [
    {
      id: "step-0",
      label: "WITHDRAW",
      status: "done",
      description: `Suilend withdraw ${inputAsset}`,
    },
    {
      id: "step-1",
      label: "DEEPBOOK_TRADE",
      status: "done",
      description: `Swap ${inputAsset}→${outputAsset}`,
    },
    {
      id: "step-2",
      label: "REDEPOSIT",
      status: "done",
      description: `NAVI supply ${outputAsset}`,
    },
  ];
}

export function buildPipelineStepsFromPtb(
  ptb: MockPtb,
  phase: "simulating" | "success" | "error",
): PipelineStep[] {
  return ptb.commands.map((command, index) => {
    let status: PipelineStepStatus = "pending";

    if (phase === "success") {
      status = "done";
    } else if (phase === "error") {
      status = index < ptb.commands.length - 1 ? "done" : "error";
    } else if (phase === "simulating") {
      status = index < ptb.commands.length - 1 ? "done" : "active";
    }

    return {
      id: `step-${index}`,
      label: OP_LABELS[command.op] ?? command.op.toUpperCase(),
      status,
      description: command.description,
    };
  });
}

export function deepbookQuoteFromHuman(params: {
  estimatedOutput: number;
  minOutput: number;
  deepRequired: number;
  feeLabel: string;
  slippageBps: number;
  outputDecimals?: number;
}): DeepbookQuoteInput {
  const scale = 10n ** BigInt(params.outputDecimals ?? 6);

  return {
    estimatedOutput: BigInt(Math.round(params.estimatedOutput * Number(scale))),
    minOutput: BigInt(Math.round(params.minOutput * Number(scale))),
    feeDeepAmount: BigInt(Math.round(params.deepRequired)),
    feeLabel: params.feeLabel,
    slippageBps: params.slippageBps,
  };
}

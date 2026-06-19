#!/usr/bin/env node
/**
 * One-time DeepBook referral bootstrap for featured pools.
 *
 * Usage:
 *   DEEPFLOW_MINT_SENDER=0x... DEEPFLOW_REFERRAL_MULTIPLIER=0.5 node scripts/mint-deepbook-referrals.mjs
 *
 * Signs and executes one PTB per pool (mint_referral). Writes object IDs to
 * scripts/output/deepbook-referrals.json and prints env lines for .env.local.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DeepBookConfig, DeepBookContract, mainnetPools } from "@mysten/deepbook-v3";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";

const FEATURED_POOL_KEYS = [
  "SUI_USDC",
  "DEEP_SUI",
  "WAL_SUI",
  "DEEP_USDC",
  "SUI_SUIUSDE",
  "SUIUSDE_USDC",
  "XBTC_USDC",
];

const sender = process.env.DEEPFLOW_MINT_SENDER;
const privateKey = process.env.DEEPFLOW_MINT_PRIVATE_KEY;
const multiplier = Number(process.env.DEEPFLOW_REFERRAL_MULTIPLIER ?? "0.5");

if (!sender) {
  console.error("Set DEEPFLOW_MINT_SENDER to the DeepFlow ops wallet address.");
  process.exit(1);
}

if (!privateKey) {
  console.error("Set DEEPFLOW_MINT_PRIVATE_KEY (suiprivkey...) for signing.");
  process.exit(1);
}

const keypair = Ed25519Keypair.fromSecretKey(privateKey);
if (keypair.getPublicKey().toSuiAddress() !== sender) {
  console.error("DEEPFLOW_MINT_PRIVATE_KEY does not match DEEPFLOW_MINT_SENDER.");
  process.exit(1);
}

const client = new SuiGrpcClient({
  network: "mainnet",
  baseUrl: "https://fullnode.mainnet.sui.io:443",
});

const config = new DeepBookConfig({ address: sender, network: "mainnet" });
const deepBook = new DeepBookContract(config);

const output = {};

for (const poolKey of FEATURED_POOL_KEYS) {
  if (!(poolKey in mainnetPools)) {
    console.warn(`Skipping unknown pool ${poolKey}`);
    continue;
  }

  const tx = new Transaction();
  tx.setSender(sender);
  tx.add(deepBook.mintReferral(poolKey, multiplier));

  const result = await client.core.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  if (result.FailedTransaction) {
    throw new Error(
      `mintReferral failed for ${poolKey}: ${result.FailedTransaction.status.error?.message ?? "unknown"}`,
    );
  }

  const created = result.Transaction.effects?.changedObjects?.filter(
    (obj) => obj.idOperation?.operation === "Created",
  );
  const referralId = created?.[0]?.objectId;
  if (!referralId) {
    throw new Error(`No referral object created for ${poolKey}`);
  }

  output[poolKey] = referralId;
  console.log(`Minted ${poolKey} referral: ${referralId}`);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "output");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "deepbook-referrals.json");
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

console.log("\nAdd to .env.local:\n");
for (const [poolKey, id] of Object.entries(output)) {
  console.log(`NEXT_PUBLIC_DEEPBOOK_REFERRAL_${poolKey}=${id}`);
}
console.log(`\nSaved ${outPath}`);

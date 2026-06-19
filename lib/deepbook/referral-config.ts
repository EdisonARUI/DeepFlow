import { FEATURED_POOL_KEYS } from "@/lib/data/pricing/deepbook-mid-price-service";

const REFERRAL_ENV_PREFIX = "NEXT_PUBLIC_DEEPBOOK_REFERRAL_";
const INTEGRATION_REFERRAL_ENV_PREFIX = "DEEPBOOK_REFERRAL_";

function poolKeyToEnvSuffix(poolKey: string): string {
  return poolKey.toUpperCase();
}

/** Resolve DeepBook pool referral object ID from env. */
export function getReferralId(poolKey: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  const suffix = poolKeyToEnvSuffix(poolKey);
  const integrationKey = `${INTEGRATION_REFERRAL_ENV_PREFIX}${suffix}`;
  const publicKey = `${REFERRAL_ENV_PREFIX}${suffix}`;

  const fromIntegration = process.env[integrationKey]?.trim();
  if (fromIntegration) {
    return fromIntegration;
  }

  const fromPublic = process.env[publicKey]?.trim();
  if (fromPublic) {
    return fromPublic;
  }

  return undefined;
}

export function getRequiredReferralId(poolKey: string): string {
  const referralId = getReferralId(poolKey);
  if (!referralId) {
    throw new Error(
      `Missing DeepBook referral for pool ${poolKey}. Set ${REFERRAL_ENV_PREFIX}${poolKeyToEnvSuffix(poolKey)}.`,
    );
  }
  return referralId;
}

export function listConfiguredReferralPoolKeys(): readonly string[] {
  return FEATURED_POOL_KEYS.filter((poolKey) => getReferralId(poolKey) !== undefined);
}

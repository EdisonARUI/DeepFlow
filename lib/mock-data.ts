export const NAV_ITEMS = [
  { href: "/portfolio", label: "PORTFOLIO", section: "PORTFOLIO" },
  { href: "/liquidity", label: "LIQUIDITY", section: "LIQUIDITY" },
  { href: "/trading", label: "TRADING", section: "TRADING" },
  { href: "/security", label: "SECURITY", section: "SECURITY" },
] as const;

export type WhitelistEntry = {
  address: string;
  label: string;
  status: "ACTIVE";
};

export const WHITELIST: WhitelistEntry[] = [
  { address: "0x7a...9f12", label: "TREASURY_MAIN", status: "ACTIVE" },
  { address: "0x3b...e4a1", label: "HOT_WALLET_A", status: "ACTIVE" },
];

export type SessionKey = {
  keyId: string;
  status: "VALID";
  expires: string;
};

export const SESSION_KEYS: SessionKey[] = [
  { keyId: "0x82...a1", status: "VALID", expires: "02:45:12" },
  { keyId: "0x82...a2", status: "VALID", expires: "01:12:08" },
  { keyId: "0x82...a3", status: "VALID", expires: "03:58:44" },
  { keyId: "0x82...a4", status: "VALID", expires: "00:45:30" },
  { keyId: "0x82...a5", status: "VALID", expires: "04:22:17" },
];

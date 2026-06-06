import {
  CircuitBreakers,
  EndpointLock,
  QuotaManagement,
  SessionKeysPanel,
} from "@/components/security/security-sections";

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-[1440px] p-6">
      <div className="grid grid-cols-12 gap-4">
        <EndpointLock />
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-5">
          <CircuitBreakers />
          <QuotaManagement />
          <SessionKeysPanel />
        </div>
      </div>
    </div>
  );
}

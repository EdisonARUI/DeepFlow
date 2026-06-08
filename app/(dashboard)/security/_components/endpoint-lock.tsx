"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { TerminalPanel } from "@/components/terminal-panel";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WHITELIST } from "@/lib/mock-data";

export function EndpointLock() {
  const [address, setAddress] = useState("");

  return (
    <TerminalPanel
      accentTop="border-t-accent-green"
      className="col-span-12 lg:col-span-7"
      contentClassName="space-y-4 p-5"
      title={
        <div className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary uppercase">
          <Lock className="size-4 text-accent-green" />
          ENDPOINT_LOCK
        </div>
      }
      actions={<StatusBadge variant="active">WHITELIST_MGMT</StatusBadge>}
    >
      <p className="text-sm leading-relaxed text-text-muted">
        Management list for trusted payout addresses. Unlisted targets will trigger
        automatic reversion.
      </p>
      <div className="overflow-hidden border border-border-default bg-bg-secondary">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {["ADDRESS_HASH", "LABEL", "STATUS"].map((col) => (
                <TableHead
                  key={col}
                  className="text-[11px] font-bold tracking-[0.6px] text-text-muted uppercase"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {WHITELIST.map((row) => (
              <TableRow key={row.address} className="border-border-muted/40">
                <TableCell className="font-mono text-accent-green">{row.address}</TableCell>
                <TableCell>{row.label}</TableCell>
                <TableCell>
                  <StatusBadge variant="active">{row.status}</StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex gap-2">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          className="rounded-none border-border-default bg-bg-secondary font-mono"
        />
        <Button className="rounded-none bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase hover:bg-accent-cyan/90">
          ADD_ADDR
        </Button>
      </div>
    </TerminalPanel>
  );
}

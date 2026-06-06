"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Key,
  Lock,
  Zap,
} from "lucide-react";
import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SESSION_KEYS, WHITELIST } from "@/lib/mock-data";

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

export function CircuitBreakers() {
  return (
    <TerminalPanel
      className="col-span-12 lg:col-span-5"
      contentClassName="space-y-5 p-5"
      title={
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-accent-orange" />
          <TerminalLabel className="text-text-primary">CIRCUIT_BREAKERS</TerminalLabel>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-text-muted">Max slippage tolerance</span>
          <span className="text-accent-orange">0.5%</span>
        </div>
        <Slider defaultValue={[25]} max={100} className="[&_[data-slot=slider-range]]:bg-accent-orange" />
        <div className="flex justify-between text-[10px] text-text-muted uppercase">
          <span>0.1%</span>
          <span>2.0%</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-text-muted">Rollback threshold</span>
          <span className="text-destructive">$50,000</span>
        </div>
        <Progress value={50} className="h-2 bg-bg-secondary [&>div]:bg-destructive/70" />
      </div>
      <Button className="w-full rounded-none bg-accent-cyan text-[11px] font-bold tracking-[1.1px] text-[var(--text-on-accent)] uppercase">
        SET
      </Button>
    </TerminalPanel>
  );
}

export function QuotaManagement() {
  return (
    <TerminalPanel
      className="col-span-12 lg:col-span-5"
      contentClassName="space-y-5 p-5"
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          <TerminalLabel className="text-text-primary">QUOTA_MGMT</TerminalLabel>
        </div>
      }
    >
      <div className="space-y-2">
        <div className="flex justify-between text-[12px]">
          <span className="text-text-muted">Current utilization</span>
          <span>
            <span className="text-destructive">$142,500</span>
            <span className="text-text-muted"> / $200,000</span>
          </span>
        </div>
        <Progress value={71} className="h-2 bg-bg-secondary [&>div]:bg-destructive/60" />
      </div>
      <div className="space-y-2">
        <span className="text-[11px] text-text-muted uppercase">Update daily limit</span>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center border border-border-default bg-bg-secondary px-3">
            <span className="text-text-muted">$</span>
            <Input
              defaultValue="200000"
              className="rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            size="sm"
            className="rounded-none bg-accent-cyan text-[11px] font-bold text-[var(--text-on-accent)] uppercase"
          >
            SET
          </Button>
        </div>
      </div>
    </TerminalPanel>
  );
}

export function SessionKeysPanel() {
  return (
    <TerminalPanel
      className="col-span-12 lg:col-span-5"
      contentClassName="space-y-4 p-5"
      title={
        <div className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary uppercase">
          <Key className="size-4 text-accent-cyan" />
          SESSION_KEYS
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Select defaultValue="4h">
            <SelectTrigger className="h-8 w-20 rounded-none border-border-default text-[11px] uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="8h">8h</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-none bg-accent-cyan text-[11px] font-bold text-[var(--text-on-accent)] uppercase">
            GENERATE_KEY
          </Button>
        </div>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {["KEY_ID", "STATUS", "EXPIRES"].map((col) => (
              <TableHead
                key={col}
                className="text-[10px] font-bold tracking-[0.6px] text-text-muted uppercase"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {SESSION_KEYS.map((row) => (
            <TableRow key={row.keyId} className="border-border-muted/40">
              <TableCell className="font-mono text-[12px] text-accent-cyan">
                {row.keyId}
              </TableCell>
              <TableCell className="text-[12px]">{row.status}</TableCell>
              <TableCell className="font-mono text-[12px]">{row.expires}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}

"use client";

import { Key } from "lucide-react";
import { TerminalPanel } from "@/components/terminal-panel";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SESSION_KEYS } from "@/lib/mock-data";

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

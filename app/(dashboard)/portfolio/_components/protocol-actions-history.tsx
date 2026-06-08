import { TerminalLabel } from "@/components/terminal-label";
import { TerminalPanel } from "@/components/terminal-panel";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PROTOCOL_ACTIONS } from "@/lib/mock-data";

export function ProtocolActionsHistory() {
  return (
    <TerminalPanel
      className="col-span-full"
      contentClassName="p-0"
      title={<TerminalLabel>PROTOCOL_ACTIONS_HISTORY</TerminalLabel>}
      actions={
        <span className="text-[12px] tracking-[0.6px] text-text-muted uppercase">
          Filter: supply_withdraw
        </span>
      }
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border-default hover:bg-transparent">
            {["DATE", "ACTION", "PROTOCOL", "ASSET", "AMOUNT", "STATUS", "TX_HASH"].map(
              (col) => (
                <TableHead
                  key={col}
                  className={cn(
                    "text-[11px] font-bold tracking-[0.6px] text-text-muted uppercase",
                    col === "TX_HASH" && "text-right",
                  )}
                >
                  {col}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PROTOCOL_ACTIONS.map((row) => (
            <TableRow key={row.txHash} className="border-border-muted/40">
              <TableCell className="text-[12px] text-text-primary/70">{row.date}</TableCell>
              <TableCell
                className={cn(
                  "text-[12px] font-bold uppercase",
                  row.action === "SUPPLY" ? "text-accent-cyan" : "text-accent-orange",
                )}
              >
                {row.action}
              </TableCell>
              <TableCell className="text-[12px]">{row.protocol}</TableCell>
              <TableCell className="text-[12px]">{row.asset}</TableCell>
              <TableCell
                className={cn(
                  "text-[12px]",
                  row.amount.startsWith("+") ? "text-accent-cyan" : "text-accent-orange",
                )}
              >
                {row.amount}
              </TableCell>
              <TableCell>
                <StatusBadge
                  variant={row.status === "COMPLETED" ? "completed" : "pending"}
                  dot
                >
                  {row.status}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right text-[12px] text-text-primary/50">
                {row.txHash}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TerminalPanel>
  );
}

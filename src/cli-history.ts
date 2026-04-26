import { Command } from "commander";
import {
  loadHistory,
  clearHistory,
  getHistoryEntry,
} from "./history";
import { printHistoryLog, printHistoryTable, formatHistoryEntry } from "./history-report";

export function registerHistoryCommand(program: Command): void {
  const history = program
    .command("history")
    .description("View and manage the comparison history log");

  history
    .command("list")
    .description("List all recorded comparison runs")
    .option("--table", "Show compact table view")
    .option("--file <path>", "Custom history file path")
    .action((opts) => {
      const log = loadHistory(opts.file);
      if (opts.table) {
        printHistoryTable(log);
      } else {
        printHistoryLog(log);
      }
    });

  history
    .command("show <id>")
    .description("Show details for a specific history entry by ID")
    .option("--file <path>", "Custom history file path")
    .action((id: string, opts) => {
      const entry = getHistoryEntry(id, opts.file);
      if (!entry) {
        console.error(`No history entry found with id: ${id}`);
        process.exit(1);
      }
      console.log(formatHistoryEntry(entry));
    });

  history
    .command("clear")
    .description("Clear all history entries")
    .option("--file <path>", "Custom history file path")
    .action((opts) => {
      clearHistory(opts.file);
      console.log("History cleared.");
    });
}

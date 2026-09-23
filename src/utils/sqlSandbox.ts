/**
 * 前端 SQL 沙箱 —— sql.js（SQLite 编译为 WebAssembly）
 *
 * 运行时资产自托管于 /sqlite/（sql-wasm.js + sql-wasm.wasm）。
 * 在浏览器内存中创建课程用表（agents）并造数，真实执行用户 SQL，
 * 将结果集格式化为 ASCII 表格输出——由"假表回放"升级为"真执行"。
 */

import type { SandboxResult } from "./pyodideRuntime";

declare global {
  interface Window {
    initSqlJs?: (opts: { locateFile: (file: string) => string }) => Promise<SQLJsModule>;
  }
}

interface SQLJsModule {
  Database: new () => SQLDatabase;
}

interface SQLDatabase {
  run(sql: string): void;
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
  getRowsModified(): number;
  close(): void;
}

let sqlJsPromise: Promise<() => Promise<SQLJsModule>> | null = null;

function loadSQLJs(): Promise<() => Promise<SQLJsModule>> {
  if (!sqlJsPromise) {
    sqlJsPromise = new Promise((resolve, reject) => {
      if (window.initSqlJs) {
        resolve(() => window.initSqlJs!({ locateFile: (f) => "/sqlite/" + f }));
        return;
      }
      const s = document.createElement("script");
      s.src = "/sqlite/sql-wasm.js";
      s.onload = () => {
        if (window.initSqlJs) {
          resolve(() => window.initSqlJs!({ locateFile: (f) => "/sqlite/" + f }));
        } else {
          reject(new Error("SQLite WASM 初始化入口缺失"));
        }
      };
      s.onerror = () => reject(new Error("SQLite WASM 加载失败"));
      document.head.appendChild(s);
    });
  }
  return sqlJsPromise;
}

/** 课程用表初始化脚本（与课程 agents 表结构一致，含符合过滤条件的数据） */
const COURSE_SCHEMA = `
CREATE TABLE agents (
  agent_id   TEXT PRIMARY KEY,
  agent_name TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  status     TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT INTO agents (agent_id, agent_name, latency_ms, status) VALUES
  ('agt-1024', 'Order-Orchestrator',  890, 'RUNNING'),
  ('agt-0817', 'RAG-Query-Router',    452, 'RUNNING'),
  ('agt-0603', 'Alert-Notifier',      238, 'RUNNING'),
  ('agt-0412', 'Data-Indexer',         98, 'RUNNING'),
  ('agt-0201', 'Retired-Bot',          12, 'STOPPED');
`;

function formatTable(columns: string[], rows: unknown[][]): string {
  const colStrs = columns.map((c) => String(c));
  const widths = colStrs.map((c, i) => {
    let w = c.length;
    for (const r of rows) {
      const v = r[i] === null || r[i] === undefined ? "NULL" : String(r[i]);
      if (v.length > w) w = v.length;
    }
    return Math.max(w, 3);
  });

  const border = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
  const header = "|" + colStrs.map((c, i) => " " + c.padEnd(widths[i]) + " ").join("|") + "|";
  const body = rows
    .map((r) => "|" + r.map((v, i) => {
      const s = v === null || v === undefined ? "NULL" : String(v);
      return " " + s.padEnd(widths[i]) + " ";
    }).join("|") + "|")
    .join("\n");

  return [border, header, border, body, border].join("\n");
}

/** 执行 SQL（支持多语句），格式化所有结果集 */
export async function runSQL(sql: string): Promise<SandboxResult> {
  const clean = (sql || "").trim();
  if (!clean) {
    return {
      status: "empty",
      output: "⚠️ [执行拦截]: 请输入要执行的 SQL 语句。",
      executionTimeMs: 0,
    };
  }

  const start = performance.now();
  try {
    const getInit = await loadSQLJs();
    const init = await getInit();
    const db = new init.Database();
    db.run(COURSE_SCHEMA);

    const parts: string[] = [];
    const results = db.exec(clean);
    let rowCount = 0;
    if (results.length === 0) {
      const affected = db.getRowsModified();
      parts.push(`[SQLite]: 语句执行成功，影响行数 ${affected}`);
    } else {
      results.forEach((rs, idx) => {
        if (idx > 0) parts.push("");
        parts.push(formatTable(rs.columns, rs.values));
        rowCount += rs.values.length;
      });
      parts.push(`${rowCount} row${rowCount === 1 ? "" : "s"} in set (${Math.max(1, Math.round(performance.now() - start))} ms)`);
    }

    db.close();
    return {
      status: "success",
      output: parts.join("\n"),
      executionTimeMs: Math.round(performance.now() - start),
    };
  } catch (e: any) {
    const msg = String((e && e.message) || e).split("\n")[0];
    return {
      status: "error",
      output: `SQLite 错误: ${msg}`,
      executionTimeMs: Math.round(performance.now() - start),
    };
  }
}
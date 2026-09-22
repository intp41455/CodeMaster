export interface VariableState {
  name: string;
  value: string;
  type: "string" | "number" | "boolean" | "list" | "dict" | "other";
  changed?: boolean;
}

export interface TraceStep {
  stepNumber: number;
  lineNumber: number;
  rawCode: string;
  explanation: string;
  variables: Record<string, VariableState>;
  stdoutPiece?: string;
  logicType: "assignment" | "io" | "branch" | "loop" | "arithmetic" | "declaration" | "call";
  branchTag?: "if_true" | "if_false" | "else_hit" | "loop_body" | "mainline";
}

export interface HeatmapStats {
  lineExecutionCounts: Record<number, number>; // lineNumber -> execution count
  maxExecutions: number;
  totalExecutions: number;
  hotspotLines: number[]; // line numbers that are most executed (> 1 or max)
  branchStats: {
    branchesEvaluated: number;
    loopsExecuted: number;
    ioCalls: number;
    assignments: number;
  };
}

/**
 * Parses Python / JS basic scripts into detailed, step-by-step execution traces.
 * Supports loops (e.g. range(1, 4), range(3)) and if/else conditions so that
 * repeatedly executed lines reflect real loop frequencies in the heatmap!
 */
export function generateCodeExecutionTrace(code: string, language: string = "python"): TraceStep[] {
  const lines = code.split("\n");
  const steps: TraceStep[] = [];
  const memory: Record<string, VariableState> = {};
  let stepCounter = 1;

  // Evaluate simple Python-style conditions (e.g., battery < 20, weather == "下雨", gold >= 50)
  const evalCondition = (cond: string): boolean => {
    let expr = cond.trim();
    // Replace variable names in expression with their numeric or string values
    for (const [k, v] of Object.entries(memory)) {
      const regex = new RegExp(`\\b${k}\\b`, "g");
      if (v.type === "number") {
        expr = expr.replace(regex, v.value);
      } else if (v.type === "string") {
        expr = expr.replace(regex, `"${v.value}"`);
      }
    }
    try {
      // Clean Python truth values
      expr = expr.replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false");
      // eslint-disable-next-line no-eval
      return Boolean(eval(expr));
    } catch {
      return true; // default true if complex
    }
  };

  // Helper to evaluate and execute a single line
  const executeSingleLine = (
    trimmed: string,
    lineNumber: number,
    branchTag?: TraceStep["branchTag"]
  ) => {
    // 1. Check for print(...) or console.log(...)
    const printMatch = trimmed.match(/^print\((.*)\)$/) || trimmed.match(/^console\.log\((.*)\);?$/);
    if (printMatch) {
      const inner = printMatch[1].trim();
      let printedVal = "";

      // Check f-string or normal string: f"第 {i} 天..."
      if (inner.startsWith('f"') || inner.startsWith("f'")) {
        let content = inner.slice(2, -1);
        for (const [k, v] of Object.entries(memory)) {
          content = content.replace(new RegExp(`\\{${k}\\}`, "g"), v.value);
        }
        printedVal = content;
      } else if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
        printedVal = inner.slice(1, -1);
      } else if (memory[inner]) {
        printedVal = memory[inner].value;
      } else {
        const parts = inner.split(",").map((p) => p.trim());
        printedVal = parts
          .map((part) => {
            if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
              return part.slice(1, -1);
            }
            if (memory[part]) {
              return memory[part].value;
            }
            return part;
          })
          .join(" ");
      }

      steps.push({
        stepNumber: stepCounter++,
        lineNumber,
        rawCode: trimmed,
        explanation: `调用 I/O 屏幕显示系统：从内存读取数据，向控制台屏幕输出 "${printedVal}"。`,
        variables: JSON.parse(JSON.stringify(memory)),
        stdoutPiece: printedVal,
        logicType: "io",
        branchTag: branchTag || "mainline",
      });
      return;
    }

    // 2. Variable assignment: e.g., var_name = value
    const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|\+=|-=|\*=)\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const operator = assignMatch[2];
      const expr = assignMatch[3].trim();

      let valStr = expr;
      let varType: VariableState["type"] = "string";

      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        valStr = expr.slice(1, -1);
        varType = "string";
      } else if (!isNaN(Number(expr))) {
        valStr = expr;
        varType = "number";
      } else if (expr.startsWith("[") && expr.endsWith("]")) {
        valStr = expr;
        varType = "list";
      } else if (operator === "+=" || expr.includes("+") || expr.includes("-")) {
        varType = "number";
        const existingNum = memory[varName] ? parseInt(memory[varName].value, 10) : 0;
        if (operator === "+=") {
          const delta = parseInt(expr, 10) || 0;
          valStr = (existingNum + delta).toString();
        } else if (expr.includes("+")) {
          const tokens = expr.split("+").map((t) => t.trim());
          let sum = 0;
          tokens.forEach((tok) => {
            if (memory[tok]) {
              sum += parseInt(memory[tok].value, 10) || 0;
            } else {
              sum += parseInt(tok, 10) || 0;
            }
          });
          valStr = sum.toString();
        } else {
          valStr = expr;
        }
      } else if (memory[expr]) {
        valStr = memory[expr].value;
        varType = memory[expr].type;
      }

      Object.keys(memory).forEach((k) => (memory[k].changed = false));
      const isNew = !memory[varName];
      memory[varName] = {
        name: varName,
        value: valStr,
        type: varType,
        changed: true,
      };

      const explanation = isNew
        ? `内存分配与初始化：在 RAM 中开辟命名空间「${varName}」，装入初始值 ${varType === "string" ? `"${valStr}"` : valStr}。`
        : `变量更新（重新赋值）：CPU 计算表达式，将新值 ${varType === "string" ? `"${valStr}"` : valStr} 覆盖写回「${varName}」的内存槽。`;

      steps.push({
        stepNumber: stepCounter++,
        lineNumber,
        rawCode: trimmed,
        explanation,
        variables: JSON.parse(JSON.stringify(memory)),
        logicType: isNew ? "declaration" : "assignment",
        branchTag: branchTag || "mainline",
      });
      return;
    }

    // 3. Fallback generic statement
    steps.push({
      stepNumber: stepCounter++,
      lineNumber,
      rawCode: trimmed,
      explanation: `指令执行：CPU 解析并运算语句。`,
      variables: JSON.parse(JSON.stringify(memory)),
      logicType: "arithmetic",
      branchTag: branchTag || "mainline",
    });
  };

  // Main linear + loop + branch scan
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    const lineNumber = i + 1;

    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) {
      i++;
      continue;
    }

    // A. Check for Loop header: for i in range(...)
    const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\(([^)]+)\):$/);
    if (forRangeMatch) {
      const iterVar = forRangeMatch[1];
      const rangeArgs = forRangeMatch[2].split(",").map((s) => parseInt(s.trim(), 10));
      let start = 0;
      let stop = 3;

      if (rangeArgs.length === 1 && !isNaN(rangeArgs[0])) {
        start = 0;
        stop = rangeArgs[0];
      } else if (rangeArgs.length >= 2 && !isNaN(rangeArgs[0]) && !isNaN(rangeArgs[1])) {
        start = rangeArgs[0];
        stop = rangeArgs[1];
      }

      // Collect loop body lines (indented lines following the for statement)
      const loopBody: { line: string; lineNo: number }[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextRaw = lines[j];
        if (!nextRaw.trim()) {
          j++;
          continue;
        }
        if (nextRaw.startsWith("    ") || nextRaw.startsWith("\t")) {
          loopBody.push({ line: nextRaw.trim(), lineNo: j + 1 });
          j++;
        } else {
          break;
        }
      }

      // Record loop header entry
      steps.push({
        stepNumber: stepCounter++,
        lineNumber,
        rawCode: trimmed,
        explanation: `循环流水线启动：CPU 设定迭代区间 [${start} 到 ${stop - 1}]，准备在寄存器推进计数。`,
        variables: JSON.parse(JSON.stringify(memory)),
        logicType: "loop",
        branchTag: "loop_body",
      });

      // Execute loop iterations
      for (let count = start; count < stop; count++) {
        // Update iteration variable
        memory[iterVar] = {
          name: iterVar,
          value: count.toString(),
          type: "number",
          changed: true,
        };

        // Step for loop counter update
        steps.push({
          stepNumber: stepCounter++,
          lineNumber,
          rawCode: trimmed,
          explanation: `循环流水线迭代：计数器更新为 ${iterVar} = ${count}，开始执行循环体。`,
          variables: JSON.parse(JSON.stringify(memory)),
          logicType: "loop",
          branchTag: "loop_body",
        });

        // Execute inner lines
        for (const bodyItem of loopBody) {
          executeSingleLine(bodyItem.line, bodyItem.lineNo, "loop_body");
        }
      }

      i = j;
      continue;
    }

    // B. Check for Conditional Branch: if ... :
    if (trimmed.startsWith("if ")) {
      const conditionStr = trimmed.replace(/^if\s+/, "").replace(/:$/, "").trim();
      const isCondMet = evalCondition(conditionStr);

      // Collect if-block lines
      const ifBody: { line: string; lineNo: number }[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const nextRaw = lines[j];
        if (!nextRaw.trim()) {
          j++;
          continue;
        }
        if (nextRaw.startsWith("    ") || nextRaw.startsWith("\t")) {
          ifBody.push({ line: nextRaw.trim(), lineNo: j + 1 });
          j++;
        } else {
          break;
        }
      }

      // Check if followed by else:
      let elseLineNo: number | null = null;
      const elseBody: { line: string; lineNo: number }[] = [];
      if (j < lines.length && lines[j].trim() === "else:") {
        elseLineNo = j + 1;
        j++;
        while (j < lines.length) {
          const nextRaw = lines[j];
          if (!nextRaw.trim()) {
            j++;
            continue;
          }
          if (nextRaw.startsWith("    ") || nextRaw.startsWith("\t")) {
            elseBody.push({ line: nextRaw.trim(), lineNo: j + 1 });
            j++;
          } else {
            break;
          }
        }
      }

      // Record condition check step
      steps.push({
        stepNumber: stepCounter++,
        lineNumber,
        rawCode: trimmed,
        explanation: `分支条件判断：CPU 计算「${conditionStr}」，判定结果为 ${isCondMet ? "【成立 (True)】" : "【不成立 (False)】"}。`,
        variables: JSON.parse(JSON.stringify(memory)),
        logicType: "branch",
        branchTag: isCondMet ? "if_true" : "if_false",
      });

      if (isCondMet) {
        for (const bodyItem of ifBody) {
          executeSingleLine(bodyItem.line, bodyItem.lineNo, "if_true");
        }
      } else if (elseLineNo !== null) {
        steps.push({
          stepNumber: stepCounter++,
          lineNumber: elseLineNo,
          rawCode: "else:",
          explanation: `转向备用分支：因上方 if 条件未达成，CPU 控制流跳转至 else 分支执行。`,
          variables: JSON.parse(JSON.stringify(memory)),
          logicType: "branch",
          branchTag: "else_hit",
        });
        for (const bodyItem of elseBody) {
          executeSingleLine(bodyItem.line, bodyItem.lineNo, "else_hit");
        }
      }

      i = j;
      continue;
    }

    // C. Standard single line execution
    executeSingleLine(trimmed, lineNumber, "mainline");
    i++;
  }

  // Fallback if empty
  if (steps.length === 0) {
    steps.push({
      stepNumber: 1,
      lineNumber: 1,
      rawCode: code.split("\n")[0] || "# 空指令",
      explanation: "程序等待输入，当前未检测到执行指令。",
      variables: {},
      logicType: "declaration",
      branchTag: "mainline",
    });
  }

  return steps;
}

/**
 * Computes frequency heatmap statistics for each line in the code based on the execution trace steps.
 */
export function calculateExecutionHeatmap(steps: TraceStep[]): HeatmapStats {
  const lineExecutionCounts: Record<number, number> = {};
  let maxExecutions = 0;
  let totalExecutions = 0;

  const branchStats = {
    branchesEvaluated: 0,
    loopsExecuted: 0,
    ioCalls: 0,
    assignments: 0,
  };

  steps.forEach((step) => {
    totalExecutions++;
    lineExecutionCounts[step.lineNumber] = (lineExecutionCounts[step.lineNumber] || 0) + 1;
    if (lineExecutionCounts[step.lineNumber] > maxExecutions) {
      maxExecutions = lineExecutionCounts[step.lineNumber];
    }

    if (step.logicType === "branch") branchStats.branchesEvaluated++;
    if (step.logicType === "loop") branchStats.loopsExecuted++;
    if (step.logicType === "io") branchStats.ioCalls++;
    if (step.logicType === "assignment" || step.logicType === "declaration") branchStats.assignments++;
  });

  // Hotspots: lines with execution count >= 2 or at max if max >= 2
  const hotspotThreshold = maxExecutions > 1 ? Math.max(2, Math.floor(maxExecutions * 0.7)) : 1;
  const hotspotLines = Object.keys(lineExecutionCounts)
    .map(Number)
    .filter((lineNo) => lineExecutionCounts[lineNo] >= hotspotThreshold);

  return {
    lineExecutionCounts,
    maxExecutions: Math.max(maxExecutions, 1),
    totalExecutions,
    hotspotLines,
    branchStats,
  };
}

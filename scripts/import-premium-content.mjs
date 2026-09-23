// 高级课程内容导入工具（管理员专用）
// 用法（Node 18+）：
//   1) 在项目根 .env 配置 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（仅本脚本使用，绝不进前端）
//   2) 准备课程 JSON 文件到 docs/premium-content/<id>.json（结构见下）
//   3) 运行：node scripts/import-premium-content.mjs [courseId...]   （不带参数=全量导入）
//
// 课程 JSON 结构：
// {
//   "title": "大模型部署与微调实战",
//   "tagline": "从零把 7B 模型跑起来",
//   "description": "……",
//   "isPublished": true,
//   "lessons": [  // 与 src/types.ts 的 Lesson 结构一致
//     {
//       "id": "plm-001",
//       "title": "…",
//       "trackId": "premium-llm",
//       "estimatedMinutes": 20,
//       "level": "实战",
//       "mentalModel": { "title": "…", "metaphor": "…", "keyIntuition": "…" },
//       "explanationMarkdown": "…",
//       "language": "python",
//       "starterCode": "…",
//       "solutionCode": "…",
//       "checkpoints": [ { "id": "…", "title": "…", "description": "…", "testFunction": "见下" } ]
//     }
//   ]
// }
//
// 注意：checkpoints 的 testFunction 是函数，JSON 无法直接表达。约定两种方式：
//   A. 省略 testFunction —— 导入后在前端数据层用默认校验（如代码包含 solutionCode 关键行）
//   B. 用字符串 "builtin" 标记 —— 前端用内置匹配逻辑
// 详细规则在导入脚本与 premiumContent 读取端保持一致。

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, "..", "docs", "premium-content");

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY（见脚本头注释）");
  process.exit(1);
}
if (!serviceKey.startsWith("eyJ")) {
  console.error("SUPABASE_SERVICE_ROLE_KEY 必须是 service_role 密钥（非 anon）");
  process.exit(1);
}

async function upsertCourse(courseId, payload) {
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/premium_content?id=eq.${courseId}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      id: courseId,
      title: payload.title,
      tagline: payload.tagline ?? null,
      description: payload.description ?? null,
      lessons: payload.lessons ?? [],
      is_published: payload.isPublished ?? true,
    }),
  });
  if (!res.ok) {
    console.error(`  ✗ ${courseId}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return false;
  }
  console.log(`  ✓ ${courseId}：${payload.title}（${(payload.lessons || []).length} 课）`);
  return true;
}

const ids = process.argv.slice(2);
const files = ids.length
  ? ids.map((id) => ({ id, path: join(CONTENT_DIR, `${id}.json`) }))
  : existsSync(CONTENT_DIR)
    ? readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json")).map((f) => ({ id: f.replace(/\.json$/, ""), path: join(CONTENT_DIR, f) }))
    : [];

if (!files.length) {
  console.error(`没有找到课程文件（${CONTENT_DIR} 为空或不存在）`);
  process.exit(1);
}

let ok = 0;
for (const { id, path } of files) {
  try {
    const payload = JSON.parse(readFileSync(path, "utf8"));
    if (await upsertCourse(id, payload)) ok += 1;
  } catch (e) {
    console.error(`  ✗ ${id}: 解析失败 ${e.message}`);
  }
}
console.log(`\n导入完成：${ok}/${files.length}`);
process.exit(ok === files.length ? 0 : 1);
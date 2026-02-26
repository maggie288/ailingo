# AILingo 生产环境部署指南

本文档说明如何将 AILingo 部署到 **GitHub**、**Vercel**、**Render** 及所需环境（Supabase 等）。

---

## 一、前置准备

### 1. 代码仓库（GitHub）

1. 在 GitHub 新建仓库（如 `your-org/ailingo`）。
2. 本地初始化并推送（若尚未使用 Git）：

```bash
git init
git add .
git commit -m "Initial commit: AILingo"
git branch -M main
git remote add origin https://github.com/your-org/ailingo.git
git push -u origin main
```

3. 确保 **不要** 提交 `.env`（已列入 `.gitignore`），仅提交 `.env.example` 作为模板。

### 2. Supabase 生产项目

1. 登录 [Supabase](https://supabase.com)，新建项目（或使用现有项目）。
2. **Settings → API** 中复制：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`（仅服务端，勿暴露到前端）
3. **Authentication → URL Configuration**：
   - Site URL：填生产站地址（如 `https://ailingo.vercel.app` 或 `https://your-app.onrender.com`）
   - Redirect URLs：添加 `https://你的域名/auth/callback`
4. **SQL Editor 中按顺序执行迁移**（二选一）：
   - **方式 A（推荐）**：在 Supabase Dashboard → **SQL Editor** → New query，打开项目里的 **`supabase/migrations/run-all-in-order.sql`**，复制全部内容粘贴到编辑器，点击 **Run**，一次性执行全部迁移。
   - **方式 B**：在 **SQL Editor** 里按下面顺序**逐个**执行每个 `.sql` 文件内容（复制粘贴后 Run）：
     1. `20250225000001_initial_schema.sql`
     2. `20250225100000_phase3_knowledge_and_generated.sql`
     3. `20250225110000_seed_learning_path.sql`
     4. `20250225200000_daily_tasks.sql`
     5. `20250225210000_hearts_coins.sql`
     6. `20250225220000_materials.sql`
     7. `20250225230000_generated_lessons_source_topic.sql`
     8. `20250225240000_streaks_double_xp.sql`
     9. `20250225250000_knowledge_graph_full.sql`
   - **方式 C（CLI）**：若已安装 Supabase CLI，可在项目根目录执行：
     ```bash
     npx supabase link --project-ref 你的项目ref
     npx supabase db push
     ```
   **注意**：若用方式 B 且执行第 4 个文件时报错 “policy … already exists”，说明 `initial_schema` 里已存在同名的 streak 策略，可跳过该文件中关于 `streaks` 的两条 `CREATE POLICY`，只执行创建 `daily_tasks` 表和 `user_achievements` 的 INSERT 策略即可。

### 3. 环境变量清单

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理后台需 | 服务端密钥，用于 admin API |
| `MINIMAX_API_KEY` | 与 OpenAI 二选一 | MiniMax 开放平台 API Key（课程生成用 M2.5） |
| `OPENAI_API_KEY` | 与 MiniMax 二选一 | OpenAI API Key（图片解析仅支持 OpenAI） |
| `NEXT_PUBLIC_APP_URL` | ✅ 生产 | 生产环境完整 URL（用于 Auth 回调等） |
| `GITHUB_TOKEN` | 可选 | 每日 cron 拉 GitHub 仓库用 |
| `CRON_SECRET` | 可选 | 保护 `/api/cron/daily-course-generation` |
| `ADMIN_EMAILS` | 可选 | 逗号分隔管理员邮箱，用于 /admin |

---

## 二、Vercel 部署

1. 登录 [Vercel](https://vercel.com)，**Add New → Project**，从 GitHub 导入 `ailingo` 仓库。
2. **Framework Preset** 选 Next.js，**Root Directory** 保持默认。
3. **Environment Variables** 中按下面「环境变量怎么设置」添加变量。
4. 重要：`NEXT_PUBLIC_APP_URL` 先可留空或填 `https://ailingo.vercel.app`，部署成功后在 Vercel 项目页复制**实际分配的生产域名**（如 `https://ailingo-xxx.vercel.app`），再回 Vercel **Settings → Environment Variables** 把 `NEXT_PUBLIC_APP_URL` 改为该域名并 **Redeploy**。
5. 点击 **Deploy**。构建命令为 `npm run build`。
6. 部署完成后，到 Supabase **Authentication → URL Configuration**，将 **Site URL** 和 **Redirect URLs** 改为该 Vercel 域名。

**自定义域名**：Vercel 项目 → Settings → Domains → 添加域名并按提示解析。

### Vercel 环境变量怎么设置

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard) → 选中你的 **ailingo** 项目。
2. 顶部点 **Settings** → 左侧 **Environment Variables**。
3. 在 **Key** 和 **Value** 里逐条添加（**Environment** 建议先勾选 **Production**，需要时再勾选 Preview/Development）：

| Key | Value | 必填 |
|-----|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL，如 `https://xxxx.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon public** key（Settings → API） | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** key（仅服务端，勿泄露） | 建议 |
| `NEXT_PUBLIC_APP_URL` | 生产站完整 URL，如 `https://ailingo-xxx.vercel.app`（部署后可改） | ✅ |
| `MINIMAX_API_KEY` | MiniMax 开放平台 API Key（课程/概念/题目生成，优先使用 M2.5） | 与 OpenAI 二选一 |
| `MINIMAX_BASE_URL` | 国内版必填，见下方「国内版配置」 | 国内版 Key 必填 |
| `MINIMAX_USE_OPENAI` | 国内版建议先试：填 `1` 走 OpenAI 兼容接口 | 国内版建议 |
| `MINIMAX_GROUP_ID` | 国内版若接口要求：在「账户管理-基本信息」复制 group_id 填入 | 按需 |
| `OPENAI_API_KEY` | OpenAI API Key（未配 MiniMax 时用于文本生成；上传资料中的图片解析仅支持 OpenAI） | 与 MiniMax 二选一或同配 |
| `ADMIN_EMAILS` | 管理员邮箱，多个用英文逗号，如 `a@b.com,c@d.com` | 需 /admin 时 |
| `GITHUB_TOKEN` | GitHub Personal Access Token（可选，cron 用） | 可选 |
| `CRON_SECRET` | 任意随机字符串（保护 cron 接口） | 可选 |

4. 每添加一条点 **Save**；全部填完后可到 **Deployments** 选最新一次部署 → **Redeploy**，或下次 push 代码会自动用新变量构建。

### 国内版 MiniMax（minimaxi.com）在 Vercel 的配置

Key 来自 **minimaxi.com** 时，在 Vercel 按下面配（每项保存后都要 **Redeploy** 才生效）：

1. **MINIMAX_API_KEY**：从 [minimaxi 接口密钥](https://platform.minimaxi.com/user-center/basic-information/interface-key) 复制的完整 Key。
2. **MINIMAX_BASE_URL**：先试 **`https://api.minimaxi.com/v1`**（OpenAI 兼容，国内版常用）。
3. **MINIMAX_USE_OPENAI**：填 **`1`**（和上面 base 一起用，走国内版 OpenAI 兼容接口）。
4. **MINIMAX_GROUP_ID**（可选）：若仍报 invalid api key，到 [账户管理 - 基本信息](https://platform.minimaxi.com/user-center/basic-information) 复制 **group_id**，在 Vercel 新增该变量并填进去。
5. 若 `https://api.minimaxi.com/v1` + `MINIMAX_USE_OPENAI=1` 仍不行，可改为用 Anthropic 兼容：**MINIMAX_BASE_URL** 改为 **`https://api.minimaxi.com/anthropic/v1`**，**MINIMAX_USE_OPENAI** 删掉或留空，再 Redeploy 试一次。

### 若 Vercel 构建失败

- **先看构建的是哪次提交**：日志开头有 `Commit: xxxxx`。若为旧提交（如 `b102c2d`），请确认本地已执行 `git push origin main` 并包含最新修复（未使用变量、Set 迭代等），再在 Vercel 的 **Deployments** 里 **Redeploy** 或重新 push 触发部署。
- **找到真正的报错**：日志里 `npm install` 后的 deprecation 警告（如 rimraf、eslint）一般不会导致失败。请往下滚动到出现 **Failed to compile**、**Error:** 或 **Command "npm run build" exited with 1** 的那几行，把那段完整贴出以便排查。
- **常见原因**：缺少环境变量（构建或运行时报错）、Node 版本（项目已要求 `>=18`，一般无需改）、ESLint/Type 报错（已在本仓库修复，确保部署的是最新 main）。

---

## 三、Render 部署

1. 登录 [Render](https://render.com)，**New → Web Service**。
2. 连接 GitHub 仓库 `ailingo`。
3. 配置：
   - **Runtime**: Node
   - **Region**: 选离用户近的（如 Singapore）。
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment** 中添加所有环境变量；`NEXT_PUBLIC_APP_URL` 填 Render 分配地址，如 `https://ailingo-xxx.onrender.com`。
5. 若使用 **Blueprint**：仓库根目录已有 `render.yaml`，可在 Render 用 **New → Blueprint** 连接仓库，按 YAML 创建服务并到 Dashboard 补全环境变量。
6. 部署完成后，在 Supabase 中把 **Site URL** 和 **Redirect URLs** 改为 Render 的 URL。

**注意**：Render 免费实例会在一段时间无访问后休眠，冷启动可能较慢；可升级付费计划避免休眠。

---

## 四、GitHub 相关

- **分支**：默认从 `main` 部署即可；Vercel/Render 均可配置从指定分支或 PR 部署。
- **Actions（可选）**：若需 CI，可新增 `.github/workflows/ci.yml` 做 `npm run lint` 与 `npm run build`，避免坏构建合并到 main。
- **Secrets**：不要将 `.env` 或密钥提交到仓库；生产密钥只写在 Vercel / Render 的 Environment 或 GitHub Secrets 中。

---

## 五、部署后检查

1. **访问**：打开生产 URL，应进入学习页。
2. **登录**：用 Supabase Auth 注册/登录，确认跳转与回调正常（依赖 `NEXT_PUBLIC_APP_URL` 与 Supabase 中配置一致）。
3. **AI 生成**：若配置了 `OPENAI_API_KEY`，在「从论文/URL/主题生成课程」试生成一节。
4. **管理后台**：用 `ADMIN_EMAILS` 中邮箱登录后访问 `/admin`，确认课时列表与知识节点可读；若 403，检查 `ADMIN_EMAILS` 与 `SUPABASE_SERVICE_ROLE_KEY`。

---

## 六、生成完整 0→1 AI 课程

0→1 路径的课时由 **AI 按知识节点批量生成**。

### 前提

- 已在 Supabase 执行完整迁移（含知识节点种子），见上文「SQL Editor 中按顺序执行迁移」。
- 已在 Vercel 配置 **MINIMAX_API_KEY** 或 **OPENAI_API_KEY**，以及 **CRON_SECRET**（用于保护该接口）。

### 域名和密钥在哪里找？

| 要用的东西 | 在哪里找 |
|------------|----------|
| **域名** | Vercel → 你的项目 → 顶部 **Domains**，或 **Settings → Domains**。一般会有一条 `xxx.vercel.app`，例如 `ailingo-abc123.vercel.app`，完整地址即 `https://ailingo-abc123.vercel.app`（务必带 `https://`）。 |
| **CRON_SECRET** | 就是你之前在 Vercel **Settings → Environment Variables** 里为 `CRON_SECRET` 填的那串随机字符串。若还没配，去那里新增一条，Value 随便填一长串（如 `my-secret-123xyz`），保存后 Redeploy，再在下面请求里用这串。 |

### 具体操作步骤

**重要**：Vercel 免费/ Hobby 下函数约 60 秒超时，一次生成多节容易 **Connection reset by peer**。请用 **limit=1** 单节生成，多次调用。

1. **先试 1 节**  
   在终端执行（替换域名的 CRON_SECRET）：
   ```bash
   curl -X POST "https://ailingo.vercel.app/api/cron/generate-path-lessons" \
     -H "Authorization: Bearer 你的CRON_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"limit":1}'
   ```
   若返回里有 `"created":1` 且无报错，说明成功。

2. **全量 10 节：每次 1 节，按 skip=0..9 调用**  
   用 `limit=1` 和 `skip=0,1,...,9` 分别生成第 1～10 节，避免单次超时：
   ```bash
   for i in 0 1 2 3 4 5 6 7 8 9; do
     curl -s -X POST "https://ailingo.vercel.app/api/cron/generate-path-lessons" \
       -H "Authorization: Bearer 你的CRON_SECRET" \
       -H "Content-Type: application/json" \
       -d "{\"limit\":1,\"skip\":$i,\"publish\":true}"
     echo ""
     sleep 2
   done
   ```
   把 `你的CRON_SECRET` 换成真实值；若要 draft 不发布，把 `\"publish\":true` 去掉。

3. **到管理后台审核**  
   打开 `https://你的域名/admin`，用 `ADMIN_EMAILS` 里邮箱登录，在「课时」里查看/发布。

### 1000 节课程：从种子到分批生成并发布

若要设计「AI 大模型入门到资深」系统课，约 **1000 节课**，可按下述流程一次分批生成并直接发布到正式环境。

1. **在 Supabase 执行 1000 节点种子**  
   - 打开 **Supabase Dashboard → SQL Editor**。  
   - 若要做**全新 1000 节**、且库里已有旧节点/旧课时，先执行（会清空已有课时与节点）：
     ```sql
     DELETE FROM public.generated_lesson_progress;
     DELETE FROM public.generated_lessons;
     DELETE FROM public.knowledge_nodes;
     ```
   - 再打开项目里的 **`supabase/seeds/curriculum_ai_1000.sql`**，复制全部内容到 SQL Editor，点击 **Run**。会插入 1000 个知识节点（10 个阶段 × 每阶段 100 节，难度 1～10 递增）。

2. **本地分批生成并发布**（推荐，无 Vercel 60s 超时）  
   - 在项目根目录执行 `npm run dev`，保持运行。  
   - 新开终端，执行（把 `你的CRON_SECRET` 换成 `.env.local` 里的值）：
     ```bash
     chmod +x scripts/batch-generate-path-lessons.sh
     CRON_SECRET=你的CRON_SECRET ./scripts/batch-generate-path-lessons.sh
     ```
   - 脚本会按节点顺序从第 1 节生成到第 1000 节，每节请求间隔 2 秒，并**直接发布**（`publish: true`）。  
   - 若中途中断，可从断点续跑，例如从第 501 节开始：  
     `START_FROM=500 CRON_SECRET=你的CRON_SECRET ./scripts/batch-generate-path-lessons.sh`  
   - 环境变量（可选）：`TOTAL=1000`（总节数）、`BASE_URL=http://localhost:3000`、`SLEEP=2`（间隔秒数）。

3. **结果**  
   - 生成结果写入当前环境连接的 Supabase（即 `.env.local` 中的 Supabase），若与生产共用同一 Supabase 项目，则线上站点会直接看到已发布的 1000 节课。  
   - 到 **管理后台**（`/admin`）可查看、筛选或下架部分课时。

### 持续补充与更新（不删历史）

系统默认**只增不删**：不会因为「再次生成」而清空或覆盖已有课程。

1. **按节点批量生成**  
   - 再次调用 `generate-path-lessons` 时，**只会给「还没有任何课时」的节点生成**，已有课时的节点会被跳过，不会重复或覆盖。  
   - 若希望给某一段节点**各多补一节**（同一章节下多节微课），传 **`supplement=1`**（或 body `"supplement": true`），例如：  
     `curl ... -d '{"limit":10,"skip":0,"supplement":true,"publish":true}'`

2. **上传资料 → 自动新增节点 + 课时**  
   - 在 **学习/上传** 页上传 PDF/文本/图片后，资料会进入「我的资料」。  
   - 调用 **`POST /api/generate/from-material`**，Body：`{ "material_id": "资料 UUID" }`（需登录）。  
   - 会为该资料 **新增 1 个知识节点** 并生成 1 节微课挂到该节点下，写入 `generated_lessons`（source_type=material），**不删、不改已有节点与课时**。

3. **关联网站 → 新增课时**  
   - 使用 **从 URL 生成**（或调用 `POST /api/generate/from-url`，Body：`{ "url": "https://..." }`）。  
   - 会生成 1 节微课并挂到**推荐的知识节点**下（或可扩展为为该 URL 单独建节点），同样是新增，不删历史。

4. **管理后台新增章节/节点**  
   - 管理员在 **`/admin`** 可维护知识节点；调用 **`POST /api/admin/knowledge-nodes`**，Body：`{ "title": "新章节名", "description": "...", "difficulty_level": 5 }` 可**新增**知识节点。  
   - 新增后，用上面的批量生成（不传 supplement）会只给「还没有课时」的新节点生成；或传 `supplement=1` 给指定范围节点补课。

5. **全新清空再建（仅当确实需要时）**  
   - 仅在需要「从零重建 1000 节」时，在 Supabase SQL Editor 中**先**执行：  
     `DELETE FROM public.generated_lesson_progress; DELETE FROM public.generated_lessons; DELETE FROM public.knowledge_nodes;`  
   - 再执行种子 `curriculum_ai_1000.sql`。日常补充**不要**执行上述 DELETE。

### 操作清单：持续补充（按顺序做一遍）

按下面步骤做一次，之后就可以随时「只增不删」地补充课程。

---

**步骤一：在 Supabase 执行新迁移（支持「上传资料」生成）**

1. 打开 [Supabase](https://supabase.com) → 你的项目 → 左侧 **SQL Editor** → **New query**。
2. 二选一：
   - **若你从没跑过完整迁移**：打开项目里的 **`supabase/migrations/run-all-in-order.sql`**，复制**全部内容**到 SQL Editor，点击 **Run**（会建表 + 含 `source_type=material`）。
   - **若你已跑过 run-all-in-order，只是要加 material**：在 SQL Editor 里只执行下面这一段，点 **Run**：
     ```sql
     ALTER TABLE public.generated_lessons DROP CONSTRAINT IF EXISTS generated_lessons_source_type_check;
     ALTER TABLE public.generated_lessons
       ADD CONSTRAINT generated_lessons_source_type_check
       CHECK (source_type IN ('arxiv', 'github', 'url', 'cron', 'topic', 'material'));
     ```

---

**步骤二：再次跑批量生成（只会给「还没有课时」的节点生成）**

- 本地先 `npm run dev`，再新开终端执行（把 `你的CRON_SECRET` 换成 `.env.local` 里的值）：
  ```bash
  CRON_SECRET=你的CRON_SECRET ./scripts/batch-generate-path-lessons.sh
  ```
- 已有课时的节点会被**自动跳过**，只给还没有课时的节点生成，不会覆盖历史。

---

**步骤三：给某段节点各多补一节（可选）**

- 例如给前 20 个节点各再生成一节，本地执行：
  ```bash
  curl -X POST "http://localhost:3000/api/cron/generate-path-lessons" \
    -H "Authorization: Bearer 你的CRON_SECRET" \
    -H "Content-Type: application/json" \
    -d '{"limit":20,"skip":0,"supplement":true,"publish":true}'
  ```
- 或用脚本给前 100 个节点各补一节：
  ```bash
  TOTAL=100 SUPPLEMENT=1 CRON_SECRET=你的CRON_SECRET ./scripts/batch-generate-path-lessons.sh
  ```

---

**步骤四：上传资料后，用资料生成新节点 + 新课时**

1. 在站点 **学习 → 上传** 页上传 PDF/文本/图片，等状态变为「已提取」。
2. 在浏览器或接口工具里拿到该资料的 **id**（上传接口返回的 `id`，或从「我的资料」列表取）。
3. 带登录态请求（Cookie 或同源页面用 fetch）：
  ```bash
  curl -X POST "http://localhost:3000/api/generate/from-material" \
    -H "Content-Type: application/json" \
    -H "Cookie: 你的登录 Cookie（从浏览器开发者工具复制）" \
    -d '{"material_id":"这里填资料的 UUID"}'
  ```
  或在**已登录**的前端页面里用 `fetch("/api/generate/from-material", { method: "POST", body: JSON.stringify({ material_id: "资料UUID" }) })`。
4. 返回里会有 `lesson_id`、`knowledge_node_id`，即新增的 1 个节点 + 1 节课时，不会动已有课程。

---

**步骤五：从 URL 生成一节并挂到路径（关联网站）**

- 本地或服务端请求（无需 CRON_SECRET，若需登录则带 Cookie）：
  ```bash
  curl -X POST "http://localhost:3000/api/generate/from-url" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://你想关联的网页地址"}'
  ```
- 会生成 1 节微课并挂到推荐的知识节点下，只增不改。

---

**步骤六：管理后台新增知识节点（持续扩展章节）**

- 用 **ADMIN_EMAILS** 里邮箱登录后，请求（需带登录 Cookie 或同源）：
  ```bash
  curl -X POST "http://localhost:3000/api/admin/knowledge-nodes" \
    -H "Content-Type: application/json" \
    -H "Cookie: 你的登录 Cookie" \
    -d '{"title":"新章节名称","description":"可选描述","difficulty_level":5}'
  ```
- 新增后，再跑**步骤二**的批量脚本，只会给这些「还没有课时」的新节点生成；或对指定范围用 **步骤三** 的 `supplement=1` 补节。

---

以上做完后：**随时再跑批量生成**只会补空节点，**supplement=1** 只补节，**from-material / from-url / 管理后台新增节点**都是新增，**都不会删或覆盖历史课程**。

### 接口说明（供查阅）

- **接口**：`POST` 或 `GET` **`/api/cron/generate-path-lessons`**
- 若配置了 `CRON_SECRET`，请求头必须带：`Authorization: Bearer <CRON_SECRET>`。
- **POST** Body 可选：`{ "publish": true }` 直接发布；`{ "limit": 5 }` 仅处理前 5 个节点；`{ "skip": 2 }` 从第 3 个节点开始；`{ "supplement": true }` 给范围内节点各补一节（不跳过已有课时的节点）。
- **GET** 可选 query：`?publish=1`、`?limit=5`、`?skip=0`、`?supplement=1`。
- **行为**：按 `knowledge_nodes` 顺序处理；**默认只给「还没有任何课时」的节点生成**（重复跑不会覆盖或删历史）。传 `supplement=1` 时给范围内每个节点再生成一节。
- **注意**：单节约 30–60 秒；Vercel 免费/Hobby 约 60s 超时，请用 **limit=1** 并多次调用或本地跑脚本。

### 若总是 Connection reset by peer（Vercel 超时）

单节生成若超过约 60 秒（例如 MiniMax 较慢），Vercel 会断开连接。**推荐在本地跑生成**，没有时间限制：

1. 在项目目录执行：`npm run dev`，保持运行。
2. 新开一个终端，把下面的 `http://localhost:3000` 和 `你的CRON_SECRET` 换成实际值后执行：
   ```bash
   # 单节测试
   curl -X POST "http://localhost:3000/api/cron/generate-path-lessons" \
     -H "Authorization: Bearer 你的CRON_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"limit":1}'
   ```
3. 若返回 `"created":1`，可继续全量生成（同样对 localhost 发请求）：
   ```bash
   for i in 0 1 2 3 4 5 6 7 8 9; do
     curl -s -X POST "http://localhost:3000/api/cron/generate-path-lessons" \
       -H "Authorization: Bearer 你的CRON_SECRET" \
       -H "Content-Type: application/json" \
       -d "{\"limit\":1,\"skip\":$i,\"publish\":true}"
     echo ""
     sleep 2
   done
   ```
4. 本地需能连上 Supabase 和 MiniMax：复制 `.env.example` 为 `.env.local`，填好 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`MINIMAX_API_KEY` 等。生成结果会写入你的 Supabase，线上站点可直接使用。

### 若返回 "404 Page not found"

说明请求打到了 MiniMax，但**路径不对**。国内版 **minimaxi.com** 一般只开放 OpenAI 兼容接口，需同时满足：

- `MINIMAX_BASE_URL=https://api.minimaxi.com/v1`
- **`MINIMAX_USE_OPENAI=1`**（必须设为 1，否则会走 Anthropic 路径导致 404）

在 `.env.local` 或 Vercel 环境变量里加上/改为上述两项，保存后重启本地 dev 或 Redeploy 再试。

### 若返回 "invalid api key"

说明 CRON 已通过，但 **MiniMax 接口认为 Key 无效**。按下面顺序排查（每改一次都要 **Redeploy** 再试）：

1. **确认已配国内版 base**  
   Key 来自 **minimaxi.com** 时，在 Vercel 必须增加：  
   - **Name**：`MINIMAX_BASE_URL`  
   - **Value**：先试 `https://api.minimaxi.com/anthropic/v1`  
   保存 → **Deployments** → 最新部署 **Redeploy** → 再调一次接口。

2. **仍报错时：试 OpenAI 兼容地址**  
   国内版有时只开放 OpenAI 兼容接口。在 Vercel 再加两条：  
   - `MINIMAX_BASE_URL` 改为：`https://api.minimaxi.com/v1`  
   - 新增 `MINIMAX_USE_OPENAI`，Value 填：`1`  
   保存 → **Redeploy** → 再试。

3. **国内版如需 group_id**  
   在 [minimaxi 账户管理 - 基本信息](https://platform.minimaxi.com/user-center/basic-information) 里复制 **group_id**，在 Vercel 新增：  
   - **Name**：`MINIMAX_GROUP_ID`  
   - **Value**：粘贴 group_id  
   保存 → **Redeploy** → 再试。

4. **确认 Redeploy 生效**  
   改环境变量后必须 **Redeploy**，否则线上还是旧配置。在 Deployments 里看最新一次是「Building」→「Ready」后再用 curl 测。

---

## 七、Cron（可选）

若使用 Vercel Cron 触发每日课程生成（ArXiv/GitHub）：

1. 在 `vercel.json` 中可增加 `crons`（参考 Vercel 文档）。
2. 请求时带上 `Authorization: Bearer ${CRON_SECRET}`，并在 `/api/cron/daily-course-generation` 中校验。

---

## 八、故障排查

- **构建失败**：查看 Vercel/Render 构建日志；常见为 Node 版本（建议 18+）、`pdf-parse` 等原生依赖在无头环境下的问题，必要时在 `package.json` 指定 `"engines": { "node": ">=18" }`。
- **登录回调 404**：确认 Supabase 中 Redirect URL 与 `NEXT_PUBLIC_APP_URL/auth/callback` 完全一致（含协议与尾斜杠策略）。
- **API 超时**：生成类接口已设 `maxDuration`（见各 route）；若仍超时，可在 Vercel 计划中提高函数最大执行时间。

完成以上步骤后，生产环境即可在 GitHub + Vercel 或 GitHub + Render 上运行，并与 Supabase 生产库、OpenAI 等正常联动。

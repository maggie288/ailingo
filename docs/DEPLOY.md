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

### 接口说明（供查阅）

- **接口**：`POST` 或 `GET` **`/api/cron/generate-path-lessons`**
- 若配置了 `CRON_SECRET`，请求头必须带：`Authorization: Bearer <CRON_SECRET>`。
- **POST** Body 可选：`{ "publish": true }` 直接发布；`{ "limit": 5 }` 仅处理前 5 个节点；`{ "skip": 2 }` 从第 3 个节点开始（配合 limit=1 可逐节生成）。
- **GET** 可选 query：`?publish=1`、`?limit=5`、`?skip=0`。
- **行为**：按 `knowledge_nodes` 顺序，为每个节点调用 AI 生成一节完整微课，写入 `generated_lessons`。
- **注意**：单节约 30–60 秒；Vercel 免费/Hobby 约 60s 超时，一次多节会 **Connection reset by peer**，请用 **limit=1** 并多次调用（见上方「全量 10 节」循环示例）。

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

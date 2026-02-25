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
4. **SQL Editor** 中按顺序执行 `supabase/migrations/` 下所有 `.sql`，或使用 Supabase CLI：
   ```bash
   npx supabase link --project-ref 你的项目ref
   npx supabase db push
   ```

### 3. 环境变量清单

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | 管理后台需 | 服务端密钥，用于 admin API |
| `OPENAI_API_KEY` | AI 功能需 | OpenAI API Key |
| `NEXT_PUBLIC_APP_URL` | ✅ 生产 | 生产环境完整 URL（用于 Auth 回调等） |
| `GITHUB_TOKEN` | 可选 | 每日 cron 拉 GitHub 仓库用 |
| `CRON_SECRET` | 可选 | 保护 `/api/cron/daily-course-generation` |
| `ADMIN_EMAILS` | 可选 | 逗号分隔管理员邮箱，用于 /admin |

---

## 二、Vercel 部署

1. 登录 [Vercel](https://vercel.com)，**Add New → Project**，从 GitHub 导入 `ailingo` 仓库。
2. **Framework Preset** 选 Next.js，**Root Directory** 保持默认。
3. **Environment Variables** 中把上表变量全部添加（Production、Preview 可按需区分）。
4. 重要：`NEXT_PUBLIC_APP_URL` 填 Vercel 分配域名，如 `https://ailingo-xxx.vercel.app`；若用自定义域名，改为该域名。
5. 点击 **Deploy**。构建命令为 `npm run build`，无需改 `vercel.json` 已包含长时 API 配置。
6. 部署完成后，回到 Supabase **Authentication → URL Configuration**，将 **Site URL** 和 **Redirect URLs** 改为该 Vercel 域名（及自定义域名）。

**自定义域名**：Vercel 项目 → Settings → Domains → 添加域名并按提示解析。

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

## 六、Cron（可选）

若使用 Vercel Cron 触发每日课程生成：

1. 在 `vercel.json` 中可增加 `crons`（参考 Vercel 文档）。
2. 请求时带上 `Authorization: Bearer ${CRON_SECRET}` 或 Query 中带 `secret`，并在 `/api/cron/daily-course-generation` 中校验，避免被随意调用。

---

## 七、故障排查

- **构建失败**：查看 Vercel/Render 构建日志；常见为 Node 版本（建议 18+）、`pdf-parse` 等原生依赖在无头环境下的问题，必要时在 `package.json` 指定 `"engines": { "node": ">=18" }`。
- **登录回调 404**：确认 Supabase 中 Redirect URL 与 `NEXT_PUBLIC_APP_URL/auth/callback` 完全一致（含协议与尾斜杠策略）。
- **API 超时**：生成类接口已设 `maxDuration`（见各 route）；若仍超时，可在 Vercel 计划中提高函数最大执行时间。

完成以上步骤后，生产环境即可在 GitHub + Vercel 或 GitHub + Render 上运行，并与 Supabase 生产库、OpenAI 等正常联动。

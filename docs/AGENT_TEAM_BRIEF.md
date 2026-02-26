# AILingo Agent 团队执行简报

本文档供 **你本人** 或 **Cursor/Agent** 按角色领取任务，与 `ONE_MONTH_LAUNCH.md` 配合使用。  
产品域名：**https://ailingo.vercel.app/**

---

## 角色一：产品 / 技术 Lead

**目标**：保证体验稳定、可观测、可付费。

**可交给 Agent 的任务示例**（在 Cursor 里直接说）：

1. **「按 ONE_MONTH_LAUNCH 文档，接入 Vercel Analytics 或 Plausible，并在 layout 里加上统计脚本。」**  
   - 产出：`src/app/layout.tsx` 或对应位置注入脚本；文档里注明如何看 UV/来源。

2. **「为 AILingo 设计付费点：免费用户每日 1 次 AI 生成、0→1 路径前 20 节免费；Pro 无限。在 docs 里写一页 PAYWALL.md 描述规则，并标出需要改的 API 和前端位置。」**  
   - 产出：`docs/PAYWALL.md`；可选：`lib/entitlements.ts` 或类似权限判断草案。

3. **「在项目中接入 Stripe 订阅：新建 /pricing 页、Stripe Checkout 或 Customer Portal，并在 Supabase 增加 subscription 相关字段（或表）的迁移草案。」**  
   - 产出：`src/app/pricing/page.tsx`、API route 如 `api/stripe/checkout`、迁移说明或 SQL 片段。

4. **「检查生产环境：学习路径、生成课、答题、进度保存整条链路，列出可能报错或体验问题的点，并修掉能修的。」**  
   - 产出：清单 + 必要的小修复（如错误边界、加载态）。

**验收**：分析能看到来源与 UV；付费规则文档清晰；Stripe 能完成一笔测试支付；核心路径无阻塞性报错。

---

## 角色二：增长 / 营销

**目标**：Product Hunt + 至少 3 个 AI 目录上架，并带来可追踪的访问与注册。

**可交给 Agent 的任务示例**：

1. **「根据 ONE_MONTH_LAUNCH 里的 PH 文案，生成 3 个 Tagline 变体 + 1 段 200 字英文 Description，并列出 PH 提交需要的素材清单（尺寸、格式）。」**  
   - 产出：`docs/product-hunt-copy.md` 或直接写在 ONE_MONTH_LAUNCH 的「八」里。

2. **「列出 FuturePedia、There's An AI For That、AI Hunt 的提交入口 URL 和必填字段，写进 docs/DIRECTORIES_SUBMIT.md。」**  
   - 产出：`docs/DIRECTORIES_SUBMIT.md`，含链接与字段说明。

3. **「写一条 280 字以内的 Twitter/X 发布文案和一条 LinkedIn 短文案，用于 PH 发布当天，带 ailingo.vercel.app 和 #ProductHunt #AIEducation。」**  
   - 产出：`docs/social-launch-copy.md` 或粘贴进 AGENT_TEAM_BRIEF。

**你本人做**：  
- 在 Product Hunt 网站完成提交（需登录、上传图与链接）。  
- 在 FuturePedia、TAAFT、第三个目录网站填写表单并提交。  
- 发布日当天发推、LinkedIn、邮件。

**验收**：PH 已上线；至少 3 个目录已提交；社交/邮件文案已用出。

---

## 角色三：商业化

**目标**：定价清晰、首月能收到钱、路径可通向 $1K MRR。

**可交给 Agent 的任务示例**：

1. **「在 ONE_MONTH_LAUNCH 的盈利模型基础上，写一页 docs/PRICING.md：免费 vs Pro 功能表、建议价格（$5/月、$10/月、年付）、首月促销话术。」**  
   - 产出：`docs/PRICING.md`。

2. **「在 /profile 或 /learn 加一个『升级 Pro』入口，链接到 /pricing；若尚无 /pricing，先链到占位页或 docs 中的 PRICING。」**  
   - 产出：导航或「我的」页上的 CTA。

**验收**：站内有明确「升级」入口；定价页或文档可给用户看；Stripe 测试支付成功即算商业化闭环打通。

---

## 角色四：内容 / SEO

**目标**：对外文案统一、利于收录与分享、PH/目录展示专业。

**可交给 Agent 的任务示例**：

1. **「为 AILingo 写一段 150 字以内的英文 meta description 和 3 个可选 title（含 AILingo、AI learning、Duolingo-style），并改 layout 的 metadata。」**  
   - 产出：`src/app/layout.tsx` 中 `metadata` 更新；可选 `docs/seo-meta.md`。

2. **「写一篇 500 字英文博客大纲：How we built a Duolingo for AI/LLM learning（技术栈、为什么游戏化、AI 生成课流程）。」**  
   - 产出：`docs/blog-outline-duolingo-ai.md`，可后续扩成正式博客。

3. **「写一段 200 字中文，用于即刻/少数派/知乎：我们做了个用 AI 学大模型的 Duolingo，附 ailingo.vercel.app。」**  
   - 产出：`docs/launch-copy-zh.md`。

**验收**：站点 title/description 已更新；中英文发布文案各有一份可直接用。

---

## GPT Store / Agent 能力封装（产品 + 增长协作）

**目标**：在 GPT Store 或 MuleRun 上有一个「AILingo 课生成助手」，描述里带 ailingo.vercel.app，冲 Skills/Agent 榜。

**可交给 Agent 的任务示例**：

1. **「写一份 GPT Store 用说明：名称、一句话描述、详细说明（含『可为你生成 AILingo 风格微课』+ 链接 ailingo.vercel.app）、3 个示例 prompt。」**  
   - 产出：`docs/gpt-store-description.md`。

2. **「若我们有一个 API 可接收『主题』并返回课程大纲或首节摘要，写出该 API 的请求/响应示例，便于 GPT 或 MuleRun Agent 调用。」**  
   - 产出：`docs/api-for-gpt-agent.md`（若暂无公开 API，可写「占位：未来 POST /api/generate/course 可对 Agent 开放」）。

**验收**：GPT 或 Agent 已提交到对应平台，描述中含 ailingo.vercel.app。

---

## 本周优先（示例：第 1 周）

| 角色 | 本周必做 |
|------|----------|
| 产品/技术 | 接入分析；写 PAYWALL.md；定 Stripe 方案（可先文档） |
| 增长 | 产出 PH 文案与素材清单；建 DIRECTORIES_SUBMIT.md |
| 商业化 | 写 PRICING.md；定免费 vs Pro 功能表 |
| 内容 | 更新 layout metadata；写中文发布稿 1 份 |

---

## 快速复制：给 Cursor 的一句指令

你可以直接对 Cursor 说：

- **「按 docs/ONE_MONTH_LAUNCH.md 和 docs/AGENT_TEAM_BRIEF.md，以产品/技术角色完成：接入 Vercel Analytics，并写 docs/PAYWALL.md 描述免费 vs Pro 规则。」**
- **「按 AGENT_TEAM_BRIEF 增长角色，生成 docs/DIRECTORIES_SUBMIT.md，列出 FuturePedia、There's An AI For That、AI Hunt 的提交链接和必填项。」**
- **「按 AGENT_TEAM_BRIEF 商业化角色，写 docs/PRICING.md，并确保站内有升级 Pro 的入口。」**

---

**总目标回顾**：1 个月内 Skills 榜前 100 + DAU 1000 + MRR $1000；本简报把任务按角色拆好，便于你或 Agent 逐项执行并验收。

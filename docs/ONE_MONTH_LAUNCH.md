# AILingo 一个月冲刺：Skills 榜单 Top 100 + 千日活 + 千刀月收入

**目标**（1 个月内）  
- 登上 **Skills / AI 应用榜单前 100**  
- **日活 1000**（DAU）  
- **月收入 1000 美元**（MRR $1,000）  
- 定位：**AI 教育细分龙头**

**产品地址**：https://ailingo.vercel.app/

---

## 一、目标拆解与可行性

| 指标 | 目标 | 粗算 | 策略要点 |
|------|------|------|----------|
| **榜单 Top 100** | 1 个月内进入至少一个主流「AI 技能/应用榜」前 100 | Product Hunt 当日 Top 5 / 周榜；FuturePedia 等目录收录 + 点赞/使用量 | 多平台上架 + 集中一天爆发（PH 发布）+ 持续引流到同一链接 |
| **DAU 1000** | 日均 1000 活跃用户 | 若 D1≈30%、D7≈15%，约需 2.5w 累计注册；或 1w 注册 + 更高留存 | 拉新：PH + 目录 + 社群 + SEO；留存：每日任务、连续学习、推送（若可做） |
| **MRR $1000** | 月经常性收入 $1000 | $10/月 × 100 付费 或 $5/月 × 200 等 | 首月可「订阅 + 一次性」组合，优先跑通付费闭环 |

**结论**：1 个月同时达成三项有难度，但可 **优先保证「上榜」+「千日活」**，**盈利** 在首月先做到「有付费产品 + 首笔收入」，$1K MRR 可作为第 4–6 周延续目标。

---

## 二、「Skills 榜单」指什么 + 冲榜清单

「Skills 榜单」在不同语境下可能指：

1. **Product Hunt** — 当日/当周新品排名（按 upvote 等）；冲进 **当日 Top 5** 或 **当周 Top 10** 即算「前 100」级别曝光。  
2. **AI 应用/工具目录** — FuturePedia、There's An AI For That、AI Hunt 等；「前 100」可理解为 **分类下排名或「Featured」**，通过提交 + 好评/使用量提升。  
3. **GPT Store / MuleRun 等** — 若把 AILingo 能力封装为 Skill/Agent，则冲 **该平台教育类或综合榜 Top 100**。  
4. **国内** — 即刻、少数派、Product Hunt 中文、或各「AI 产品榜」等，按你主战场选 1–2 个冲榜。

**冲榜执行清单（1 个月内必做）**

| 序号 | 平台 | 动作 | 负责角色 |
|------|------|------|----------|
| 1 | Product Hunt | 选一天正式发布；备好 240×240 图、1270×760 图×2、Tagline、YouTube 演示（可选） | 增长 + 内容 |
| 2 | FuturePedia | 提交 AILingo，分类选 Education / AI Tools | 增长 |
| 3 | There's An AI For That | 同上，提交 + 填准 tagline 与链接 | 增长 |
| 4 | AI Hunt / 其他 1 个目录 | 再选一个英文 AI 目录提交 | 增长 |
| 5 | GPT Store 或 MuleRun | 做一个「AILingo 课生成助手」类 GPT/Agent，描述里带 ailingo.vercel.app | 产品 + 增长 |
| 6 | 国内 1 个渠道 | 即刻 / 少数派 / 知乎 等发一篇「我们做了个 AI 学大模型的 Duolingo」 | 内容 |

---

## 三、Agent 团队分工（谁做什么）

用「虚拟团队」分工，你本人 + Cursor/Agent 协作执行。

| 角色 | 职责 | 典型产出 |
|------|------|----------|
| **产品 / 技术** | 付费点、数据埋点、性能、上架前体验 | Stripe 订阅/一次性、Vercel Analytics 或 Plausible、核心路径无报错 |
| **增长 / 营销** | 上架、投稿、社群、邮件 | PH 发布、目录提交、Twitter/LinkedIn/邮件列表文案、合作 KOL 列表 |
| **商业化** | 定价、套餐、首月促销 | 定价方案、Landing 付费区、$1K MRR 路径（如 100 人 × $10） |
| **内容 / SEO** | 文案、落地页、博客、榜单/评测投稿 | 英文 Tagline/Description、博客 1 篇、PH 图下文案、SEO 标题与 meta |

**协作方式**  
- 你在 Cursor 里用 **Agent（或任务拆解）** 按「产品 / 增长 / 商业化 / 内容」分别提需求，例如：「按 ONE_MONTH_LAUNCH 文档，本周完成增长侧：PH 素材 + FuturePedia 提交」。  
- 详见 **`docs/AGENT_TEAM_BRIEF.md`**，给 Agent 的简短任务说明。

---

## 四、四周节奏（按周执行）

### Week 1：基建 + 冲榜准备

- **产品/技术**  
  - 接入 **Vercel Analytics** 或 **Plausible**（看 UV/页面/来源）。  
  - 确认生产环境无报错，核心路径：注册 → 学习 → 生成课 → 答题 → 进度保存。  
  - 决定付费点（见下「盈利模型」），至少定好「哪几个功能付费」。  
- **商业化**  
  - 定稿：免费 vs 付费能力、价格（如 $9.99/月 或 $5/月 + 年付折扣）。  
- **内容**  
  - 定稿：Product Hunt **Name / Tagline / Description**（中英均可，建议英文主）。  
  - 准备 **240×240** 主图、**1270×760** 至少 2 张（学习路径、生成课、答题界面）。  
  - 可选：1 分钟 **YouTube 演示**（从论文/URL → 生成课 → 做题）。  
- **增长**  
  - 注册/完善 Product Hunt 账号，确认可提交。  
  - 列出要提交的目录：FuturePedia、There's An AI For That、再 1 个。  
  - 若有邮件列表 / 社群，预告「下周某天 PH 发布」。

**本周结束检查**：分析可用、付费方案清晰、PH 素材齐、目录列表确定。

---

### Week 2：上架 + 首波流量

- **增长**  
  - **Product Hunt 正式发布**（选周二或周三，你全天能回复评论）。  
  - 同一天或次日：**FuturePedia、There's An AI For That** 提交。  
  - Twitter/X、LinkedIn、邮件发一条：「We just launched on Product Hunt: [链接]」。  
- **内容**  
  - 在 PH 帖子下用 1–2 条评论写「AILingo 是什么 + 谁适合用」，并回复前 20 条评论。  
  - 若有博客：发 1 篇「How we built a Duolingo for AI/LLM learning」。  
- **产品/技术**  
  - 若已接 Stripe：在站内加「Upgrade」入口与定价页（可先简单一页）。  
  - 监控首日/首周来源：PH、Direct、Referral。

**本周结束检查**：PH 已发布、至少 2 个目录已提交、社交/邮件已发、有首日 UV 数据。

---

### Week 3：留存 + 付费上线 + 继续上榜

- **产品/技术**  
  - 正式上线 **付费墙**：例如「每日免费生成 1 节，Pro 无限」「或 0→1 路径前 N 节免费，后需订阅」。  
  - 接入 **Stripe**（或 Paddle）订阅/一次性支付，并测试一遍支付流程。  
- **商业化**  
  - 首月促销：如「首月 5 折」或「年付送 1 个月」，在 Landing 与站内展示。  
- **增长**  
  - 提交 **第 3 个 AI 目录**（如 AI Hunt）。  
  - 若已做 **GPT/Agent**：在 GPT Store 或 MuleRun 提交，描述里带 ailingo.vercel.app。  
  - 在 PH、目录的落地页强调「Free to start」+「Pro for power learners」。  
- **内容**  
  - 国内 1 篇：即刻 / 少数派 / 知乎「我们做了个 AI 学大模型的 Duolingo」+ 链接。

**本周结束检查**：付费可完成支付、至少 1 个付费用户、3 个目录已提交、国内 1 篇已发。

---

### Week 4：冲 DAU 1000 + 稳 MRR

- **增长**  
  - 复盘来源：PH、目录、Direct、Referral 各占比；加大高 ROI 渠道（如某目录带来注册多，可再投 1 个类似目录）。  
  - 若有 KOL/教育博主：发 1–2 条合作或评测（可小规模）。  
  - 考虑「邀请好友得 Pro 天数」或「分享学习成果到 Twitter 得金币」等轻量裂变（若开发来得及）。  
- **产品/技术**  
  - 每日任务、连续学习、成就已具备；检查「每日答题」「智能复习」是否在首屏/导航好找。  
  - 若有条件：邮件/站内「第二天再来」提醒（需收集邮箱或推送权限）。  
- **商业化**  
  - 目标：首月 **$1K MRR** 或至少 **$500 + 清晰路径**（如 50 人 × $10）。  
  - 在「我的」或设置里加「升级 Pro」入口，并跟踪从访问定价页 → 支付转化。

**本月结束检查**：DAU 接近或达到 1000、MRR 有数字且可解释、至少 1 个「Skills 榜单」进入前 100 或等效曝光。

---

## 五、盈利模型（月入 $1000 路径）

- **订阅制**  
  - 例：**$9.99/月** 或 **$5/月**（年付 $48）。  
  - $1K MRR ≈ **100 人 × $10** 或 **200 人 × $5**。  
- **免费 vs 付费** 建议  
  - 免费：每日 1 节 AI 生成、0→1 路径前 20 节、每日答题 5 题、基础进度与成就。  
  - Pro：无限生成、全路径、无限每日题、优先新题型/主题、去广告（若有）。  
- **首月**  
  - 目标先 **100 付费用户**（或 50 人 × $20 年付），再靠留存与拉新冲到 $1K。

**技术实现**：Stripe Customer + Subscription，Supabase 存 `subscription_status` / `plan`，接口侧按权限限制生成次数与路径解锁。

---

## 六、DAU 1000 从哪里来（粗算）

- **假设**：D1 约 30%，D7 约 15%，则 1000 DAU 约需 **约 6000–7000 次日留存用户**，即首月约 **2 万+ 注册** 或 **1 万注册 + 更高留存**。  
- **渠道分工建议**  
  - **Product Hunt**：首日 500–2000 访客，转化 5–15% 注册 → 约 50–200 注册。  
  - **AI 目录**：3 个目录持续带来长尾，首月合计 500–2000 访客 → 50–200 注册。  
  - **社交 + 邮件 + 国内 1 篇**：合计目标 200–500 注册。  
  - **SEO + 自然**：首月少量，为后续铺路。  
- **若要冲 1000 DAU**：需要 **一次小爆款**（如 PH 进当日前三、或一条推/视频爆）或 **多日稳定拉新**（如日均 80–100 新注册 × 30 天 × 留存）。因此 Week 2 的 PH 发布质量至关重要，同时 Week 3–4 持续在目录、国内、社群引流。

---

## 七、关键产出物清单（可交给 Agent 执行）

| 产出 | 说明 | 文档/位置 |
|------|------|-----------|
| PH 主图 240×240 | Logo 或首屏，<3MB | 设计稿或 `docs/assets/ph-thumbnail.png` |
| PH 图×2 以上 1270×760 | 学习路径、生成课、答题 | `docs/assets/ph-gallery-*.png` |
| PH 文案 | Tagline + Description（英） | 见下「八」 |
| Stripe 定价页 | 月付/年付、免费 vs Pro 说明 | 新路由如 `/pricing` 或 `/upgrade` |
| 分析埋点 | Vercel Analytics 或 Plausible | `layout.tsx` 或 `_app` 注入 |
| 目录提交清单 | FuturePedia、TAAFT、第三个 | 本 doc 第二节表格 |
| GPT/Agent 描述 | 用于 GPT Store / MuleRun | `docs/AGENT_TEAM_BRIEF.md` 或单独 `gpt-store-description.md` |

---

## 八、Product Hunt 文案（可直接用）

- **Name**：AILingo  
- **Tagline**：Learn AI & LLM with AI-generated micro-lessons — Duolingo-style.  
- **Description**（短）：Turn papers, URLs, and topics into bite-sized lessons. Concept cards, code fill-in, quizzes, and progress tracking. Mobile-first.  
- **Description**（长，用于 Gallery 或评论）：AILingo is a mobile-first learning platform for AI and large language models. Paste an ArXiv link, a URL, or a topic — get a micro-lesson with concept cards, code fill-in, quizzes, and matching pairs. Track progress, streaks, and daily practice. Built for developers and learners who want to go from 0 to 1 in ML/AI.

---

## 九、成功标准（1 个月后自检）

| 指标 | 目标 | 测量方式 |
|------|------|----------|
| 榜单 | 至少 1 个「Skills/AI 应用」榜进前 100，或 PH 当日 Top 10 | PH 当日排名截图；目录站内排名或 Featured |
| DAU | 1000 | 分析后台「每日活跃用户」定义一致，如「当日有学习/答题行为」 |
| MRR | $1000（或首月 $500+ 且路径清晰） | Stripe 月度经常性收入 |
| 品牌 | 「AI 教育 / Duolingo for AI」被 1–2 篇报道或 KOL 提及 | 搜索 AILingo + 第三方链接 |

---

下一步：打开 **`docs/AGENT_TEAM_BRIEF.md`**，按角色把任务拆给 Cursor/Agent 或自己执行；产品侧优先「分析 + 付费点 + Stripe」，增长侧优先「PH 发布 + 3 个目录提交」。

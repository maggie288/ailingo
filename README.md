# AILingo — AI 大模型学习平台

移动端优先的 H5 应用，参考 Duolingo 的游戏化学习体验，面向 AI 大模型学习者。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS、Framer Motion、Lucide Icons
- **数据库**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK + OpenAI
- **认证**: Supabase Auth
- **部署**: Vercel / Render（见 [docs/DEPLOY.md](docs/DEPLOY.md)）

## 当前进度

- **Phase 1–2**: 基础框架、课程列表、学习路径、课时 Markdown + 答题、进度（localStorage）
- **Phase 3**: AI 课程生成
  - [x] 数据库：`knowledge_nodes`、`generated_lessons`（cards JSONB）
  - [x] Zod 课程 schema + `generateText`(Output.object) 生成标准 JSON
  - [x] `POST /api/generate/from-paper`（ArXiv ID）、`POST /api/generate/from-url`
  - [x] `GET /api/cron/daily-course-generation`（ArXiv cs.AI/cs.LG + GitHub 热门仓库，存 draft）
  - [x] `GET /api/learning-path`、`GET /api/lesson/[id]`
  - [x] 前端：LessonRenderer（概念卡、代码填空卡、选择题卡、概念配对卡）、`/learn/generate` 生成页、`/learn/ai/[lessonId]` 查看

## 快速开始

```bash
npm install
cp .env.example .env.local   # 可选：配置 Supabase 后启用登录
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)，默认会跳转到 `/learn`。

## 环境变量与部署

见 `.env.example`。生产部署步骤（GitHub、Vercel、Render、Supabase）见 **[docs/DEPLOY.md](docs/DEPLOY.md)**。

- **Supabase**：登录与存储 AI 生成课程
- **OPENAI_API_KEY**：AI 生成课程（from-paper / from-url）必填
- **GITHUB_TOKEN**（可选）：每日 cron 拉取 GitHub 热门 ML 仓库
- **CRON_SECRET**（可选）：保护 `GET /api/cron/daily-course-generation`

## 后续阶段

- **Phase 4**: 经验值、活力值、连续学习、成就、排行榜

## 项目结构（简要）

```
src/
  app/           # 路由与页面
  components/    # 布局、导航、认证等
  lib/           # Supabase、后续 API 封装
  types/         # 数据库与业务类型
```

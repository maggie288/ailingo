# AILingo 功能对照与缺口清单

对照《AI-LLM学习平台系统建设完整提示词》，当前实现与仍缺内容如下。

---

## 一、已实现内容概览

### 1. 移动端 UI/UX（部分）
- 移动端优先、480px 容器、底部导航（学习 / 练习 / 排行榜 / 我的）
- 视口、PWA meta、manifest
- Duolingo 风格色彩、Nunito 字体、圆角与按钮下压
- 顶部 TopBar、ProgressBar、LearningNode（锁定/可学习/已完成）

### 2. 学习流程（Phase 2）
- 课程列表（Mock 数据）、课程详情、学习路径（竖线+节点）
- 课时页：Markdown 理论 + 开始练习 → 答题（单选、判断）→ 正确/错误反馈 → 完成写入 localStorage
- 答题组件：MultipleChoice、BooleanChoice；CorrectFeedback、IncorrectFeedback

### 3. AI 课程生成（Phase 3）
- POST /api/generate/from-paper、/api/generate/from-url
- GET /api/cron/daily-course-generation（ArXiv + GitHub，存 draft）
- 课程 JSON 规范（Zod schema）：concept_intro、code_gap_fill、multiple_choice、match_pairs
- 前端：LessonRenderer、/learn/generate、/learn/ai/[lessonId]

### 4. 学习路径 0–1 与映射
- knowledge_nodes 种子（难度 1–10）
- 难度映射（beginner→1–3, intermediate→4–6, advanced→7–10）
- 主题→节点推荐、写入 generated_lessons 时自动挂 knowledge_node_id
- GET /api/learning-path（path 槽位 + unassigned_lessons）、GET /api/learning-path/suggest

### 5. 数据与认证
- Supabase：profiles、courses、units、lessons、questions、user_progress、streaks、user_achievements、knowledge_nodes、generated_lessons、generated_lesson_progress
- 登录/注册/退出（Supabase Auth）、/auth/callback

---

## 二、后端缺口

### 2.1 API 未实现或未对齐

| 说明 | 建议路由 | 状态 |
|------|----------|------|
| 提交答题结果 | POST /api/progress/submit | ✅ 已实现（含 streak/XP/每日任务 learn 完成度） |
| 获取用户学习进度 | GET /api/progress/user | ✅ 已实现 |
| 上传并解析资料（PDF/图/MD） | POST /api/ingest/material | ✅ 已实现（文本/MD/JSON/PDF/图片，图片用 OpenAI Vision） |
| AI 生成整课（从主题规划） | POST /api/generate/course | ✅ 已实现（仅从 topic + difficulty 生成，生成页「主题」模式） |
| AI 生成练习题 | POST /api/generate/questions | ✅ 已实现（topic + 可选 context/count，OpenAI 生成单选） |
| 从文本提取知识点 | POST /api/extract/concepts | ✅ 已实现（OpenAI 从文本提取概念列表） |
| 用户资料 | GET/PUT /api/user/profile | ✅ 已实现 |
| 学习统计 | GET /api/user/stats | ✅ 已实现 |
| 成就列表 | GET /api/user/achievements | ✅ 已实现 |
| 排行榜 | GET /api/leaderboard | ✅ 已实现 |
| 每日任务 | GET /api/user/daily-tasks | ✅ 已实现 |
| 每日答题题目 | GET /api/practice/daily | ✅ 已实现 |

### 2.2 数据库表/字段缺口

| 说明 | 状态 |
|------|------|
| daily_tasks（每日任务） | ✅ 已建表（20250225200000_daily_tasks.sql） |
| materials（上传资料、extracted_content、status） | ✅ 已建表（20250225220000_materials.sql） |
| knowledge_graph 完整结构 | ✅ 已扩展 knowledge_nodes：concept_name、prerequisites (JSONB)、resources (JSONB)；GET /api/knowledge-graph 返回节点与边 |

### 2.3 业务逻辑未实现
- ~~每日任务刷新与完成统计~~ ✅ 每日任务表 + 当日自动创建；完成课时时更新 learn 任务
- 每日答题挑战（固定 5–10 题、当日有效）✅ 有 GET /api/practice/daily；排行榜可后续接每日挑战成绩
- 间隔重复 / 智能复习 ✅ GET /api/review/suggest（完成超过 3 天的课时）、练习页「智能复习」入口、/practice/review 列表页
- 经验值（XP）、升级 ✅ 完成课时写 streaks（total_xp、level）
- 活力值（Hearts）、恢复逻辑、金币、商店 — 未做
- 连续学习（streaks）计算 ✅ updateStreakOnLessonComplete
- 成就解锁判定与写入 user_achievements — 仅列表展示，未自动解锁

---

## 三、前端缺口

### 3.1 页面/入口
- 练习（Practice）✅ 每日答题、智能复习（/practice/review）、复习（链到 /learn）
- 排行榜 ✅ 接 GET /api/leaderboard，展示排名、XP、连续天数
- 我的 ✅ 学习统计、今日任务、成就、设置入口、商店入口；设置页（主题/语言）✅

### 3.2 学习路径与课程
- 学习路径：竖线+节点列表；**知识图谱可视化** ✅ /learn/graph 使用 React Flow 展示节点与边（parent/prerequisite）
- 课程列表 ✅ GET /api/courses 支持难度筛选与 search 搜索；学习页课程区支持「全部难度」下拉 + 搜索框
- 0–1 路径展示 ✅ /learn/path 页按 path 槽位 + unassigned 展示，学习页有入口

### 3.3 答题与反馈
- 题型 ✅ 单选、判断、多选多（MultipleSelect）、纯填空（FillBlank）、拖拽排序（DragSort）、代码填空（CodeGapCard）、概念卡、配对卡
- 解释弹窗 ✅ ExplanationModal 组件，答错时若有 explanation 则弹窗展示解析
- 成就解锁动效 ✅ 完成课时后若有新成就则展示 AchievementUnlockToast
- 连续学习提醒 ✅ StreakReminder（学习页/我的页）：已连续 X 天 / 今天还没学习

### 3.4 游戏化 UI
- 顶部状态栏 ✅ 学习/练习/排行榜/我的页 TopBar 右侧展示活力值、等级、金币（TopBarStats）
- 成就徽章列表与详情 ✅ 我的页点击成就弹出详情（描述、解锁时间）；解锁动效已有 Toast
- 连续学习提醒 ✅ StreakReminder；日历/火焰可视化、连胜保护入口未做
- 金币/商店 ✅ 商店页：50 金币补满活力值、30 金币下一节双倍 XP

### 3.5 其他
- 管理后台 ✅ /admin：AI 课时列表与发布审核、**知识节点**列表与编辑（title/description/difficulty）；用户管理未做
- 资料上传页 ✅ /learn/upload（粘贴 + 上传 .md/.txt/.pdf/图片），调用 ingest/material

---

## 四、按优先级归纳

### 高优先级（核心体验）— 本轮已做
1. **进度与进度同步** ✅ POST/GET progress，Phase 2 完成课时调用 submit，路径页优先用服务端进度。
2. **练习页** ✅ 每日答题（GET /api/practice/daily）+ 复习链到 /learn。
3. **我的页** ✅ 学习统计、今日任务、成就列表（streaks/achievements API）。
4. **排行榜** ✅ GET /api/leaderboard + 排行榜 Tab 展示。

### 中优先级（游戏化与留存）— 已完成
5. **游戏化系统** ✅ XP、等级、连续学习、活力值（扣心/恢复）、金币（完成课时+10）、顶部栏展示。
6. **成就系统** ✅ 成就定义 + GET /api/user/achievements + 我的页徽章列表 + 自动解锁逻辑（完成课时/连续天数触发）。
7. **每日任务** ✅ 当日自动创建；完成课时更新 learn、每日答题完成更新 quiz、复习并完成练习更新 review；前端今日任务展示。

### 较低优先级（增强与运营）
8. **资料解析** ✅ 已做：materials 表、POST /api/ingest/material（文本/MD/JSON/PDF/**图片**）、上传页支持 .pdf 与 PNG/JPG/WebP（图片走 OpenAI Vision 提取文字）。
9. **知识图谱** ✅ 已做：knowledge_nodes 扩展 concept_name/prerequisites/resources；GET /api/knowledge-graph；**React Flow 图谱页** /learn/graph（节点可拖拽、缩放、小地图）；管理后台知识节点维护；S 形弯曲为可选增强。
10. **S 形路径与 0–1 路径页** ✅ /learn/path 使用 GET /api/learning-path 展示从 0 到 1 路径；S 形弯曲/图谱可视化未做。

---

## 五、小结

| 维度       | 已实现 | 缺口 |
|------------|--------|------|
| 后端 API   | 进度、用户、排行榜、每日任务、每日答题、ingest、商店、complete、generate/questions、extract/concepts、generate/course、review/suggest | — |
| 数据库     | 核心表 + 种子路径 + daily_tasks + materials + streaks + knowledge_nodes(concept_name, prerequisites, resources) | — |
| 前端页面   | 学习流、生成课、练习、排行榜、我的、0–1 路径、**知识图谱页**、设置、商店、资料上传页、管理后台 | 用户管理 |
| 答题与反馈 | 单选/判断/多选多/填空/拖拽排序/代码填空/概念卡/配对卡、ExplanationModal、成就解锁 Toast | — |
| 游戏化     | XP、连续学习、每日任务、成就、活力值、金币、成就自动解锁、顶部栏、商店（补心+双倍 XP）、StreakReminder、成就解锁 Toast、成就详情弹窗 | — |

建议实现顺序：**进度 API + 练习页 + 我的统计与成就** → **排行榜 + 游戏化后端** → **每日任务与资料解析** → **知识图谱与 0–1 路径前端**。

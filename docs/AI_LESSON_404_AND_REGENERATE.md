# AI 课时 404 与重新生成

## 为什么会出现 404？

访问 `/learn/ai/{lessonId}` 时，页面会请求 `GET /api/lesson/{lessonId}`，该接口从 Supabase 表 **`generated_lessons`** 中按主键 `id` 查询。若查不到该条记录，接口返回 404，页面显示「课时不存在」。

常见原因：

1. **生成任务未完成**：从论文/URL/上传生成时，任务超时或失败，课时从未写入 `generated_lessons`。
2. **环境不一致**：链接来自本地或另一套 Supabase，生产库中没有这条数据。
3. **数据被删**：课程或课时在库里被删除，但入口（路径、我的课程等）仍指向该 `lesson_id`。

## 如何确认库里有没有这条课？

在 Supabase Dashboard → SQL Editor 执行：

```sql
SELECT id, topic, status, user_course_id, created_at
FROM public.generated_lessons
WHERE id = '020ffcc7-6c4d-48f8-8194-3f0d1ee6870f';
```

- 有结果：说明数据存在，可能是 RLS 或接口 base URL 等问题。
- 无结果：说明库里没有这条课，需要重新生成或修复入口链接。

## 如何重新生成？

1. **从「学习」页重新生成**
   - 打开 **学习** → **上传资料生成课** 或 **从论文/从链接** 生成。
   - 重新提交同一份资料/链接，等待任务完成。
   - 完成后会得到新的课程和课时，使用新的 `lesson_id` 链接即可。

2. **从「我的课程」进入**
   - 若之前生成成功过，在 **学习** → **我的课程** 里应能看到该课程，点进去应使用当前库里存在的 `lesson_id`；若列表里还显示旧链接，说明列表数据与库里不一致，需要修复数据来源（如 `user_courses` / 路径关联的 `generated_lessons`）。

3. **生产环境变量**
   - 确保 Vercel 上配置了 `NEXT_PUBLIC_APP_URL=https://ailingo.vercel.app`，这样服务端请求 `/api/lesson/:id` 会打到生产自己，能正确查生产库。

## 前端行为

- 当接口返回 404 时，`/learn/ai/[lessonId]` 会调用 `notFound()`，展示 **「课时不存在」** 文案，并提供「返回学习」「重新生成课程」按钮，引导用户回到学习页或生成页重新生成。

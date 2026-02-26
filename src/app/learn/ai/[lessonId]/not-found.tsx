import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";

/** 课时不存在（DB 无此 id 或生成未完成）时显示，引导用户返回或重新生成 */
export default function AILessonNotFound() {
  return (
    <>
      <TopBar
        title="课时不存在"
        left={
          <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
      />
      <main className="p-4 pb-8">
        <div className="rounded-card border border-border bg-card p-6 text-center space-y-4">
          <p className="text-muted">
            该课时可能尚未生成完成、已被删除，或链接有误。请从「学习」页进入课程，或重新生成。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/learn"
              className="rounded-card border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
            >
              返回学习
            </Link>
            <Link
              href="/learn/generate"
              className="rounded-card border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              重新生成课程
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

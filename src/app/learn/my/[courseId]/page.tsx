import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { MyCourseLevelsClient } from "@/components/learn/MyCourseLevelsClient";

type Props = { params: Promise<{ courseId: string }> };

export default async function MyCoursePage({ params }: Props) {
  const { courseId } = await params;

  return (
    <>
      <TopBar
        title="我的课程"
        left={
          <Link href="/learn" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
      />
      <main className="p-4 pb-8">
        <MyCourseLevelsClient courseId={courseId} />
      </main>
    </>
  );
}

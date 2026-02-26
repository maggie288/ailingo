import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <>
      <TopBar
        title="定价"
        left={
          <Link href="/" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </Link>
        }
      />
      <main className="p-4 pb-24 max-w-md mx-auto">
        <div className="rounded-card border-2 border-primary bg-primary/5 p-5 mb-6">
          <h2 className="font-bold text-foreground text-lg mb-1">当前全部免费</h2>
          <p className="text-muted text-sm mb-4">
            所有功能免费开放，无需订阅。
          </p>
          <ul className="space-y-2 text-sm text-muted mb-6">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              0→1 系统路径全部可学
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              AI 生成（主题 / 论文 / URL / 上传）不限次
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              每日答题、智能复习
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              我的生成课程不限门数
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              进度、成就、连续学习、排行榜
            </li>
          </ul>
          <Link
            href="/learn"
            className="block w-full text-center py-3 rounded-button bg-primary text-white font-bold border-b-4 border-primary-dark btn-press"
          >
            去学习
          </Link>
        </div>
        <p className="text-xs text-muted text-center">
          若未来推出付费选项，会另行通知；现有免费权益不受影响。
        </p>
      </main>
    </>
  );
}

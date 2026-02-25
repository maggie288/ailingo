import { TopBar } from "@/components/layout/TopBar";
import { TopBarStats } from "@/components/layout/TopBarStats";
import { ShopClient } from "@/components/shop/ShopClient";

export default function ShopPage() {
  return (
    <>
      <TopBar
        title="商店"
        left={
          <a href="/profile" className="p-2 -ml-2 text-foreground" aria-label="返回">
            ←
          </a>
        }
        right={<TopBarStats />}
      />
      <main className="p-4 pb-8">
        <ShopClient />
      </main>
    </>
  );
}

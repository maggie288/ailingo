"use client";

/**
 * 捕获根 layout 及全应用未处理的渲染错误（含 Server Components）。
 * 生产环境生效；开发环境仍显示 Next 默认错误 overlay。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error;
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", padding: "2rem", background: "#f5f5f5" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            页面加载出错，请重试或返回首页。
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              重试
            </button>
            <a
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                background: "#58CC02",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

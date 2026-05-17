"use client";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "#f0f0f0",
        backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="w-full max-w-[420px]">
        {children}
      </div>
    </div>
  );
}

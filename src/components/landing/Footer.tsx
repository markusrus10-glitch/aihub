import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">ИИ Хаб</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Конфиденциальность</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Условия</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Тарифы</Link>
          <a href="mailto:support@aihub.io" className="hover:text-foreground transition-colors">Поддержка</a>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ИИ Хаб. Все права защищены.
        </p>
      </div>
    </footer>
  );
}

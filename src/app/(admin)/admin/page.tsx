"use client";

import { useEffect, useState } from "react";
import { Users, MessageSquare, DollarSign, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  users: { total: number; newToday: number };
  chats: { total: number };
  messages: { total: number; today: number };
  revenue: { mrr: number; activeSubscriptions: number };
  tokens: { thisMonth: number };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { title: "Total Users", value: stats.users.total.toLocaleString(), sub: `+${stats.users.newToday} today`, icon: Users, color: "text-blue-400" },
        { title: "Total Messages", value: stats.messages.total.toLocaleString(), sub: `${stats.messages.today} today`, icon: MessageSquare, color: "text-green-400" },
        { title: "MRR", value: `$${stats.revenue.mrr.toFixed(0)}`, sub: `${stats.revenue.activeSubscriptions} subs`, icon: DollarSign, color: "text-yellow-400" },
        { title: "Tokens (Month)", value: (stats.tokens.thisMonth / 1_000_000).toFixed(1) + "M", sub: "this month", icon: Zap, color: "text-purple-400" },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : cards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { href: "/admin/users", label: "Manage Users" },
              { href: "/admin/revenue", label: "Revenue Analytics" },
              { href: "/admin/models", label: "Model Configuration" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                {link.label}
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Database", status: "Healthy" },
              { label: "AI Providers", status: "Operational" },
              { label: "File Storage", status: "Operational" },
              { label: "Stripe", status: "Operational" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">{item.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

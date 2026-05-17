"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Prefs {
  defaultModel: string;
  theme: string;
  fontSize: string;
  sendOnEnter: boolean;
  showTokenCount: boolean;
  enableSoundEffects: boolean;
  compactMode: boolean;
  streamingEnabled: boolean;
}

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Prefs>({
    defaultModel: "gpt-4o-mini",
    theme: "system",
    fontSize: "medium",
    sendOnEnter: true,
    showTokenCount: true,
    enableSoundEffects: false,
    compactMode: false,
    streamingEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((r) => r.json())
      .then((d) => { if (d.preferences) setPrefs({ ...prefs, ...d.preferences }); })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      toast.success("Preferences saved");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preferences</h1>
        <p className="text-muted-foreground text-sm">Customize your AI Hub experience</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Chat Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Send on Enter</Label>
              <p className="text-xs text-muted-foreground">Press Enter to send (Shift+Enter for new line)</p>
            </div>
            <Switch
              checked={prefs.sendOnEnter}
              onCheckedChange={(v) => setPrefs({ ...prefs, sendOnEnter: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Token Count</Label>
              <p className="text-xs text-muted-foreground">Display token usage in chat</p>
            </div>
            <Switch
              checked={prefs.showTokenCount}
              onCheckedChange={(v) => setPrefs({ ...prefs, showTokenCount: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Streaming Responses</Label>
              <p className="text-xs text-muted-foreground">Show AI responses as they generate</p>
            </div>
            <Switch
              checked={prefs.streamingEnabled}
              onCheckedChange={(v) => setPrefs({ ...prefs, streamingEnabled: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Compact Mode</Label>
              <p className="text-xs text-muted-foreground">Reduce spacing in the chat interface</p>
            </div>
            <Switch
              checked={prefs.compactMode}
              onCheckedChange={(v) => setPrefs({ ...prefs, compactMode: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={prefs.theme} onValueChange={(v) => setPrefs({ ...prefs, theme: v })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select value={prefs.fontSize} onValueChange={(v) => setPrefs({ ...prefs, fontSize: v })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Save preferences
      </Button>
    </div>
  );
}

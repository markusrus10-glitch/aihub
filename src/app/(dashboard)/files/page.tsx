"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FolderOpen, Upload, Trash2, FileText, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes, formatRelative } from "@/lib/utils/format";

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  status: string;
  createdAt: string;
}

function FileIcon({ type }: { type: string }) {
  if (type === "IMAGE") return <Image className="h-8 w-8 text-blue-400" />;
  if (type === "PDF") return <FileText className="h-8 w-8 text-red-400" />;
  return <File className="h-8 w-8 text-zinc-400" />;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then((d) => setFiles(d.files ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function deleteFile(id: string) {
    await fetch(`/api/files/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("File deleted");
  }

  return (
    <div className="flex flex-col h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold">Files</h1>
            <p className="text-xs text-muted-foreground">Upload files to use in your chats</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => toast.info("Use file upload in the chat input")}>
            <Upload className="h-4 w-4" />
            Upload via Chat
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No files uploaded yet</p>
            <p className="text-sm mt-1">Upload files in the chat to analyze them with AI</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="group">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <FileIcon type={file.fileType} />
                    <div className="w-full">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{file.fileType}</Badge>
                        <span className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatRelative(file.createdAt)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteFile(file.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

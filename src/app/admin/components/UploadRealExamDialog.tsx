"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, Loader2 } from "lucide-react";

interface UploadRealExamDialogProps {
  onSuccess?: () => void;
}

export function UploadRealExamDialog({ onSuccess }: UploadRealExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
    } else {
      setPdfFile(null);
      setError("请选择 PDF 文件");
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("请先选择 PDF 文件");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("未登录");
      }

      const formData = new FormData();
      formData.append("pdfFile", pdfFile);

      const response = await fetch("/api/admin/real-exams/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "上传失败");
      }

      const data = await response.json();
      console.log("上传成功:", data);

      setOpen(false);
      setPdfFile(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败，请重试");
      console.error("上传错误:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          上传真题
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>上传数学试卷</DialogTitle>
          <DialogDescription>
            只需上传 PDF 文件，系统会自动解析试卷信息、提取题目
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              选择 PDF 文件
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
          </div>

          {pdfFile && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pdfFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 支持功能：</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>自动识别试卷标题、年级、地区等信息</li>
              <li>自动提取所有题目（选择、填空、解答）</li>
              <li>自动识别题目答案、分值、难度</li>
              <li>自动提取涉及的知识点</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              setPdfFile(null);
              setError("");
            }}
          >
            取消
          </Button>
          <Button onClick={handleUpload} disabled={!pdfFile || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                解析中...
              </>
            ) : (
              "上传并解析"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

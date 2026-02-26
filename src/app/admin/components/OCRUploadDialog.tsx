"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface OCRUploadDialogProps {
  onSuccess?: () => void;
}

export function OCRUploadDialog({ onSuccess }: OCRUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [ocrText, setOcrText] = useState("");

  // 配置PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
      setOcrText("");
    } else {
      setPdfFile(null);
      setError("请选择 PDF 文件");
    }
  };

  // PDF转图片
  const pdfToImage = async (pdfData: ArrayBuffer): Promise<string[]> => {
    setProgressText("正在加载PDF...");
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const images: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      setProgressText(`正在处理第 ${i}/${pdf.numPages} 页...`);
      setProgress(Math.round((i / pdf.numPages) * 50));

      const page = await pdf.getPage(i);
      const scale = 2.0; // 提高分辨率以提高OCR准确率
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      images.push(canvas.toDataURL("image/png"));
    }

    return images;
  };

  // OCR识别
  const recognizeText = async (images: string[]): Promise<string> => {
    let allText = "";

    for (let i = 0; i < images.length; i++) {
      setProgressText(`正在OCR识别第 ${i + 1}/${images.length} 页...`);
      setProgress(50 + Math.round(((i + 1) / images.length) * 40));

      const { data: { text } } = await Tesseract.recognize(
        images[i],
        "chi_sim+eng", // 中文简体 + 英文
        {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              console.log(`OCR进度: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      allText += `\n\n--- 第 ${i + 1} 页 ---\n\n${text}`;
    }

    return allText;
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setError("请先选择 PDF 文件");
      return;
    }

    setLoading(true);
    setError("");
    setProgress(0);
    setProgressText("准备中...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("未登录");
      }

      // 1. 读取PDF文件
      setProgressText("正在读取PDF文件...");
      setProgress(5);
      const arrayBuffer = await pdfFile.arrayBuffer();

      // 2. PDF转图片
      const images = await pdfToImage(arrayBuffer);

      // 3. OCR识别
      const extractedText = await recognizeText(images);
      setOcrText(extractedText);

      // 4. 发送给后端解析
      setProgressText("正在解析试卷信息...");
      setProgress(95);

      const response = await fetch("/api/admin/real-exams/upload-ocr", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pdfFile.name.replace(".pdf", ""),
          ocrText: extractedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "解析失败");
      }

      const data = await response.json();
      console.log("上传成功:", data);

      setProgress(100);
      setProgressText("完成！");

      setTimeout(() => {
        setOpen(false);
        setPdfFile(null);
        setOcrText("");
        setProgress(0);
        setProgressText("");
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);
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
          上传真题 (OCR)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>上传数学试卷 (OCR智能识别)</DialogTitle>
          <DialogDescription>
            使用OCR技术自动识别PDF中的文字，AI解析试卷信息
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

          {/* 进度显示 */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{progressText}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* OCR识别结果预览 */}
          {ocrText && !loading && (
            <div className="p-3 bg-muted rounded-md max-h-48 overflow-y-auto">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">OCR识别完成</span>
              </div>
              <p className="text-xs text-muted-foreground">
                识别文本长度：{ocrText.length} 字符
              </p>
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  查看识别的文本
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                  {ocrText.substring(0, 500)}...
                </pre>
              </details>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 OCR功能说明：</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>自动识别PDF中的所有文字内容</li>
              <li>支持中文和英文识别</li>
              <li>AI解析试卷标题、年级、地区等信息</li>
              <li>自动提取所有题目和答案</li>
              <li>处理时间取决于PDF页数和内容</li>
            </ul>
            <p className="mt-2 text-amber-600">⚠️ 建议：使用清晰的扫描版PDF效果最佳</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false);
              setPdfFile(null);
              setOcrText("");
              setError("");
              setProgress(0);
              setProgressText("");
            }}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleUpload} disabled={!pdfFile || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {progressText}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                开始识别并上传
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

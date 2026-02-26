"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Loader2, FileText, Trash2, Eye } from "lucide-react";

interface RealExam {
  id: string;
  title: string;
  region: string;
  semester: string;
  exam_type: string;
  year: number;
  duration: number;
  total_score: number;
  question_count: number;
  status: string;
  created_at: string;
  grades: {
    id: string;
    name: string;
  };
}

interface RealExamManagementProps {
  user: any;
}

export default function RealExamManagement({ user }: RealExamManagementProps) {
  const [exams, setExams] = useState<RealExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    gradeId: "",
    region: "",
    semester: "上学期",
    examType: "期中",
    year: new Date().getFullYear().toString(),
    duration: "120",
    pdfUrl: "",
  });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/real-exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setExams(data.data);
      }
    } catch (error) {
      console.error("加载真题失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleUpload = async () => {
    if (!uploadFormData.title || !uploadFormData.pdfUrl) {
      alert("请填写完整信息");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/real-exams/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: uploadFormData.title,
          gradeId: uploadFormData.gradeId,
          region: uploadFormData.region,
          semester: uploadFormData.semester,
          examType: uploadFormData.examType,
          year: parseInt(uploadFormData.year),
          duration: parseInt(uploadFormData.duration),
          pdfUrl: uploadFormData.pdfUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`上传成功！共提取 ${data.questionCount} 道题目，总分 ${data.totalScore}`);
        setIsUploadDialogOpen(false);
        loadExams();
        resetUploadForm();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("上传失败:", error);
      alert("上传失败，请稍后重试");
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      alert("请上传JSON文件");
      return;
    }

    try {
      const text = await file.text();
      const examList = JSON.parse(text);

      if (!Array.isArray(examList)) {
        alert("文件格式错误：应为JSON数组");
        return;
      }

      const token = localStorage.getItem("token");
      let successCount = 0;
      let failCount = 0;

      for (const exam of examList) {
        try {
          const response = await fetch("/api/admin/real-exams/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: exam.title,
              gradeId: exam.gradeId,
              region: exam.region,
              semester: exam.semester,
              examType: exam.examType,
              year: exam.year,
              duration: exam.duration,
              pdfUrl: exam.pdfUrl,
            }),
          });

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
            console.error(`上传失败: ${exam.title}`, data.error);
          }
        } catch (error) {
          failCount++;
          console.error(`上传失败: ${exam.title}`, error);
        }
      }

      alert(`批量上传完成：成功 ${successCount} 个，失败 ${failCount} 个`);
      setIsUploadDialogOpen(false);
      loadExams();
    } catch (error) {
      console.error("批量上传失败:", error);
      alert("批量上传失败，请检查文件格式");
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm("确定要删除这个真题吗？")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/real-exams/${examId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert("删除成功");
        loadExams();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("删除失败，请稍后重试");
    }
  };

  const resetUploadForm = () => {
    setUploadFormData({
      title: "",
      gradeId: "",
      region: "",
      semester: "上学期",
      examType: "期中",
      year: new Date().getFullYear().toString(),
      duration: "120",
      pdfUrl: "",
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: "示例：海淀区七年级上数学期中试卷",
        gradeId: "初一",
        region: "海淀区",
        semester: "上学期",
        examType: "期中",
        year: 2025,
        duration: 120,
        pdfUrl: "https://example.com/exam.pdf",
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch_upload_template.json";
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>真题管理</CardTitle>
            <CardDescription>上传和管理历年真题</CardDescription>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                上传真题
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>上传真题</DialogTitle>
                <DialogDescription>
                  支持单个上传或批量上传（JSON格式）
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="single">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">单个上传</TabsTrigger>
                  <TabsTrigger value="batch">批量上传</TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="space-y-4">
                  <div>
                    <Label>试卷标题 *</Label>
                    <Input
                      value={uploadFormData.title}
                      onChange={(e) =>
                        setUploadFormData({ ...uploadFormData, title: e.target.value })
                      }
                      placeholder="例如：海淀区七年级上数学期中试卷"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>年级 *</Label>
                      <Select
                        value={uploadFormData.gradeId}
                        onValueChange={(value) =>
                          setUploadFormData({ ...uploadFormData, gradeId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择年级" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="初一">初一</SelectItem>
                          <SelectItem value="初二">初二</SelectItem>
                          <SelectItem value="初三">初三</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>地区 *</Label>
                      <Input
                        value={uploadFormData.region}
                        onChange={(e) =>
                          setUploadFormData({ ...uploadFormData, region: e.target.value })
                        }
                        placeholder="例如：海淀区"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>学期 *</Label>
                      <Select
                        value={uploadFormData.semester}
                        onValueChange={(value) =>
                          setUploadFormData({ ...uploadFormData, semester: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="上学期">上学期</SelectItem>
                          <SelectItem value="下学期">下学期</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>考试类型 *</Label>
                      <Select
                        value={uploadFormData.examType}
                        onValueChange={(value) =>
                          setUploadFormData({ ...uploadFormData, examType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="期中">期中</SelectItem>
                          <SelectItem value="期末">期末</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>年份 *</Label>
                      <Input
                        type="number"
                        value={uploadFormData.year}
                        onChange={(e) =>
                          setUploadFormData({ ...uploadFormData, year: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>考试时长（分钟） *</Label>
                      <Input
                        type="number"
                        value={uploadFormData.duration}
                        onChange={(e) =>
                          setUploadFormData({ ...uploadFormData, duration: e.target.value })
                        }
                        placeholder="120"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>PDF文件URL *</Label>
                    <Input
                      value={uploadFormData.pdfUrl}
                      onChange={(e) =>
                        setUploadFormData({ ...uploadFormData, pdfUrl: e.target.value })
                      }
                      placeholder="输入PDF文件的URL地址"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      系统将自动解析PDF并提取题目
                    </p>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button onClick={handleSingleUpload} disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          解析中...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          上传并解析
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </TabsContent>
                <TabsContent value="batch" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>上传JSON文件</Label>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleBatchUpload}
                      />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">JSON格式说明：</p>
                      <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
{`[
  {
    "title": "试卷标题",
    "gradeId": "初一",
    "region": "海淀区",
    "semester": "上学期",
    "examType": "期中",
    "year": 2025,
    "duration": 120,
    "pdfUrl": "https://..."
  }
]`}
                      </pre>
                    </div>
                    <Button variant="outline" onClick={downloadTemplate} className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      下载模板文件
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>地区</TableHead>
                <TableHead>年级</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>年份</TableHead>
                <TableHead>题数/总分</TableHead>
                <TableHead>时长</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    暂无真题，请上传
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>{exam.region}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{exam.grades.name}</Badge>
                    </TableCell>
                    <TableCell>{exam.exam_type}</TableCell>
                    <TableCell>{exam.year}</TableCell>
                    <TableCell>
                      {exam.question_count}题 / {exam.total_score}分
                    </TableCell>
                    <TableCell>{exam.duration}分钟</TableCell>
                    <TableCell>
                      <Badge
                        variant={exam.status === "active" ? "default" : "secondary"}
                      >
                        {exam.status === "active" ? "已启用" : "已禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/real-exams/${exam.id}`} target="_blank">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(exam.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

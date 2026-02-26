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
import { Upload, Loader2, FileText, Trash2, Eye } from "lucide-react";

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
  });
  const [images, setImages] = useState<File[]>([]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // 检查所有文件是否为图片
      const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
      if (invalidFiles.length > 0) {
        alert(`文件 ${invalidFiles.map(f => f.name).join(", ")} 不是有效的图片文件`);
        return;
      }
      setImages(files);
    }
  };

  const handleUpload = async () => {
    if (!uploadFormData.title || images.length === 0) {
      alert("请填写完整信息并选择至少一张试卷图片");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");

      // 创建 FormData
      const formData = new FormData();
      formData.append("title", uploadFormData.title);
      formData.append("gradeId", uploadFormData.gradeId);
      formData.append("region", uploadFormData.region);
      formData.append("semester", uploadFormData.semester);
      formData.append("examType", uploadFormData.examType);
      formData.append("year", uploadFormData.year);
      formData.append("duration", uploadFormData.duration);

      // 添加所有图片
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/admin/real-exams/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
    });
    setImages([]);
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>上传真题</DialogTitle>
                <DialogDescription>
                  上传试卷图片（支持多张），系统将自动解析并提取题目
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                  <Label>试卷图片 *</Label>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {images.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        已选择 {images.length} 张图片
                      </div>
                      <div className="space-y-1">
                        {images.map((image, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {index + 1}. {image.name} ({(image.size / 1024).toFixed(2)} KB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    支持上传多张图片，系统将按顺序解析所有图片中的题目
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={uploading}
                >
                  取消
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
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

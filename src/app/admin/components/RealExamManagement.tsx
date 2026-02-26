"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Loader2,
  FileText,
  GraduationCap,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import { UploadRealExamDialog } from "./UploadRealExamDialog";
import { OCRUploadDialog } from "./OCRUploadDialog";

interface RealExam {
  id: string;
  title: string;
  grade_id: string;
  region: string;
  semester: string;
  exam_type: string;
  year: number;
  duration: number;
  total_score: number;
  question_count: number;
  created_at: string;
}

interface Grade {
  id: string;
  name: string;
}

export function RealExamManagement() {
  const [exams, setExams] = useState<RealExam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<RealExam | null>(null);

  // 筛选状态
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [examTypeFilter, setExamTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const fetchExams = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/real-exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取真题列表失败");
      }

      const data = await response.json();
      setExams(data.exams || []);
    } catch (error) {
      console.error("获取真题列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/grades", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取年级列表失败");
      }

      const data = await response.json();
      setGrades(data.grades || []);
    } catch (error) {
      console.error("获取年级列表失败:", error);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchGrades();
  }, []);

  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/admin/real-exams/${examToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setDeleteDialogOpen(false);
      setExamToDelete(null);
      fetchExams();
    } catch (error) {
      console.error("删除真题失败:", error);
    }
  };

  // 筛选逻辑
  const filteredExams = exams.filter((exam) => {
    if (gradeFilter !== "all") {
      const grade = grades.find((g) => g.id === exam.grade_id);
      if (!grade || grade.name !== gradeFilter) {
        return false;
      }
    }
    if (examTypeFilter !== "all" && exam.exam_type !== examTypeFilter) {
      return false;
    }
    if (yearFilter !== "all" && exam.year.toString() !== yearFilter) {
      return false;
    }
    return true;
  });

  // 获取年级名称
  const getGradeName = (gradeId: string) => {
    const grade = grades.find((g) => g.id === gradeId);
    return grade ? grade.name : "未知";
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">真题管理</h2>
        <div className="flex gap-2">
          <UploadRealExamDialog onSuccess={fetchExams} />
          <OCRUploadDialog onSuccess={fetchExams} />
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Select
            value={gradeFilter}
            onValueChange={setGradeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择年级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部年级</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.name}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={examTypeFilter}
            onValueChange={setExamTypeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="考试类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="期中">期中</SelectItem>
              <SelectItem value="期末">期末</SelectItem>
              <SelectItem value="模拟">模拟</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <Select
            value={yearFilter}
            onValueChange={setYearFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="年份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部年份</SelectItem>
              {Array.from(
                new Set(exams.map((e) => e.year.toString()).sort()),
              ).map((year) => (
                <SelectItem key={year} value={year}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>试卷标题</TableHead>
              <TableHead>年级</TableHead>
              <TableHead>地区</TableHead>
              <TableHead>学期</TableHead>
              <TableHead>考试类型</TableHead>
              <TableHead>年份</TableHead>
              <TableHead>时长</TableHead>
              <TableHead>总分</TableHead>
              <TableHead>题目数</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  暂无真题数据
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                      <span className="truncate">{exam.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span>{getGradeName(exam.grade_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{exam.region}</TableCell>
                  <TableCell>{exam.semester}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      exam.exam_type === "期中"
                        ? "bg-blue-100 text-blue-700"
                        : exam.exam_type === "期末"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {exam.exam_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>{exam.year}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>{exam.duration}分钟</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-pink-600" />
                      <span className="font-semibold">{exam.total_score}分</span>
                    </div>
                  </TableCell>
                  <TableCell>{exam.question_count}题</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/real-exams/${exam.id}`, "_blank")}
                      >
                        查看
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExamToDelete(exam);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除真题 "{examToDelete?.title}" 吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setExamToDelete(null);
              }}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

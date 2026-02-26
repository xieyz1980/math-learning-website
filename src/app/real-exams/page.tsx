"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, FileText, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

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
  grades: {
    id: string;
    name: string;
  };
}

export default function RealExamsPage() {
  const [exams, setExams] = useState<RealExam[]>([]);
  const [filteredExams, setFilteredExams] = useState<RealExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gradeId: "all",
    region: "all",
    examType: "all",
    year: "all",
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exams, filters]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/real-exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setExams(data.data);
        setFilteredExams(data.data);
      }
    } catch (error) {
      console.error("获取真题列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...exams];

    if (filters.gradeId && filters.gradeId !== "all") {
      result = result.filter((e) => e.grades.id === filters.gradeId);
    }
    if (filters.region && filters.region !== "all") {
      result = result.filter((e) => e.region.includes(filters.region));
    }
    if (filters.examType && filters.examType !== "all") {
      result = result.filter((e) => e.exam_type === filters.examType);
    }
    if (filters.year && filters.year !== "all") {
      result = result.filter((e) => e.year === parseInt(filters.year));
    }

    setFilteredExams(result);
  };

  const years = Array.from(new Set(exams.map((e) => e.year))).sort((a, b) => b - a);
  const regions = Array.from(new Set(exams.map((e) => e.region)));
  const examTypes = ["期中", "期末"];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">历年真题</h1>
        <p className="text-muted-foreground">
          北京海淀区、西城区等地历年初中数学期中期末考试真题
        </p>
      </div>

      {/* 筛选器 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">年级</label>
              <Select
                value={filters.gradeId}
                onValueChange={(value) =>
                  setFilters({ ...filters, gradeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部年级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部年级</SelectItem>
                  <SelectItem value="初一">初一</SelectItem>
                  <SelectItem value="初二">初二</SelectItem>
                  <SelectItem value="初三">初三</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">地区</label>
              <Select
                value={filters.region}
                onValueChange={(value) =>
                  setFilters({ ...filters, region: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部地区</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">考试类型</label>
              <Select
                value={filters.examType}
                onValueChange={(value) =>
                  setFilters({ ...filters, examType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {examTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">年份</label>
              <Select
                value={filters.year}
                onValueChange={(value) =>
                  setFilters({ ...filters, year: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部年份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部年份</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 真题列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : filteredExams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无真题数据
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{exam.region}</span>
                    <Badge variant="secondary" className="ml-2">
                      {exam.grades.name}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{exam.year}年 {exam.semester}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{exam.exam_type}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{exam.duration}分钟</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {exam.question_count}道题
                    </span>
                    <Badge variant="outline">{exam.total_score}分</Badge>
                  </div>
                </div>
                <Link href={`/real-exams/${exam.id}`}>
                  <Button className="w-full">开始考试</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

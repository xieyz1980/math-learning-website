"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, BookOpen, ClipboardCheck, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface StatisticsData {
  overview: {
    points: number;
    totalStudyTime: string;
    examCount: number;
    avgScore: number;
    wrongCount: number;
    masteredCount: number;
    daysActive: number;
  };
  chartData: Array<{
    date: string;
    studyTime: number;
    examCount: number;
  }>;
  recentExams: Array<{
    score: number;
    total_score: number;
    created_at: string;
  }>;
  knowledgePoints: string[];
}

export default function StatisticsPage() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无数据
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">学习数据统计</h1>
        <p className="text-muted-foreground">查看你的学习进度和成果</p>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">当前积分</CardDescription>
            <CardTitle className="text-3xl">{data.overview.points}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              累计学习 {data.overview.daysActive} 天
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              学习时长
            </CardDescription>
            <CardTitle className="text-3xl">{data.overview.totalStudyTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              本周累计学习
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <ClipboardCheck className="w-3 h-3" />
              考试次数
            </CardDescription>
            <CardTitle className="text-3xl">{data.overview.examCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              平均分 {data.overview.avgScore}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs flex items-center gap-1">
              <Target className="w-3 h-3" />
              错题掌握
            </CardDescription>
            <CardTitle className="text-3xl">
              {data.overview.masteredCount} / {data.overview.wrongCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              掌握率{" "}
              {data.overview.wrongCount > 0
                ? Math.round((data.overview.masteredCount / data.overview.wrongCount) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 学习时长趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle>学习时长趋势</CardTitle>
            <CardDescription>最近7天学习时长（分钟）</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value: number) => [`${value}分钟`, "学习时长"]}
                />
                <Line
                  type="monotone"
                  dataKey="studyTime"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 考试次数柱状图 */}
        <Card>
          <CardHeader>
            <CardTitle>考试次数</CardTitle>
            <CardDescription>最近7天考试次数</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value: number) => [`${value}次`, "考试次数"]}
                />
                <Bar dataKey="examCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 最近考试记录 */}
      <Card>
        <CardHeader>
          <CardTitle>最近考试</CardTitle>
          <CardDescription>最近5次考试成绩</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentExams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无考试记录
            </div>
          ) : (
            <div className="space-y-4">
              {data.recentExams.map((exam, index) => {
                const scorePercentage =
                  exam.total_score > 0
                    ? (exam.score / exam.total_score) * 100
                    : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {new Date(exam.created_at).toLocaleDateString()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        总分: {exam.total_score}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="text-sm font-medium mb-1">
                          得分: {exam.score}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${scorePercentage}%` }}
                          />
                        </div>
                      </div>
                      <Badge
                        variant={scorePercentage >= 60 ? "default" : "destructive"}
                      >
                        {scorePercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

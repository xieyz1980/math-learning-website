"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  BookOpen,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface DetailedResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  questionType: string;
  knowledgePoints: string[];
}

interface Analysis {
  summary: string;
  weakPoints: string[];
  suggestions: string[];
  strongPoints: string[];
}

interface ExamRecord {
  id: string;
  score: number;
  total_score: number;
  status: string;
  started_at: string;
  completed_at: string;
  answers: Record<string, string>;
  analysis: Analysis;
}

interface Question {
  id: string;
  question_number: number;
  question_type: string;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  } | null;
  answer: string;
  score: number;
  knowledge_points: string[];
}

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const recordId = params.recordId as string;

  const [examRecord, setExamRecord] = useState<ExamRecord | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [examId, recordId]);

  const fetchResult = async () => {
    try {
      const token = localStorage.getItem("token");
      const [recordResponse, questionsResponse] = await Promise.all([
        fetch(`/api/real-exams/records?examId=${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/real-exams/${examId}/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const recordData = await recordResponse.json();
      const questionsData = await questionsResponse.json();

      if (recordData.success) {
        const record = recordData.data.find((r: ExamRecord) => r.id === recordId);
        if (record) {
          setExamRecord(record);
          if (record.analysis && record.analysis.summary) {
            // 分析结果已在提交时保存
            try {
              const parsedAnalysis =
                typeof record.analysis === "string"
                  ? JSON.parse(record.analysis)
                  : record.analysis;
              setDetailedResults(parsedAnalysis.detailedResults || []);
            } catch (e) {
              console.error("解析分析结果失败:", e);
            }
          }
        }
      }

      if (questionsData.success) {
        setQuestions(questionsData.data);
      }
    } catch (error) {
      console.error("获取考试结果失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!examRecord) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">考试结果不存在</p>
            <Link href="/real-exams" className="mt-4 inline-block">
              <Button>返回列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scorePercentage = (examRecord.score / examRecord.total_score) * 100;
  const correctCount = detailedResults.filter((r) => r.isCorrect).length;
  const totalTime = Math.floor(
    (new Date(examRecord.completed_at).getTime() -
      new Date(examRecord.started_at).getTime()) /
      1000,
  );

  const analysis =
    typeof examRecord.analysis === "string"
      ? JSON.parse(examRecord.analysis)
      : examRecord.analysis;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/real-exams" className="inline-flex items-center mb-4 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Link>
        <h1 className="text-3xl font-bold">考试结果</h1>
      </div>

      {/* 总分卡片 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {examRecord.score}
              </div>
              <div className="text-sm text-muted-foreground">得分</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {examRecord.total_score}
              </div>
              <div className="text-sm text-muted-foreground">总分</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {scorePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">正确率</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {Math.floor(totalTime / 60)}:{(totalTime % 60)
                  .toString()
                  .padStart(2, "0")}
              </div>
              <div className="text-sm text-muted-foreground">用时</div>
            </div>
          </div>
          <Progress value={scorePercentage} className="mt-6" />
        </CardContent>
      </Card>

      {/* AI分析 */}
      {analysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              AI 分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                总体评价
              </h3>
              <p className="text-muted-foreground">{analysis.summary}</p>
            </div>

            {analysis.strongPoints && analysis.strongPoints.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  优势
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.strongPoints.map((point: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.weakPoints && analysis.weakPoints.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  需要加强的知识点
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.weakPoints.map((point: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">学习建议</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {analysis.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 详细答题情况 */}
      <Card>
        <CardHeader>
          <CardTitle>答题详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question) => {
            const userAnswer = examRecord.answers[question.id] || "未作答";
            const isCorrect = userAnswer === question.answer;
            const detailedResult = detailedResults.find(
              (r) => r.questionId === question.id,
            );
            const earnedScore = detailedResult?.score || (isCorrect ? question.score : 0);

            return (
              <div key={question.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{question.question_number}题</Badge>
                      <Badge variant="secondary">{question.question_type}</Badge>
                      <Badge>{question.score}分</Badge>
                      {isCorrect ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          +{earnedScore}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          +{earnedScore}
                        </Badge>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{question.content}</p>
                  </div>
                </div>

                {question.question_type === "选择题" && question.options && (
                  <div className="space-y-2 my-3 pl-4">
                    {Object.entries(question.options).map(([key, value]) => {
                      const isSelected = userAnswer === key;
                      const isCorrectOption = question.answer === key;
                      return (
                        <div
                          key={key}
                          className={`p-2 rounded ${
                            isSelected && isCorrectOption
                              ? "bg-green-100 border-2 border-green-500"
                              : isSelected && !isCorrectOption
                              ? "bg-red-100 border-2 border-red-500"
                              : isCorrectOption
                              ? "bg-green-50 border-2 border-green-300"
                              : "bg-gray-50"
                          }`}
                        >
                          <span className="font-medium">{key}.</span> {value}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="font-medium text-blue-900 mb-1">你的答案：</p>
                    <p className="text-blue-800">
                      {userAnswer !== "未作答" ? (
                        question.question_type === "选择题" ? (
                          <span className="font-bold">{userAnswer}</span>
                        ) : (
                          userAnswer
                        )
                      ) : (
                        <span className="text-muted-foreground">未作答</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="font-medium text-green-900 mb-1">正确答案：</p>
                    <p className="text-green-800">
                      {question.question_type === "选择题" ? (
                        <span className="font-bold">{question.answer}</span>
                      ) : (
                        question.answer
                      )}
                    </p>
                  </div>
                </div>

                {question.knowledge_points && question.knowledge_points.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">知识点：</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {question.knowledge_points.map((kp, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {kp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="mt-4" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-center gap-4">
        <Link href="/real-exams">
          <Button variant="outline">返回列表</Button>
        </Link>
        <Button
          onClick={() => router.push(`/real-exams/${examId}`)}
          variant="outline"
        >
          再次练习
        </Button>
      </div>
    </div>
  );
}

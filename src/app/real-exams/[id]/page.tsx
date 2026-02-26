"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
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
  score: number;
  knowledge_points: string[];
}

interface ExamRecord {
  id: string;
  status: string;
  started_at: string;
  exam_duration: number;
}

type ExamStatus = "not_started" | "in_progress" | "completed";

export default function RealExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<RealExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examRecord, setExamRecord] = useState<ExamRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ExamStatus>("not_started");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExamDetail();
  }, [examId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "in_progress" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const fetchExamDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const [examResponse, recordResponse] = await Promise.all([
        fetch(`/api/real-exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/real-exams/records?examId=${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const examData = await examResponse.json();
      const recordData = await recordResponse.json();

      if (examData.success) {
        setExam(examData.data);
        setQuestions(examData.data.questions || []);
      }

      if (recordData.success && recordData.data.length > 0) {
        const existingRecord = recordData.data[0];
        if (existingRecord.status === "in_progress") {
          setExamRecord(existingRecord);
          setAnswers(existingRecord.answers || {});
          setStatus("in_progress");
          const elapsed = Math.floor(
            (Date.now() - new Date(existingRecord.started_at).getTime()) / 1000,
          );
          setTimeLeft(existingRecord.exam_duration * 60 - elapsed);
        } else if (existingRecord.status === "completed") {
          router.push(`/real-exams/${examId}/result/${existingRecord.id}`);
          return;
        }
      }
    } catch (error) {
      console.error("获取真题详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/real-exams/${examId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setExamRecord(data.data);
        setStatus("in_progress");
        setTimeLeft(data.data.exam_duration * 60);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("开始考试失败:", error);
      alert("开始考试失败");
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (!examRecord) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/real-exams/${examId}/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordId: examRecord.id,
          answers,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/real-exams/${examId}/result/${examRecord.id}`);
      } else {
        alert(data.error);
        setSubmitting(false);
      }
    } catch (error) {
      console.error("提交答案失败:", error);
      alert("提交答案失败");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">真题不存在</p>
            <Link href="/real-exams" className="mt-4 inline-block">
              <Button>返回列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "not_started") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Link href="/real-exams" className="inline-flex items-center mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exam.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">地区</p>
                <p className="font-medium">{exam.region}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">年级</p>
                <p className="font-medium">{exam.grades.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">学期</p>
                <p className="font-medium">{exam.semester}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">考试类型</p>
                <p className="font-medium">{exam.exam_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">考试时长</p>
                <p className="font-medium">{exam.duration}分钟</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总分</p>
                <p className="font-medium">{exam.total_score}分</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                考试开始后需要消耗50积分，请确保已作答准备充分。考试过程中不能暂停，提交后无法修改。
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={startExam} size="lg" className="flex-1">
                开始考试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-base px-3 py-1">
            <Clock className="w-4 h-4 mr-2 inline" />
            {formatTime(timeLeft)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            已答 {answeredCount} / {questions.length} 题
          </span>
        </div>
        <Progress value={progress} className="w-48" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            第 {currentQuestion.question_number} 题
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({currentQuestion.question_type})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{currentQuestion.score}分</Badge>
            {currentQuestion.knowledge_points.map((kp) => (
              <Badge key={kp} variant="outline">
                {kp}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{currentQuestion.content}</p>
          </div>

          {currentQuestion.question_type === "选择题" &&
            currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, value)
                }
              >
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`option-${key}`} />
                    <Label htmlFor={`option-${key}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{key}.</span> {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

          {(currentQuestion.question_type === "填空题" ||
            currentQuestion.question_type === "解答题") && (
            <Textarea
              placeholder="请输入你的答案..."
              value={answers[currentQuestion.id] || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              rows={currentQuestion.question_type === "解答题" ? 10 : 3}
              className="min-h-[100px]"
            />
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一题
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "提交中..." : "提交试卷"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  下一题
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-3">快速导航：</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, index) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = index === currentQuestionIndex;
            return (
              <Button
                key={q.id}
                variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className="min-w-[48px]"
              >
                {q.question_number}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

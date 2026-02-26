'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle2, FileText, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ExamPaper {
  id: string;
  title: string;
  grade_id: string;
  region: string;
  exam_type: string;
  questions: Question[];
  total_score: number;
  duration: number;
}

interface Question {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  question: string;
  options: string[];
  answer: string | number;
  score: number;
}

interface ExamRecord {
  id: string;
  answers: { questionId: string; answer: string | number }[];
  score: number;
  total_score: number;
}

export default function ExamPage() {
  const [user, setUser] = useState<any>(null);
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examResult, setExamResult] = useState<ExamRecord | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadExamPapers();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamStarted && selectedPaper && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamStarted, selectedPaper, timeRemaining]);

  const loadExamPapers = async () => {
    setIsLoading(true);
    try {
      // 获取预置的试卷数据
      const response = await fetch('/api/test-exams');
      if (response.ok) {
        const data = await response.json();
        setExamPapers(data.data);
      } else {
        // 如果API不存在，使用模拟数据
        const mockPapers: ExamPaper[] = [
          {
            id: '1',
            title: '海淀区2024-2025学年第一学期期中数学试卷',
            grade_id: '1',
            region: '海淀区',
            exam_type: '期中考试',
            total_score: 100,
            duration: 60,
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                question: '计算 |-3| + |2| 的结果是？',
                options: ['5', '-5', '1', '-1'],
                answer: 0,
                score: 10,
              },
              {
                id: 'q2',
                type: 'single_choice',
                question: '下列各式中，正确的是？',
                options: ['-3² = 9', '-(-3)² = -9', '(-3)² = -9', '-|-3| = 3'],
                answer: 1,
                score: 10,
              },
              {
                id: 'q3',
                type: 'true_false',
                question: '整数包括正整数、负整数和0。',
                options: ['正确', '错误'],
                answer: 0,
                score: 5,
              },
              {
                id: 'q4',
                type: 'single_choice',
                question: '如果a < b，那么下面一定成立的是？',
                options: ['a + c < b + c', 'ac < bc', 'a - c < b - c', 'a/c < b/c'],
                answer: 0,
                score: 10,
              },
              {
                id: 'q5',
                type: 'single_choice',
                question: '解方程 3x + 5 = 14，x = ？',
                options: ['3', '5', '9', '19/3'],
                answer: 0,
                score: 10,
              },
            ],
          },
          {
            id: '2',
            title: '西城区2024-2025学年第一学期期中数学试卷',
            grade_id: '1',
            region: '西城区',
            exam_type: '期中考试',
            total_score: 100,
            duration: 60,
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                question: '计算 (-2)³ 的结果是？',
                options: ['8', '-8', '6', '-6'],
                answer: 1,
                score: 10,
              },
              {
                id: 'q2',
                type: 'single_choice',
                question: '下列说法正确的是？',
                options: ['0是最小的数', '-3 < -2', '绝对值最小的数是1', '正数都大于负数'],
                answer: 1,
                score: 10,
              },
              {
                id: 'q3',
                type: 'true_false',
                question: '有理数都可以用数轴上的点来表示。',
                options: ['正确', '错误'],
                answer: 0,
                score: 5,
              },
              {
                id: 'q4',
                type: 'single_choice',
                question: '合并同类项：3a + 2a - 5a = ？',
                options: ['0', '10a', 'a', '5a'],
                answer: 0,
                score: 10,
              },
              {
                id: 'q5',
                type: 'single_choice',
                question: '如果 2x - 3 = 5，那么 x = ？',
                options: ['1', '2', '3', '4'],
                answer: 3,
                score: 10,
              },
            ],
          },
          {
            id: '3',
            title: '海淀区2024-2025学年第一学期期末数学试卷',
            grade_id: '1',
            region: '海淀区',
            exam_type: '期末考试',
            total_score: 100,
            duration: 90,
            questions: [
              {
                id: 'q1',
                type: 'single_choice',
                question: '计算 |-5| × |-2| 的结果是？',
                options: ['-10', '10', '-7', '7'],
                answer: 1,
                score: 10,
              },
              {
                id: 'q2',
                type: 'single_choice',
                question: '下列各数中，最大的数是？',
                options: ['-2', '-1', '0', '1'],
                answer: 3,
                score: 10,
              },
              {
                id: 'q3',
                type: 'single_choice',
                question: '如果 a = -2，b = 3，那么 a + b 的值是？',
                options: ['-5', '5', '-1', '1'],
                answer: 2,
                score: 10,
              },
              {
                id: 'q4',
                type: 'single_choice',
                question: '化简表达式：-(x - y) = ？',
                options: ['-x - y', '-x + y', 'x - y', 'x + y'],
                answer: 1,
                score: 10,
              },
              {
                id: 'q5',
                type: 'single_choice',
                question: '方程 2(x - 1) = 8 的解是？',
                options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
                answer: 2,
                score: 10,
              },
            ],
          },
        ];
        setExamPapers(mockPapers);
      }
    } catch (error) {
      console.error('加载试卷失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startExam = (paper: ExamPaper) => {
    if (!user) {
      alert('请先登录');
      return;
    }
    setSelectedPaper(paper);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setExamResult(null);
    setTimeRemaining(paper.duration * 60);
    setIsExamStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = () => {
    if (!selectedPaper) return;
    
    setIsSubmitting(true);
    
    // 计算得分
    let totalScore = 0;
    const answersArray: { questionId: string; answer: string | number }[] = [];
    
    selectedPaper.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      answersArray.push({
        questionId: question.id,
        answer: userAnswer,
      });
      
      if (userAnswer !== undefined && userAnswer === question.answer) {
        totalScore += question.score;
      }
    });
    
    const result: ExamRecord = {
      id: Date.now().toString(),
      answers: answersArray,
      score: totalScore,
      total_score: selectedPaper.total_score,
    };
    
    setTimeout(() => {
      setExamResult(result);
      setIsExamStarted(false);
      setIsSubmitting(false);
      setConfirmDialogOpen(false);
    }, 500);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (selectedPaper && currentQuestionIndex < selectedPaper.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    if (!selectedPaper) return 0;
    return selectedPaper.questions.filter(q => userAnswers[q.id] !== undefined).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {!isExamStarted && !examResult ? (
          <>
            {/* 页面头部 */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                AI智能考试
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                选择试卷，开始测试
              </p>
            </div>

            {/* 试卷列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examPapers.map((paper) => (
                <Card key={paper.id} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-purple-500">
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-2">{paper.title}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{paper.region}</Badge>
                        <Badge variant="secondary">{paper.exam_type}</Badge>
                        <Badge>{paper.questions.length} 道题</Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">总分</span>
                        <span className="font-bold text-purple-600">{paper.total_score}分</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">时长</span>
                        <span className="font-bold flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {paper.duration} 分钟
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => startExam(paper)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      开始考试
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : isExamStarted && selectedPaper ? (
          /* 考试进行中 */
          <div className="space-y-6">
            {/* 考试头部 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedPaper.title}</CardTitle>
                    <CardDescription>
                      第 {currentQuestionIndex + 1} / {selectedPaper.questions.length} 题
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-mono font-bold text-purple-600 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      已答 {getAnsweredCount()} / {selectedPaper.questions.length}
                    </div>
                  </div>
                </div>
                <Progress 
                  value={(currentQuestionIndex / selectedPaper.questions.length) * 100} 
                  className="mt-4"
                />
              </CardHeader>
            </Card>

            {/* 当前题目 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">
                    {selectedPaper.questions[currentQuestionIndex].question}
                  </CardTitle>
                  <Badge variant="outline">
                    {selectedPaper.questions[currentQuestionIndex].score} 分
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userAnswers[selectedPaper.questions[currentQuestionIndex].id]?.toString()}
                  onValueChange={(value) => 
                    handleAnswerChange(selectedPaper.questions[currentQuestionIndex].id, parseInt(value))
                  }
                >
                  {selectedPaper.questions[currentQuestionIndex].options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 导航按钮 */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                上一题
              </Button>
              
              {currentQuestionIndex === selectedPaper.questions.length - 1 ? (
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  提交试卷
                </Button>
              ) : (
                <Button onClick={goToNextQuestion}>
                  下一题
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* 题目导航 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">题目导航</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {selectedPaper.questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={currentQuestionIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={
                        userAnswers[question.id] !== undefined
                          ? currentQuestionIndex === index
                            ? ""
                            : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                          : ""
                      }
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 提交确认对话框 */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认提交</DialogTitle>
                  <DialogDescription>
                    你已完成 {getAnsweredCount()} / {selectedPaper.questions.length} 道题。
                    提交后将无法修改答案。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                    继续答题
                  </Button>
                  <Button
                    onClick={handleSubmitExam}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    确认提交
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ) : examResult ? (
          /* 考试结果 */
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-purple-500">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle className="text-3xl">考试完成！</CardTitle>
                <CardDescription>你的成绩</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {examResult.score}
                  </div>
                  <div className="text-xl text-gray-600 dark:text-gray-400">
                    / {examResult.total_score} 分
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">正确率</span>
                    <span className="font-bold">
                      {Math.round((examResult.score / examResult.total_score) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(examResult.score / examResult.total_score) * 100} 
                    className="h-3"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setExamResult(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    返回试卷列表
                  </Button>
                  <Button
                    onClick={() => startExam(selectedPaper!)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    再考一次
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

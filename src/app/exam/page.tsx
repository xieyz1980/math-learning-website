'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle2, FileText, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Question {
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  question: string;
  options: string[];
  answer: number | number[];
  score: number;
  explanation: string;
}

interface ExamPaper {
  id: string;
  title: string;
  questions: Question[];
  total_score: number;
  duration: number;
}

// 考试主题选项
const examTopics = [
  '有理数的加减法',
  '有理数的乘除法',
  '整式的加减',
  '一元一次方程',
  '图形的初步认识',
  '数据的收集与整理',
  '相交线与平行线',
  '平面直角坐标系',
  '三角形',
  '二元一次方程组',
  '不等式与不等式组',
  '数据的分析',
  '实数',
  '一次函数',
  '整式的乘除与因式分解',
  '分式',
  '反比例函数',
  '勾股定理',
  '四边形',
  '数据的整理与初步处理',
  '二次根式',
  '一元二次方程',
  '图形的相似',
  '解直角三角形',
  '随机事件的概率',
  '二次函数',
  '圆',
  '投影与视图',
];

const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
];

const questionCounts = [3, 5, 8, 10, 15, 20];

export default function ExamPage() {
  const [user, setUser] = useState<any>(null);
  
  // 生成配置
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState('5');
  
  // 考试状态
  const [generatedPaper, setGeneratedPaper] = useState<ExamPaper | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examResult, setExamResult] = useState<{
    score: number;
    totalScore: number;
    correctCount: number;
    details: Array<{
      questionIndex: number;
      userAnswer: string | number | undefined;
      correctAnswer: number | number[];
      isCorrect: boolean;
      score: number;
    }>;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExamStarted && generatedPaper && timeRemaining > 0) {
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
  }, [isExamStarted, generatedPaper, timeRemaining]);

  const handleGenerateExam = async () => {
    if (!selectedTopic) {
      alert('请选择考试主题');
      return;
    }

    if (!user) {
      alert('请先登录');
      window.location.href = '/auth';
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          questionCount: selectedQuestionCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const paper: ExamPaper = {
          id: Date.now().toString(),
          title: `${selectedTopic} - AI智能生成试卷`,
          questions: data.data.questions,
          total_score: 100,
          duration: parseInt(selectedQuestionCount) * 5, // 每题5分钟
        };
        
        setGeneratedPaper(paper);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setExamResult(null);
        setTimeRemaining(paper.duration * 60);
        setIsExamStarted(true);
      } else {
        alert(data.error || '生成试卷失败');
      }
    } catch (error) {
      console.error('生成试卷失败:', error);
      alert('生成试卷失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = () => {
    if (!generatedPaper) return;
    
    setIsSubmitting(true);
    
    // 计算得分
    let totalScore = 0;
    let correctCount = 0;
    const details: any[] = [];
    
    generatedPaper.questions.forEach((question, index) => {
      const userAnswer = userAnswers[questionId(question)];
      const isCorrect = userAnswer !== undefined && userAnswer === question.answer;
      
      details.push({
        questionIndex: index,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        score: isCorrect ? question.score : 0,
      });
      
      if (isCorrect) {
        totalScore += question.score;
        correctCount++;
      }
    });
    
    setExamResult({
      score: totalScore,
      totalScore: generatedPaper.total_score,
      correctCount,
      details,
    });
    
    setIsExamStarted(false);
    setIsSubmitting(false);
  };

  const questionId = (index: number) => `q-${index}`;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (value: string) => {
    const diff = difficulties.find(d => d.value === value);
    return diff?.label || value;
  };

  // 初始界面
  if (!isExamStarted && !examResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">AI 智能考试</CardTitle>
              <CardDescription>选择考试主题和难度，AI 会为你生成专属试卷</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 考试主题 */}
              <div>
                <Label className="text-base font-medium">考试主题</Label>
                <Select
                  value={selectedTopic}
                  onValueChange={setSelectedTopic}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="请选择考试主题" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 难度等级 */}
              <div>
                <Label className="text-base font-medium">难度等级</Label>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="请选择难度" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 题目数量 */}
              <div>
                <Label className="text-base font-medium">题目数量</Label>
                <Select
                  value={selectedQuestionCount}
                  onValueChange={setSelectedQuestionCount}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="请选择题目数量" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCounts.map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count}题
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerateExam}
                className="w-full"
                disabled={isGenerating || !selectedTopic}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成试卷中...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    生成试卷
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 考试中界面
  if (isExamStarted && generatedPaper) {
    const currentQuestion = generatedPaper.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / generatedPaper.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* 顶部导航和计时器 */}
          <div className="mb-4 flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <Badge variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </Badge>
          </div>

          {/* 进度条 */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                第 {currentQuestionIndex + 1} / {generatedPaper.questions.length} 题
              </span>
              <span className="text-muted-foreground">
                {currentQuestion.score} 分
              </span>
            </div>
            <Progress value={progress} />
          </div>

          {/* 题目卡片 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {currentQuestion.type === 'single_choice' && '单选题'}
                  {currentQuestion.type === 'multiple_choice' && '多选题'}
                  {currentQuestion.type === 'true_false' && '判断题'}
                </Badge>
              </div>
              <CardTitle className="text-xl whitespace-pre-wrap">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={userAnswers[questionId(currentQuestionIndex)]?.toString()}
                onValueChange={(value) => handleAnswerChange(questionId(currentQuestionIndex), parseInt(value))}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {String.fromCharCode(65 + index)}. {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 导航按钮 */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              上一题
            </Button>
            
            {currentQuestionIndex < generatedPaper.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(generatedPaper.questions.length - 1, prev + 1))}
              >
                下一题
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    提交试卷
                  </>
                )}
              </Button>
            )}
          </div>

          {/* 题目导航 */}
          <div className="mt-6 p-4 bg-card border rounded-lg">
            <div className="text-sm text-muted-foreground mb-3">题目导航</div>
            <div className="flex flex-wrap gap-2">
              {generatedPaper.questions.map((_, index) => {
                const isAnswered = userAnswers[questionId(index)] !== undefined;
                const isCurrent = index === currentQuestionIndex;
                return (
                  <Button
                    key={index}
                    variant={isCurrent ? 'default' : 'outline'}
                    size="sm"
                    className={`min-w-[40px] ${
                      isAnswered ? 'bg-green-100 border-green-300 text-green-700' : ''
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 考试结果界面
  if (examResult && generatedPaper) {
    const percentage = (examResult.score / examResult.totalScore) * 100;
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {passed ? (
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  ) : (
                    <FileText className="w-12 h-12 text-red-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl">
                {passed ? '考试通过' : '考试未通过'}
              </CardTitle>
              <CardDescription>
                你的得分：{examResult.score} / {examResult.totalScore}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 得分进度 */}
              <div>
                <Progress value={percentage} className="h-4" />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">正确率</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{examResult.correctCount}</div>
                  <div className="text-sm text-muted-foreground">正确题数</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{generatedPaper.questions.length - examResult.correctCount}</div>
                  <div className="text-sm text-muted-foreground">错误题数</div>
                </div>
              </div>

              {/* 题目详情 */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">题目详情</h3>
                {examResult.details.map((detail) => {
                  const question = generatedPaper.questions[detail.questionIndex];
                  return (
                    <div key={detail.questionIndex} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium">第 {detail.questionIndex + 1} 题</span>
                        <Badge variant={detail.isCorrect ? 'default' : 'destructive'}>
                          {detail.isCorrect ? '正确' : '错误'}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{question.question}</p>
                      <div className="text-sm space-y-1">
                        <div className="text-muted-foreground">
                          你的答案：{detail.userAnswer !== undefined ? String.fromCharCode(65 + Number(detail.userAnswer)) : '未作答'}
                        </div>
                        <div className="text-muted-foreground">
                          正确答案：{String.fromCharCode(65 + Number(detail.correctAnswer))}
                        </div>
                        {question.explanation && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">解析：</span>
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setExamResult(null);
                    setGeneratedPaper(null);
                    setCurrentQuestionIndex(0);
                    setUserAnswers({});
                  }}
                >
                  重新生成试卷
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">返回首页</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}

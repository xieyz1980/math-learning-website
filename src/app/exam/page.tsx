'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Result {
  questionId: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export default function ExamPage() {
  const [step, setStep] = useState<'setup' | 'exam' | 'result'>('setup');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('中等');
  const [questionCount, setQuestionCount] = useState('5');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correctCount: number;
    totalCount: number;
    results: Result[];
    analysis: string;
  } | null>(null);

  const topics = [
    '有理数的加减法',
    '整式的加减',
    '一元一次方程',
    '图形的初步认识',
    '有理数的乘除法',
    '整式的乘除',
    '一元一次不等式',
    '二元一次方程组',
  ];

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          questionCount: parseInt(questionCount),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
        setUserAnswers(new Array(data.data.questions.length).fill(''));
        setStep('exam');
        setCurrentQuestionIndex(0);
      } else {
        alert('生成题目失败，请重试');
      }
    } catch (error) {
      console.error('生成题目失败:', error);
      alert('生成题目失败，请重试');
    }
    setLoading(false);
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const submitExam = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          userAnswers,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setStep('result');
      } else {
        alert('分析结果失败，请重试');
      }
    } catch (error) {
      console.error('分析结果失败:', error);
      alert('分析结果失败，请重试');
    }
    setLoading(false);
  };

  const resetExam = () => {
    setStep('setup');
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setResults(null);
  };

  // 设置页面
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          {/* 顶部导航 */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI 智能考试</CardTitle>
              <CardDescription>
                选择考试主题和难度，AI 会为你生成专属试卷
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">考试主题</label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择考试主题" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">难度等级</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="简单">简单</SelectItem>
                    <SelectItem value="中等">中等</SelectItem>
                    <SelectItem value="困难">困难</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">题目数量</label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 题</SelectItem>
                    <SelectItem value="5">5 题</SelectItem>
                    <SelectItem value="10">10 题</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateQuestions}
                disabled={!topic || loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    正在生成题目...
                  </>
                ) : (
                  '生成试卷'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 考试页面
  if (step === 'exam') {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* 顶部导航 */}
          <div className="mb-6 flex justify-between items-center">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
            </Link>
            <Badge variant="outline">
              第 {currentQuestionIndex + 1} / {questions.length} 题
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{topic}</span>
                <Badge>{difficulty}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={progress} />

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {currentQuestion.question}
                </h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionLetter = ['A', 'B', 'C', 'D'][index];
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(optionLetter)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          userAnswers[currentQuestionIndex] === optionLetter
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {optionLetter}.
                        </span>
                        {option.replace(/^[A-D]\.\s*/, '')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                >
                  上一题
                </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={submitExam}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        正在提交...
                      </>
                    ) : (
                      '提交试卷'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    下一题
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 结果页面
  if (step === 'result' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* 顶部导航 */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Button>
            </Link>
          </div>

          {/* 成绩卡片 */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Trophy className="w-16 h-16 text-yellow-500" />
              </div>
              <CardTitle className="text-3xl">考试完成！</CardTitle>
              <CardDescription>你的得分</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {results.score}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                共 {results.totalCount} 题，答对 {results.correctCount} 题
              </p>
            </CardContent>
          </Card>

          {/* AI 分析 */}
          {results.analysis && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI 学习建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {results.analysis}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 答题详情 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>答题详情</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{result.question}</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">正确答案：</span>
                          <span className="text-green-600 dark:text-green-400">
                            {result.correctAnswer}
                          </span>
                        </p>
                        {!result.isCorrect && (
                          <p>
                            <span className="font-medium">你的答案：</span>
                            <span className="text-red-600 dark:text-red-400">
                              {result.userAnswer || '未作答'}
                            </span>
                          </p>
                        )}
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">解析：</span>
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 重新考试 */}
          <Button onClick={resetExam} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            重新考试
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

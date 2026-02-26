'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, BookOpen, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface KnowledgePoint {
  id: string;
  chapter: string;
  title: string;
  content: string;
  type: 'keypoint' | 'common_error' | 'tip';
}

export default function KnowledgePage() {
  const [user, setUser] = useState<any>(null);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadKnowledgePoints();
  }, []);

  const loadKnowledgePoints = async () => {
    setIsLoading(true);
    try {
      // 模拟知识点数据，实际应该从API获取
      const mockKnowledgePoints: KnowledgePoint[] = [
        {
          id: '1',
          chapter: '第一章 有理数',
          title: '有理数的分类',
          content: '有理数可以分为整数和分数两大类。整数包括正整数、负整数和0；分数包括正分数和负分数。',
          type: 'keypoint',
        },
        {
          id: '2',
          chapter: '第一章 有理数',
          title: '绝对值的性质',
          content: '正数的绝对值是它本身；负数的绝对值是它的相反数；0的绝对值是0。|a| ≥ 0。',
          type: 'keypoint',
        },
        {
          id: '3',
          chapter: '第一章 有理数',
          title: '易错点：绝对值的符号',
          content: '|-3| = 3，而不是-3。绝对值的结果永远是正数或0。',
          type: 'common_error',
        },
        {
          id: '4',
          chapter: '第一章 有理数',
          title: '学习技巧：数轴法',
          content: '使用数轴可以帮助理解有理数的大小关系和绝对值的概念。',
          type: 'tip',
        },
        {
          id: '5',
          chapter: '第二章 整式的加减',
          title: '同类项的判断',
          content: '所含字母相同，并且相同字母的指数也相同的项叫做同类项。所有常数项都是同类项。',
          type: 'keypoint',
        },
        {
          id: '6',
          chapter: '第二章 整式的加减',
          title: '易错点：合并同类项',
          content: '合并同类项时，系数相加减，字母和字母的指数不变。例如：3x² + 2x² = 5x²，而不是5x⁴。',
          type: 'common_error',
        },
        {
          id: '7',
          chapter: '第二章 整式的加减',
          title: '去括号法则',
          content: '括号前是"+"号，去掉括号和"+"号后，括号里各项符号不变；括号前是"-"号，去掉括号和"-"号后，括号里各项符号都要改变。',
          type: 'keypoint',
        },
        {
          id: '8',
          chapter: '第三章 一元一次方程',
          title: '一元一次方程的标准形式',
          content: 'ax + b = 0（a ≠ 0），其中x是未知数，a是未知数的系数，b是常数项。',
          type: 'keypoint',
        },
        {
          id: '9',
          chapter: '第三章 一元一次方程',
          title: '解方程的一般步骤',
          content: '去分母 → 去括号 → 移项 → 合并同类项 → 系数化为1。',
          type: 'tip',
        },
        {
          id: '10',
          chapter: '第三章 一元一次方程',
          title: '易错点：移项变号',
          content: '移项时必须改变符号。例如：3x = 5 + 2x，移项得3x - 2x = 5。',
          type: 'common_error',
        },
        {
          id: '11',
          chapter: '第四章 图形的初步认识',
          title: '直线、射线、线段的区别',
          content: '直线没有端点，向两方无限延伸；射线有一个端点，向一方无限延伸；线段有两个端点，长度有限。',
          type: 'keypoint',
        },
        {
          id: '12',
          chapter: '第四章 图形的初步认识',
          title: '角的概念',
          content: '有公共端点的两条射线组成的图形叫做角，这个公共端点叫做角的顶点，这两条射线叫做角的边。',
          type: 'keypoint',
        },
      ];
      
      setKnowledgePoints(mockKnowledgePoints);
    } catch (error) {
      console.error('加载知识点失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'keypoint':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'common_error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadgeByType = (type: string) => {
    switch (type) {
      case 'keypoint':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">核心要点</Badge>;
      case 'common_error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">易错点</Badge>;
      case 'tip':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">学习技巧</Badge>;
      default:
        return <Badge>知识点</Badge>;
    }
  };

  // 按章节分组
  const groupedKnowledge = knowledgePoints.reduce((acc, point) => {
    if (!acc[point.chapter]) {
      acc[point.chapter] = [];
    }
    acc[point.chapter].push(point);
    return acc;
  }, {} as Record<string, KnowledgePoint[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
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

        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            核心要点知识库
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            掌握章节核心知识点，巩固学习基础
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">加载中...</div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px] lg:mx-auto">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="keypoint">核心要点</TabsTrigger>
              <TabsTrigger value="common_error">易错点</TabsTrigger>
              <TabsTrigger value="tip">学习技巧</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {Object.entries(groupedKnowledge).map(([chapter, points]) => (
                <div key={chapter} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    {chapter}
                    <Badge variant="outline">{points.length} 个知识点</Badge>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {points.map((point) => (
                      <Card key={point.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg">{point.title}</CardTitle>
                            {getIconByType(point.type)}
                          </div>
                          <CardDescription className="text-sm text-gray-500">
                            {getBadgeByType(point.type)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 dark:text-gray-300">{point.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Separator className="my-8" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="keypoint" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgePoints
                  .filter(p => p.type === 'keypoint')
                  .map((point) => (
                    <Card key={point.id} className="hover:shadow-lg transition-shadow border-green-200 dark:border-green-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{point.title}</CardTitle>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <CardDescription className="text-sm text-gray-500">
                          {point.chapter}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{point.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="common_error" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgePoints
                  .filter(p => p.type === 'common_error')
                  .map((point) => (
                    <Card key={point.id} className="hover:shadow-lg transition-shadow border-red-200 dark:border-red-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{point.title}</CardTitle>
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <CardDescription className="text-sm text-gray-500">
                          {point.chapter}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{point.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="tip" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgePoints
                  .filter(p => p.type === 'tip')
                  .map((point) => (
                    <Card key={point.id} className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{point.title}</CardTitle>
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                        </div>
                        <CardDescription className="text-sm text-gray-500">
                          {point.chapter}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">{point.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

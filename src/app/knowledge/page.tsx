'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight, Lightbulb, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// 模拟知识点数据
const knowledgeData = [
  {
    chapter: '第一章 有理数',
    topics: [
      {
        title: '有理数的概念',
        keyPoints: [
          '有理数的定义：整数和分数统称为有理数',
          '正数、负数、0 的概念',
          '数轴的定义和表示方法',
          '相反数：只有符号不同的两个数',
          '绝对值：数轴上表示数a的点与原点的距离',
        ],
        examples: [
          '3 和 -3 是相反数，绝对值都是 3',
          '0 的绝对值是 0',
          '负数的绝对值是它的相反数',
        ],
        easyMistakes: [
          '注意：0 既不是正数也不是负数，但是是偶数',
          '绝对值不可能是负数',
          '一个数的相反数不一定是负数（如 -5 的相反数是 5）',
        ],
      },
      {
        title: '有理数的加减法',
        keyPoints: [
          '同号两数相加，取相同的符号，并把绝对值相加',
          '异号两数相加，取绝对值较大的符号，并用较大的绝对值减去较小的绝对值',
          '减去一个数，等于加上这个数的相反数',
          '加法交换律：a + b = b + a',
          '加法结合律：(a + b) + c = a + (b + c)',
        ],
        examples: [
          '(-3) + (-5) = -(3+5) = -8',
          '(-3) + 5 = +(5-3) = 2',
          '5 - (-3) = 5 + 3 = 8',
        ],
        easyMistakes: [
          '减法变加法时，别忘了改变符号',
          '计算时要注意运算顺序',
          '负号要正确处理，特别是连续的负号',
        ],
      },
    ],
  },
  {
    chapter: '第二章 整式的加减',
    topics: [
      {
        title: '整式的概念',
        keyPoints: [
          '单项式：由数或字母的积组成的代数式',
          '单项式的系数：单项式中的数字因数',
          '单项式的次数：一个单项式中，所有字母的指数的和',
          '多项式：几个单项式的和',
          '多项式的次数：多项式中次数最高的项的次数',
        ],
        examples: [
          '3x² 是单项式，系数是 3，次数是 2',
          '2xy 的系数是 2，次数是 2（x 的指数是 1，y 的指数是 1）',
          '3x² + 2x - 1 是多项式，次数是 2',
        ],
        easyMistakes: [
          '注意：常数项的次数是 0',
          '多项式的次数不是所有项次数的和，而是最高的',
          '单独一个数或字母也是单项式',
        ],
      },
      {
        title: '整式的加减',
        keyPoints: [
          '同类项：所含字母相同，并且相同字母的指数也相同的项',
          '合并同类项：系数相加，字母和字母的指数不变',
          '去括号法则：括号前面是正号，去掉括号后各项符号不变；括号前面是负号，去掉括号后各项符号都改变',
          '整式加减的步骤：去括号 → 合并同类项',
        ],
        examples: [
          '2x + 3x = (2+3)x = 5x',
          '3x² - 2x² = (3-2)x² = x²',
          '-(a - b) = -a + b',
        ],
        easyMistakes: [
          '不是同类项不能合并（如 2x 和 2x²）',
          '去括号时，如果括号前是负号，括号内每一项都要变号',
          '合并同类项时，字母和指数不能变，只能改变系数',
        ],
      },
    ],
  },
  {
    chapter: '第三章 一元一次方程',
    topics: [
      {
        title: '方程的概念',
        keyPoints: [
          '方程：含有未知数的等式',
          '一元一次方程：只含有一个未知数，并且未知数的次数是 1 的方程',
          '方程的解：使方程左右两边相等的未知数的值',
          '等式的性质1：等式两边同时加上（或减去）同一个数或代数式，等式仍成立',
          '等式的性质2：等式两边同时乘以（或除以）同一个不为 0 的数，等式仍成立',
        ],
        examples: [
          '2x + 3 = 7 是一元一次方程',
          'x = 2 是方程 2x + 3 = 7 的解',
        ],
        easyMistakes: [
          '注意：方程必须有等号',
          '一元一次方程必须只有一个未知数，且次数为 1',
          '除数不能为 0',
        ],
      },
      {
        title: '解一元一次方程',
        keyPoints: [
          '解方程的步骤：去分母 → 去括号 → 移项 → 合并同类项 → 系数化为 1',
          '移项：把方程中的某一项从等号一边移到另一边，要改变符号',
          '去分母时，方程两边同时乘以各分母的最小公倍数',
          '检验：把求得的解代入原方程，看左右两边是否相等',
        ],
        examples: [
          '解方程 2x + 3 = 7：2x = 7 - 3，2x = 4，x = 2',
          '解方程 3(x - 2) = 6：3x - 6 = 6，3x = 12，x = 4',
        ],
        easyMistakes: [
          '移项时一定要变号',
          '去分母时，常数项也要乘以最小公倍数',
          '解完方程后最好检验一下',
        ],
      },
    ],
  },
];

export default function KnowledgePage() {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);

  const currentChapter = knowledgeData[selectedChapter];
  const currentTopic = currentChapter.topics[selectedTopic];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            核心要点
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            掌握章节核心知识点，巩固基础
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：章节导航 */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>章节列表</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {knowledgeData.map((chapter, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedChapter(index);
                      setSelectedTopic(0);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedChapter === index
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {chapter.chapter}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>知识点</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentChapter.topics.map((topic, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTopic(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTopic === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {topic.title}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：知识点详情 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  {currentTopic.title}
                </CardTitle>
                <CardDescription>{currentChapter.chapter}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 核心要点 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    核心要点
                  </h3>
                  <ul className="space-y-2">
                    {currentTopic.keyPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Badge variant="outline" className="mt-0.5">
                          {index + 1}
                        </Badge>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 典型例题 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    典型例题
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                    {currentTopic.examples.map((example, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="font-medium">例{index + 1}：</span>
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 易错点提醒 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    易错点提醒
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2">
                    {currentTopic.easyMistakes.map((mistake, index) => (
                      <div
                        key={index}
                        className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-red-600 dark:text-red-400">⚠️</span>
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

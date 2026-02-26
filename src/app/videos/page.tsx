'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Play, BookMarked, FileText } from 'lucide-react';
import Link from 'next/link';

// 模拟课程数据
const courses = [
  {
    id: 1,
    title: '有理数的加减法',
    chapter: '第一章 有理数',
    videoUrl: 'https://www.bilibili.com/video/BV1d3411y7K6',
    description: '本节讲解有理数的加减法运算规则',
  },
  {
    id: 2,
    title: '整式的加减',
    chapter: '第二章 整式的加减',
    videoUrl: 'https://www.bilibili.com/video/BV1f3411y7U8',
    description: '学习整式的概念及加减运算',
  },
  {
    id: 3,
    title: '一元一次方程',
    chapter: '第三章 一元一次方程',
    videoUrl: 'https://www.bilibili.com/video/BV1cJ41117jL',
    description: '掌握一元一次方程的解法',
  },
  {
    id: 4,
    title: '图形的初步认识',
    chapter: '第四章 图形的初步认识',
    videoUrl: 'https://www.bilibili.com/video/BV1wq4y1m7W8',
    description: '认识平面图形和立体图形',
  },
];

export default function VideosPage() {
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [notes, setNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'video' | 'notes'>('video');

  const handleSaveNotes = () => {
    if (notes.trim()) {
      setSavedNotes({
        ...savedNotes,
        [selectedCourse.id]: notes,
      });
      alert('笔记已保存！');
    }
  };

  const handleCourseChange = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setNotes(savedNotes[course.id] || '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
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
            学习视频
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            观看优质教学视频，边看边记笔记
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：课程列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>课程列表</CardTitle>
                <CardDescription>选择要学习的课程</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseChange(course)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCourse.id === course.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {course.title}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {course.chapter}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：视频和笔记 */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="video" className="gap-2">
                  <Play className="w-4 h-4" />
                  观看视频
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <FileText className="w-4 h-4" />
                  我的笔记
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedCourse.title}</CardTitle>
                    <CardDescription>{selectedCourse.chapter}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                      <iframe
                        src={selectedCourse.videoUrl.replace('www.bilibili.com/video/', 'player.bilibili.com/player.html?bvid=').split('?')[0]}
                        className="w-full h-full"
                        allowFullScreen
                        title={selectedCourse.title}
                      />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {selectedCourse.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookMarked className="w-5 h-5" />
                      {selectedCourse.title} - 笔记
                    </CardTitle>
                    <CardDescription>记录重点内容，便于复习</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="在这里记录你的学习笔记..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[300px] resize-y"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotes} className="gap-2">
                        <Save className="w-4 h-4" />
                        保存笔记
                      </Button>
                    </div>
                    {savedNotes[selectedCourse.id] && (
                      <>
                        <Separator />
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p className="font-medium mb-2">已保存的笔记：</p>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            {savedNotes[selectedCourse.id]}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

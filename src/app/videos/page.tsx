'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Play, BookMarked, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { VideoPlayer } from '@/components/video-player';

interface Course {
  id: string;
  title: string;
  chapter: string;
  video_url: string;
  description: string;
  video_type: string;
}

interface Note {
  id: string;
  content: string;
}

export default function VideosPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'notes'>('video');

  useEffect(() => {
    // 检查用户登录状态
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && user) {
      loadNotes();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
        if (data.data.length > 0) {
          setSelectedCourse(data.data[0]);
        }
      }
    } catch (error) {
      console.error('加载课程失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!selectedCourse || !user) return;

    try {
      const response = await fetch(
        `/api/notes?userId=${user.id}&courseId=${selectedCourse.id}`
      );
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setNotes(data.data[0].content);
      } else {
        setNotes('');
      }
    } catch (error) {
      console.error('加载笔记失败:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedCourse || !user) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: selectedCourse.id,
          content: notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('笔记已保存！');
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('保存失败，请稍后重试');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航 */}
        <div className="mb-6 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                管理后台
              </Button>
            </Link>
          )}
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
                {courses.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">暂无课程</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedCourse?.id === course.id
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
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：视频和笔记 */}
          <div className="lg:col-span-2">
            {!selectedCourse ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">请选择一个课程开始学习</p>
                </CardContent>
              </Card>
            ) : (
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
                      <VideoPlayer
                        videoUrl={selectedCourse.video_url}
                        videoType={selectedCourse.video_type as any}
                        title={selectedCourse.title}
                      />
                      {selectedCourse.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-4">
                          {selectedCourse.description}
                        </p>
                      )}
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
                        <Button
                          onClick={handleSaveNotes}
                          disabled={isSaving}
                          className="gap-2"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              保存中...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              保存笔记
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

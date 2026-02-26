'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Video, BookOpen, ClipboardCheck, User, LogOut, Settings } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center mb-12">
          <div></div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="w-4 h-4" />
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      管理后台
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button className="gap-2">
                <User className="w-4 h-4" />
                登录/注册
              </Button>
            </Link>
          )}
        </div>

        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            初中数学学习助手
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI赋能，让数学学习更轻松
          </p>
        </div>

        {/* 三大模块卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 学习视频模块 */}
          <Link href="/videos">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-500">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle className="text-2xl">学习视频</CardTitle>
                <CardDescription>
                  观看优秀教学视频，边看边记笔记
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• 精选网络优质课程</li>
                  <li>• 支持笔记功能</li>
                  <li>• 随时暂停回顾</li>
                </ul>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  开始学习
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 核心要点模块 */}
          <Link href="/knowledge">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-green-500">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-green-600 dark:text-green-300" />
                </div>
                <CardTitle className="text-2xl">核心要点</CardTitle>
                <CardDescription>
                  掌握章节核心知识点，巩固基础
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• 章节重点总结</li>
                  <li>• 知识体系梳理</li>
                  <li>• 易错点提醒</li>
                </ul>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                  查看要点
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* AI出题考试模块 */}
          <Link href="/exam">
            <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-purple-500">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle className="text-2xl">AI考试</CardTitle>
                <CardDescription>
                  AI智能出题，自动判分分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• AI智能出题</li>
                  <li>• 支持多次考试</li>
                  <li>• 自动判分分析</li>
                </ul>
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  开始考试
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            © 2025 初中数学学习助手 | 为孩子的数学学习保驾护航
          </p>
        </div>
      </div>
    </div>
  );
}

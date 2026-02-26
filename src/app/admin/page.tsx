"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Users, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";
import CourseManagement from "./components/CourseManagement";
import RealExamManagement from "./components/RealExamManagement";
import UserManagement from "./components/UserManagement";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    // 检查用户登录状态
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role !== "admin") {
        alert("无权限访问此页面");
        window.location.href = "/";
        return;
      }
    } else {
      window.location.href = "/auth";
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            管理员：{user.email}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="gap-2">
              <FileText className="w-4 h-4" />
              课程管理
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-2">
              <FileText className="w-4 h-4" />
              真题管理
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              数据统计
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CourseManagement user={user} />
          </TabsContent>

          <TabsContent value="exams">
            <RealExamManagement user={user} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement currentUser={user} />
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>数据统计功能开发中...</p>
                <Link href="/statistics" className="mt-4 inline-block">
                  <Button variant="outline">查看用户端数据统计</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

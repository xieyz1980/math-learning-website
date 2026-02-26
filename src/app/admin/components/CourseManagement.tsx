"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  chapter: string;
  video_url: string;
  description: string;
  video_type: string;
  created_at: string;
}

interface CourseManagementProps {
  user: any;
}

export default function CourseManagement({ user }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    chapter: "",
    videoUrl: "",
    description: "",
    videoType: "bilibili",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("加载课程失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const url = editingCourse
        ? `/api/admin/courses/${editingCourse.id}`
        : "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingCourse ? "课程更新成功" : "课程添加成功");
        setIsDialogOpen(false);
        loadCourses();
        resetForm();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("操作失败，请稍后重试");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      chapter: course.chapter,
      videoUrl: course.video_url,
      description: course.description,
      videoType: course.video_type,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("确定要删除这个课程吗？")) return;
    if (!user) return;

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success) {
        alert("删除成功");
        loadCourses();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("删除失败，请稍后重试");
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      chapter: "",
      videoUrl: "",
      description: "",
      videoType: "bilibili",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>课程管理</CardTitle>
            <CardDescription>添加、编辑和删除课程</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="w-4 h-4" />
                添加课程
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "编辑课程" : "添加新课程"}
                </DialogTitle>
                <DialogDescription>
                  {editingCourse ? "修改课程信息" : "填写课程信息"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>课程标题</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="例如：有理数的加减法"
                  />
                </div>
                <div>
                  <Label>所属章节</Label>
                  <Input
                    value={formData.chapter}
                    onChange={(e) =>
                      setFormData({ ...formData, chapter: e.target.value })
                    }
                    placeholder="例如：第一章 有理数"
                  />
                </div>
                <div>
                  <Label>视频类型</Label>
                  <Select
                    value={formData.videoType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, videoType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bilibili">B站视频</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="iframe">Iframe嵌入</SelectItem>
                      <SelectItem value="direct">直接链接</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>视频链接</Label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="粘贴视频链接"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    B站视频请使用BV号链接，例如：https://www.bilibili.com/video/BVxxxxxx
                  </p>
                </div>
                <div>
                  <Label>课程描述</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="课程内容简述"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>章节</TableHead>
                <TableHead>视频类型</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    暂无课程，请添加
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.chapter}</TableCell>
                    <TableCell>
                      <span className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        {course.video_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(course.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(course)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

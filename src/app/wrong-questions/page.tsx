"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookX, CheckCircle, XCircle, Trash2, Edit, Loader2 } from "lucide-react";

interface WrongQuestion {
  id: string;
  question_id: string;
  question_type: string;
  question_content: string;
  user_answer: string;
  correct_answer: string;
  score: number;
  question_source: string;
  source_id: string | null;
  knowledge_points: string[];
  note: string | null;
  mastered: boolean;
  practice_count: number;
  last_practiced_at: string | null;
  created_at: string;
}

export default function WrongQuestionsPage() {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<WrongQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<WrongQuestion | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadWrongQuestions();
  }, []);

  const loadWrongQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/wrong-questions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setWrongQuestions(data.data);
        setFilteredQuestions(data.data.filter((q: WrongQuestion) => !q.mastered));
      }
    } catch (error) {
      console.error("获取错题列表失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMastered = async (question: WrongQuestion) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/wrong-questions/${question.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mastered: !question.mastered,
        }),
      });

      const data = await response.json();
      if (data.success) {
        loadWrongQuestions();
      }
    } catch (error) {
      console.error("更新错题状态失败:", error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedQuestion) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/wrong-questions/${selectedQuestion.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          note: noteText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("笔记保存成功");
        setIsDialogOpen(false);
        loadWrongQuestions();
      }
    } catch (error) {
      console.error("保存笔记失败:", error);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("确定要删除这道错题吗？")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/wrong-questions/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        alert("删除成功");
        loadWrongQuestions();
      }
    } catch (error) {
      console.error("删除错题失败:", error);
    }
  };

  const openNoteDialog = (question: WrongQuestion) => {
    setSelectedQuestion(question);
    setNoteText(question.note || "");
    setIsDialogOpen(true);
  };

  const handleTabChange = (value: string) => {
    if (value === "all") {
      setFilteredQuestions(wrongQuestions);
    } else if (value === "unmastered") {
      setFilteredQuestions(wrongQuestions.filter((q) => !q.mastered));
    } else if (value === "mastered") {
      setFilteredQuestions(wrongQuestions.filter((q) => q.mastered));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookX className="w-8 h-8" />
          错题本
        </h1>
        <p className="text-muted-foreground">整理错题，查漏补缺</p>
      </div>

      <Tabs defaultValue="unmastered" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="unmastered">
            未掌握 ({wrongQuestions.filter((q) => !q.mastered).length})
          </TabsTrigger>
          <TabsTrigger value="mastered">
            已掌握 ({wrongQuestions.filter((q) => q.mastered).length})
          </TabsTrigger>
          <TabsTrigger value="all">
            全部 ({wrongQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unmastered" className="mt-6">
          <QuestionList
            questions={filteredQuestions}
            onToggleMastered={handleToggleMastered}
            onOpenNote={openNoteDialog}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="mastered" className="mt-6">
          <QuestionList
            questions={filteredQuestions}
            onToggleMastered={handleToggleMastered}
            onOpenNote={openNoteDialog}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <QuestionList
            questions={filteredQuestions}
            onToggleMastered={handleToggleMastered}
            onOpenNote={openNoteDialog}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      {/* 笔记编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加笔记</DialogTitle>
            <DialogDescription>
              记录这道题的解题思路和易错点
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="输入你的笔记..."
            rows={6}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveNote}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface QuestionListProps {
  questions: WrongQuestion[];
  onToggleMastered: (question: WrongQuestion) => void;
  onOpenNote: (question: WrongQuestion) => void;
  onDelete: (questionId: string) => void;
}

function QuestionList({
  questions,
  onToggleMastered,
  onOpenNote,
  onDelete,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          暂无错题
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{question.question_type}</Badge>
                  <Badge variant="outline">{question.question_source}</Badge>
                  {question.mastered && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已掌握
                    </Badge>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm">{question.question_content}</p>
              </div>
              <Switch
                checked={question.mastered}
                onCheckedChange={() => onToggleMastered(question)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-red-900 mb-1 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  你的答案
                </p>
                <p className="text-sm text-red-800">{question.user_answer}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  正确答案
                </p>
                <p className="text-sm text-green-800">{question.correct_answer}</p>
              </div>
            </div>

            {question.note && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  💡 笔记
                </p>
                <p className="text-sm text-blue-800">{question.note}</p>
              </div>
            )}

            {question.knowledge_points && question.knowledge_points.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.knowledge_points.map((kp, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {kp}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="mb-4" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span>练习 {question.practice_count} 次</span>
                {question.last_practiced_at && (
                  <span>
                    最后练习:{" "}
                    {new Date(question.last_practiced_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenNote(question)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  笔记
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(question.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

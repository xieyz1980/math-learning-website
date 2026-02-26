'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function InitPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInit = async () => {
    setIsLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage(data.message || '初始化成功');
        if (data.results) {
          data.results.forEach((result: any) => {
            setMessage(prev => prev + '\n' + result.message);
          });
        }
      } else {
        setSuccess(false);
        setMessage(data.error || '初始化失败');
      }
    } catch (error) {
      setSuccess(false);
      setMessage('初始化失败，请稍后重试');
      console.error('初始化错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">初始化数据库</CardTitle>
            <CardDescription>创建测试用户和管理员账号</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  此操作将创建以下账号：
                  <ul className="mt-2 ml-4 list-disc">
                    <li>超级管理员: xieyouzehpu@outlook.com / xyz20010</li>
                    <li>测试用户: test1@example.com / 12234567890</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {message && (
                <Alert className={success ? 'border-green-500' : 'border-red-500'}>
                  {success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription className="whitespace-pre-line">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleInit}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    初始化中...
                  </>
                ) : (
                  '开始初始化'
                )}
              </Button>

              {success && (
                <div className="text-center">
                  <a
                    href="/auth"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    前往登录页面 →
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

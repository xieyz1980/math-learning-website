'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    // 验证输入
    if (!loginForm.email || !loginForm.password) {
      setErrorMessage('邮箱和密码不能为空');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 保存用户信息和 token 到 localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
        }
        router.push('/');
      } else {
        setErrorMessage(data.error || '登录失败');
      }
    } catch (error) {
      setErrorMessage('登录失败，请稍后重试');
      console.error('登录错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    // 验证输入
    if (!registerForm.email || !registerForm.password) {
      setErrorMessage('邮箱和密码不能为空');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      return;
    }

    if (registerForm.password.length < 6) {
      setErrorMessage('密码长度至少6位');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('注册成功，请登录');
        setRegisterForm({
          email: '',
          password: '',
          confirmPassword: '',
        });
        // 切换到登录 tab
        const loginTab = document.querySelector('[value="login"]') as HTMLElement;
        if (loginTab) {
          loginTab.click();
        }
      } else {
        setErrorMessage(data.error || '注册失败');
      }
    } catch (error) {
      setErrorMessage('注册失败，请稍后重试');
      console.error('注册错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录或注册以开始学习</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>

              {/* 登录表单 */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="login-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => {
                          setErrorMessage('');
                          setLoginForm({ ...loginForm, email: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="请输入密码"
                        className="pl-10"
                        value={loginForm.password}
                        onChange={(e) => {
                          setErrorMessage('');
                          setLoginForm({ ...loginForm, password: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '登录'
                    )}
                  </Button>
                </form>

                {/* 测试账号提示 */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    测试账号（管理员）
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    邮箱：xieyouzehpu@outlook.com
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    密码：xyz20010
                  </p>
                </div>
              </TabsContent>

              {/* 注册表单 */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="register-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        value={registerForm.email}
                        onChange={(e) => {
                          setErrorMessage('');
                          setRegisterForm({ ...registerForm, email: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="请输入密码（至少6位）"
                        className="pl-10"
                        value={registerForm.password}
                        onChange={(e) => {
                          setErrorMessage('');
                          setRegisterForm({ ...registerForm, password: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="register-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="请再次输入密码"
                        className="pl-10"
                        value={registerForm.confirmPassword}
                        onChange={(e) => {
                          setErrorMessage('');
                          setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

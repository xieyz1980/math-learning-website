/**
 * 功能性测试 - 真题相关API
 * 测试真题功能的所有API端点
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:5000/api';
let authToken: string;
let testExamId: string;
let testRecordId: string;

// 辅助函数：生成JWT token
function createAuthToken(userId: string, email: string, role: string): string {
  const jwt = require('jsonwebtoken');
  const payload = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '1h',
  });
}

describe('真题API功能测试', () => {
  beforeAll(async () => {
    // 创建测试token
    authToken = createAuthToken(
      'test-user-id',
      'test@example.com',
      'user'
    );
  });

  describe('真题列表API', () => {
    it('应该成功获取真题列表', async () => {
      const response = await fetch(`${API_BASE}/admin/real-exams`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('exams');
      expect(Array.isArray(data.exams)).toBe(true);

      // 保存一个测试用的真题ID
      if (data.exams.length > 0) {
        testExamId = data.exams[0].id;
      }
    });

    it('应该返回包含年级关联数据', async () => {
      const response = await fetch(`${API_BASE}/admin/real-exams`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.exams.length).toBeGreaterThan(0);
      expect(data.exams[0]).toHaveProperty('grades');
    });

    it('应该拒绝未授权的请求', async () => {
      const response = await fetch(`${API_BASE}/admin/real-exams`);

      expect(response.status).toBe(401);
    });

    it('应该拒绝无效的token', async () => {
      const response = await fetch(`${API_BASE}/admin/real-exams`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('真题详情API', () => {
    it('应该成功获取真题详情', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id', testExamId);
      expect(data.data).toHaveProperty('questions');
      expect(Array.isArray(data.data.questions)).toBe(true);
    });

    it('应该隐藏题目答案', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();

      if (data.data.questions.length > 0) {
        // 答案应该被隐藏（为undefined）
        expect(data.data.questions[0]).toHaveProperty('answer');
        expect(data.data.questions[0].answer).toBeUndefined();
      }
    });

    it('应该拒绝不存在的真题ID', async () => {
      const response = await fetch(`${API_BASE}/real-exams/non-existent-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('开始考试API', () => {
    it('应该成功开始考试', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('status', 'in_progress');
      expect(data.data).toHaveProperty('exam_duration');

      // 保存考试记录ID
      testRecordId = data.data.id;
    });

    it('应该返回正在进行的考试（如果已存在）', async () => {
      if (!testExamId || !testRecordId) {
        console.warn('跳过测试：没有可用的测试真题或考试记录ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data.id).toBe(testRecordId);
    });

    it('应该拒绝未授权的请求', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('获取题目列表API', () => {
    it('应该拒绝未完成考试的用户查看答案', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}/questions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);
    });

    it('应该拒绝未授权的请求', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/real-exams/${testExamId}/questions`);

      expect(response.status).toBe(401);
    });
  });

  describe('获取考试记录API', () => {
    it('应该成功获取用户的考试记录', async () => {
      const response = await fetch(`${API_BASE}/real-exams/records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);

      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('real_exams');
      }
    });

    it('应该支持按考试ID筛选', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(
        `${API_BASE}/real-exams/records?examId=${testExamId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
    });

    it('应该拒绝未授权的请求', async () => {
      const response = await fetch(`${API_BASE}/real-exams/records`);

      expect(response.status).toBe(401);
    });
  });

  describe('删除真题API', () => {
    let adminAuthToken: string;

    beforeAll(() => {
      // 创建管理员token
      adminAuthToken = createAuthToken(
        'admin-id',
        'xieyouzehpu@outlook.com',
        'admin'
      );
    });

    it('应该允许管理员删除真题', async () => {
      // 注意：这个测试会删除真实的真题，谨慎使用
      // 这里只是验证API的正确性，实际测试时可以使用mock数据

      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/real-exams/${testExamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
        },
      });

      // 如果真题存在，应该成功删除
      // 如果真题不存在，返回404也是可以接受的
      expect([200, 404]).toContain(response.status);
    });

    it('应该拒绝非管理员删除真题', async () => {
      if (!testExamId) {
        console.warn('跳过测试：没有可用的测试真题ID');
        return;
      }

      const response = await fetch(`${API_BASE}/admin/real-exams/${testExamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);
    });
  });
});

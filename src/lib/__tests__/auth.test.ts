/**
 * 单元测试 - auth.ts
 * 测试用户验证和管理员验证功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyUser, verifyAdmin, DecodedToken } from '../auth';

// Mock JWT_SECRET
const testSecret = 'test-secret-key-for-unit-testing';

describe('verifyUser', () => {
  beforeEach(() => {
    // 设置测试环境变量
    vi.stubEnv('JWT_SECRET', testSecret);
  });

  it('应该成功验证有效的token', async () => {
    const validToken = createTestToken('user123', 'test@example.com', 'user');
    const result = await verifyUser(`Bearer ${validToken}`);

    expect(result.userId).toBe('user123');
    expect(result.email).toBe('test@example.com');
    expect(result.role).toBe('user');
  });

  it('应该拒绝没有授权头的请求', async () => {
    await expect(verifyUser(null)).rejects.toThrow('未授权');
  });

  it('应该拒绝空授权头', async () => {
    await expect(verifyUser('')).rejects.toThrow('未授权');
  });

  it('应该拒绝无效的token', async () => {
    await expect(verifyUser('Bearer invalid-token')).rejects.toThrow('无效的token');
  });

  it('应该拒绝过期token', async () => {
    const expiredToken = createTestToken('user123', 'test@example.com', 'user', -3600); // 1小时前过期
    await expect(verifyUser(`Bearer ${expiredToken}`)).rejects.toThrow('无效的token');
  });

  it('应该拒绝格式错误的token', async () => {
    await expect(verifyUser('Bearer invalid-format')).rejects.toThrow('无效的token');
  });

  it('应该接受管理员token', async () => {
    const adminToken = createTestToken('admin123', 'xieyouzehpu@outlook.com', 'admin');
    const result = await verifyUser(`Bearer ${adminToken}`);

    expect(result.email).toBe('xieyouzehpu@outlook.com');
    expect(result.role).toBe('admin');
  });
});

describe('verifyAdmin', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', testSecret);
  });

  it('应该成功验证管理员token', async () => {
    const adminToken = createTestToken('admin123', 'xieyouzehpu@outlook.com', 'admin');
    const result = await verifyAdmin(`Bearer ${adminToken}`);

    expect(result.userId).toBe('admin123');
    expect(result.email).toBe('xieyouzehpu@outlook.com');
    expect(result.role).toBe('admin');
  });

  it('应该拒绝非管理员token', async () => {
    const userToken = createTestToken('user123', 'other@example.com', 'user');
    await expect(verifyAdmin(`Bearer ${userToken}`)).rejects.toThrow('权限不足');
  });

  it('应该拒绝没有授权头的请求', async () => {
    await expect(verifyAdmin(null)).rejects.toThrow('未授权');
  });

  it('应该拒绝无效的token', async () => {
    await expect(verifyAdmin('Bearer invalid-token')).rejects.toThrow('无效的token');
  });
});

// 辅助函数：创建测试token
function createTestToken(
  userId: string,
  email: string,
  role: string,
  expiresIn: number = 3600
): string {
  const jwt = require('jsonwebtoken');
  const payload: DecodedToken = {
    userId,
    email,
    role,
  };

  return jwt.sign(payload, testSecret, {
    expiresIn: expiresIn,
  });
}

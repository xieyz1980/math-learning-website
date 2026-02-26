import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

/**
 * 验证管理员权限
 * @param authHeader Authorization header value
 * @returns 解码后的 token 信息
 * @throws {Error} 如果未授权或权限不足
 */
export async function verifyAdmin(authHeader: string | null): Promise<DecodedToken> {
  if (!authHeader) {
    throw new Error("未授权");
  }

  const token = authHeader.replace("Bearer ", "");
  let decoded: DecodedToken;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    throw new Error("无效的token");
  }

  if (decoded.email !== "xieyouzehpu@outlook.com") {
    throw new Error("权限不足");
  }

  return decoded;
}

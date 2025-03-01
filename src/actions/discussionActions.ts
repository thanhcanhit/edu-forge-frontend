"use server";

import { AxiosFactory } from "@/lib/axios";

/**
 * Hiện tại phần jwt chưa handle, nên skip nhé, mai mốt xong auth rồi đoạn nào cần thì gắn bổ sung
 */

// Cho các request thông thường (public)
const discussionAxios = AxiosFactory.getApiInstance("discussion");
// Cho các request cần JWT
const discussionJWTAxios = AxiosFactory.getJwtInstance("discussion");

// Lấy danh sách các thread
export const getThread = async (threadId: string) => {
  const res = await discussionAxios.get(`api/v1/threads/${threadId}`);
  return res.data;
};

// Tạo post cần jwt để xem người dùng đã đăng nhập hay chưa, có quyền đăng bài hay không
export const createPost = async (threadId: string, content: string) => {
  const res = await discussionJWTAxios.post(`api/v1/posts`, {
    threadId,
    content,
  });
  return res.data;
};

/**
 * Chia ra các interface cho dễ quản lý, nhưng không chia file ra nhiều
 * vì vậy ta sẽ đặt tất cả vào một file types.ts cho từng module
 */

// Các interface gốc mapping từ Typescript
export interface Thread {
  id: string;
  title: string;
  content: string;
}

export interface Post {
  id: string;
  content: string;
}

// DTO mở rộng
export interface ThreadWithPosts extends Thread {
  posts: Post[];
}

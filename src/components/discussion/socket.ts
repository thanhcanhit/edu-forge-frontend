import { Socket, io } from "socket.io-client";
import type { Post } from "./type";

interface ThreadUser {
  userId: string;
  userName: string;
}

interface ThreadUsers {
  threadId: string;
  users: ThreadUser[];
}

class DiscussionSocketService {
  private socket: Socket | null = null;
  private currentThreadId: string | null = null;
  private readonly namespace = "/threads";

  connect() {
    if (!this.socket) {
      const baseUrl =
        process.env.NEXT_PUBLIC_DISCUSSION_GATEWAY_URL ||
        "http://localhost:3005";

      this.socket = io(baseUrl + this.namespace, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected to namespace:", this.namespace);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error.message);
      });

      this.socket.on("disconnect", (reason) => {
        console.log(`Disconnected from namespace ${this.namespace}:`, reason);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.currentThreadId = null;
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinThread(threadId: string, userId: string, userName: string) {
    if (this.socket) {
      this.currentThreadId = threadId;
      this.socket.emit("join-thread", { threadId, userId, userName });
    }
  }

  leaveThread(threadId: string, userId: string) {
    if (this.socket) {
      this.currentThreadId = null;
      this.socket.emit("leave-thread", { threadId, userId });
    }
  }

  // Post event listeners
  onNewPost(callback: (post: Post) => void) {
    if (this.socket) {
      this.socket.on("new-post", callback);
    }
  }

  onUpdatePost(callback: (post: Post) => void) {
    if (this.socket) {
      this.socket.on("update-post", callback);
    }
  }

  onDeletePost(callback: (data: { postId: string }) => void) {
    if (this.socket) {
      this.socket.on("delete-post", callback);
    }
  }

  // Thread user event listeners
  onThreadUsers(callback: (data: ThreadUsers) => void) {
    if (this.socket) {
      this.socket.on("thread-users", callback);
    }
  }

  onUserJoined(callback: (user: ThreadUser) => void) {
    if (this.socket) {
      this.socket.on("user-joined", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new DiscussionSocketService();
export default socketService;

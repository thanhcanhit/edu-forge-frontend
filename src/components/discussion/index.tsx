"use client";

import { useEffect, useState } from "react";

import { Loader2, MessageCircle, Star, X } from "lucide-react";
import { toast } from "sonner";

import useUserStore from "@/stores/useUserStore";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useDiscussionStore } from "../../stores/useDiscussion";
import { PostCard } from "./PostCard";
import UserInput from "./UserInput";
import { DiscussionType } from "./type";

// Content component that handles the scrollable content area
function DiscussionContent({
  threadId,
  thread,
  posts,
  isLoading,
  error,
  threadUsers,
  isConnected,
  isReconnecting,
  showReplies,
  isLoadingMore,
  loadingReplies,
  repliesMap,
  toggleReplies,
  loadMoreReplies,
  loadMorePosts,
  currentUserId,
}: {
  threadId: string;
  thread: any;
  posts: any[];
  isLoading: boolean;
  error: string | null;
  threadUsers: any[];
  isConnected: boolean;
  isReconnecting: boolean;
  showReplies: Record<string, boolean>;
  isLoadingMore: boolean;
  loadingReplies: Record<string, boolean>;
  repliesMap: Record<string, any[]>;
  toggleReplies: (postId: string) => void;
  loadMoreReplies: (postId: string) => void;
  loadMorePosts: () => void;
  currentUserId: string;
}) {
  if (isLoading && !posts.length) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!thread) {
    return <div>Không tìm thấy bài viết</div>;
  }

  const hasMorePosts = thread._count.posts > posts.length;
  const totalPosts = thread._count.posts;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            thread={thread}
            replies={repliesMap[post.id] || []}
            onToggleReplies={() => toggleReplies(post.id)}
            onLoadMoreReplies={() => loadMoreReplies(post.id)}
            isLoadingReplies={loadingReplies[post.id]}
            showReplies={showReplies[post.id]}
          />
        ))}
      </div>

      {hasMorePosts && (
        <div className="flex justify-center pt-4">
          <Button
            variant="link"
            onClick={loadMorePosts}
            disabled={isLoadingMore}
            className="w-full max-w-xs text-xs"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              `Hiển thị thêm (${totalPosts - posts.length} bình luận còn lại)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Main wrapper component with Sheet
export default function Discussion({ threadId }: { threadId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const [isThreadReady, setIsThreadReady] = useState(Boolean(threadId));

  const {
    posts,
    thread,
    isLoading,
    error,
    threadUsers,
    isConnected,
    isReconnecting,
    showReplies,
    isLoadingMore,
    loadingReplies,
    hasReviewed,
    repliesMap,
    setCurrentUserId,
    setCurrentUserName,
    setCurrentThreadId,
    initializeSocket,
    cleanupSocket,
    fetchThread,
    fetchPosts,
    addReply,
    toggleReplies,
    loadMoreReplies,
    loadMorePosts,
    checkUserReview,
  } = useDiscussionStore();

  // Update isThreadReady when threadId changes
  useEffect(() => {
    setIsThreadReady(Boolean(threadId));
  }, [threadId]);

  // Only set user info once, regardless of sheet open state
  useEffect(() => {
    if (!user) return;
    if (!threadId) return; // Don't set thread ID if it's empty

    setCurrentUserId(user.id);
    setCurrentUserName(user.name);
    setCurrentThreadId(threadId);
  }, [
    threadId,
    user,
    setCurrentUserId,
    setCurrentUserName,
    setCurrentThreadId,
  ]);

  // Only initialize socket and fetch data when sheet is open
  useEffect(() => {
    // Skip if sheet is not open, no user, or no threadId
    if (!isOpen || !user || !threadId) return;

    console.log("Initializing socket for thread:", threadId);

    // Initialize socket when sheet opens
    initializeSocket();

    // Fetch thread and posts only once when the sheet opens
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        console.log("Fetching thread data for:", threadId);
        await fetchThread();
        await fetchPosts();
      } catch (error) {
        console.error("Error fetching discussion data:", error);
      }
    };

    if (!controller.signal.aborted) {
      fetchData();
    }

    // Clean up socket when sheet closes or component unmounts
    return () => {
      console.log("Cleaning up socket for thread:", threadId);
      controller.abort();
      cleanupSocket();
    };
  }, [
    // Include all dependencies used in the effect
    isOpen,
    user?.id,
    threadId,
    fetchThread,
    fetchPosts,
    initializeSocket,
    cleanupSocket,
  ]);

  // Explicitly check for user review when thread is loaded
  useEffect(() => {
    if (thread && user && thread.type === DiscussionType.COURSE_REVIEW) {
      console.log("Explicitly checking user review for thread:", thread.id);
      console.log("Current hasReviewed state:", hasReviewed);
      // For course reviews, the resourceId is the courseId
      checkUserReview(thread.resourceId);
      console.log("Called checkUserReview with courseId:", thread.resourceId);
    }
  }, [thread?.id, user?.id, checkUserReview]);

  // Log when hasReviewed changes
  useEffect(() => {
    if (thread?.type === DiscussionType.COURSE_REVIEW) {
      console.log("hasReviewed state changed:", hasReviewed);
    }
  }, [hasReviewed, thread?.type]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // If no user, show login prompt
  if (!user) {
    return (
      <Button
        onClick={() => toast.error("Vui lòng đăng nhập để tham gia thảo luận")}
        className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg"
        aria-label="Open discussion"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  // If threadId is empty, show loading state
  if (!isThreadReady) {
    return (
      <Button
        onClick={() => toast.info("Đang tải thông tin thảo luận...")}
        className="fixed bottom-20 z-50 right-8 bg-orange-500   hover:bg-orange-500 rounded-full h-12 w-12 shadow-lg opacity-70"
        aria-label="Discussion loading"
        size="icon"
      >
        <Loader2 className="h-6 w-6 animate-spin" />
      </Button>
    );
  }

  const totalPosts = thread?._count?.posts || 0;

  return (
    <>
      {/* Floating MessageCircle button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 z-50 right-24 bg-orange-500 hover:bg-orange-600 rounded-full h-12 w-12 shadow-lg"
        aria-label="Open discussion"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Sheet component */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col p-0 w-full sm:max-w-2xl md:max-w-2xl lg:max-w-2xl">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background">
            <SheetHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SheetTitle>
                    {thread?.type === DiscussionType.COURSE_REVIEW
                      ? "Đánh giá khóa học"
                      : "Thảo luận"}
                  </SheetTitle>

                  {/* Thread info */}
                  {thread && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{Math.round(thread?.overallRating || 0)}</span>
                        <Star className="size-3" />
                        <span>{totalPosts} bình luận</span>
                        <span>Hiện {threadUsers.length} người đang xem</span>
                        {isConnected && (
                          <span className="text-green-500">•</span>
                        )}
                        {isReconnecting && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Đang kết nối
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <SheetClose className="rounded-full p-1.5 hover:bg-muted">
                  <X className="h-4 w-4" />
                </SheetClose>
              </div>

              {thread?.type === DiscussionType.COURSE_REVIEW && hasReviewed && (
                <div className="text-xs text-muted-foreground mt-2">
                  Bạn đã đánh giá khóa học này. Bạn vẫn có thể tham gia thảo
                  luận mà không cần thêm điểm đánh giá.
                </div>
              )}
            </SheetHeader>
          </div>

          {/* Scrollable Content Area */}
          <ScrollArea className="flex-1 overflow-y-auto p-4 px-12">
            {isOpen && (
              <DiscussionContent
                threadId={threadId}
                thread={thread}
                posts={posts}
                isLoading={isLoading}
                error={error}
                threadUsers={threadUsers}
                isConnected={isConnected}
                isReconnecting={isReconnecting}
                showReplies={showReplies}
                isLoadingMore={isLoadingMore}
                loadingReplies={loadingReplies}
                repliesMap={repliesMap}
                toggleReplies={toggleReplies}
                loadMoreReplies={loadMoreReplies}
                loadMorePosts={loadMorePosts}
                currentUserId={user.id}
              />
            )}
          </ScrollArea>

          {/* Sticky Footer with UserInput */}
          <div className="sticky bottom-0 bg-background px-4 py-2">
            {isOpen && thread && (
              <UserInput
                currentUserId={user.id}
                thread={thread}
                parentId={undefined}
                placeholder={
                  thread.type === DiscussionType.COURSE_REVIEW && !hasReviewed
                    ? "Đánh giá khóa học với tên của bạn..."
                    : "Bình luận dưới tên của bạn..."
                }
                hideRating={hasReviewed}
                onSubmit={async (content, rating) => {
                  if (
                    thread.type === DiscussionType.COURSE_REVIEW &&
                    !hasReviewed &&
                    !rating
                  ) {
                    throw new Error(
                      "Bạn phải cung cấp điểm đánh giá với bình luận đầu tiên của bạn",
                    );
                  }
                  await addReply(null, content, rating);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDiscussionStore } from "@/stores/useDiscussion";
import useUserStore from "@/stores/useUserStore";

import { Rating } from "@/components/rating";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ReactionButton } from "./ReactionButton";
import UserInput from "./UserInput";
import type { PostWithReplyCount, Thread } from "./type";
import { DiscussionType } from "./type";

interface PostCardProps {
  post: PostWithReplyCount;
  currentUserId?: string;
  level?: number;
  thread: Thread;
  replies?: PostWithReplyCount[];
  onToggleReplies?: (postId: string) => void;
  onLoadMoreReplies?: (postId: string) => void;
  isLoadingReplies?: boolean;
  showReplies?: boolean;
}

export function PostCard({
  post,
  currentUserId,
  level = 0,
  thread,
  replies = [],
  onToggleReplies,
  onLoadMoreReplies,
  isLoadingReplies = false,
  showReplies = false,
}: PostCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    editPost,
    deletePost,
    addReaction,
    removeReaction,
    error,
    addReply,
    currentUserName,
  } = useDiscussionStore();
  const { user } = useUserStore();
  const MAX_REPLY_DEPTH = 1;

  // Get the effective parent ID for replies
  const getEffectiveParentId = () => {
    // For level 0 (top-level posts), return the post ID
    // For level 1 (replies to posts), find the original parent ID
    if (level === 0) {
      return post.id;
    } else if (level === 1) {
      // For level 1 posts, we want to return their parent's ID
      // This ensures all replies stay at level 1 (under the same parent)
      return post.parentId || post.id;
    }

    // If somehow we have deeper levels, don't allow more replies
    return undefined;
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleEditSuccess = async (content: string) => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để chỉnh sửa");
      return;
    }

    await editPost(post.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!currentUserId) {
      toast.error("Vui lòng đăng nhập để xóa");
      return;
    }

    try {
      toast.promise(deletePost(post.id), {
        loading: "Đang xóa bình luận...",
        success: "Bình luận đã được xóa thành công",
        error: "Không thể xóa bình luận",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete post";
      toast.error(errorMessage);
    }
  };

  const getInitials = (id: string) => {
    return id ? id.slice(0, 2).toUpperCase() : "??";
  };

  // Helper function to render reaction summary in Facebook style
  const renderReactionSummary = () => {
    if (!post.reactionCounts || post.reactionCounts.total === 0) {
      return null;
    }

    // Get the top 2 reactions by count (excluding 0 counts)
    const topReactions = Object.entries(post.reactionCounts)
      .filter(([key, count]) => key !== "total" && count > 0)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 2);

    if (topReactions.length === 0) return null;

    // Map of reaction types to emojis
    const reactionEmojis: Record<string, string> = {
      LIKE: "👍",
      LOVE: "❤️",
      CARE: "🤗",
      HAHA: "😄",
      WOW: "😮",
      SAD: "😢",
      ANGRY: "😠",
    };

    return (
      <div className="flex items-center mr-2">
        <div className="flex -space-x-1 mr-1">
          {topReactions.map(([type]) => (
            <div
              key={type}
              className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200"
            >
              <span className="text-[10px]">{reactionEmojis[type]}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          {post.reactionCounts.total}
        </span>
      </div>
    );
  };

  return (
    <div className={`mb-3 w-fit max-w-full ${level > 0 ? "ml-6" : ""}`}>
      <div className="flex items-start gap-2">
        {level > 0 && (
          <div className="relative -ml-6 mr-1">
            <div className="absolute top-4 -left-6 w-6 h-6 border-l-2 border-b-2 border-gray-400 rounded-bl-xl" />
          </div>
        )}
        <Avatar className="w-8 h-8">
          {post.authorId === currentUserId && user?.image ? (
            <AvatarImage src={user.image} alt={currentUserName || "You"} />
          ) : (
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`}
              alt={
                post.authorId === currentUserId
                  ? currentUserName || "You"
                  : post.authorId.slice(0, 8)
              }
            />
          )}
          <AvatarFallback>{getInitials(post.authorId)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {isEditing ? (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-xs flex items-center gap-1">
                  <span className="text-blue-600">Chỉnh sửa bình luận</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1 text-xs text-gray-500"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </Button>
              </div>
              <EditInput
                currentUserId={currentUserId}
                thread={thread}
                initialContent={post.content}
                onSubmitSuccess={handleEditSuccess}
                showAvatar={false}
                post={post}
              />
            </div>
          ) : (
            <div
              className="bg-zinc-50 border border-gray-200 rounded-2xl p-3 relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xs flex items-center gap-1">
                  {post.authorId === currentUserId
                    ? currentUserName || "Bạn"
                    : post.authorId
                      ? post.authorId.slice(0, 8)
                      : "Anonymous"}
                  {post.authorId === currentUserId && (
                    <Badge
                      className="text-[10px] text-blue-500"
                      variant="outline"
                    >
                      Bạn
                    </Badge>
                  )}
                </div>
                {currentUserId &&
                  post.authorId === currentUserId &&
                  (isHovering || isDropdownOpen) && (
                    <div className="flex items-center gap-0 absolute right-2 top-2">
                      <DropdownMenu
                        open={isDropdownOpen}
                        onOpenChange={setIsDropdownOpen}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-36 text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditing(true);
                              setIsDropdownOpen(false);
                            }}
                            className="text-xs"
                          >
                            <Pencil className="h-3 w-3 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Xóa bình luận
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Bạn có chắc chắn?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Nó sẽ xóa
                                  vĩnh viễn bình luận của bạn
                                  {post._count?.replies > 0 &&
                                    ` và tất cả ${post._count.replies} phản hồi của nó`}
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
              </div>

              {thread.type === DiscussionType.COURSE_REVIEW &&
                !post.parentId &&
                post.rating && (
                  <div className="mt-1">
                    <Rating
                      value={post.rating}
                      disabled
                      className="mb-2"
                      size="sm"
                    />
                  </div>
                )}

              <p className="mt-1 text-sm break-all">{post.content}</p>
            </div>
          )}

          <div className="mt-1 ml-2 flex items-center gap-3 text-xs text-gray-500">
            <ReactionButton
              postId={post.id}
              reactions={post.reactions}
              reactionCounts={post.reactionCounts}
              currentUserId={currentUserId || ""}
              onReact={(type, existingReactionId) => {
                addReaction(post.id, type, existingReactionId);
              }}
              onRemoveReaction={(reactionId, reactionType) =>
                removeReaction(reactionId, reactionType)
              }
            />
            {level < MAX_REPLY_DEPTH && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs p-0 h-6 flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
                onClick={() => setIsReplying(!isReplying)}
              >
                Trả lời
              </Button>
            )}

            {level === MAX_REPLY_DEPTH && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs p-0 h-6 flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
                onClick={() => setIsReplying(!isReplying)}
              >
                Trả lời
              </Button>
            )}
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-3">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
                {post.isEdited && " (đã chỉnh sửa)"}
              </span>
              {renderReactionSummary()}
            </div>

            {post._count?.replies > 0 && level < MAX_REPLY_DEPTH && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs p-0 h-6 flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
                onClick={() => onToggleReplies?.(post.id)}
                disabled={isLoadingReplies}
              >
                {isLoadingReplies ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Đang tải...
                  </div>
                ) : (
                  <>
                    {showReplies
                      ? "Ẩn"
                      : `Xem ${post._count.replies} ${
                          post._count.replies === 1 ? "phản hồi" : "phản hồi"
                        }`}
                  </>
                )}
              </Button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2 ml-2">
              <UserInput
                currentUserId={currentUserId}
                thread={thread}
                parentId={getEffectiveParentId()}
                onSubmitSuccess={() => setIsReplying(false)}
                placeholder="Viết phản hồi..."
                showAvatar={false}
                onSubmit={async (content) => {
                  await addReply(getEffectiveParentId() || null, content);
                }}
              />
            </div>
          )}

          {showReplies && replies.length > 0 && level < MAX_REPLY_DEPTH && (
            <div className="mt-2 ml-1 space-y-2">
              <div className="space-y-2">
                {replies.map((reply) => (
                  <PostCard
                    key={reply.id}
                    post={reply}
                    currentUserId={currentUserId}
                    level={level + 1}
                    thread={thread}
                    onToggleReplies={onToggleReplies}
                    onLoadMoreReplies={onLoadMoreReplies}
                    isLoadingReplies={isLoadingReplies}
                    showReplies={showReplies}
                    replies={[]}
                  />
                ))}

                {post._count?.replies > replies.length && (
                  <div className="flex justify-start ml-7 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onLoadMoreReplies?.(post.id);
                      }}
                      disabled={isLoadingReplies}
                      className="text-xs flex items-center gap-1 text-blue-500 hover:bg-transparent"
                    >
                      {isLoadingReplies ? (
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Đang tải phản hồi...
                        </div>
                      ) : (
                        <>
                          Tải thêm {post._count?.replies - replies.length} phản
                          hồi
                          {post._count?.replies - replies.length === 1
                            ? ""
                            : ""}{" "}
                          khác
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// A specialized version of UserInput specifically for editing posts
function EditInput({
  currentUserId,
  thread,
  initialContent,
  onSubmitSuccess,
  showAvatar = false,
  post,
}: {
  currentUserId?: string;
  thread: Thread;
  initialContent: string;
  onSubmitSuccess: (content: string) => Promise<void>;
  showAvatar?: boolean;
  post: PostWithReplyCount;
}) {
  const [content, setContent] = useState(initialContent);

  // Determine if rating should be hidden based on post data
  const hideRating = !(
    thread.type === DiscussionType.COURSE_REVIEW &&
    !post.parentId &&
    post.rating !== null &&
    post.rating !== undefined &&
    typeof post.rating === "number"
  );

  return (
    <div className="flex-1">
      <UserInput
        currentUserId={currentUserId}
        thread={thread}
        initialContent={initialContent}
        onContentChange={setContent}
        onSubmitSuccess={() => onSubmitSuccess(content)}
        placeholder="Chỉnh sửa bình luận của bạn..."
        showAvatar={showAvatar}
        submitButtonText="Lưu"
        hideRating={hideRating}
        onSubmit={async (content) => {
          await onSubmitSuccess(content);
        }}
      />
    </div>
  );
}

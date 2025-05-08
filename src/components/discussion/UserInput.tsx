import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import data from "@emoji-mart/data";
import { Send, Smile } from "lucide-react";
import { toast } from "sonner";

import useUserStore from "@/stores/useUserStore";

import { Rating } from "@/components/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DiscussionType, Thread } from "./type";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

interface UserInputProps {
  currentUserId?: string;
  thread: Thread;
  parentId?: string;
  onSubmitSuccess?: () => void;
  placeholder?: string;
  showAvatar?: boolean;
  className?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  submitButtonText?: string;
  onSubmit: (content: string, rating?: number) => Promise<void>;
  hideRating?: boolean;
}

interface EmojiData {
  native: string;
  id: string;
  unified: string;
  keywords: string[];
}

export default function UserInput({
  currentUserId,
  thread,
  parentId,
  onSubmitSuccess,
  placeholder = "Bình luận dưới tên của bạn...",
  showAvatar = true,
  className = "",
  initialContent = "",
  onContentChange,
  submitButtonText = "Bình luận",
  onSubmit,
  hideRating = false,
}: UserInputProps) {
  const [newPostContent, setNewPostContent] = useState(initialContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [rating, setRating] = useState<number | undefined>(5);
  const newPostInputRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUserStore();

  // Update content if initialContent changes (for edit mode)
  useEffect(() => {
    if (initialContent) {
      setNewPostContent(initialContent);
    }
  }, [initialContent]);

  // Notify parent component of content changes if needed
  useEffect(() => {
    if (onContentChange) {
      onContentChange(newPostContent);
    }
  }, [newPostContent, onContentChange]);

  const handleSubmitNewPost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUserId) {
      toast.error("Bạn phải đăng nhập để có thể để lại bình luận");
      return;
    }
    if (!thread) {
      toast.error("Không tìm thấy bài viết");
      return;
    }

    // For course reviews, first post must include a rating
    if (
      !parentId &&
      thread.type === DiscussionType.COURSE_REVIEW &&
      !hideRating &&
      rating === undefined
    ) {
      toast.error("Bạn phải đánh giá khóa học trước khi để lại bình luận");
      return;
    }

    if (newPostContent.trim()) {
      // If editing (using onContentChange), don't submit directly
      if (onContentChange) {
        onSubmitSuccess?.();
        return;
      }

      // Normal post/reply submission
      const postRating =
        !parentId && thread.type === DiscussionType.COURSE_REVIEW && !hideRating
          ? rating
          : undefined;
      setIsSubmitting(true);
      try {
        await onSubmit(newPostContent, postRating);
        setNewPostContent("");
        setRating(5);
        if (newPostInputRef.current) {
          newPostInputRef.current.style.height = "auto";
        }
        onSubmitSuccess?.();
      } catch (error) {
        console.error("Failed to submit:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to submit post");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPostContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleEmojiSelect = (emoji: EmojiData) => {
    const start = newPostInputRef.current?.selectionStart || 0;
    const end = newPostInputRef.current?.selectionEnd || 0;
    const newContent =
      newPostContent.substring(0, start) +
      emoji.native +
      newPostContent.substring(end);
    setNewPostContent(newContent);
  };

  if (!currentUserId) {
    return (
      <div className="text-center text-gray-500">
        Bạn phải đăng nhập để có thể để lại bình luận
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitNewPost}
      className={`flex items-start gap-2 ${className}`}
    >
      {showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={
              user?.image ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`
            }
          />
          <AvatarFallback>
            {currentUserId.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 ">
        <div className="bg-white border rounded-2xl w-full min-w-[300px] max-w-full">
          <div className="relative p-3">
            {!parentId &&
              thread.type === DiscussionType.COURSE_REVIEW &&
              !hideRating && (
                <Rating value={rating} onChange={setRating} className="mb-2" />
              )}
            <Textarea
              ref={newPostInputRef}
              value={newPostContent}
              onChange={handleTextareaChange}
              placeholder={
                placeholder ||
                (thread.type === DiscussionType.COURSE_REVIEW &&
                !parentId &&
                !hideRating
                  ? "Write your course review..."
                  : "Write a comment...")
              }
              className={`min-h-[35px] max-h-[200px] border-0 focus-visible:ring-0 shadow-none resize-none rounded-lg p-0  placeholder:text-foreground/50 placeholder:text-sm ${isSubmitting ? "opacity-50" : ""}`}
              disabled={isSubmitting}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-0.5">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={isSubmitting}
                  >
                    <Smile className="h-4 w-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="end">
                  <EmojiPicker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    previewPosition="none"
                    skinTonePosition="none"
                  />
                </PopoverContent>
              </Popover>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      disabled={!newPostContent.trim() || isSubmitting}
                      className="h-7 w-7"
                    >
                      <Send className="h-4 w-4 text-blue-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {submitButtonText} {parentId ? "reply" : "comment"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { LessonType } from "@/types/course/types";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { ChevronLeft } from "lucide-react";

import { createLesson } from "@/actions/courseAction";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function CreateLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [lessonType, setLessonType] = useState<string>(LessonType.BLOG);
  const editor = useCreateBlockNote();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Get the content from the editor
      const blocks = editor.document;
      const content = JSON.stringify(blocks);

      // Determine the lesson type based on inputs
      let type = lessonType;
      if (lessonType === LessonType.MIXED && !videoUrl) {
        type = LessonType.BLOG;
      } else if (lessonType === LessonType.VIDEO && !content) {
        type = LessonType.VIDEO;
      } else if (videoUrl && blocks.length > 0) {
        type = LessonType.MIXED;
      }

      const result = await createLesson(
        resolvedParams.courseId,
        resolvedParams.chapterId,
        {
          title,
          content,
          type,
          videoUrl: videoUrl || undefined,
          isPublished,
          isFreePreview,
        },
      );

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã tạo bài học mới",
        });
        router.push(`/admin/courses/${resolvedParams.courseId}`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài học",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/courses/${resolvedParams.courseId}`}>
              <Button
                variant="outline"
                size="icon"
                className="border-slate-200 hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">
              Tạo bài học mới
            </h1>
          </div>
          <Button
            type="submit"
            form="lesson-form"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isSubmitting ? "Đang tạo..." : "Tạo bài học"}
          </Button>
        </div>
      </div>

      <div className="">
        <form id="lesson-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-slate-900"
              >
                Tiêu đề bài học
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="border-slate-200 focus:ring-black"
                placeholder="Nhập tiêu đề bài học"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lessonType"
                className="text-sm font-semibold text-slate-900"
              >
                Loại bài học
              </Label>
              <Select
                value={lessonType}
                onValueChange={(value) => setLessonType(value)}
              >
                <SelectTrigger className="border-slate-200 focus:ring-black">
                  <SelectValue placeholder="Chọn loại bài học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LessonType.BLOG}>Bài viết</SelectItem>
                  <SelectItem value={LessonType.VIDEO}>Video</SelectItem>
                  <SelectItem value={LessonType.MIXED}>Cả hai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(lessonType === LessonType.VIDEO ||
              lessonType === LessonType.MIXED) && (
              <div className="space-y-2">
                <Label
                  htmlFor="videoUrl"
                  className="text-sm font-semibold text-slate-900"
                >
                  URL Video
                </Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Nhập URL video từ YouTube, Vimeo, ..."
                  required={lessonType === LessonType.VIDEO}
                  className="border-slate-200 focus:ring-black"
                />
              </div>
            )}

            {(lessonType === LessonType.BLOG ||
              lessonType === LessonType.MIXED) && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-900">
                  Nội dung bài học
                </Label>
                <div className="border rounded-lg border-slate-200 overflow-hidden">
                  <BlockNoteView
                    editor={editor}
                    theme="light"
                    className="min-h-[500px]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="isFreePreview"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Cho phép xem thử
                  </Label>
                  <p className="text-sm text-slate-500">
                    Học viên có thể xem bài học này mà không cần mua khóa học
                  </p>
                </div>
                <Switch
                  id="isFreePreview"
                  checked={isFreePreview}
                  onCheckedChange={setIsFreePreview}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="isPublished"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Xuất bản ngay
                  </Label>
                  <p className="text-sm text-slate-500">
                    Bài học sẽ được hiển thị ngay sau khi tạo
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

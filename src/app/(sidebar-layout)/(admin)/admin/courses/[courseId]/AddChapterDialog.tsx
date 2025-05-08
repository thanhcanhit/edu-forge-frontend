import { useState } from "react";

import { toast } from "@/hooks/use-toast";

import { createChapter } from "@/actions/courseAction";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddChapterDialogProps {
  courseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Callback to refresh data after successful creation
}

export function AddChapterDialog({
  courseId,
  open,
  onOpenChange,
  onSuccess,
}: AddChapterDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chapterData, setChapterData] = useState({
    title: "",
    description: "",
    isPublished: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createChapter(courseId, chapterData);
      setChapterData({ title: "", description: "", isPublished: false });
      toast({
        title: "Thành công",
        description: "Đã tạo chương mới",
      });

      // Call the onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm chương mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên chương</Label>
            <Input
              id="title"
              value={chapterData.title || ""}
              onChange={(e) =>
                setChapterData({ ...chapterData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={chapterData.description}
              onChange={(e) =>
                setChapterData({ ...chapterData, description: e.target.value })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              checked={chapterData.isPublished}
              onCheckedChange={(checked) =>
                setChapterData({
                  ...chapterData,
                  isPublished: checked as boolean,
                })
              }
            />
            <Label htmlFor="isPublished">Xuất bản ngay</Label>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo chương"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

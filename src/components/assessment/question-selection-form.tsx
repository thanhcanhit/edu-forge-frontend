"use client";

import { useEffect, useState } from "react";

import { Question } from "@/types/assessment/types";
import { toast } from "sonner";

import { getQuestions } from "@/actions/assessmentAction";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuestionSelectionFormProps {
  courseId: string;
  chapterId?: string;
  lessonId?: string;
  defaultQuestions?: Array<{
    questionId: string;
    maxScore: number;
  }>;
  defaultOrder?: string[];
  onQuestionsSelected?: (data: {
    testQuestions: Array<{ questionId: string; maxScore: number }>;
    questionOrder: string[];
    maxScore: number;
  }) => void;
  onSubmit?: (data: {
    testQuestions: Array<{ questionId: string; maxScore: number }>;
    questionOrder: string[];
    maxScore: number;
  }) => void;
}

interface QuestionWithScore extends Question {
  selected: boolean;
  maxScore: number;
}

export function QuestionSelectionForm({
  courseId,
  chapterId,
  lessonId,
  defaultQuestions,
  defaultOrder,
  onQuestionsSelected,
  onSubmit,
}: QuestionSelectionFormProps) {
  const [questions, setQuestions] = useState<QuestionWithScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        let params: any = {};

        if (courseId) {
          params = { courseId };
        }
        if (chapterId) {
          params = { ...params, chapterId };
        }
        if (lessonId) {
          params = { ...params, lessonId };
        }

        const result = await getQuestions(params);

        if (!result.success) {
          throw new Error(result.message || "Không thể lấy danh sách câu hỏi");
        }

        // Map the questions and mark selected ones based on defaultQuestions
        const mappedQuestions = result.data.map((q: Question) => {
          const defaultQuestion = defaultQuestions?.find(
            (dq) => dq.questionId === q.id,
          );
          return {
            ...q,
            selected: !!defaultQuestion,
            maxScore: defaultQuestion?.maxScore || 25,
          };
        });

        setQuestions(mappedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Có lỗi xảy ra khi tải danh sách câu hỏi");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId, chapterId, lessonId, defaultQuestions]);

  useEffect(() => {
    // When questions change, notify parent component
    const selectedQuestions = questions.filter((q) => q.selected);
    if (selectedQuestions.length > 0) {
      const testQuestions = selectedQuestions.map((q) => ({
        questionId: q.id!,
        maxScore: q.maxScore,
      }));

      const questionOrder = selectedQuestions.map((q) => q.id!);
      const maxScore = selectedQuestions.reduce(
        (sum, q) => sum + q.maxScore,
        0,
      );

      const data = {
        testQuestions,
        questionOrder,
        maxScore,
      };

      // Support both callback names
      if (onQuestionsSelected) {
        onQuestionsSelected(data);
      }
    }
  }, [questions, onQuestionsSelected]);

  const handleScoreChange = (questionId: string, value: string) => {
    const score = parseInt(value, 10);
    if (isNaN(score) || score < 0) return;

    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, maxScore: score } : q)),
    );
  };

  const handleToggleSelect = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, selected: !q.selected } : q,
      ),
    );
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const selectedQuestions = questions.filter((q) => q.selected);
      if (selectedQuestions.length === 0) {
        toast.error("Vui lòng chọn ít nhất một câu hỏi");
        return;
      }

      const testQuestions = selectedQuestions.map((q) => ({
        questionId: q.id!,
        maxScore: q.maxScore,
      }));

      const questionOrder = selectedQuestions.map((q) => q.id!);
      const maxScore = selectedQuestions.reduce(
        (sum, q) => sum + q.maxScore,
        0,
      );

      onSubmit({
        testQuestions,
        questionOrder,
        maxScore,
      });
    }
  };

  const selectedCount = questions.filter((q) => q.selected).length;
  const totalScore = questions
    .filter((q) => q.selected)
    .reduce((sum, q) => sum + q.maxScore, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Chọn câu hỏi</h3>
          <p className="text-sm text-muted-foreground">
            Đã chọn {selectedCount} câu hỏi - Tổng điểm: {totalScore}
          </p>
        </div>
        {onSubmit && (
          <Button onClick={handleSubmit} disabled={selectedCount === 0}>
            Tiếp tục
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Không có câu hỏi nào
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Câu hỏi</TableHead>
                <TableHead className="w-32">Loại</TableHead>
                <TableHead className="w-32">Độ khó</TableHead>
                <TableHead className="w-32 text-right">Điểm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <Checkbox
                      checked={question.selected}
                      onCheckedChange={() => handleToggleSelect(question.id!)}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: question.content.text,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {question.type === "SINGLE_CHOICE" &&
                      "Trắc nghiệm một đáp án"}
                    {question.type === "MULTIPLE_CHOICE" &&
                      "Trắc nghiệm nhiều đáp án"}
                    {question.type === "TRUE_FALSE" && "Đúng/Sai"}
                    {question.type === "ESSAY" && "Tự luận"}
                  </TableCell>
                  <TableCell>
                    {question.difficulty === "REMEMBERING" && "Ghi nhớ"}
                    {question.difficulty === "UNDERSTANDING" && "Thông hiểu"}
                    {question.difficulty === "APPLYING" && "Vận dụng"}
                    {question.difficulty === "ANALYZING" && "Phân tích"}
                    {question.difficulty === "EVALUATING" && "Đánh giá"}
                    {question.difficulty === "CREATING" && "Sáng tạo"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={question.maxScore}
                      onChange={(e) =>
                        handleScoreChange(question.id!, e.target.value)
                      }
                      className="w-20 ml-auto"
                      disabled={!question.selected}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

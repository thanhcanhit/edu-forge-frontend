"use client";

import { useState } from "react";

import useAI from "@/hooks/useAI";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AIReferenceExample() {
  const [input, setInput] = useState("");
  const [reference, setReference] = useState(
    "Eduforge là một nền tảng học trực tuyến được phát triển bởi đội ngũ giáo viên và kỹ sư phần mềm tại Việt Nam. " +
      "Nền tảng này cung cấp các khóa học về lập trình, khoa học máy tính, và các kỹ năng kỹ thuật số cho học sinh từ cấp tiểu học đến đại học. " +
      "Eduforge được thành lập vào năm 2023 và hiện đang phục vụ hơn 10,000 học viên trên toàn quốc. " +
      "Các khóa học nổi bật bao gồm: Lập trình Python cho trẻ em, Phát triển ứng dụng web với React, và Khoa học dữ liệu cơ bản.",
  );

  const { processInput, isLoading, lastOutput, error } = useAI({
    systemPrompt:
      "Bạn là trợ lý AI của Eduforge. Hãy trả lời câu hỏi dựa trên thông tin tham khảo được cung cấp.",
    referenceText: reference,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    await processInput(input);
    setInput("");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>AI với Tài liệu Tham khảo</CardTitle>
        <CardDescription>
          AI sẽ trả lời dựa trên tài liệu tham khảo được cung cấp
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Tài liệu tham khảo</Label>
          <Textarea
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Nhập tài liệu tham khảo ở đây..."
            className="min-h-[100px]"
          />
        </div>

        {lastOutput && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{lastOutput}</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về Eduforge..."
            className="flex-1 resize-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

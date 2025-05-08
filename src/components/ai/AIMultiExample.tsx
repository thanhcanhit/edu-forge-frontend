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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function AIMultiExample() {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
        <TabsTrigger value="general">Trợ lý chung</TabsTrigger>
        <TabsTrigger value="teacher">Giáo viên</TabsTrigger>
        <TabsTrigger value="coder">Lập trình viên</TabsTrigger>
        <TabsTrigger value="yesno">Yes/No</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <AIAssistant
          title="Trợ lý AI"
          description="Trợ lý AI thông thường"
          systemPrompt="Bạn là trợ lý AI hữu ích. Hãy trả lời câu hỏi một cách ngắn gọn và chính xác."
        />
      </TabsContent>

      <TabsContent value="teacher">
        <AIAssistant
          title="Giáo viên AI"
          description="Trợ lý AI đóng vai trò giáo viên"
          systemPrompt="Bạn là một giáo viên kinh nghiệm. Hãy giải thích các khái niệm một cách rõ ràng, dễ hiểu và đưa ra ví dụ minh họa khi cần thiết."
        />
      </TabsContent>

      <TabsContent value="coder">
        <AIAssistant
          title="Lập trình viên AI"
          description="Trợ lý AI đóng vai trò lập trình viên"
          systemPrompt="Bạn là một lập trình viên giỏi. Hãy giúp người dùng giải quyết các vấn đề về code, đưa ra giải pháp tốt nhất và giải thích code một cách chi tiết."
        />
      </TabsContent>

      <TabsContent value="yesno">
        <AIAssistant
          title="AI Yes/No"
          description="AI chỉ trả lời YES hoặc NO"
          systemPrompt="Bạn là AI chỉ trả lời câu hỏi với YES hoặc NO. Không cung cấp bất kỳ lời giải thích nào. Không sử dụng từ nào khác ngoài YES hoặc NO. Nếu câu hỏi không thể trả lời bằng YES hoặc NO, hãy đáp là NO."
          placeholder="Hỏi câu hỏi có/không..."
        />
      </TabsContent>
    </Tabs>
  );
}

interface AIAssistantProps {
  title: string;
  description: string;
  systemPrompt: string;
  placeholder?: string;
}

function AIAssistant({
  title,
  description,
  systemPrompt,
  placeholder,
}: AIAssistantProps) {
  const [input, setInput] = useState("");
  const { processInput, isLoading, lastOutput, error } = useAI({
    systemPrompt,
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {lastOutput && (
          <div className="bg-muted p-4 rounded-lg mb-4">
            <p className="whitespace-pre-wrap">{lastOutput}</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || "Type your question..."}
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

"use client";

import { AIExample } from "@/components/ai/AIExample";
import { AIMultiExample } from "@/components/ai/AIMultiExample";
import { AIReferenceExample } from "@/components/ai/AIReferenceExample";

export default function AIExamplesPage() {
  // System prompt cho mỗi vai trò
  const systemPrompts = {
    general:
      "Bạn là trợ lý AI hữu ích. Hãy trả lời câu hỏi một cách ngắn gọn và chính xác.",
    teacher:
      "Bạn là một giáo viên kinh nghiệm. Hãy giải thích các khái niệm một cách rõ ràng, dễ hiểu và đưa ra ví dụ minh họa khi cần thiết.",
    coder:
      "Bạn là một lập trình viên giỏi. Hãy giúp người dùng giải quyết các vấn đề về code, đưa ra giải pháp tốt nhất và giải thích code một cách chi tiết.",
    yesno:
      "Bạn là AI chỉ trả lời câu hỏi với YES hoặc NO. Không cung cấp bất kỳ lời giải thích nào. Không sử dụng từ nào khác ngoài YES hoặc NO. Nếu câu hỏi không thể trả lời bằng YES hoặc NO, hãy đáp là NO.",
  };

  return (
    <div className="container py-8 space-y-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Ví dụ tích hợp AI</h1>
        <p className="text-muted-foreground">
          Các ví dụ về cách tích hợp AI trong ứng dụng sử dụng các hooks useAI
          và usePopupChatbot
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">1. AI Cơ bản</h2>
        <p className="text-muted-foreground">
          Ví dụ đơn giản nhất về cách sử dụng hook useAI để tạo một trợ lý AI
        </p>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="text-sm font-semibold mb-2">System Prompt:</h3>
          <p className="text-sm font-mono bg-background p-3 rounded border">
            {systemPrompts.general}
          </p>
        </div>

        <AIExample />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">2. AI Đa vai trò</h2>
        <p className="text-muted-foreground">
          Ví dụ về cách sử dụng hook useAI với các system prompt khác nhau để
          tạo nhiều vai trò AI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Trợ lý AI:</h3>
            <p className="text-sm font-mono bg-background p-3 rounded border">
              {systemPrompts.general}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Giáo viên AI:</h3>
            <p className="text-sm font-mono bg-background p-3 rounded border">
              {systemPrompts.teacher}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">Lập trình viên AI:</h3>
            <p className="text-sm font-mono bg-background p-3 rounded border">
              {systemPrompts.coder}
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2">AI Yes/No:</h3>
            <p className="text-sm font-mono bg-background p-3 rounded border">
              {systemPrompts.yesno}
            </p>
          </div>
        </div>

        <AIMultiExample />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">3. AI với Tài liệu Tham khảo</h2>
        <p className="text-muted-foreground">
          Ví dụ về cách sử dụng hook useAI với referenceText để AI trả lời dựa
          trên tài liệu cụ thể
        </p>

        <div className="bg-muted p-4 rounded-lg mb-4">
          <h3 className="text-sm font-semibold mb-2">System Prompt:</h3>
          <p className="text-sm font-mono bg-background p-3 rounded border">
            Bạn là trợ lý AI của Eduforge. Hãy trả lời câu hỏi dựa trên thông
            tin tham khảo được cung cấp.
          </p>
        </div>

        <AIReferenceExample />
      </section>

      <section className="p-4 bg-primary/5 rounded-lg border">
        <h2 className="text-xl font-semibold mb-2">Tìm hiểu thêm</h2>
        <p className="mb-2">
          Xem tài liệu hướng dẫn đầy đủ về cách tích hợp AI vào ứng dụng của bạn
          tại:
        </p>
        <a
          href="/docs/ai-integration-guide"
          className="text-primary hover:underline font-medium"
        >
          Hướng dẫn tích hợp AI →
        </a>
      </section>
    </div>
  );
}

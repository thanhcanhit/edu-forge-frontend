import { useCallback, useState } from "react";

import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

// Sử dụng API key cố định từ biến môi trường
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Interface cho options của hook
interface UseAIOptions {
  systemPrompt?: string;
  modelName?: string;
  referenceText?: string;
}

// Interface cho kết quả trả về của hook
interface UseAIResult {
  isLoading: boolean;
  error: string | null;
  lastInput: string;
  lastOutput: string;
  clearOutput: () => void;
  processInput: (input: string) => Promise<string>;
}

/**
 * Custom hook để tương tác với Google Gemini AI
 * @param options - Các tùy chọn cho AI
 * @param options.systemPrompt - Prompt hệ thống để định hướng AI
 * @param options.modelName - Tên model Gemini sử dụng
 * @param options.referenceText - Văn bản tham khảo để AI dựa vào khi trả lời
 * @returns Các state và methods để tương tác với AI
 */
const useAI = (options: UseAIOptions = {}): UseAIResult => {
  const {
    systemPrompt = "",
    modelName = "gemini-2.0-flash",
    referenceText = "",
  } = options;

  // Local states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState("");
  const [lastOutput, setLastOutput] = useState("");

  // Tạo model instance với lazy initialization
  const getModel = useCallback((): GenerativeModel | null => {
    if (!API_KEY) return null;

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      return genAI.getGenerativeModel({ model: modelName });
    } catch (error) {
      console.error("Error creating Gemini model instance:", error);
      return null;
    }
  }, [modelName]);

  // Clear output
  const clearOutput = useCallback(() => {
    setLastOutput("");
    setLastInput("");
  }, []);

  // Process input
  const processInput = useCallback(
    async (input: string): Promise<string> => {
      if (!API_KEY) {
        const errorMessage = "API key is not set in environment variables";
        setError(errorMessage);
        return errorMessage;
      }

      setIsLoading(true);
      setError(null);
      setLastInput(input);

      try {
        const model = getModel();

        if (!model) {
          throw new Error("Failed to create model instance");
        }

        // Chuẩn bị prompt với system prompt và reference text nếu có
        let finalPrompt = input;

        // Thêm system prompt nếu có
        if (systemPrompt) {
          finalPrompt = `${systemPrompt}\n\n${finalPrompt}`;
        }

        // Thêm reference text nếu có
        if (referenceText) {
          finalPrompt = `${finalPrompt}\n\nTham khảo thông tin sau để trả lời:\n${referenceText}`;
        }

        // Gửi prompt và nhận response
        const result = await model.generateContent(finalPrompt);
        const response = result.response;
        const text = response.text();

        setIsLoading(false);
        setLastOutput(text);
        return text;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setIsLoading(false);
        setError(errorMessage);
        return `Error: ${errorMessage}`;
      }
    },
    [getModel, systemPrompt, referenceText],
  );

  return {
    isLoading,
    error,
    lastInput,
    lastOutput,
    clearOutput,
    processInput,
  };
};

export default useAI;

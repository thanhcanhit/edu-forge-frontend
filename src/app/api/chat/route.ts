import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variable
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    // Extract the messages and other parameters from the request
    const { messages, temperature = 0.7, max_tokens = 1000 } = await req.json();

    // Check if API key is available
    if (!apiKey) {
      return new Response("API key is not configured", { status: 500 });
    }

    // Initialize the model with configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: max_tokens,
      },
    });

    // Convert messages to the format expected by Gemini
    const systemMessages = messages.filter((m: any) => m.role === "system");
    const conversationMessages = messages.filter(
      (m: any) => m.role !== "system",
    );

    try {
      // Prepare system prompt if any
      let systemPrompt = "";
      if (systemMessages.length > 0) {
        systemPrompt = systemMessages.map((m: any) => m.content).join("\n\n");
      }

      // Create chat history for Gemini
      const history = conversationMessages
        .slice(0, -1) // Exclude the last message which is the current query
        .map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

      // Get the last user message if there are any conversation messages
      if (conversationMessages.length === 0) {
        // If there are no conversation messages, return a greeting
        return new Response(
          JSON.stringify({
            role: "assistant",
            content:
              "Xin chào! Tôi là trợ lý AI của Eduforge. Bạn có thể hỏi tôi bất cứ điều gì.",
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      const lastMessage = conversationMessages[conversationMessages.length - 1];

      // Create chat session
      const chat = model.startChat({ history });

      // Prepare the final prompt with system instructions if any
      let finalPrompt = lastMessage.content;
      if (systemPrompt) {
        finalPrompt = `${systemPrompt}\n\n${finalPrompt}`;
      }

      // Generate content
      const result = await chat.sendMessage(finalPrompt);
      const responseText = result.response.text();

      // Return a simple JSON response
      return new Response(
        JSON.stringify({
          role: "assistant",
          content: responseText,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.error("Error generating response:", error);

      // Return a simple JSON error response
      return new Response(
        JSON.stringify({
          role: "assistant",
          content:
            "Xin lỗi, tôi đang gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    console.error("Error in chat API:", error);

    // Return a simple JSON error response
    return new Response(
      JSON.stringify({
        role: "assistant",
        content:
          "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

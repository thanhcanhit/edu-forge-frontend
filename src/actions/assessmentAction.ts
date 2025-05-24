"use server";

import { AxiosFactory } from "@/lib/axios";
import {
  CreateTestDto,
  CreateTestQuestionDto,
  Question,
  ScoringPolicy,
  TestType,
} from "@/types/assessment/types";
import axios from "axios";

// const assessmentApi = await AxiosFactory.getApiInstance("assessment");
let assessmentApi = axios.create({
  baseURL: "http://eduforge.io.vn:3005/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getQuestions(params: {
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
}) {
  try {
    const { data } = await assessmentApi.get("/questions", { params });
    return {
      success: true,
      data,
      message: "Lấy danh sách câu hỏi thành công",
    };
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi lấy danh sách câu hỏi",
      error,
    };
  }
}

export async function getQuestionById(questionId: string) {
  try {
    const { data } = await assessmentApi.get(`/questions/${questionId}`);
    return {
      success: true,
      data,
      message: "Lấy thông tin câu hỏi thành công",
    };
  } catch (error: any) {
    console.error("Error fetching question:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Đã xảy ra lỗi khi lấy thông tin câu hỏi",
      error,
    };
  }
}

export async function updateQuestion(
  questionId: string,
  questionData: Question,
) {
  try {
    const { data } = await assessmentApi.patch(
      `/questions/${questionId}`,
      questionData,
    );

    return {
      success: true,
      data,
      message: "Cập nhật câu hỏi thành công",
    };
  } catch (error: any) {
    console.error("Error updating question:", error);

    let errorMessage = "Đã xảy ra lỗi khi cập nhật câu hỏi";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (!error.response) {
      errorMessage = "Không nhận được phản hồi từ máy chủ";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.response?.data || error,
    };
  }
}

export async function createQuestion(questionData: Question) {
  try {
    const { data } = await assessmentApi.post("/questions", questionData);

    return {
      success: true,
      data,
      message: "Tạo câu hỏi thành công",
    };
  } catch (error: any) {
    console.error("Error creating question:", error);

    let errorMessage = "Đã xảy ra lỗi khi tạo câu hỏi";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (!error.response) {
      errorMessage = "Không nhận được phản hồi từ máy chủ";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.response?.data || error,
    };
  }
}

export async function getQuestionsById(questionIds: string[]) {
  try {
    const questions = await Promise.all(
      questionIds.map(async (id) => {
        const result = await getQuestionById(id);
        if (result.success) {
          return result.data;
        }
        throw new Error(`Failed to fetch question with ID ${id}`);
      }),
    );
    return {
      success: true,
      data: questions,
      message: "Lấy danh sách câu hỏi thành công",
    };
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách câu hỏi",
      error,
    };
  }
}

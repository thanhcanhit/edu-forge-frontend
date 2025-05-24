"use server";

import { AxiosFactory } from "@/lib/axios";
import axios from "axios";

// const assessmentApi = await AxiosFactory.getApiInstance("assessment");
let assessmentApi = axios.create({
  baseURL: "http://eduforge.io.vn:3005/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function getTests(params: {
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
}) {
  try {
    const { data } = await assessmentApi.get("/tests", { params });
    return {
      success: true,
      data,
      message: "Lấy danh sách bài kiểm tra thành công",
    };
  } catch (error) {
    console.error("Error fetching tests:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách bài kiểm tra",
      error,
    };
  }
}

export async function getTestAttempts(params: {
  testTakerId: string;
  isSubmitted?: boolean;
}) {
  try {
    const { data } = await assessmentApi.get("/test-attempts", { params });
    return {
      success: true,
      data,
      message: "Lấy danh sách lần làm bài thành công",
    };
  } catch (error) {
    console.error("Error fetching test attempts:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy danh sách lần làm bài",
      error,
    };
  }
}

export async function getHighestScoreAttempt(params: {
  testId: string;
  testTakerId: string;
}) {
  console.log("params", params);
  try {
    const { data } = await assessmentApi.get("/test-attempts/highest-score", {
      params,
    });
    return {
      success: true,
      data,
      message: "Lấy lần làm bài điểm cao nhất thành công",
    };
  } catch (error) {
    console.error("Error fetching highest score attempt:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy lần làm bài điểm cao nhất",
      error,
    };
  }
}

export async function createTestAttempt(data: {
  testId: string;
  testTakerId: string;
}) {
  try {
    const response = await assessmentApi.post("/test-attempts", data);
    return {
      success: true,
      data: response.data,
      message: "Tạo lần làm bài thành công",
    };
  } catch (error) {
    console.error("Error creating test attempt:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi tạo lần làm bài",
      error,
    };
  }
}

export async function getTestAttemptById(attemptId: string) {
  try {
    const { data } = await assessmentApi.get(`/test-attempts/${attemptId}`);
    return {
      success: true,
      data,
      message: "Lấy thông tin lần làm bài thành công",
    };
  } catch (error) {
    console.error("Error fetching test attempt:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin lần làm bài",
      error,
    };
  }
}

export async function submitTestAttempt(attemptId: string) {
  try {
    const { data } = await assessmentApi.post(
      `/test-attempts/${attemptId}/submit`,
    );
    return {
      success: true,
      data,
      message: "Nộp bài thành công",
    };
  } catch (error) {
    console.error("Error submitting test attempt:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi nộp bài",
      error,
    };
  }
}

export async function saveTestAnswer(
  attemptId: string,
  data: {
    questionId: string;
    answerData: string;
  },
) {
  try {
    console.log("Saving answer:", { attemptId, data });
    const response = await assessmentApi.post(
      `/test-attempts/${attemptId}/answers`,
      {
        questionId: data.questionId,
        answerData: data.answerData,
        submittedAt: new Date().toISOString(),
      },
    );
    return {
      success: true,
      data: response.data,
      message: "Lưu câu trả lời thành công",
    };
  } catch (error) {
    console.error("Error saving answer:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lưu câu trả lời",
      error,
    };
  }
}

export async function getTestResult(attemptId: string) {
  try {
    const { data } = await assessmentApi.get(
      `/test-attempts/${attemptId}/result`,
    );
    return {
      success: true,
      data,
      message: "Lấy kết quả bài kiểm tra thành công",
    };
  } catch (error) {
    console.error("Error fetching test result:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy kết quả bài kiểm tra",
      error,
    };
  }
}

export async function createTest(testData: any) {
  try {
    const response = await assessmentApi.post("/tests", testData);
    return {
      success: true,
      data: response.data,
      message: "Tạo bài kiểm tra thành công",
    };
  } catch (error) {
    console.error("Error creating test:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi tạo bài kiểm tra",
      error,
    };
  }
}

export async function updateTest(id: string, updateData: any) {
  try {
    const response = await assessmentApi.patch(`/tests/${id}`, updateData);
    return {
      success: true,
      data: response.data,
      message: "Cập nhật bài kiểm tra thành công",
    };
  } catch (error) {
    console.error("Error updating test:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật bài kiểm tra",
      error,
    };
  }
}

export async function deleteTest(id: string) {
  try {
    const response = await assessmentApi.delete(`/tests/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Xóa bài kiểm tra thành công",
    };
  } catch (error) {
    console.error("Error deleting test:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi xóa bài kiểm tra",
      error,
    };
  }
}

export async function getTestById(id: string) {
  try {
    const { data } = await assessmentApi.get(`/tests/${id}`);
    return {
      success: true,
      data,
      message: "Lấy thông tin bài kiểm tra thành công",
    };
  } catch (error) {
    console.error("Error fetching test:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi khi lấy thông tin bài kiểm tra",
      error,
    };
  }
}

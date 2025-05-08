import { AxiosFactory } from "@/lib/axios";

interface ProgressData {
  progress: number;
  currentLesson: string;
  lessonId: string;
  isLessonCompleted: boolean;
}

interface ProgressResponse {
  enrollmentId: string;
  progress: number;
  currentLesson: string;
  lessonId: string;
  isLessonCompleted: boolean;
  lastUpdated: string;
}

interface OverallProgressResponse {
  overallProgress: number;
  completed: boolean;
  status: string;
}

export const getInitialProgress = async (enrollmentId: string) => {
  try {
    const progressApi = await AxiosFactory.getApiInstance("courses");
    const response = await progressApi.get<ProgressResponse>(
      `/progress/${enrollmentId}`,
    );
    console.log("response", response);
    return {
      error: false,
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      error: true,
      success: false,
      message:
        error.response?.data?.message || "Không thể lấy tiến trình học tập.",
      data: null,
    };
  }
};

export const updateProgress = async (
  enrollmentId: string,
  progressData: ProgressData,
) => {
  try {
    const progressApi = await AxiosFactory.getApiInstance("courses");
    const response = await progressApi.put<ProgressResponse>(
      `/progress/${enrollmentId}`,
      progressData,
    );

    return {
      error: false,
      success: true,
      message: "Cập nhật tiến trình thành công!",
      data: response.data,
    };
  } catch (error: any) {
    return {
      error: true,
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể cập nhật tiến trình học tập.",
      data: null,
    };
  }
};

export const getOverallProgress = async (enrollmentId: string) => {
  try {
    const progressApi = await AxiosFactory.getApiInstance("courses");
    const response = await progressApi.get<OverallProgressResponse>(
      `/progress/overall/${enrollmentId}`,
    );

    return {
      error: false,
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      error: true,
      success: false,
      message:
        error.response?.data?.message || "Không thể lấy tổng quan tiến trình.",
      data: null,
    };
  }
};

export const verifyCourseCompletion = async (enrollmentId: string) => {
  try {
    const progressApi = await AxiosFactory.getApiInstance("enrollment");
    const response = await progressApi.get<{ completed: boolean }>(
      `/progress/completion/${enrollmentId}`,
    );

    return {
      error: false,
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      error: true,
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể kiểm tra trạng thái hoàn thành khóa học.",
      data: null,
    };
  }
};

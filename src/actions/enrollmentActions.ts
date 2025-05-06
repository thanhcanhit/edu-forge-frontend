import { AxiosFactory } from "@/lib/axios";

export interface EnrollmentData {
  courseId: string;
  userId: string;
  userName?: string;
  courseName?: string;
  isFree?: boolean;
  paymentId?: string;
}

export const enrollCourse = async (enrollmentData: EnrollmentData) => {
  try {
    const enrollmentApi = await AxiosFactory.getApiInstance("enrollment");
    // Đảm bảo path khớp với backend API: /api/v1/enrollment
    const response = await enrollmentApi.post("", enrollmentData);
    return {
      error: false,
      success: true,
      message: "Đăng ký khóa học thành công!",
      data: response.data,
    };
  } catch (error) {
    return {
      error: true,
      success: false,
      message:
        error.response?.data?.message || "Có lỗi xảy ra khi đăng ký khóa học.",
      data: null,
    };
  }
};

export const checkEnrollmentStatus = async (
  courseId: string,
  userId: string,
) => {
  try {
    const enrollmentApi = await AxiosFactory.getApiInstance("enrollment");
    // Đảm bảo path khớp với backend API: /api/v1/enrollment/check/:userId/:courseId
    const response = await enrollmentApi.get(`check/${userId}/${courseId}`);
    return {
      error: false,
      success: true,
      data: response.data.enrolled,
    };
  } catch (error) {
    return {
      error: true,
      success: false,
      data: false,
    };
  }
};

export const getUserEnrollments = async (userId: string) => {
  try {
    const enrollmentApi = await AxiosFactory.getApiInstance("enrollment");
    // Đảm bảo path khớp với backend API: /api/v1/enrollment/user/:userId/courses
    const response = await enrollmentApi.get(`user/${userId}/courses`);
    return {
      error: false,
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      error: true,
      success: false,
      data: [],
    };
  }
};

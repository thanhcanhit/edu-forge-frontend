import { AxiosFactory } from "@/lib/axios";

interface EnrollmentData {
  courseId: string;
  userId: string;
  userName: string;
  courseName: string;
  isFree: boolean;
}

export const enrollCourse = async (enrollmentData: EnrollmentData) => {
  try {
    const enrollmentApi = await AxiosFactory.getApiInstance("enrollment");
    const response = await enrollmentApi.post("/", enrollmentData);
    console.log("response", response);
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
    const response = await enrollmentApi.get(`/check/${userId}/${courseId}`);
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

// "use server";
import { AxiosFactory } from "@/lib/axios";
import { Category, Course, Lesson } from "@/types/course/types";

const courseApi = await AxiosFactory.getApiInstance("courses");

export interface CourseFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  level?: string;
  createdAt?: Date;
  isPublished?: boolean;
  skipPagination?: boolean; // Option to skip pagination and return all courses
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAllCourses = async (
  filters: CourseFilters = {},
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Course>> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    // Add pagination parameters if not skipping pagination
    if (!filters.skipPagination) {
      params.append("page", page.toString());
      params.append("limit", limit.toString());
    } else {
      // If skipping pagination, request a large limit to get all courses
      params.append("limit", "1000"); // Use a large number to get all courses
    }

    // Add filter parameters if they exist
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.minPrice !== undefined)
      params.append("minPrice", filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters.level) params.append("level", filters.level);
    if (filters.createdAt)
      params.append("createdAt", filters.createdAt.toISOString());

    // Always include isPublished parameter if specified
    if (filters.isPublished !== undefined) {
      params.append("isPublished", filters.isPublished.toString());
    }

    console.log("API Request URL:", `/courses?${params.toString()}`);
    const { data } = await courseApi.get(`/courses?${params.toString()}`);
    console.log("API Response:", data);

    // If the backend doesn't return a paginated response format yet, transform it
    if (Array.isArray(data)) {
      // Filter out unpublished courses if isPublished=true is specified
      let filteredData = data;
      if (filters.isPublished === true) {
        console.log("Filtering for published courses only");
        filteredData = data.filter(
          (course: Course) => course.isPublished === true,
        );
        console.log("Filtered data length:", filteredData.length);
      }

      // If skipPagination is true, return all courses
      if (filters.skipPagination) {
        console.log("Skipping pagination, returning all filtered courses");
        return {
          data: filteredData,
          meta: {
            total: filteredData.length,
            page: 1,
            limit: filteredData.length,
            totalPages: 1,
          },
        };
      }

      // Apply manual pagination if needed
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      console.log(
        `Paginating data: page ${page}, limit ${limit}, showing ${paginatedData.length} of ${filteredData.length} courses`,
      );

      return {
        data: paginatedData,
        meta: {
          total: filteredData.length,
          page,
          limit,
          totalPages: Math.ceil(filteredData.length / limit),
        },
      };
    }

    // If the backend returns a paginated response, use it directly
    // But ensure we filter by isPublished if needed
    if (
      data &&
      data.data &&
      Array.isArray(data.data) &&
      filters.isPublished === true
    ) {
      const filteredData = data.data.filter(
        (course: Course) => course.isPublished === true,
      );
      return {
        data: filteredData,
        meta: {
          ...data.meta,
          total: filteredData.length,
          totalPages: Math.ceil(
            filteredData.length / (data.meta.limit || limit),
          ),
        },
      };
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  try {
    const { data } = await courseApi.get(`/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCoursesByCategory = async (
  categoryId: string,
): Promise<Course[]> => {
  try {
    const { data } = await courseApi.get(`/courses/category/${categoryId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCourseStructure = async (courseId: string) => {
  try {
    const { data } = await courseApi.get(`/courses/${courseId}/structure`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getUserCourseStructure = async (userId: string) => {
  try {
    const { data } = await courseApi.get(`/courses/user/${userId}/structure`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const publishCourse = async (courseId: string) => {
  try {
    const { data } = await courseApi.patch(`/courses/${courseId}/publish`);
    return data;
  } catch (error) {
    throw error;
  }
};
export const createCourse = async (courseData: {
  title: string;
  description: string;
  categoryId: string;
  level: string;
  price: number;
  currency: string;
  isPublished: boolean;
  isHasCertificate: boolean;
  tags?: string[];
  learningOutcomes?: string[];
  requirements?: string[];
  targetAudience?: string;
  thumbnailUrl?: string;
}) => {
  try {
    const { data } = await courseApi.post("/courses", courseData);
    console.log("+ data >>>", data.id);
    return {
      error: false,
      success: true,
      data,
      message: "Tạo khóa học thành công",
    };
  } catch (error) {
    return {
      error: true,
      success: false,
      message: "Đã xảy ra lỗi khi tạo khóa học",
      data: null,
    };
  }
};

export const unpublishCourse = async (courseId: string) => {
  try {
    const { data } = await courseApi.patch(`/courses/${courseId}/unpublish`);
    return data;
  } catch (error) {
    throw error;
  }
};
export const updateCourse = async (
  courseId: string,
  courseData: {
    title: string;
    description: string;
    categoryId: string;
    level: string;
    price: number;
    promotionPrice?: number;
    currency: string;
    isPublished: boolean;
    isHasCertificate: boolean;
    tags?: string[];
    learningOutcomes: string[];
    requirements: string[];
    targetAudience: string;
    thumbnailUrl?: string;
  },
) => {
  try {
    const { data } = await courseApi.patch(`/courses/${courseId}`, courseData);
    return {
      error: false,
      success: true,
      data,
      message: "Cập nhật khóa học thành công",
    };
  } catch (error) {
    return {
      error: true,
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật khóa học",
      data: null,
    };
  }
};
export const createChapter = async (courseId: string, chapterData: any) => {
  try {
    const { data } = await courseApi.post(
      `/courses/${courseId}/chapters`,
      chapterData,
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const getChapters = async (courseId: string) => {
  try {
    const { data } = await courseApi.get(`/courses/${courseId}/chapters`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getChapterById = async (chapterId: string) => {
  try {
    const { data } = await courseApi.get(`/chapters/${chapterId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateChapter = async (
  chapterId: string,
  chapterData: {
    title: string;
    description?: string;
    isPublished?: boolean;
  },
) => {
  try {
    const { data } = await courseApi.patch(
      `/chapters/${chapterId}`,
      chapterData,
    );
    return {
      success: true,
      data,
      message: "Cập nhật chương thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật chương",
      error,
    };
  }
};
export const deleteCourse = async (courseId: string) => {
  try {
    const { data } = await courseApi.delete(`/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error;
  }
};
export const deleteChapter = async (chapterId: string) => {
  try {
    console.log("++  chapterId", chapterId);
    const { data } = await courseApi.delete(`/chapters/${chapterId}`);
    console.log("++  data", data);
    return data;
  } catch (error) {
    throw error;
  }
};

export const createLesson = async (
  courseId: string,
  chapterId: string,
  lessonData: {
    title: string;
    content?: string;
    type: string;
    videoUrl?: string;
    isPublished?: boolean;
    isFreePreview?: boolean;
  },
) => {
  try {
    const { data } = await courseApi.post(
      `/lessons/courses/${courseId}/chapters/${chapterId}`,
      lessonData,
    );
    return {
      success: true,
      data,
      message: "Tạo bài học thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Đã xảy ra lỗi khi tạo bài học",
      error,
    };
  }
};

export const getLessonsByChapter = async (chapterId: string) => {
  try {
    const { data } = await courseApi.get(`/lessons/chapters/${chapterId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getLessonsByCourse = async (courseId: string) => {
  try {
    const { data } = await courseApi.get(`/lessons/courses/${courseId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const getLessonById = async (lessonId: string) => {
  try {
    const { data } = await courseApi.get(`/lessons/${lessonId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateLesson = async (
  lessonId: string,
  lessonData: {
    title?: string;
    content?: string;
    type?: string;
    videoUrl?: string;
    isPublished?: boolean;
    isFreePreview?: boolean;
  },
) => {
  try {
    const { data } = await courseApi.put(`/lessons/${lessonId}`, lessonData);
    return {
      success: true,
      data,
      message: "Cập nhật bài học thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật bài học",
      error,
    };
  }
};

export const deleteLesson = async (lessonId: string) => {
  try {
    const { data } = await courseApi.delete(`/lessons/${lessonId}`);
    return {
      success: true,
      data,
      message: "Xóa bài học thành công",
    };
  } catch (error) {
    return {
      success: false,
      message: "Đã xảy ra lỗi khi xóa bài học",
      error,
    };
  }
};
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await courseApi.get("/categories");
    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadImage = async (
  file: File,
  bucket: string = "courses",
  folder?: string,
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    if (folder) {
      formData.append("folder", folder);
    }

    const response = await fetch(
      "https://storage.eduforge.io.vn/api/v1/storage/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Lỗi khi tải lên hình ảnh");
    }

    const data = await response.json();
    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      message: "Không thể tải lên hình ảnh",
    };
  }
};

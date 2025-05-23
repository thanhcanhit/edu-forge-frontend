// "use server";
import { AxiosFactory } from "@/lib/axios";
import axios from "axios";

import useUserStore from "@/stores/useUserStore";

const USER_INFO_URL = "https://users.eduforge.io.vn/dashboard/internal/user";
const COURSE_SERVICE_API_KEY = "sk_course_service_12345";

// const postApi = await AxiosFactory.getApiInstance("post");
const API_URL = "http://eduforge.io.vn:8081/api/v1";

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  coverImage: string;
  tags: string[];
  totalLikes: number;
  totalViews: number;
  likedByCurrentUser: boolean;
  viewedByCurrentUser: boolean;
  isPublished: boolean;
  seriesId?: string;
  seriesTitle?: string;
  orderInSeries?: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    isFeatured?: boolean;
    isVerified?: boolean;
  };
}

export interface PostFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  currentUserId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
  timestamp: string;
}

export interface UserInfo {
  name: string;
  image: string;
}

export const getAllPosts = async (
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(`/posts?${params.toString()}`);
    const response = await axios.get(`${API_URL}/posts?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostById = async (
  postId: string,
  currentUserId?: string,
): Promise<ApiResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (currentUserId) params.append("currentUserId", currentUserId);

    // const { data } = await postApi.get(`/posts/${postId}?${params.toString()}`);
    const response = await axios.get(
      `${API_URL}/posts/${postId}?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostsByUserId = async (
  userId: string,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(
    //   `/posts/user/${userId}?${params.toString()}`,
    // );
    const response = await axios.get(
      `${API_URL}/posts/user/${userId}?${params.toString()}`,
    );
    console.log("User id: ", userId);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostsByTag = async (
  tag: string,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(
    //   `/posts/tag/${tag}?${params.toString()}`,
    // );
    const response = await axios.get(
      `${API_URL}/posts/tag/${tag}?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostsBySeriesId = async (
  seriesId: string,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(
    //   `/posts/series/${seriesId}?${params.toString()}`,
    // );
    const response = await axios.get(
      `${API_URL}/posts/series/${seriesId}?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostsWithoutSeries = async (
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(`/posts/no-series?${params.toString()}`);
    const response = await axios.get(
      `${API_URL}/posts/no-series?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserPostsWithoutSeries = async (
  userId: string,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortDir) params.append("sortDir", filters.sortDir);
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(
    //   `/posts/user/${userId}/no-series?${params.toString()}`,
    // );
    const response = await axios.get(
      `${API_URL}/posts/user/${userId}/no-series?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchPosts = async (
  keyword: string,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    params.append("keyword", keyword);
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(`/posts/search?${params.toString()}`);
    const response = await axios.get(
      `${API_URL}/posts/search?${params.toString()}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPost = async (
  post: Partial<Post>,
): Promise<ApiResponse<Post>> => {
  try {
    // const { data } = await postApi.post("/posts", post);
    const response = await axios.post(`${API_URL}/posts`, post);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePost = async (
  postId: string,
  post: Partial<Post>,
): Promise<ApiResponse<Post>> => {
  try {
    // const { data } = await postApi.put(`/posts/${postId}`, post);
    const response = await axios.put(`${API_URL}/posts/${postId}`, post);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (
  postId: string,
): Promise<ApiResponse<void>> => {
  try {
    // const { data } = await postApi.delete(`/posts/${postId}`);
    const response = await axios.delete(`${API_URL}/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const togglePostLike = async (
  postId: string,
  userId: string,
): Promise<ApiResponse<Post>> => {
  try {
    // const { data } = await postApi.post(
    //   `/posts/${postId}/like?userId=${userId}`,
    // );
    const response = await axios.post(
      `${API_URL}/posts/${postId}/like?userId=${userId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addPostView = async (
  postId: string,
  userId: string,
): Promise<ApiResponse<Post>> => {
  try {
    // const { data } = await postApi.post(
    //   `/posts/${postId}/view?userId=${userId}`,
    // );
    const response = await axios.post(
      `${API_URL}/posts/${postId}/view?userId=${userId}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserRecommendations = async (
  userId: string,
  filters: PostFilters = {},
): Promise<PaginatedResponse<Post>> => {
  try {
    const params = new URLSearchParams();
    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.currentUserId)
      params.append("currentUserId", filters.currentUserId);

    // const { data } = await postApi.get(
    //   `/v1/recommendations/users/${userId}?${params.toString()}`,
    // );
    const response = await axios.get(
      `${API_URL}/recommendations/users/${userId}?${params.toString()}`,
    );
    return {
      success: true,
      message: "Operation successful",
      data: response.data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
};

export const getUserInfo = async (userId: string): Promise<UserInfo> => {
  try {
    const response = await fetch(
      `http://eduforge.io.vn:8081/api/v1/posts/author/${userId}`,
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
};

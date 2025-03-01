import { message } from "antd";

// lib/api/authApi.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Lớp gọi API cho Auth
class AuthApi {
  // Helper để thêm header Authorization nếu có token
  private getHeaders(token?: string) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Đăng ký người dùng
  async register(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }
  // Hàm xử lý lỗi
  handleErrors = (response: Response, data: any) => {
    switch (response.status) {
      case 201:
        return data;
      case 400:
        return {
          statusCode: 400,
          error: true,
          message:
            data.message ||
            "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt.",
        };
      case 401:
        console.log("API error 401:", data);
        return {
          statusCode: 401,
          error: true,
          message: data.message || "Email hoặc mật khẩu không chính xác.",
        };
      case 500:
        return {
          statusCode: 500,
          error: true,
          message:
            data.message || "Đã xảy ra lỗi từ server. Vui lòng thử lại sau.",
        };
      default:
        return {
          statusCode: 500,
          error: true,
          message:
            data.message || "Đã xảy ra lỗi từ server. Vui lòng thử lại sau.",
        };
    }
  };

  // Đăng nhập
  async login(email: string, password: string) {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Sử dụng hàm handleErrors để kiểm tra lỗi
    if (!response.ok) {
      return this.handleErrors(response, data);
    }
    return data;
  }

  // Làm mới token
  async refresh(refreshToken: string) {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Refresh token failed");
    }

    return response.json(); // Trả về { accessToken, refreshToken }
  }

  // Lấy thông tin hồ sơ
  async getProfile(accessToken: string) {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "POST",
      headers: this.getHeaders(accessToken),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch profile");
    }

    return response.json();
  }
}

export const authApi = new AuthApi();

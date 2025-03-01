// actions/login.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// actions/login.ts

export async function loginUser(
  email: string,
  password: string,
  redirectTo?: string | undefined,
) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Không redirect tự động, xử lý bằng FE
      redirectTo: redirectTo,
    });

    // Nếu thành công, trả về thông tin để FE xử lý chuyển hướng
    return {
      error: false,
      success: true,
      message: "",
      redirectTo: redirectTo || "/dashboard",
      status: 200,
    };
  } catch (error) {
    if ((error as any).name === "AccountNotActivatedError") {
      return {
        error: true,
        success: true,
        message: "Tài khoản chưa được kích hoạt",
        status: 401,
      };
    } else if ((error as any).name === "InvalidEmailPasswordError") {
      console.error("Login error:", JSON.stringify(error));
      return {
        error: true,
        success: true,
        message: (error as any).type,
        status: 400,
      };
    }
    //hello
    return {
      error: true,
      success: true,
      message: "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
      status: 500,
    };
  }
}

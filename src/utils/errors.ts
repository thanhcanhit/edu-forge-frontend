/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthError } from "next-auth";

export class CustomAuthError extends AuthError {
  static type: string;

  constructor(message?: any) {
    super();

    this.type = message;
  }
}

export class InvalidEmailPasswordError extends AuthError {
  static type = "Email/Password không hợp lệ";
}
export class AccountNotActivatedError extends AuthError {
  static type = "Tài khoản chưa được kích hoạt";
}
export class ServerError extends AuthError {
  static type = "Đã xảy ra lỗi từ server";
}

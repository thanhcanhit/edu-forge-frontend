import { log } from "console";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authApi } from "./lib/api/authApi";
import {
  AccountNotActivatedError,
  InvalidEmailPasswordError,
  ServerError,
} from "./utils/errors";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          throw new Error("Invalid credentials.");
        }
        // try {
        const { email, password } = credentials;
        const response = await authApi.login(email, password);
        console.log("Authorize response:", response);

        if (response.error) {
          if (response.statusCode === 400) {
            // Tài khoản chưa kích hoạt
            throw new AccountNotActivatedError();
          } else if (response.statusCode === 401) {
            // Sai email hoặc mật khẩu
            throw new InvalidEmailPasswordError();
          } else {
            throw new ServerError();
          }
        }

        if (response.user && response.access_token) {
          const user = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            accessToken: response.access_token,
          };
          return user;
          // }

          return null; // Trả về null nếu không hợp lệ
          // } catch (error) {
          //   console.error("Authorize error:", error);
          //   if (error instanceof AccountNotActivatedError) {
          //     return { error: true, success: false, message: "Tài khoản chưa được kích hoạt", status: 400 };
          //   }
          //   throw new Error("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  // callbacks: {
  //   async jwt({ token, user }) {
  //     if (user) {
  //       token.id = user.id;
  //       token.email = user.email;
  //       token.name = user.name;
  //       token.accessToken = user.accessToken;
  //     }
  //     return token;
  //   },
  // async session({ session, token }) {
  //   session.user.id = token.id;
  //   session.user.email = token.email;
  //   session.user.name = token.name;
  //   session.accessToken = token.accessToken;
  //   return session;
  // },
  // },
  secret: process.env.NEXTAUTH_SECRET,
});

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

// Định nghĩa interface cho config tùy chỉnh
interface CustomApiConfig extends AxiosRequestConfig {
  customHeaders?: Record<string, string>;
}

// Định nghĩa các service name hợp lệ
type ServiceName =
  | "user"
  | "course"
  | "enrollment"
  | "payment"
  | "assessment"
  | "notification"
  | "report"
  | "discussion";

// Config cơ bản
class ApiConfig {
  static readonly BASE_URL: string =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost";
  static readonly DEFAULT_TIMEOUT: number = 10000;

  static readonly SERVICE_PORTS: Record<ServiceName, string> = {
    user: process.env.NEXT_PUBLIC_USER_SERVICE || "3001",
    course: process.env.NEXT_PUBLIC_COURSE_SERVICE || "3002",
    enrollment: process.env.NEXT_PUBLIC_ENROLLMENT_SERVICE || "3003",
    payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE || "3004",
    assessment: process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE || "3005",
    notification: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE || "3006",
    report: process.env.NEXT_PUBLIC_REPORT_SERVICE || "3007",
    discussion: process.env.NEXT_PUBLIC_DISCUSSION_SERVICE || "3008",
  };
}

// Hàm giả lập lấy JWT token
const getJwtToken = (): string | null => {
  // Sau thay bằng lấy từ zustand
  return localStorage.getItem("jwt_token") || null;
};

// Factory class để tạo API instances
class AxiosFactory {
  private static instances: Partial<Record<ServiceName, AxiosInstance>> = {};
  private static jwtInstances: Partial<Record<ServiceName, AxiosInstance>> = {};

  private static createInstance(
    serviceName: ServiceName,
    config: CustomApiConfig = {},
  ): AxiosInstance {
    const port = ApiConfig.SERVICE_PORTS[serviceName];

    if (!port) {
      throw new Error(
        `Port cho service ${serviceName} không được định nghĩa trong env`,
      );
    }

    return axios.create({
      baseURL: `${ApiConfig.BASE_URL}:${port}`,
      timeout: ApiConfig.DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        ...config.customHeaders,
        ...config.headers,
      },
      ...config,
    });
  }

  // Phương thức public để lấy instance thông thường
  public static getApiInstance(
    serviceName: ServiceName,
    config?: CustomApiConfig,
  ): AxiosInstance {
    if (!this.instances[serviceName]) {
      this.instances[serviceName] = this.createInstance(serviceName, config);
    }
    return this.instances[serviceName]!;
  }

  // Phương thức public để lấy instance với JWT
  public static getJwtInstance(
    serviceName: ServiceName,
    config?: CustomApiConfig,
  ): AxiosInstance {
    if (!this.jwtInstances[serviceName]) {
      const instance = this.createInstance(serviceName, config);

      instance.interceptors.request.use(
        (reqConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
          const token = getJwtToken();
          if (token) {
            reqConfig.headers = reqConfig.headers || {};
            reqConfig.headers.Authorization = `Bearer ${token}`;
          }
          return reqConfig;
        },
        (error) => {
          return Promise.reject(error);
        },
      );

      this.jwtInstances[serviceName] = instance;
    }
    return this.jwtInstances[serviceName]!;
  }
}

export { AxiosFactory };

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AxiosFactory } from "@/lib/axios";
import { generateOrderCode } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const fetchCourseAndCreatePayment = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch course details
        const courseApi = await AxiosFactory.getApiInstance("course");
        const courseResponse = await courseApi.get(`/${params.courseId}`);
        const courseData = courseResponse.data;
        setCourse(courseData);

        // 2. Create payment order
        const paymentApi = await AxiosFactory.getApiInstance("payment");
        const orderCode = generateOrderCode();
        setOrderId(orderCode);

        const paymentData = {
          amount: courseData.promotionPrice || courseData.price,
          method: "BANK_TRANSFER",
          serviceName: "Enrollment",
          description: courseData.name,
          orderCode: orderCode,
          userId: session.user.id,
          serviceId: courseData.id,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/course/${courseData.id}`,
          metadata: {
            courseId: courseData.id,
            userId: session.user.id,
            userName: session.user.name,
            courseName: courseData.name,
            serviceType: "COURSE_ENROLLMENT",
            instructor: courseData.instructor,
            duration: courseData.duration,
            level: courseData.level,
          },
        };

        const response = await paymentApi.post("/", paymentData);
        if (response.data?.qrCode) {
          setQrCode(response.data.qrCode);
        } else {
          throw new Error("Không thể tạo mã QR thanh toán");
        }
      } catch (error) {
        console.error("Error creating payment:", error);
        toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.");
        setStatusMessage("Có lỗi xảy ra khi tạo đơn hàng");
        setPaymentStatus("failed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndCreatePayment();
  }, [session, params.courseId, router]);

  // Kiểm tra trạng thái thanh toán định kỳ
  useEffect(() => {
    if (!orderId || paymentStatus !== "pending") return;

    const checkPaymentStatus = async () => {
      try {
        const paymentApi = await AxiosFactory.getApiInstance("payment");
        const response = await paymentApi.get(`/order/${orderId}/status`);

        if (response.data?.status === "COMPLETED") {
          setPaymentStatus("success");
          toast.success("Thanh toán thành công!");

          // Đăng ký khóa học sau khi thanh toán thành công
          const enrollmentApi = await AxiosFactory.getJwtInstance("enrollment");
          await enrollmentApi.post("", {
            courseId: params.courseId,
            userId: session?.user.id,
            userName: session?.user.name,
            courseName: course?.name,
            isFree: false,
            paymentId: response.data.id,
          });

          // Chuyển hướng về trang khóa học
          setTimeout(() => {
            router.push(`/course/${params.courseId}`);
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    // Kiểm tra trạng thái mỗi 5 giây
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [orderId, paymentStatus, params.courseId, router, session, course]);

  const handleCancel = () => {
    router.push(`/course/${params.courseId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Đang tải thông tin thanh toán...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Toaster richColors position="top-right" />

      <h1 className="text-2xl font-bold mb-6">Thanh toán khóa học</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin khóa học */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Thông tin khóa học</CardTitle>
          </CardHeader>
          <CardContent>
            {course && (
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  {course.thumbnail && (
                    <Image
                      src={course.thumbnail}
                      alt={course.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h2 className="text-xl font-semibold">{course.name}</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Giảng viên: {course.instructor}
                    </p>
                    <p className="text-sm text-gray-500">
                      Thời lượng: {course.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    {course.promotionPrice !== undefined &&
                    course.promotionPrice < course.price ? (
                      <>
                        <p className="text-lg font-bold text-primary">
                          {course.promotionPrice.toLocaleString("vi-VN")}đ
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {course.price.toLocaleString("vi-VN")}đ
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-primary">
                        {course.price.toLocaleString("vi-VN")}đ
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thông tin thanh toán */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quét mã QR để thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentStatus === "pending" && qrCode ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <Image
                      src={qrCode}
                      alt="QR Code"
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Mã đơn hàng: {orderId}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Vui lòng quét mã QR bằng ứng dụng ngân hàng để thanh toán
                  </p>
                </div>
                <Separator />
                <div className="text-center">
                  <p className="text-sm">
                    Hệ thống sẽ tự động xác nhận sau khi bạn thanh toán thành
                    công
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Hủy thanh toán
                </Button>
              </div>
            ) : paymentStatus === "success" ? (
              <div className="text-center space-y-4">
                <div className="text-green-500 text-xl font-semibold">
                  Thanh toán thành công!
                </div>
                <p>Bạn đã đăng ký khóa học thành công.</p>
                <p>Đang chuyển hướng về trang khóa học...</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-red-500 text-xl font-semibold">
                  {statusMessage || "Có lỗi xảy ra khi tạo thanh toán"}
                </div>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Quay lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

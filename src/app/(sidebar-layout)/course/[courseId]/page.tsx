"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Course } from "@/types/course/types";
import { Book, Crown, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { getCourseById } from "@/actions/courseAction";
import { getThreadByResourceId } from "@/actions/discussion.action";
import {
  checkEnrollmentStatus,
  enrollCourse,
} from "@/actions/enrollmentActions";

import useUserStore from "@/stores/useUserStore";

import Discussion from "@/components/discussion";
import { DiscussionType } from "@/components/discussion/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function CourseDetail() {
  const [course, setCourse] = useState<Course | null>(null);
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  const params = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        const data = await getCourseById(params.courseId as string);
        setCourse(data);

        // Find the first lesson ID
        if (data.chapters && data.chapters.length > 0) {
          const firstChapter = data.chapters[0];
          if (firstChapter.lessons && firstChapter.lessons.length > 0) {
            setFirstLessonId(firstChapter.lessons[0].id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (session?.user?.id && course?.id) {
        try {
          setIsCheckingEnrollment(true);
          const result = await checkEnrollmentStatus(
            course.id,
            session.user.id,
          );
          setIsEnrolled(result.data);
        } catch (err) {
          console.error("Error checking enrollment:", err);
        } finally {
          setIsCheckingEnrollment(false);
        }
      }
    };

    checkEnrollment();
  }, [session?.user?.id, course?.id]);

  // Handle discussion thread
  useEffect(() => {
    const fetchThread = async () => {
      if (!params.courseId || !user) return;

      try {
        const thread = await getThreadByResourceId(
          params.courseId as string,
          DiscussionType.COURSE_REVIEW,
        );

        if (thread) {
          setThreadId(thread.id);
        }
      } catch (err) {
        console.error("Error fetching discussion thread:", err);
      }
    };

    fetchThread();
  }, [params.courseId, user]);

  const handleEnrollClick = async () => {
    if (!session?.user) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
      router.push("/auth/login");
      return;
    }

    if (!course) return;

    // Handle free courses directly
    if (course.promotionPrice === 0 || course.price === 0) {
      try {
        // Set processing state to show loading animation
        setIsProcessing(true);

        // Enroll in the free course
        const result = await enrollCourse({
          courseId: course.id,
          userId: session.user.id,
          userName: session.user.name || "",
          courseName: course.title || course.name,
          isFree: true,
        });

        if (result.success) {
          toast.success("Bạn đã đăng ký khóa học thành công!");
          // Refresh enrollment status
          setIsEnrolled(true);
        } else {
          toast.error(result.message || "Có lỗi xảy ra khi đăng ký khóa học");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi đăng ký khóa học");
        console.error("Error enrolling in free course:", error);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Redirect to enrollment page for paid courses
      router.push(`/enrollment/${course.id}?courseID=${course.id}`);
    }
  };

  const handleStartLearningClick = () => {
    if (!course || !firstLessonId) return;

    // Navigate to the first lesson
    router.push(`/course/${course.id}/lesson/${firstLessonId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Course not found
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex gap-8 justify-center min-h-screen p-5">
      {/* Left Column */}
      <div className="w-2/3 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold mb-4">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        {/* Learning Outcomes */}
        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Bạn sẽ học được gì?</h2>
            <ul className="grid grid-cols-2 gap-4">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex text-start gap-2">
                  <div className="text-orange-500">✓</div>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Course Content */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Nội dung khoá học</h2>
          <p className="text-gray-600 mb-4 text-xs">
            <span className="font-semibold">• Số chương: </span>
            {course.chapters?.length || 0}
            <span className="font-semibold ml-4">• Số bài: </span>
            {course.totalLessons || 0}
          </p>

          <div className="space-y-4">
            {course.chapters?.map((chapter) => (
              <Collapsible key={chapter.id}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-orange-500" />
                    <h3 className="font-semibold text-gray-700">
                      {chapter.title}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-600">
                    {chapter.lessons?.length || 0} bài
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  <ul className="mt-2 space-y-2">
                    {chapter.lessons?.map((lesson) => (
                      <Link
                        href={
                          isEnrolled || lesson.isFreePreview
                            ? `/course/${course.id}/lesson/${lesson.id}`
                            : "#"
                        }
                        key={lesson.id}
                        className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg ${
                          isEnrolled || lesson.isFreePreview
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-50"
                        }`}
                        onClick={(e) => {
                          if (!isEnrolled && !lesson.isFreePreview) {
                            e.preventDefault();
                            toast.error(
                              "Vui lòng đăng ký khóa học để xem bài học này",
                            );
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          <span>{lesson.title}</span>
                        </div>
                        {lesson.isFreePreview && (
                          <span className="text-xs bg-gray-200 text-black px-2 py-1 rounded">
                            Preview
                          </span>
                        )}
                      </Link>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Yêu cầu</h2>
            <ul className="space-y-2">
              {course.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div>•</div>
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Discussion Section */}
        {threadId && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Thảo luận</h2>
            <Discussion threadId={threadId} />
          </div>
        )}
      </div>

      {/* Right Column - Course Card */}
      <div className="w-1/3">
        <div className="sticky top-8">
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full">
              <Image
                src={course.thumbnailUrl || "/placeholder-course.jpg"}
                alt={course.title}
                fill
                className="object-cover"
              />
              {course.price > 0 && (
                <div className="absolute top-2 right-2 rounded-lg px-1 py-1.5 bg-gray-500/35">
                  <Crown size={18} color="gold" />
                </div>
              )}
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Price Display */}
                <div className="flex items-center gap-2">
                  {course.price === 0 ? (
                    <p className="text-red-600 text-2xl font-semibold">
                      Miễn phí
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p
                        className={`font-semibold text-2xl ${
                          course.promotionPrice
                            ? "text-red-600"
                            : "text-red-600"
                        }`}
                      >
                        {(
                          course.promotionPrice || course.price
                        ).toLocaleString()}{" "}
                        {course.currency}
                      </p>
                      {course.promotionPrice &&
                        course.promotionPrice < course.price && (
                          <p className="text-gray-500 line-through">
                            {course.price.toLocaleString()} {course.currency}
                          </p>
                        )}
                    </div>
                  )}
                </div>

                {/* Enroll/Start Learning Button */}
                {isCheckingEnrollment ? (
                  <Button className="w-full" size="lg" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kiểm tra...
                  </Button>
                ) : !isEnrolled ? (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnrollClick}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : course.price === 0 ? (
                      "Đăng ký ngay"
                    ) : (
                      "Mua khóa học"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleStartLearningClick}
                  >
                    Tiếp tục học
                  </Button>
                )}

                {/* Course Stats */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-gray-500" />
                    <span>{course.totalLessons || 0} bài học</span>
                  </div>
                  {/* Add more stats as needed */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

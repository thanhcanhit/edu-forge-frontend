"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Course } from "@/types/course/types";

import { getAllCourses } from "@/actions/courseAction";

import CourseItem from "@/components/courseItem";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const bannerImages = [
  "https://res.cloudinary.com/dxxsudprj/image/upload/v1740664494/Screenshot_2025-02-27_at_20.53.58_wgkc7i.png",
  "https://res.cloudinary.com/dxxsudprj/image/upload/v1740663732/Screenshot_2025-02-27_at_20.37.42_apjhxh.png",
  "https://res.cloudinary.com/dxxsudprj/image/upload/v1740663732/Screenshot_2025-02-27_at_20.38.14_jgjenf.png",
  "https://res.cloudinary.com/dxxsudprj/image/upload/v1740664494/Screenshot_2025-02-27_at_20.54.08_f0jal5.png",
  "https://res.cloudinary.com/dxxsudprj/image/upload/v1740664063/Screenshot_2025-02-27_at_20.39.05_wvgzaw.png",
];

export default function Home() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Get all published courses without pagination
        const response = await getAllCourses({
          isPublished: true, // Only get published courses
          skipPagination: true, // Get all courses, not just the first page
        });

        console.log("Home page courses:", response.data);

        // Double-check to make sure we only show published courses
        const publishedCourses = response.data.filter(
          (course) => course.isPublished === true,
        );
        console.log("Filtered published courses:", publishedCourses.length);

        setAllCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Apply search filtering
  useEffect(() => {
    if (!allCourses.length) return;

    if (!searchQuery) {
      setFilteredCourses(allCourses);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        (course.description &&
          course.description.toLowerCase().includes(query)),
    );

    setFilteredCourses(filtered);
  }, [searchQuery, allCourses]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  // Split filtered courses into free and paid
  const proCourses = filteredCourses.filter((course) => course.price > 0);
  const freeCourses = filteredCourses.filter((course) => course.price === 0);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-6 lg:px-2 py-4 flex-1 flex flex-col items-center w-full justify-start min-h-screen gap-12">
      {/* Only show carousel if not searching */}
      {!searchQuery && (
        <div className="w-full relative rounded-3xl bg-gradient-to-r from-slate-50 to-orange-50/50">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full max-w-[1400px] mx-auto"
          >
            <CarouselContent className="rounded-3xl">
              {bannerImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[200px] sm:h-[280px] w-full rounded-3xl overflow-hidden shadow-lg">
                    <Image
                      src={image}
                      alt={`Banner ${index + 1}`}
                      fill
                      className="w-full object-cover transition-transform duration-500 hover:scale-105"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:-left-4 sm:flex h-8 w-8 sm:h-10 sm:w-10 opacity-70 hover:opacity-100 transition-opacity" />
            <CarouselNext className="hidden sm:-right-4 sm:flex h-8 w-8 sm:h-10 sm:w-10 opacity-70 hover:opacity-100 transition-opacity" />

            <div className="py-4 text-center flex justify-center sm:justify-start sm:pl-12 gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`items-center rounded-md transition-all duration-300 ${
                    index === current - 1
                      ? "w-8 sm:w-10 bg-orange-500/65 h-2"
                      : "w-4 sm:w-6 h-1.5 bg-gray-200 hover:bg-orange-200"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          </Carousel>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="w-full space-y-6 ">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Kết quả tìm kiếm:{" "}
            <span className="text-orange-500">"{searchQuery}"</span>
            <div className="h-1 w-1/4 bg-orange-500 mt-2"></div>
          </h2>

          {filteredCourses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xl text-gray-500">
                Không tìm thấy khóa học phù hợp với từ khóa "{searchQuery}"
              </p>
              <p className="mt-2 text-gray-600">
                Vui lòng thử lại với từ khóa khác
              </p>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-2 pb-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="transform hover:-translate-y-1 transition-transform duration-300"
                >
                  <CourseItem
                    {...course}
                    enrollmentCount={0}
                    totalLessons={course.totalLessons}
                    categories={[course.categoryId || ""]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pro Courses Section - Only show if not searching */}
      {!searchQuery && (
        <div className="w-full space-y-6 ">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 group">
              Khoá học Pro
              <div className="h-1 w-0 group-hover:w-full bg-orange-500 transition-all duration-300"></div>
            </h2>
            <button className="text-orange-500 hover:text-orange-600 transition-colors text-sm sm:text-base">
              Xem tất cả →
            </button>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-2 pb-4">
            {proCourses.map((course) => (
              <div
                key={course.id}
                className="transform hover:-translate-y-1 transition-transform duration-300"
              >
                <CourseItem
                  {...course}
                  enrollmentCount={0}
                  totalLessons={course.totalLessons}
                  categories={[course.categoryId || ""]}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Free Courses Section - Only show if not searching */}
      {!searchQuery && (
        <div className="w-full space-y-6 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 group">
              Khoá học miễn phí
              <div className="h-1 w-0 group-hover:w-full bg-orange-500 transition-all duration-300"></div>
            </h2>
            <button className="text-orange-500 hover:text-orange-600 transition-colors text-sm sm:text-base">
              Xem tất cả →
            </button>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-2 pb-4">
            {freeCourses.map((course) => (
              <div
                key={course.id}
                className="transform hover:-translate-y-1 transition-transform duration-300"
              >
                <CourseItem
                  {...course}
                  enrollmentCount={0}
                  totalLessons={course.totalLessons}
                  categories={[course.categoryId || ""]}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

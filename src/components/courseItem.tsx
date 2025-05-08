"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { CourseWithUser } from "@/types/course/types";
import { Book, Crown, Star, Users } from "lucide-react";

import { getLessonsByCourse } from "@/actions/courseAction";

import useUserStore from "@/stores/useUserStore";

import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter } from "./ui/card";

export default function CourseItem({
  id,
  title,
  thumbnailUrl,
  price,
  promotionPrice,
  currency = "VND",
  totalLessons,
  enrollmentCount = 0,
  categories,
  rating,
}: CourseWithUser & {
  description?: string;
  categories?: string[];
  rating?: number;
}) {
  // Keep the ID for the link but don't display it
  const courseLink = `/course/${id}`;
  const { user } = useUserStore();

  // Calculate discount percentage if there's a promotion
  const discountPercentage =
    price && promotionPrice
      ? Math.round(((price - promotionPrice) / price) * 100)
      : 0;

  return (
    <Link
      href={courseLink}
      className="block transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-2xl transition-all duration-300">
        <div className="relative h-36 w-full overflow-hidden group">
          <Image
            src={thumbnailUrl || "/placeholder-course.jpg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {price > 0 && (
            <div className="absolute top-3 right-3 rounded-lg px-2 py-1.5 bg-black/40 backdrop-blur-sm">
              <Crown size={18} className="text-yellow-400" />
            </div>
          )}

          {/* Discount banner */}
          {discountPercentage > 0 && (
            <div className="absolute bottom-3 left-0 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-r-md">
              -{discountPercentage}%
            </div>
          )}
        </div>

        <CardContent className="px-4 py-3">
          {/* Course title */}
          <h3 className="font-bold text-md line-clamp-2 mb-2 text-gray-800 truncate ">
            {title}
          </h3>

          {/* Price display */}
          <div className="flex items-center gap-2">
            {price === 0 ? (
              <p className="text-green-600 font-bold">Miễn phí</p>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-red-500 font-bold">
                  {(promotionPrice || price).toLocaleString()} {currency}
                </p>
                {promotionPrice && promotionPrice < price && (
                  <p className="text-gray-500 line-through text-sm">
                    {price.toLocaleString()} {currency}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-2 bg-gray-100/35">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">
                {totalLessons} bài học
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="h-4 w-4 text-blue-500" />
              <span>{enrollmentCount}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

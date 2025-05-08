"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { useEffect, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { Category, Course, CourseLevel } from "@/types/course/types";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Trash, Upload } from "lucide-react";

import {
  getAllCategories,
  getCourseById,
  updateCourse,
  uploadImage,
} from "@/actions/courseAction";

import useUserStore from "@/stores/useUserStore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [courseData, setCourseData] = useState<Course | null>(null);

  const { user } = useUserStore();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [course, categoriesData] = await Promise.all([
          getCourseById(resolvedParams.courseId),
          getAllCategories(),
        ]);

        setCourseData(course);
        setSelectedImage(course.thumbnailUrl || null);
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin khóa học",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchData();
  }, [resolvedParams.courseId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Handle numeric fields
    if (name === "price" || name === "promotionPrice") {
      // Parse as float to handle decimal values like 49.99
      const numValue = value === "" ? 0 : parseFloat(value);
      // Round to 2 decimal places to avoid floating point issues
      const roundedValue = Math.round(numValue * 100) / 100;
      setCourseData((prev) =>
        prev ? { ...prev, [name]: roundedValue } : null,
      );
    } else {
      setCourseData((prev) => (prev ? { ...prev, [name]: value } : null));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setCourseData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCourseData((prev) => (prev ? { ...prev, [name]: checked } : null));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Hiển thị preview ngay lập tức
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);

        // Upload file lên server
        const response = await uploadImage(
          file,
          "courses",
          `course-thumbnails/${user?.id}`,
        );

        if (response.success) {
          // Cập nhật URL thật từ server
          setSelectedImage(response.url);
          toast({
            title: "Thành công",
            description: "Đã tải lên hình ảnh",
          });
        } else {
          toast({
            title: "Lỗi",
            description: response.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải lên hình ảnh",
          variant: "destructive",
        });
      }
    }
  };

  const handleArrayFieldChange = (
    field: keyof Pick<Course, "learningOutcomes" | "requirements" | "tags">,
    index: number,
    value: string,
  ) => {
    setCourseData((prev) => {
      if (!prev) return null;
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (
    field: keyof Pick<Course, "learningOutcomes" | "requirements" | "tags">,
  ) => {
    setCourseData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: [...prev[field], ""],
      };
    });
  };

  const removeArrayItem = (
    field: keyof Pick<Course, "learningOutcomes" | "requirements" | "tags">,
    index: number,
  ) => {
    setCourseData((prev) => {
      if (!prev) return null;
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("+Data test: ", courseData);
    if (
      !courseData ||
      !courseData.title ||
      !courseData.description ||
      !courseData.categoryId
    ) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate price and promotionPrice
      const price =
        typeof courseData.price === "number"
          ? courseData.price
          : parseFloat(String(courseData.price || 0));
      // Round to 2 decimal places
      const roundedPrice = Math.round(price * 100) / 100;

      let promotionPrice =
        typeof courseData.promotionPrice === "number"
          ? courseData.promotionPrice
          : parseFloat(String(courseData.promotionPrice || 0));
      // Round to 2 decimal places
      let roundedPromotionPrice = Math.round(promotionPrice * 100) / 100;

      // Ensure promotionPrice is not greater than price
      if (roundedPromotionPrice > roundedPrice) {
        roundedPromotionPrice = roundedPrice;
      }

      // If price is 0, promotionPrice should also be 0
      if (roundedPrice === 0) {
        roundedPromotionPrice = 0;
      }

      const result = await updateCourse(resolvedParams.courseId, {
        title: courseData.title,
        description: courseData.description || "",
        categoryId: courseData.categoryId,
        level: courseData.level || "BEGINNER",
        price: roundedPrice,
        promotionPrice: roundedPromotionPrice,
        currency: courseData.currency,
        isPublished: courseData.isPublished,
        isHasCertificate: courseData.isHasCertificate,
        tags: courseData.tags,
        learningOutcomes: courseData.learningOutcomes,
        requirements: courseData.requirements,
        targetAudience: courseData.targetAudience || "",
        thumbnailUrl: selectedImage || undefined,
      });

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật khóa học thành công",
        });
        router.push("/admin/courses");
      } else {
        toast({
          title: "Lỗi",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã có lỗi xảy ra khi cập nhật khóa học",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!courseData) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full mx-auto py-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Link href={`/admin/courses/${resolvedParams.courseId}`}>
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Cập nhật khóa học</h1>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/admin/courses/${resolvedParams.courseId}`)
              }
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Card */}
            <Card className="shadow-sm border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-gray-700">
                    Tên khóa học <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={courseData.title || ""}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Nhập tên khóa học"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-gray-700">
                    Mô tả <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={courseData.description || ""}
                    onChange={handleInputChange}
                    required
                    className="min-h-[120px] border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Mô tả chi tiết về khóa học"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-gray-700">
                      Danh mục <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={courseData.categoryId}
                      onValueChange={(value) =>
                        handleSelectChange("categoryId", value)
                      }
                      disabled={isLoadingCategories}
                    >
                      <SelectTrigger className="border-gray-300 focus:ring-orange-500">
                        <SelectValue
                          placeholder={
                            isLoadingCategories
                              ? "Đang tải danh mục..."
                              : "Chọn danh mục"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="level" className="text-gray-700">
                      Cấp độ
                    </Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value) =>
                        handleSelectChange("level", value)
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:ring-orange-500">
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CourseLevel.BEGINNER}>
                          Cơ bản
                        </SelectItem>
                        <SelectItem value={CourseLevel.INTERMEDIATE}>
                          Trung cấp
                        </SelectItem>
                        <SelectItem value={CourseLevel.ADVANCED}>
                          Nâng cao
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="targetAudience" className="text-gray-700">
                    Đối tượng mục tiêu
                  </Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={courseData.targetAudience || ""}
                    onChange={handleInputChange}
                    placeholder="Mô tả đối tượng học viên mục tiêu của khóa học"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card className="shadow-sm border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Thông tin giá
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <Label htmlFor="price" className="text-gray-700">
                      Giá gốc
                    </Label>
                    <div className="relative">
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={courseData.price || 0}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">₫</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="promotionPrice" className="text-gray-700">
                      Giá khuyến mãi
                    </Label>
                    <div className="relative">
                      <Input
                        id="promotionPrice"
                        name="promotionPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        max={courseData.price || 0}
                        value={courseData.promotionPrice || 0}
                        onChange={handleInputChange}
                        disabled={!courseData.price || courseData.price <= 0}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">₫</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isPublished"
                    checked={courseData.isPublished}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("isPublished", checked as boolean)
                    }
                    className="text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <Label htmlFor="isPublished" className="text-gray-700">
                    Xuất bản ngay
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHasCertificate"
                    checked={courseData.isHasCertificate}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(
                        "isHasCertificate",
                        checked as boolean,
                      )
                    }
                    className="text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <Label htmlFor="isHasCertificate" className="text-gray-700">
                    Có chứng chỉ
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Learning Outcomes Card */}
            <Card className="shadow-sm border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Kết quả đạt được
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <Input
                      value={outcome}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "learningOutcomes",
                          index,
                          e.target.value,
                        )
                      }
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Học viên sẽ có được gì sau khóa học?"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("learningOutcomes", index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem("learningOutcomes")}
                  className="mt-2 border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm kết quả đạt được
                </Button>
              </CardContent>
            </Card>

            {/* Requirements Card */}
            <Card className="shadow-sm border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Yêu cầu khi học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courseData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <Input
                      value={requirement}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "requirements",
                          index,
                          e.target.value,
                        )
                      }
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Yêu cầu kiến thức hoặc công cụ cần thiết"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeArrayItem("requirements", index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem("requirements")}
                  className="mt-2 border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm yêu cầu khi học
                </Button>
              </CardContent>
            </Card>

            {/* Tags Card */}
            <Card className="shadow-sm border-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {courseData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 rounded-full pl-3 pr-1 py-1"
                    >
                      <span className="text-sm">{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 rounded-full p-0 hover:bg-gray-200"
                        onClick={() => removeArrayItem("tags", index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tag và nhấn thêm"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    onChange={(e) => {
                      if (courseData.tags.length === 0) {
                        handleArrayFieldChange("tags", 0, e.target.value);
                      } else {
                        const lastIndex = courseData.tags.length - 1;
                        handleArrayFieldChange(
                          "tags",
                          lastIndex,
                          e.target.value,
                        );
                      }
                    }}
                    value={
                      courseData.tags.length > 0
                        ? courseData.tags[courseData.tags.length - 1]
                        : ""
                    }
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (
                        courseData.tags.length === 0 ||
                        courseData.tags[courseData.tags.length - 1] !== ""
                      ) {
                        addArrayItem("tags");
                      }
                    }}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar column */}
          <div className="space-y-8">
            <Card className="shadow-sm border-none sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Ảnh bìa khóa học
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={selectedImage}
                        alt="Course thumbnail"
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          className="bg-red-500 text-white hover:bg-red-600"
                          size="sm"
                          onClick={() => setSelectedImage(null)}
                        >
                          <Trash className="h-4 w-4 mr-2" /> Xóa ảnh
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="thumbnail"
                      className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          Tải ảnh lên
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG (Tối đa 5MB)
                        </p>
                      </div>
                    </label>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="thumbnail"
                  />
                </div>

                <div className="mt-6 bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-800 mb-2">
                    Hướng dẫn
                  </h3>
                  <ul className="text-xs text-orange-700 space-y-1 list-disc pl-4">
                    <li>Sử dụng hình ảnh chất lượng cao, tỉ lệ 16:9</li>
                    <li>Kích thước tối thiểu 1280x720 pixels</li>
                    <li>Tránh sử dụng quá nhiều chữ trong hình ảnh</li>
                    <li>Hình ảnh phải liên quan đến nội dung khóa học</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

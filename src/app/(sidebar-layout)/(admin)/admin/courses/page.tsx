"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import { toast } from "@/hooks/use-toast";
import { Course, CourseLevel } from "@/types/course/types";
import { Edit, Eye, Filter, Plus, Trash } from "lucide-react";

import {
  CourseFilters,
  deleteCourse,
  getAllCategories,
  getAllCourses,
} from "@/actions/courseAction";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<CourseFilters>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const fetchCourses = async (
    page = pagination.page,
    limit = pagination.limit,
    courseFilters = filters,
  ) => {
    try {
      setIsLoading(true);
      // Chỉ truyền các giá trị filter khi chúng không phải là "tất cả"
      const filteredParams = {
        ...courseFilters,
        categoryId:
          courseFilters.categoryId === "all"
            ? undefined
            : courseFilters.categoryId,
        level: courseFilters.level === "" ? undefined : courseFilters.level,
        isPublished:
          courseFilters.isPublished === undefined
            ? undefined
            : courseFilters.isPublished,
      };

      const response = await getAllCourses(filteredParams, page, limit);

      if (response && response.data) {
        setCourses(response.data);

        if (response.meta) {
          setPagination({
            page: response.meta.page || 1,
            limit: response.meta.limit || 10,
            total: response.meta.total || response.data.length,
            totalPages:
              response.meta.totalPages ||
              Math.ceil(response.data.length / (response.meta.limit || 10)),
          });
        } else {
          setPagination({
            page: 1,
            limit: 10,
            total: response.data.length,
            totalPages: Math.ceil(response.data.length / 10),
          });
        }
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    if (!courseId) return;
    setCourseToDelete(courseId);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      await deleteCourse(courseToDelete);
      setCourses(courses.filter((course) => course.id !== courseToDelete));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));

      toast({
        title: "Thành công",
        description: "Xóa khóa học thành công",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khóa học",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setCourseToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchCourses(page);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchCourses(1, pagination.limit, filters);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({});
    fetchCourses(1, pagination.limit, {});
    setIsFilterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6 bg-slate-50">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý khoá học
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý tất cả các khóa học của bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-slate-200 hover:bg-slate-100"
              >
                <Filter className="mr-2 h-4 w-4" /> Lọc
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-slate-900">
                  Lọc khóa học
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Chọn các tiêu chí để lọc danh sách khóa học
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Danh mục
                  </Label>
                  <Select
                    value={filters.categoryId || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "categoryId",
                        value === "all" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">
                    Cấp độ
                  </Label>
                  <Select
                    value={filters.level || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "level",
                        value === "all" ? undefined : value,
                      )
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Tất cả cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả cấp độ</SelectItem>
                      <SelectItem value={CourseLevel.BEGINNER}>
                        Người mới bắt đầu
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isPublished" className="text-right">
                    Trạng thái
                  </Label>
                  <Select
                    value={
                      filters.isPublished === undefined
                        ? "all"
                        : filters.isPublished
                          ? "true"
                          : "false"
                    }
                    onValueChange={(value) => {
                      let filterValue;
                      if (value === "all") {
                        filterValue = undefined;
                      } else if (value === "true") {
                        filterValue = true;
                      } else {
                        filterValue = false;
                      }
                      handleFilterChange("isPublished", filterValue);
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="true">Đã xuất bản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minPrice" className="text-right">
                    Giá tối thiểu
                  </Label>
                  <Input
                    id="minPrice"
                    type="number"
                    min="0"
                    className="col-span-3"
                    value={filters.minPrice || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "minPrice",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxPrice" className="text-right">
                    Giá tối đa
                  </Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    min="0"
                    className="col-span-3"
                    value={filters.maxPrice || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "maxPrice",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-slate-200"
                >
                  Đặt lại
                </Button>
                <Button
                  onClick={applyFilters}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Áp dụng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href="/admin/courses/create">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Thêm khoá học
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-100/50">
              <TableHead className="text-slate-700">Tên khoá học</TableHead>
              <TableHead className="text-slate-700">Danh mục</TableHead>
              <TableHead className="text-slate-700">Giá</TableHead>
              <TableHead className="text-slate-700">Trạng thái</TableHead>
              <TableHead className="text-right text-slate-700">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Chưa có khóa học nào
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {course.title}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {course.category?.name}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {course.price === 0
                      ? "Miễn phí"
                      : `${course.price.toLocaleString()} ${course.currency}`}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/course/${course.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-slate-100 border-slate-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-slate-100 border-slate-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:bg-red-50 border-red-200"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-900">
                              Xác nhận xóa khóa học
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              Bạn có chắc chắn muốn xóa khóa học "{course.title}
                              "? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              disabled={isDeleting}
                              className="border-slate-200"
                            >
                              Hủy
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDeleteCourse}
                              disabled={isDeleting}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              {isDeleting ? "Đang xóa..." : "Xóa"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && courses.length > 0 && (
        <div className="mt-6 flex flex-col items-center">
          <Pagination className="mb-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={`${
                    pagination.page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-slate-100"
                  } border-slate-200`}
                />
              </PaginationItem>

              {Array.from(
                { length: Math.max(1, pagination.totalPages) },
                (_, i) => i + 1,
              )
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                  );
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsisBefore = prevPage && prevPage !== page - 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsisBefore && (
                        <PaginationItem>
                          <PaginationEllipsis className="text-slate-400" />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          isActive={page === pagination.page}
                          onClick={() => handlePageChange(page)}
                          className={`cursor-pointer ${
                            page === pagination.page
                              ? "bg-orange-500 text-white hover:bg-orange-600"
                              : "hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={`${
                    pagination.page >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-slate-100"
                  } border-slate-200`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

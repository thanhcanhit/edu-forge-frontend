"use client";

import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Bell, LogOut, Search, Settings, User, X } from "lucide-react";

import CourseProgress from "@/components/course/CourseProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  isLoggedIn?: boolean;
  image?: string;
  userName?: string;
  onLogout?: () => void;
}

export default function Navbar({
  isLoggedIn = false,
  image = "",
  userName = "User",
  onLogout,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize search query from URL on mount
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Check if we're in a lesson page
  const isLessonPage =
    pathname?.includes("/course/") && pathname?.includes("/lesson/");

  // Check if we're on the home page
  const isHomePage = pathname === "/";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to home page with search query
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (searchParams.has("q")) {
      router.push("/");
    }
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500 text-white font-bold text-xl">
              F8
            </div>
          </Link>
          <h1 className="hidden text-base font-medium md:block">
            Học Lập Trình Để Đi Làm
          </h1>
        </div>

        {/* Search Bar and Progress */}
        <div className="relative mx-4 flex-1 max-w-md flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học, bài viết, video, ..."
              className="w-full rounded-full border-gray-200 pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Clear search results and redirect to home page if search field is empty
                if (e.target.value === "" && searchParams.has("q")) {
                  router.push("/");
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          {isLessonPage && <CourseProgress />}
        </div>

        {/* Auth Buttons or User Info */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm font-medium md:block">
                Khóa học của tôi
              </span>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  3
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 border cursor-pointer">
                    <AvatarImage src={image} alt={userName} />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userName}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Trang cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/register">
                <Button variant="ghost" className="text-sm font-medium">
                  Đăng ký
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-orange-500 text-white hover:bg-orange-600">
                  Đăng nhập
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

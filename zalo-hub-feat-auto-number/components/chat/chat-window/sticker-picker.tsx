import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sticker } from "@/lib/api/sticker";
import { stickerApi, zaloApi } from "@/lib/api";
import { Loader2, Sparkles, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface StickerPickerProps {
  onSelectSticker: (sticker: Sticker) => void;
  accountId: number;
  children: React.ReactNode;
}

export function StickerPicker({
  onSelectSticker,
  accountId,
  children,
}: StickerPickerProps) {
  const [categories, setCategories] = useState<number[]>([]);
  const [stickersByCategory, setStickersByCategory] = useState<
    Record<number, Sticker[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"category" | "sticker" | "name">(
    "category"
  );
  const [searchResults, setSearchResults] = useState<Sticker[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query to avoid calling API too frequently
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory && !stickersByCategory[selectedCategory]) {
      loadStickersByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, searchType]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await stickerApi.getCategories();
      setCategories(categoriesData);
      setSelectedCategory(categoriesData[0]);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStickersByCategory = async (cateId: number) => {
    try {
      const stickers = await stickerApi.getByCategory(cateId);
      setStickersByCategory((prev) => ({
        ...prev,
        [cateId]: stickers,
      }));
    } catch (error) {
      console.error("Error loading stickers:", error);
    }
  };

  const handleSearch = async () => {
    if (!debouncedSearchQuery.trim()) return;

    setIsSearching(true);
    try {
      let results: Sticker[] = [];

      if (searchType === "category") {
        // Call API to search by category ID
        results = await stickerApi.searchByCategoryId(debouncedSearchQuery);
      } else if (searchType === "sticker") {
        // Call API to search by sticker ID
        results = await stickerApi.searchByStickerId(debouncedSearchQuery);
      } else {
        // Call API to search by keyword using Zalo API
        const zaloResponse = await zaloApi.getStickers({
          accountId,
          keyword: debouncedSearchQuery,
        });
        results = zaloResponse || [];
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching stickers:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStickerClick = (sticker: Sticker) => {
    onSelectSticker(sticker);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const renderSticker = (sticker: Sticker) => (
    <TooltipProvider key={sticker.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="group relative w-16 h-16 p-2 cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-transparent hover:border-blue-200"
            onClick={() => handleStickerClick(sticker)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              src={sticker.stickerUrl}
              alt={`Sticker ${sticker.id}`}
              className="w-full h-full object-contain relative z-10 drop-shadow-sm"
              draggable={false}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">
            {sticker?.stickerId ?? sticker?.id}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 border-0 shadow-2xl rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm"
        align="start"
      >
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Sticker</h3>
          </div>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSearchType("category")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                searchType === "category"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Theo Category ID
            </button>
            <button
              onClick={() => setSearchType("sticker")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                searchType === "sticker"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Theo Sticker ID
            </button>
            <button
              onClick={() => setSearchType("name")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                searchType === "name"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Theo tên
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={
                searchType === "category"
                  ? "Nhập Category ID..."
                  : searchType === "sticker"
                  ? "Nhập Sticker ID..."
                  : "Tìm kiếm theo tên..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ outline: "none" }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-blue-200 rounded-full animate-pulse" />
              </div>
              <span className="text-gray-600 font-medium">
                Đang tải sticker...
              </span>
            </div>
          </div>
        ) : searchQuery ? (
          // Search Results
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                Kết quả tìm kiếm ({searchResults.length})
              </h4>
              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
            </div>

            {searchResults.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="grid grid-cols-4 gap-3">
                  {searchResults.map(renderSticker)}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-48">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-gray-500 text-sm">
                    Không tìm thấy sticker
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Category Content
          <div className="w-full">
            <div className="px-4 pt-4">
              <div className="w-full max-w-full">
                <div className="flex gap-2 overflow-x-auto pb-2 sticker-category-scroll">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === category
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-current rounded-full" />
                        {category}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedCategory && (
              <div className="mt-0 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <ScrollArea className="h-80">
                  <div className="grid grid-cols-4 gap-3 p-6">
                    {stickersByCategory[selectedCategory]?.map(
                      renderSticker
                    ) || (
                      <div className="col-span-4 flex items-center justify-center h-48">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                          </div>
                          <span className="text-gray-500 text-sm">
                            Đang tải...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

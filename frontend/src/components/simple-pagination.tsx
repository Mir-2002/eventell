import { SpringBootPagination } from "@/domain/domain";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimplePaginationProps<T> {
  pagination: SpringBootPagination<T>;
  onPageChange: (page: number) => void;
}

export function SimplePagination<T>({
  pagination,
  onPageChange,
}: SimplePaginationProps<T>) {
  const currentPage = pagination.number;
  const totalPages = pagination.totalPages;

  // Nothing to page through
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={pagination.first}
      >
        <ChevronLeft />
        <span className="sr-only">Previous page</span>
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {currentPage + 1} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="cursor-pointer"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={pagination.last}
      >
        <ChevronRight />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
}

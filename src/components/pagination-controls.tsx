"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PaginationControls({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="text-xs text-muted-foreground">
        {start}–{end} sur {total}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Par page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(parseInt(v))}
        >
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
          >
            «
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Préc.
          </Button>
          <div className="px-2 text-xs text-muted-foreground">
            Page {page} / {pageCount}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            Suiv.
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageCount)}
            disabled={page >= pageCount}
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}

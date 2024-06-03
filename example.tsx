import { type Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import ScrollArea from "@/components/ui/scroll-area";
import SkeletonRows from "./skeleton-rows";
import DataTableHeader from "./data-table-header";
import DataTableCell from "./data-table-cell";
import Td from "./td";
import { cva } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import { PAGINATION_HEIGHT_CORRECTOR } from "../hooks/utils";
import { useMediaQuery } from "usehooks-ts";

interface DataTableContentProps<TData> {
    table: Table<TData>;
    isLoading?: boolean;
    variant?: "default" | "loose";
}

const tableVariants = cva("border-separate table-auto w-full text-sm", {
    variants: {
        variant: {
            default: "border-spacing-0 ",
            loose: "border-spacing-x-0 border-spacing-y-2",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export default function DataTableContent<TData>({ table, isLoading, variant }: DataTableContentProps<TData>) {
    const ref = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const [top, setTop] = useState(250);

    const isMobile = useMediaQuery("(max-width: 1024px)");

    const isFiltered = table.getPreFilteredRowModel().rows.length > table.getFilteredRowModel().rows.length;

    const columnsLen = table.getVisibleFlatColumns().length;
    const headerGroups = table.getHeaderGroups();
    const rows = table.getRowModel().rows;

    const calculateAndSetTopValue = useCallback(() => {
        if (ref.current) {
            setTop(ref.current.getBoundingClientRect().top + PAGINATION_HEIGHT_CORRECTOR);
        }
    }, [ref.current]);

    useEffect(() => {
        if (!ref.current) return;
        calculateAndSetTopValue();
        const resizeObserver = new ResizeObserver(calculateAndSetTopValue);

        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, [ref.current, calculateAndSetTopValue]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.children[1]?.scrollTo?.({ left: 0, top: 0 });
        }
    }, [scrollAreaRef.current, table.getState().pagination.pageIndex]);

    return (
        <div ref={ref} className="min-h-[30vh]" style={{ height: isMobile ? "auto" : `calc(100vh - ${top}px)` }}>
            <ScrollArea ref={scrollAreaRef} className="w-full h-full">
                <table className={tableVariants({ variant })}>
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header, idx) => (
                                    <DataTableHeader
                                        key={header.id}
                                        header={header}
                                        className={cn({
                                            "left-0 z-30": idx === 0,
                                        })}
                                    />
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-background dark:bg-slate-800">
                        {isLoading && <SkeletonRows rows={10} columns={columnsLen} />}
                        {!isLoading && table.getRowModel().rows.length === 0 && (
                            <tr>
                                <Td colSpan={columnsLen}>
                                    <div className="flex flex-col items-center justify-center gap-2 py-24">
                                        <div className="font-semibold text-slate-500 dark:text-slate-400" data-testid="table-th-no-results">
                                            No results
                                        </div>
                                        <div className="text-slate-500 dark:text-slate-400">
                                            <div className="text-slate-500 dark:text-slate-400">{isFiltered ? "Try a different search criteria" : ""}</div>
                                        </div>
                                    </div>
                                </Td>
                            </tr>
                        )}
                        {!isLoading &&
                            rows.map((row, rowIndex) => {
                                const cellColor = rowIndex % 2 === 0 ? "bg-slate-50 dark:bg-slate-900" : "bg-background dark:bg-slate-800";
                                return (
                                    <tr
                                        key={row.id}
                                        className={cn(row.getIsGrouped() ? "bg-slate-100 dark:bg-slate-800" : "odd:bg-slate-50/50 dark:odd:bg-slate-900")}
                                    >
                                        {row.getVisibleCells().map((cell, index) => (
                                            <DataTableCell
                                                key={cell.id}
                                                cell={cell}
                                                row={row}
                                                className={cn(row.getIsGrouped() ? "bg-slate-100 dark:bg-slate-800" : cellColor, {
                                                    "sticky left-0 z-10 shadow-stickyColumn": index === 0,
                                                })}
                                            />
                                        ))}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </ScrollArea>
        </div>
    );
}

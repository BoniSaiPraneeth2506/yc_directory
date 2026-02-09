"use client";

import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteStartup } from "@/lib/actions";
import { toast } from "sonner";

interface KebabMenuProps {
  startupId: string;
}

export function KebabMenu({ startupId }: KebabMenuProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/startup/${startupId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this startup? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteStartup(startupId);
      
      if (result.status === "SUCCESS") {
        toast.success("Startup deleted successfully!");
        router.push("/");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete startup");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.message || "An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 shadow-md border border-gray-200"
          disabled={isDeleting}
        >
          <MoreVertical className="h-5 w-5 text-gray-700" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 sm:w-48 bg-white shadow-lg border border-gray-200">
        <DropdownMenuItem
          onClick={handleEdit}
          className="cursor-pointer text-gray-900 font-medium hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 py-2.5"
        >
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="cursor-pointer text-red-600 font-medium hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 py-2.5"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

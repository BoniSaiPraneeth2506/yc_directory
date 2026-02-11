"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const uploadOptions = [
    {
      title: "Create Post",
      description: "Share your startup idea with the community",
      icon: FileText,
      href: "/startup/create",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Create Reel",
      description: "Upload a pitch video for your startup",
      icon: Video,
      href: "/reels/create",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  const handleOptionClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md mx-auto overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Create New</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="p-4 space-y-3">
            {uploadOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.title}
                  onClick={() => handleOptionClick(option.href)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-gray-50 transition-all group"
                >
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      option.bgColor,
                      "group-hover:scale-110 transition-transform"
                    )}
                  >
                    <Icon className={cn("w-6 h-6", option.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer spacing for mobile */}
          <div className="h-4 md:h-0" />
        </div>
      </div>
    </>
  );
};

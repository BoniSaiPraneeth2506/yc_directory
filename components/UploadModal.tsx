"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, FileText, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const router = useRouter();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  if (!isOpen) return null;

  const uploadOptions = [
    {
      title: "Create Post",
      description: "Share your startup idea with the community",
      icon: FileText,
      href: "/startup/create",
      color: "text-blue-600",
      gradient: "from-blue-500/20 to-indigo-500/20",
      hoverGradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Create Reel",
      description: "Upload a pitch video for your startup",
      icon: Video,
      href: "/reels/create",
      color: "text-pink-600",
      gradient: "from-pink-500/20 to-rose-500/20",
      hoverGradient: "from-pink-500 to-rose-600",
      bgColor: "bg-pink-50",
    },
  ];

  const handleOptionClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-500 ease-out"
        style={{
          animation: 'fadeIn 0.5s ease-out forwards'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-0 md:flex md:items-center md:justify-center">
        <div 
          className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md mx-auto overflow-hidden shadow-2xl transition-all duration-500 ease-out"
          style={{
            animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}
        >
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create</h2>
                <p className="text-sm text-gray-500 mt-0.5">Choose what you want to create</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-500 ease-out hover:rotate-90"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Options with premium cards */}
          <div className="px-6 pb-6 space-y-4">
            {uploadOptions.map((option, index) => {
              const Icon = option.icon;
              const isHovered = hoveredOption === option.title;
              
              return (
                <button
                  key={option.title}
                  onClick={() => handleOptionClick(option.href)}
                  onMouseEnter={() => setHoveredOption(option.title)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={cn(
                    "w-full flex items-center gap-4 p-5 rounded-2xl transition-all duration-500 ease-out",
                    "border-2 border-gray-100 bg-white",
                    "hover:border-transparent hover:shadow-2xl hover:-translate-y-2",
                    "group relative overflow-hidden"
                  )}
                  style={{
                    animation: `fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                    animationDelay: `${0.1 + index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ease-out",
                      option.gradient,
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  />
                  
                  {/* Content */}
                  <div className="relative flex items-center gap-4 flex-1">
                    {/* Icon container */}
                    <div className="relative">
                      <div
                        className={cn(
                          "p-3.5 rounded-xl transition-all duration-500 ease-out",
                          option.bgColor,
                          isHovered && "scale-110 shadow-lg"
                        )}
                      >
                        <Icon 
                          className={cn(
                            "w-6 h-6 transition-all duration-500 ease-out",
                            option.color,
                            isHovered && "scale-110"
                          )}
                          strokeWidth={2}
                        />
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900 mb-0.5 text-base">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-tight">
                        {option.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className={cn(
                      "transition-all duration-500 ease-out",
                      isHovered ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                    )}>
                      <ArrowRight className={cn("w-5 h-5", option.color)} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer spacing for mobile */}
          <div className="h-4 md:h-0" />
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (min-width: 768px) {
          @keyframes slideUp {
            from {
              transform: translateY(50px) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

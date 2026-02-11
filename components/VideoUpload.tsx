"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Video, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string, thumbnail?: string, duration?: number) => void;
  disabled?: boolean;
}

export const VideoUpload = ({ value, onChange, disabled }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log environment variables on component mount
  useEffect(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    console.log("🎬 VideoUpload Component Initialized");
    console.log("Cloudinary Cloud Name:", cloudName ? "✅ Set" : "❌ Missing");
    console.log("Cloudinary Upload Preset:", uploadPreset ? "✅ Set" : "❌ Missing");
    
    if (!cloudName || !uploadPreset) {
      console.error("⚠️ Cloudinary not configured! Check your .env.local file.");
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file (MP4, MOV, AVI, etc.)");
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert("Video file size must be less than 100MB. Please compress your video or choose a shorter clip.");
      return;
    }

    // Check environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      alert("Cloudinary is not configured. Please contact the administrator.");
      console.error("Missing Cloudinary config:", { cloudName, uploadPreset });
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Get video duration
      const duration = await getVideoDuration(file);

      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "yc_reels");
      formData.append("resource_type", "video");

      // Upload to Cloudinary with progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const videoUrl = response.secure_url;
          const thumbnail = response.secure_url.replace(/\.[^/.]+$/, ".jpg"); // Cloudinary auto-generates thumbnails

          console.log("✅ Video uploaded successfully!");
          console.log("Video URL:", videoUrl);
          console.log("Duration:", duration, "seconds");

          setPreview(videoUrl);
          onChange(videoUrl, thumbnail, duration);
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          console.error("❌ Upload failed:", errorResponse);
          
          let errorMessage = "Upload failed";
          
          // Handle specific Cloudinary errors
          if (errorResponse.error?.message) {
            errorMessage = errorResponse.error.message;
            
            // User-friendly error messages
            if (errorMessage.includes("Upload preset")) {
              errorMessage = `Upload preset not found! Please create an unsigned upload preset in Cloudinary:\n\n1. Go to: https://console.cloudinary.com/settings/upload\n2. Click "Add upload preset"\n3. Set "Signing mode" to "Unsigned"\n4. Name it: "yc_reels"\n5. Save and update your .env.local`;
            }
          }
          
          throw new Error(errorMessage);
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        console.error("Network error during upload");
        alert("Video upload failed due to network error. Please check your connection and try again.");
        setUploading(false);
      });

      xhr.addEventListener("abort", () => {
        console.log("Upload cancelled");
        setUploading(false);
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`
      );
      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert(`Failed to upload video: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`);
      setUploading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full max-w-2xl mx-auto">
          <video
            src={preview}
            controls
            className="w-full rounded-lg border-2 border-black shadow-100"
            style={{ maxHeight: "400px" }}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || uploading}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-2xl mx-auto border-2 border-dashed border-black rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors bg-white"
        >
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              <p className="text-lg font-semibold">Uploading Video...</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{progress}%</p>
            </div>
          ) : (
            <div className="space-y-3">
              <Video className="w-16 h-16 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-semibold">Upload Your Pitch Video</p>
                <p className="text-sm text-gray-600 mt-1">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  MP4, MOV, AVI up to 100MB
                </p>
              </div>
              <Button
                type="button"
                disabled={disabled}
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Video
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

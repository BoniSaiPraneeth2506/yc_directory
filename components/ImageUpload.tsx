"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  defaultValue?: string;
  name: string;
  required?: boolean;
}

export function ImageUpload({ defaultValue, name, required }: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue || "");
  const [preview, setPreview] = useState(defaultValue || "");
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setImageUrl(result);
      setShowUrlInput(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreview(url);
  };

  const clearImage = () => {
    setImageUrl("");
    setPreview("");
    setShowUrlInput(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={imageUrl} required={required} />

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={imageUrl}
              onChange={handleUrlChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none"
              placeholder="Paste image URL or drag & drop below"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors"
            title="Switch to file upload"
          >
            <ImageIcon className="size-5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!showUrlInput && !preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload
            className={`size-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-gray-400"}`}
          />
          <p className="text-lg font-semibold mb-2">
            {isDragging ? "Drop image here" : "Drag & drop your image"}
          </p>
          <p className="text-sm text-gray-500 mb-3">
            or click to browse (max 5MB)
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlInput(true);
            }}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <LinkIcon className="size-4" />
            Use URL instead
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="relative">
          <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Remove image"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="absolute top-2 left-2 p-2 bg-white border-2 border-gray-200 rounded-full hover:border-primary transition-colors shadow-lg"
            title="Change to URL"
          >
            <LinkIcon className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}

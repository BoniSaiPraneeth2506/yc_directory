"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagInput({ value, onChange, maxTags = 5 }: TagInputProps) {
  const[inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      value.length < maxTags
    ) {
      onChange([...value, trimmedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check if user typed a comma
    if (newValue.includes(",")) {
      // Extract tag before comma
      const tag = newValue.split(",")[0];
      addTag(tag);
      // Keep any text after comma (in case multiple commas)
      const remaining = newValue.split(",").slice(1).join(",");
      setInputValue(remaining);
    } else {
      setInputValue(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-primary-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length >= maxTags
              ? `Maximum ${maxTags} tags`
              : "Type tag and press comma or Enter"
          }
          disabled={value.length >= maxTags}
          className="startup-form_input"
          enterKeyHint="done"
        />
      </div>
      <p className="text-xs text-gray-500">
        {value.length}/{maxTags} tags • Use comma (,) or Enter to add
      </p>
    </div>
  );
}

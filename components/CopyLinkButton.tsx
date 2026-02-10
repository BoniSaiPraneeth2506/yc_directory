"use client";

import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface CopyLinkButtonProps {
  url?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CopyLinkButton({ 
  url, 
  variant = "outline",
  size = "default" 
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(url || "");
  
  useEffect(() => {
    // If no URL provided, use current page URL
    if (!url && typeof window !== 'undefined') {
      setFullUrl(window.location.href);
    }
  }, [url]);
  
  const handleCopy = async () => {
    try {
      const urlToCopy = fullUrl || url || window.location.href;
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };
  
  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>Copy Link</span>
        </>
      )}
    </Button>
  );
}

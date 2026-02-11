"use client";

import React, { useState, useActionState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { reelFormSchema } from "@/lib/validation";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createReel } from "@/lib/actions";
import { TagInput } from "./TagInput";
import { VideoUpload } from "./VideoUpload";

const ReelForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [videoData, setVideoData] = useState<{
    url: string;
    thumbnail?: string;
    duration?: number;
  }>({ url: "" });
  const router = useRouter();

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        videoUrl: videoData.url,
      };

      await reelFormSchema.parseAsync(formValues);

      if (!videoData.url) {
        throw new Error("Please upload a video");
      }

      const result = await createReel(prevState, formData, tags, videoData);

      if (result.status == "SUCCESS") {
        toast.success("Success", {
          description: "Your reel has been created successfully",
        });

        router.push(`/reels`);
        router.refresh();
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;

        setErrors(fieldErrors as unknown as Record<string, string>);

        toast.error("Error", {
          description: "Please check your inputs and try again",
        });

        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast.error("Error", {
        description: error instanceof Error ? error.message : "An unexpected error has occurred",
      });

      return {
        ...prevState,
        error: error instanceof Error ? error.message : "An unexpected error has occurred",
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  const handleVideoChange = (url: string, thumbnail?: string, duration?: number) => {
    setVideoData({ url, thumbnail, duration });
    // Clear video error if exists
    if (errors.videoUrl) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.videoUrl;
        return newErrors;
      });
    }
  };

  return (
    <form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Reel Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Give your pitch reel a catchy title"
        />

        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Describe your startup pitch..."
        />

        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup category (Tech, Health, Finance...)"
        />

        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label className="startup-form_label">Video Upload</label>
        <VideoUpload
          value={videoData.url}
          onChange={handleVideoChange}
          disabled={isPending}
        />
        {errors.videoUrl && (
          <p className="startup-form_error">{errors.videoUrl}</p>
        )}
        {!videoData.url && (
          <p className="text-sm text-gray-600 mt-2">
            Upload your pitch video. Maximum 100MB.
          </p>
        )}
      </div>

      <div>
        <label className="startup-form_label">Tags (Optional)</label>
        <TagInput value={tags} onChange={setTags} />
        <p className="text-sm text-gray-600 mt-2">
          Add up to 5 tags to help others discover your reel
        </p>
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending || !videoData.url}
      >
        {isPending ? "Creating..." : "Create Reel"}
        <Send className="size-6 ml-2" />
      </Button>
    </form>
  );
};

export default ReelForm;

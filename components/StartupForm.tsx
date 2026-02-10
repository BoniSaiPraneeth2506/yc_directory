"use client";

import React, { useState, useActionState, useEffect, useCallback } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "./ui/button";
import { Send, Save, Calendar } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPitch, updatePitch } from "@/lib/actions";
import { TagInput } from "./TagInput";
import { ImageUpload } from "./ImageUpload";

interface StartupFormProps {
  startup?: {
    _id: string;
    title: string;
    description: string;
    category: string;
    image: string;
    pitch: string;
    tags?: string[];
    isDraft?: boolean;
    scheduledFor?: string;
  };
}

const StartupForm = ({ startup }: StartupFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState(startup?.pitch || "");
  const [tags, setTags] = useState<string[]>(startup?.tags || []);
  const [isDraft, setIsDraft] = useState(startup?.isDraft || false);
  const [scheduledFor, setScheduledFor] = useState(startup?.scheduledFor || "");
  const [showSchedule, setShowSchedule] = useState(!!startup?.scheduledFor);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const router = useRouter();
  const isEditing = !!startup;

  // Auto-save for drafts every 30 seconds
  const autoSave = useCallback(async () => {
    if (!isEditing || !isDraft) return;

    const form = document.querySelector("form") as HTMLFormElement;
    if (!form) return;

    const formData = new FormData(form);
    
    try {
      setIsAutoSaving(true);
      
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };

      // Validate before auto-saving
      await formSchema.parseAsync(formValues);

      await updatePitch(
        {},
        formData,
        pitch,
        startup!._id,
        tags,
        true,
        scheduledFor || undefined
      );

      setLastSaved(new Date());
    } catch (error) {
      // Silently fail auto-save to not interrupt user
      console.error("Auto-save failed:", error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [isEditing, isDraft, pitch, tags, scheduledFor, startup]);

  useEffect(() => {
    if (!isEditing || !isDraft) return;

    const interval = setInterval(autoSave, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoSave, isEditing, isDraft]);

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };

      await formSchema.parseAsync(formValues);

      const result = isEditing
        ? await updatePitch(
            prevState,
            formData,
            pitch,
            startup!._id,
            tags,
            isDraft,
            scheduledFor || undefined
          )
        : await createPitch(
            prevState,
            formData,
            pitch,
            tags,
            isDraft,
            scheduledFor || undefined
          );

      if (result.status == "SUCCESS") {
        toast.success("Success", {
          description: isDraft
            ? "Your draft has been saved successfully"
            : isEditing
              ? "Your startup pitch has been updated successfully"
              : "Your startup pitch has been created successfully",
        });

        if (isDraft) {
          router.push(`/user/${(result as any).author?._ref || ""}`);
        } else {
          router.push(`/startup/${isEditing ? startup!._id : result._id}`);
        }
        router.refresh();
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErorrs = error.flatten().fieldErrors;

        setErrors(fieldErorrs as unknown as Record<string, string>);

        toast.error("Error", {
          description: "Please check your inputs and try again",
        });

        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }

      toast.error("Error", {
        description: "An unexpected error has occurred",
      });

      return {
        ...prevState,
        error: "An unexpected error has occurred",
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <form action={formAction} className="startup-form">
      {isAutoSaving && (
        <div className="mb-4 text-sm text-gray-500">
          Auto-saving draft...
        </div>
      )}
      {lastSaved && (
        <div className="mb-4 text-sm text-gray-500">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
          defaultValue={startup?.title}
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
          defaultValue={startup?.description}
          placeholder="Startup Description"
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
          defaultValue={startup?.category}
          placeholder="Startup Category (Tech, Health, Education...)"
        />

        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="tags" className="startup-form_label">
          Tags (Max 5)
        </label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div>
        <label htmlFor="link" className="startup-form_label">
          Image
        </label>
        <ImageUpload name="link" defaultValue={startup?.image} required />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>

        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      {/* Schedule Publishing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showSchedule"
            checked={showSchedule}
            onChange={(e) => {
              setShowSchedule(e.target.checked);
              if (!e.target.checked) setScheduledFor("");
            }}
            className="size-4 cursor-pointer"
          />
          <label htmlFor="showSchedule" className="startup-form_label !mb-0 flex items-center gap-2 cursor-pointer">
            <Calendar className="size-5" />
            Schedule for later
          </label>
        </div>
        
        {showSchedule && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select publish date and time:
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border-[3px] border-black px-4 py-3 text-base font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {scheduledFor && (
              <p className="text-sm text-gray-600">
                Will publish on: {new Date(scheduledFor).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Button
          type="submit"
          onClick={() => setIsDraft(false)}
          className="startup-form_btn text-white"
          disabled={isPending}
        >
          {isPending
            ? isEditing
              ? "Updating..."
              : "Publishing..."
            : isEditing
              ? "Update & Publish"
              : "Publish Your Pitch"}
          <Send className="size-6 ml-2" />
        </Button>

        <Button
          type="submit"
          onClick={() => setIsDraft(true)}
          variant="outline"
          className="startup-form_btn"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save as Draft"}
          <Save className="size-6 ml-2" />
        </Button>
      </div>
    </form>
  );
};

export default StartupForm;
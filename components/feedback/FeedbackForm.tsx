// components/feedback/FeedbackForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from '@hookform/resolvers/zod';


// Define form schema
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  path: z.string().url("Must be a valid URL"),
  type: z.string().min(1, "Please select a feedback type"),
  severity: z.string().min(1, "Please select a severity level"),
  screenshot: z.string().optional(),
});

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
  currentPath: string;
  isLoading?: boolean;
}

export default function FeedbackForm({
  open,
  onOpenChange,
  onSubmit,
  currentPath,
  isLoading = false,
}: FeedbackFormProps) {
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      path: currentPath,
      type: "",
      severity: "medium",
      screenshot: undefined,
    },
  });

  // Update path when currentPath changes
  useEffect(() => {
    form.setValue("path", currentPath);
  }, [currentPath, form]);

  // Handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Add screenshot if available
    if (screenshotBase64) {
      values.screenshot = screenshotBase64;
    }

    onSubmit(values);
  };

  // Handle taking a screenshot
  const handleTakeScreenshot = async () => {
    try {
      // This is a placeholder for screenshot functionality
      // In a real implementation, you'd use a library or API to capture the screen
      const screenshotData = await captureScreenshot();
      setScreenshotBase64(screenshotData);
    } catch (error) {
      console.error("Error taking screenshot:", error);
    }
  };

  // Mock function for capturing screenshots
  // In a real app, you'd implement a proper screenshot mechanism
  const captureScreenshot = async (): Promise<string> => {
    return new Promise((resolve) => {
      // This is just placeholder code
      // In a real implementation, you might use html2canvas or another library
      setTimeout(() => {
        // Return a placeholder base64 image
        resolve("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");
      }, 500);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Provide details about your feedback for this page.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the issue"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed explanation of your feedback"
                      className="min-h-[100px]"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Path</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormDescription>
                    URL where the issue was found
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="design">Design Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTakeScreenshot}
                className="w-full"
                disabled={isLoading}
              >
                Take Screenshot
              </Button>

              {screenshotBase64 && (
                <div className="mt-2 border rounded-md p-2">
                  <p className="text-xs text-muted-foreground mb-2">Screenshot captured</p>
                  <img
                    src={screenshotBase64}
                    alt="Screenshot"
                    className="w-full h-auto object-contain max-h-[150px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
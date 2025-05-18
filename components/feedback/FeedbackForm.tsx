"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import html2canvas from 'html2canvas';

const feedbackFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["bug", "suggestion", "content", "improvement", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  includeScreenshot: z.boolean().default(false),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => Promise<void>;
  currentPath: string;
}

export default function FeedbackForm({ 
  open, 
  onOpenChange, 
  onSubmit,
  currentPath 
}: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "bug",
      severity: "medium",
      includeScreenshot: false,
    },
  });

  const captureScreenshot = async () => {
    try {
      // Get the iframe element
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        // Capture the iframe content
        const canvas = await html2canvas(iframe.contentWindow.document.body);
        const screenshotData = canvas.toDataURL('image/png');
        setScreenshot(screenshotData);
        return screenshotData;
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
    return null;
  };

  const handleSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      let screenshotData = screenshot;
      
      if (values.includeScreenshot && !screenshotData) {
        screenshotData = await captureScreenshot();
      }
      
      await onSubmit({
        ...values,
        path: currentPath,
        screenshot: screenshotData,
      });
      
      form.reset();
      setScreenshot(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
          <DialogDescription>
            Provide details about your feedback for the current page.
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
                    <Input placeholder="Brief summary of your feedback" {...field} />
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
                      placeholder="Detailed description of your feedback" 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
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
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="content">Content Issue</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
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
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="includeScreenshot"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Include Screenshot</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        const boolValue = value === "true";
                        field.onChange(boolValue);
                        if (boolValue && !screenshot) {
                          captureScreenshot();
                        }
                      }}
                      defaultValue={field.value ? "true" : "false"}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">Yes</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="cursor-pointer">No</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Include a screenshot of the current page
                  </FormDescription>
                </FormItem>
              )}
            />
            
            {screenshot && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <img src={screenshot} alt="Screenshot" className="w-full h-auto" />
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
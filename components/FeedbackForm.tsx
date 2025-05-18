import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DrawingCanvas } from "./DrawingCanvas";
import { ShareFeedback } from "./ShareFeedback";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { toast } from "sonner";

interface FeedbackFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function FeedbackForm({ onSubmit, initialData }: FeedbackFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "bug");
  const [severity, setSeverity] = useState(initialData?.severity || "medium");
  const [drawing, setDrawing] = useState<ExcalidrawElement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        title,
        description,
        type,
        severity,
        drawing: JSON.stringify(drawing),
        path: window.location.pathname,
      };

      await onSubmit(formData);
      toast.success("Feedback submitted successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setType("bug");
      setSeverity("medium");
      setDrawing([]);
    } catch (error) {
      toast.error("Failed to submit feedback");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of the feedback"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the feedback"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Drawing</Label>
        <DrawingCanvas
          initialData={initialData?.drawing}
          onChange={setDrawing}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>

      {initialData?.id && (
        <ShareFeedback feedbackId={initialData.id} />
      )}
    </form>
  );
}
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";

interface ShareFeedbackProps {
  feedbackId: string;
}

export function ShareFeedback({ feedbackId }: ShareFeedbackProps) {
  const [email, setEmail] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbackId,
          email,
          canEdit,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share feedback");
      }

      toast.success("Feedback shared successfully");
      setEmail("");
      setCanEdit(false);
    } catch (error) {
      toast.error("Failed to share feedback");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Share Feedback</h3>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="canEdit"
          checked={canEdit}
          onCheckedChange={(checked) => setCanEdit(checked as boolean)}
        />
        <Label htmlFor="canEdit">Allow editing</Label>
      </div>
      <Button
        onClick={handleShare}
        disabled={!email || isLoading}
        className="w-full"
      >
        {isLoading ? "Sharing..." : "Share"}
      </Button>
    </div>
  );
}
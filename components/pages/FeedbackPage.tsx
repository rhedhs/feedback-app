"use client";

import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackList from "@/components/feedback/FeedbackList";
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton";
import DualPaneLayout from "@/components/layout/DualPaneLayout";
import WebsitePreview from "@/components/website-preview/WebsitePreview";
import { useFeedbackSession } from "@/contexts/FeedbackSessionContext";
import { useToast } from "@/hooks/use-toast";
import {
  createFeedback,
  generateReport,
  getFeedbackBySession,
} from "@/lib/actions";
import { Feedback } from "@/types/feedback";
import { jsPDF } from "jspdf";
import { Suspense, useEffect, useState } from "react";
import ErrorBoundary from "../ui/ErrorBoundary";
import Loading from "../ui/Loading";

export default function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("https://nextjs.org");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sessionId } = useFeedbackSession();

  // Fetch feedback items when session ID is available
  useEffect(() => {
    if (sessionId) {
      fetchFeedbackItems();
    }
  }, [sessionId]);

  // Fetch feedback items using the server action
  const fetchFeedbackItems = async () => {
    try {
      setIsLoading(true);
      const result = await getFeedbackBySession(sessionId);

      if (result.success && result.data) {
        setFeedbackItems(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feedback form submission
  const handleSubmitFeedback = async (values: any) => {
    try {
      setIsLoading(true);
      const result = await createFeedback({
        ...values,
        sessionId,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh feedback list
      fetchFeedbackItems();

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });

      // Close the form after successful submission
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feedback item click
  const handleFeedbackItemClick = (item: Feedback) => {
    // Navigate to the path in the iframe
    if (item.path && (window as any).navigateToPath) {
      (window as any).navigateToPath(item.path);
    }

    // Set current path
    setCurrentPath(item.path);
  };

  // Generate PDF report
  const generatePdfReport = async () => {
    try {
      setIsLoading(true);

      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text("Website Feedback Report", 20, 20);

      // Add session info
      doc.setFontSize(12);
      doc.text(`Session ID: ${sessionId}`, 20, 30);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);
      doc.text(`Total Feedback Items: ${feedbackItems.length}`, 20, 50);

      // Add feedback items
      let yPos = 70;

      feedbackItems.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.text(`${index + 1}. ${item.title}`, 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.text(
          `Type: ${item.type} | Severity: ${item.severity} | Path: ${item.path}`,
          20,
          yPos
        );
        yPos += 10;

        doc.setFontSize(12);
        // Split long descriptions into multiple lines
        const descLines = doc.splitTextToSize(item.description, 170);
        doc.text(descLines, 20, yPos);
        yPos += descLines.length * 7 + 10;

        // Add screenshot if available
        if (item.screenshot) {
          try {
            doc.addImage(item.screenshot, "PNG", 20, yPos, 170, 100);
            yPos += 110;
          } catch (e) {
            console.error("Error adding image:", e);
          }
        }

        // Add separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 15;
      });

      // Save the PDF
      doc.save(`feedback-report-${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "Success",
        description: "PDF report generated successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate JSON report
  const generateJsonReport = async () => {
    try {
      setIsLoading(true);
      const result = await generateReport(sessionId, "json");

      if (!result.success) {
        throw new Error(result.error);
      }

      // Create blob and download link
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `feedback-report-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "JSON report downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating JSON report:", error);
      toast({
        title: "Error",
        description: "Failed to generate JSON report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    if (feedbackItems.length === 0) {
      toast({
        title: "No Feedback",
        description: "There are no feedback items to include in a report",
        variant: "destructive",
      });
      return;
    }

    // Ask which format to generate
    if (confirm("Generate report as PDF? Click Cancel for JSON format.")) {
      generatePdfReport();
    } else {
      generateJsonReport();
    }
  };

  return (
    <ErrorBoundary
      fallback={
        <div className="p-4">Something went wrong with the feedback tool</div>
      }
    >
      <main className="min-h-screen bg-background">
        <DualPaneLayout
          leftPane={
            <Suspense fallback={<Loading />}>
              <WebsitePreview />
            </Suspense>
          }
          rightPane={
            <Suspense fallback={<Loading />}>
              <FeedbackList
                items={feedbackItems}
                onItemClick={handleFeedbackItemClick}
                onGenerateReport={handleGenerateReport}
                isLoading={isLoading}
              />
            </Suspense>
          }
        />

        <FloatingFeedbackButton onClick={() => setIsFormOpen(true)} />

        <FeedbackForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmitFeedback}
          currentPath={currentPath}
          isLoading={isLoading}
        />
      </main>
    </ErrorBoundary>
  );
}

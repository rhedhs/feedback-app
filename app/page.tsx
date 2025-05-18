"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import DualPaneLayout from "@/components/layout/DualPaneLayout";
import WebsitePreview from "@/components/website-preview/WebsitePreview";
import FeedbackList from "@/components/feedback/FeedbackList";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FloatingFeedbackButton from "@/components/feedback/FloatingFeedbackButton";
import { useToast } from "@/hooks/use-toast";
import { Feedback } from "@/types/feedback";
import { jsPDF } from "jspdf";

export default function Home() {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("https://nextjs.org");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const { toast } = useToast();

  // Initialize session ID
  useEffect(() => {
    // Check for existing session ID in localStorage
    const existingSessionId = localStorage.getItem("feedbackSessionId");
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      // Create new session ID
      const newSessionId = uuidv4();
      localStorage.setItem("feedbackSessionId", newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Fetch feedback items when session ID is available
  useEffect(() => {
    if (sessionId) {
      fetchFeedbackItems();
    }
  }, [sessionId]);

  // Fetch feedback items from the API
  const fetchFeedbackItems = async () => {
    try {
      const response = await fetch(`/api/feedback?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch feedback");
      const data = await response.json();
      setFeedbackItems(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback items",
        variant: "destructive",
      });
    }
  };

  // Handle feedback form submission
  const handleSubmitFeedback = async (values: any) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      // Refresh feedback list
      fetchFeedbackItems();

      toast({
        title: "Success",
        description: "Feedback submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  // Handle feedback item click
  const handleFeedbackItemClick = (item: Feedback) => {
    // Navigate to the path in the iframe
    if (item.path && window.navigateToPath) {
      window.navigateToPath(item.path);
    }

    // Set current path
    setCurrentPath(item.path);
  };

  // Generate PDF report
  const generatePdfReport = async () => {
    try {
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
    }
  };

  // Generate JSON report
  const generateJsonReport = async () => {
    try {
      const response = await fetch(
        `/api/reports?sessionId=${sessionId}&format=json`
      );
      if (!response.ok) throw new Error("Failed to generate report");

      const data = await response.json();

      // Create blob and download link
      const blob = new Blob([JSON.stringify(data, null, 2)], {
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
    <main className="min-h-screen bg-background">
      <DualPaneLayout
        leftPane={<WebsitePreview />}
        rightPane={
          <FeedbackList
            items={feedbackItems}
            onItemClick={handleFeedbackItemClick}
            onGenerateReport={handleGenerateReport}
          />
        }
      />

      <FloatingFeedbackButton onClick={() => setIsFormOpen(true)} />

      <FeedbackForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitFeedback}
        currentPath={currentPath}
      />
    </main>
  );
}

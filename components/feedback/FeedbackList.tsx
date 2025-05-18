"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { Bug, Lightbulb, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/types/feedback';

interface FeedbackListProps {
  items: Feedback[];
  onItemClick: (item: Feedback) => void;
  onGenerateReport: () => void;
}

// Map feedback types to icons
const typeIcons: Record<string, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  suggestion: <Lightbulb className="h-4 w-4" />,
  content: <FileText className="h-4 w-4" />,
  improvement: <CheckCircle2 className="h-4 w-4" />,
  other: <AlertTriangle className="h-4 w-4" />
};

// Map severity to colors
const severityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

export default function FeedbackList({ items, onItemClick, onGenerateReport }: FeedbackListProps) {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>(items);

  useEffect(() => {
    setFeedbackItems(items);
  }, [items]);

  if (feedbackItems.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-2">Feedback</h2>
          <p className="text-sm text-muted-foreground">No feedback items yet.</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-3">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">No feedback yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Click the "Add Feedback" button to report an issue or suggest an improvement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Feedback ({feedbackItems.length})</h2>
        <Button onClick={onGenerateReport} variant="outline" size="sm">
          Generate Report
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {feedbackItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onItemClick(item)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge 
                    variant="outline"
                    className={severityColors[item.severity]}
                  >
                    {item.severity}
                  </Badge>
                </div>
                <CardDescription className="truncate text-xs">
                  {item.path}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-2">{item.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="mr-2 flex items-center">
                    {typeIcons[item.type] || typeIcons.other}
                    <span className="ml-1 capitalize">{item.type}</span>
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
// components/feedback/FeedbackList.tsx
import { Feedback } from "@/types/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedbackListProps {
  items: Feedback[];
  onItemClick: (item: Feedback) => void;
  onGenerateReport: () => void;
  isLoading?: boolean;
}

export default function FeedbackList({
  items,
  onItemClick,
  onGenerateReport,
  isLoading = false,
}: FeedbackListProps) {
  // Helper to format date strings
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Helper to get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Feedback Items</CardTitle>
        <CardDescription>
          Click on an item to navigate to the page
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full px-4">
          {isLoading ? (
            // Loading state
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card
                  key={`skeleton-${i}`}
                  className="mb-4 cursor-pointer"
                >
                  <CardHeader className="p-4 pb-0">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </CardFooter>
                </Card>
              ))
          ) : items.length > 0 ? (
            // Feedback items
            items.map((item) => (
              <Card
                key={item.id}
                className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onItemClick(item)}
              >
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="truncate">
                    {item.path}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm line-clamp-3">{item.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <Badge variant={getSeverityColor(item.severity)}>
                    {item.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </CardFooter>
              </Card>
            ))
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <p className="text-muted-foreground mb-2">
                No feedback items yet
              </p>
              <p className="text-xs text-muted-foreground">
                Click the "+" button to add feedback
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t bg-card">
        <Button
          onClick={onGenerateReport}
          className="w-full"
          disabled={items.length === 0 || isLoading}
        >
          Generate Report
        </Button>
      </CardFooter>
    </Card>
  );
}

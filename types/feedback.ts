export interface Feedback {
  id: string;
  title: string;
  description: string;
  path: string;
  type: string;
  severity: string;
  screenshot?: string | null;
  createdAt: string | Date;
  userId?: string | null;
  sessionId: string;
}
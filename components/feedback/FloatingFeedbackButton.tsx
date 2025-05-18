"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingFeedbackButtonProps {
  onClick: () => void;
}

export default function FloatingFeedbackButton({ onClick }: FloatingFeedbackButtonProps) {
  return (
    <motion.div
      className="fixed bottom-8 left-8 z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Button 
        onClick={onClick} 
        size="lg" 
        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Feedback
      </Button>
    </motion.div>
  );
}
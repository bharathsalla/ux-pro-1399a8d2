import { motion } from "framer-motion";
import CommentsWidget from "@/components/feedback/CommentsWidget";
import HeaderProfile from "@/components/auth/HeaderProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TestimonialsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HeaderProfile />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to App
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Testimonials & Feedback
          </h1>
          <p className="text-muted-foreground">
            Real feedback from real users — see what our community thinks about UX Pro.
          </p>
        </motion.div>
        <CommentsWidget />
      </div>
    </div>
  );
}

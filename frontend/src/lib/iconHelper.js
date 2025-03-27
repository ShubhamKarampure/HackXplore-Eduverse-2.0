import { BookOpen, Video, FileText, PenTool, CheckCircle2 } from "lucide-react";

export const getContentTypeIcon = (type) => {
  const iconMap = {
    video: <Video className="w-5 h-5" />,
    text: <FileText className="w-5 h-5" />,
    assignment: <PenTool className="w-5 h-5" />,
    quiz: <CheckCircle2 className="w-5 h-5" />,
  };
  return iconMap[type] || <BookOpen className="w-5 h-5" />;
};

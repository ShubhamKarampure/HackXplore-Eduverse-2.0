import React from 'react';
import { 
  FileText, 
  Plus,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import Button from '../../ui/button/Button';
import { useRouter } from 'next/navigation';

const QuizSection = ({ 
  quizData, 
  moduleId,
  courseId,
  isTeacher,
}) => {
  const router = useRouter();

  const handleViewQuiz = () => {
    // Redirect to quiz view page
    router.push(`/quiz/view/${moduleId}?courseId=${courseId}`);
  };

  const handleEditQuiz = () => {
    // Redirect to quiz edit page
    router.push(`/quiz/edit/${moduleId}?courseId=${courseId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-6 h-6 mr-3 text-purple-500" />
          Module Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isTeacher ?
          ( quizData?.questions?.length > 0 ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={handleViewQuiz}
            >
              <Edit className="mr-2 w-4 h-4" /> View Quiz
            </Button>
          ) : (
            <p className="text-gray-500">No quiz available for this module.</p>
             
          )) :
          (
            <div className="space-y-4">
          {quizData?.questions?.length > 0 ? (
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={handleEditQuiz}
            >
               <Edit className="mr-2 w-4 h-4" /> Edit Quiz
            </Button>
          ) : (
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={handleEditQuiz}
            >
              <Plus className="mr-2 w-4 h-4" /> Create Quiz
            </Button>
          )}
        </div>
          )
        }
        
      </CardContent>
    </Card>
  );
};

export default QuizSection;
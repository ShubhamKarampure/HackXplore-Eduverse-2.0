import API_ROUTES from './route';
import useUserStore from '@/store/userStore';

// Utility function to get authentication headers
const getAuthHeaders = () => {
  const token = useUserStore.getState().token;
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Create a new quiz for a module
export async function createQuiz(moduleId, quizData) {
  try {
    const response = await fetch(API_ROUTES.QUIZ.CREATE(moduleId), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not create quiz');
    }

    return data;
  } catch (error) {
    console.error('Quiz creation error:', error);
    throw error;
  }
}

// Get a quiz by module ID
export async function getQuizByModuleId(moduleId) {
  try {
    const response = await fetch(`${API_ROUTES.QUIZ.GET}/${moduleId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Quiz retrieval error:', error);
    throw error;
  }
}

// generate quiz 
export async function generateQuiz(quizConfig) {
  try {
    const response = await fetch(API_ROUTES.QUIZ.GENERATE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(quizConfig),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Quiz creation error:", error);
    throw error;
  }
}


// Update a quiz
export async function updateQuiz(quizId, quizData) {
  try {
    const response = await fetch(`${API_ROUTES.QUIZ.UPDATE}/${quizId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData)
    });

    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.message || 'Could not update quiz');
    }

    return data;
  } catch (error) {
    console.error('Quiz update error:', error);
    throw error;
  }
}

// Delete a quiz
export async function deleteQuiz(quizId) {
  try {
    const response = await fetch(API_ROUTES.QUIZ.DELETE(quizId), {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not delete quiz');
    }

    return data;
  } catch (error) {
    console.error('Quiz deletion error:', error);
    throw error;
  }
}
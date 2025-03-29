import API_ROUTES from './route';
import useUserStore from '@/store/userStore';
import axiosInstance from '@/lib/axiosInstance';

// Create a new quiz for a module
export async function createQuiz(moduleId, quizData) {
  try {
    const response = await axiosInstance.post(
      API_ROUTES.QUIZ.CREATE(moduleId),
      quizData,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error('Quiz creation error:', error);
    throw error.response?.data || error;
  }
}

// Get a quiz by module ID
export async function getQuizByModuleId(moduleId) {
  try {
    const response = await axiosInstance.get(
      `${API_ROUTES.QUIZ.GET}/${moduleId}`,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error('Quiz retrieval error:', error);
    throw error.response?.data || error;
  }
}

// Generate quiz
export async function genearteQuiz(quizConfig) {
  try {
    const response = await axiosInstance.post(
      API_ROUTES.QUIZ.GENERATE,
      quizConfig,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error.response?.data || error;
  }
}

// Update a quiz
export async function updateQuiz(quizId, quizData) {
  try {
    const response = await axiosInstance.put(
      `${API_ROUTES.QUIZ.UPDATE}/${quizId}`,
      quizData,
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error('Quiz update error:', error);
    throw error.response?.data || error;
  }
}

// Delete a quiz
export async function deleteQuiz(quizId) {
  try {
    const response = await axiosInstance.delete(
      API_ROUTES.QUIZ.DELETE(quizId),
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error('Quiz deletion error:', error);
    throw error.response?.data || error;
  }
}

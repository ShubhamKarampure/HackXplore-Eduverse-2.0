const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const API_ROUTES = {
  AUTH: {
    ME: `${BACKEND_URL}/current-user`,
    REGISTER: `${BACKEND_URL}/signup`,
    LOGIN: `${BACKEND_URL}/login`,
    LOGOUT: `${BACKEND_URL}/api/auth/logout`,
    GOOGLE_LOGIN: `${BACKEND_URL}/auth/google`,
    CREATE_PROFILE: `${BACKEND_URL}/create-profile`,
  },
  COURSE: {
    CREATE: `${BACKEND_URL}/course/`,
    ALL: `${BACKEND_URL}/course/`,
    MY: `${BACKEND_URL}/course/my-courses`,
    DETAILS: (courseId) => `${BACKEND_URL}/course/${courseId}`,
    ENROLL: `${BACKEND_URL}/course/student/enroll`,
  },
  MODULE: {
    CREATE: `${BACKEND_URL}/modules`,
    GET_ALL: `${BACKEND_URL}/modules`,
    GET_BY_ID: (moduleId) => `${BACKEND_URL}/modules/${moduleId}`,
    UPDATE: (moduleId) => `${BACKEND_URL}/modules/${moduleId}`,
    DELETE: (moduleId) => `${BACKEND_URL}/modules/${moduleId}`,
    GENERATE: (courseId) => `${BACKEND_URL}/modules/generate/${courseId}`,
  },
  QUIZ: {
    CREATE: (moduleId) => `${BACKEND_URL}/quiz/${moduleId}`,
    GET: (moduleId) => `${BACKEND_URL}/quiz/${moduleId}`,
    UPDATE: (quizId) => `${BACKEND_URL}/quiz/${quizId}`,
    DELETE: (quizId) => `${BACKEND_URL}/quiz/${quizId}`,
    GENERATE: `${BACKEND_URL}/quiz/generate`,
  },
  DOCUMENT: {
    CREATE: `${BACKEND_URL}/documents`,
    MY: `${BACKEND_URL}/documents`,
    ADD_COLLABORATOR: `${BACKEND_URL}/documents/share`,
  },
  USER: {
    SHARE_LIST: `${BACKEND_URL}/share-list`,
  },
  PROGRESS: {
    UPDATE_QUIZ: `${BACKEND_URL}/progress/updateQuiz`,
  },
};

export default API_ROUTES;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const API_ROUTES = {
    AUTH: {
        ME:`${BACKEND_URL}/current-user`,
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
        DETAILS: `${BACKEND_URL}/course`,
        ENROLL: `${BACKEND_URL}/course/student/enroll`
    },
    MODULE: {
    // Modules CRUD Routes
    CREATE: `${BACKEND_URL}/modules`,
    GET_ALL: `${BACKEND_URL}/modules`,
    GET_BY_ID: `${BACKEND_URL}/modules`,
    UPDATE:  `${BACKEND_URL}/modules`,
    DELETE: `${BACKEND_URL}/modules`,
    // Special route for AI-generated modules
    GENERATE: `${BACKEND_URL}/modules/generate`
    },
    QUIZ: {
    // Modules CRUD Routes
    GET: `${BACKEND_URL}/quiz`,
    UPDATE:`${BACKEND_URL}/quiz`,
    GENERATE: `${BACKEND_URL}/quiz/generate`
    },
    DOCUMENT: {
        CREATE: `${BACKEND_URL}/documents`,
        MY: `${BACKEND_URL}/documents`,
        ADD_COLLABORATOR: (documentId) => `${BACKEND_URL}/documents/${documentId}/collaborators`,
    },

    USER: {
        SHARE_LIST: `${BACKEND_URL}/share-list`,
     }

};

export default API_ROUTES;

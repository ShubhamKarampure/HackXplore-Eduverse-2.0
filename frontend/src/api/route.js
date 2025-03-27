const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const API_ROUTES = {
    AUTH: {
        REGISTER: `${BACKEND_URL}/signup`,
        LOGIN: `${BACKEND_URL}/login`,
        LOGOUT: `${BACKEND_URL}/api/auth/logout`,
        GOOGLE_LOGIN: `${BACKEND_URL}/auth/google`,
        CREATE_PROFILE: `${BACKEND_URL}/create-profile`,
    },
    COURSE: {
        ALL: `${BACKEND_URL}/student/course/`,
        ENROLLED: `${BACKEND_URL}/student/course/enrolled`,
        ENROLL: `${BACKEND_URL}/student/course/enroll`
    }
};

/*
export const host = "http://localhost:4000/api/v1/user"
export const signupRoute = `${host}/signup`
export const loginRoute = `${host}/login`
export const getAllCoursesByBranchRoute = `${host}/student/course/`
export const getAllCoursesByInstructor = `${host}/teacher/course/`
export const quizRoute = `${host}/teacher/course/get-course`
export const studentCourseEnrollment = `${host}/student/course`
export const getAssignments = `${host}/assignments`
export const submitAssignment = `${host}/student/assignment`
export const submitQuiz = `${host}/student/quiz`
export const gradeAssignment = `${host}/teacher/assignment`
export const generateRoadmap = `${host}/teacher/course/roadmap`

export const flaskApi = 'http://localhost:5000'
*/

export default API_ROUTES;

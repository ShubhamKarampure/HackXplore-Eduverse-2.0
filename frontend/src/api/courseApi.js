import API_ROUTES from "./route";
import useUserStore from "@/store/userStore";

const getAuthHeaders = (isFormData = false) => {
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

export async function createCourse(formData) {
  try {
    const response = await fetch(API_ROUTES.COURSE.CREATE, {
      method: "POST",
      headers: getAuthHeaders(true), // Indicate this is FormData
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Could not create course");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getAllCourses() {
  try {
    const response = await fetch(API_ROUTES.COURSE.ALL, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Could not fetch courses");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getMyCourses() {
  try {
    const response = await fetch(API_ROUTES.COURSE.MY, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Could not fetch courses");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getCourseDetails(courseId) {
  try {
    // CLEAN: Calling the route as a function
    const response = await fetch(API_ROUTES.COURSE.DETAILS(courseId), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    localStorage.setItem("courseDetails", JSON.stringify(data));
    if (!response.ok) {
      throw new Error(data.message || "Could not fetch course details");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function enrollCourse(course_id, enroll_key) {
  try {
    const response = await fetch(API_ROUTES.COURSE.ENROLL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ courseId: course_id, enrollKey: enroll_key }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Enrollment failed");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

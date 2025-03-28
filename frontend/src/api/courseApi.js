import API_ROUTES from './route';
import useUserStore from '@/store/userStore';


export async function createCourse(formData) {
  console.log(formData)
  try {
    const response = await fetch(API_ROUTES.COURSE.CREATE, {  
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useUserStore.getState().token}`,
      },
      body: formData, 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not create course');
    }
    
    return data;
  } catch (error) {
    throw error;
  } 
}


export async function getAllCourses() {
  try {   
    const response = await fetch(API_ROUTES.COURSE.ALL, {  
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore.getState().token}`,
     
      }
    });

    const data = await response.json();
    console.log(data)
   if (!response.ok) {
      throw new Error(data.message || 'Could not fetch courses');
    }
    return data;
  } catch (error) {
    throw error;
  } 
}

export async function getMyCourses() {
  try {   
    const response = await fetch(API_ROUTES.COURSE.MY, {  
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore.getState().token}`,
     
      }
    });

    const data = await response.json();
    console.log(data)
   if (!response.ok) {
      throw new Error(data.message || 'Could not fetch courses');
    }
    return data;
  } catch (error) {
    throw error;
  } 
}

export async function getCourseDetails(courseId) {
  try {   
    const response = await fetch( `${API_ROUTES.COURSE.DETAILS}/${courseId}`, {  
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore.getState().token}`,
     
      }
    });

    const data = await response.json();
    console.log(data)
   if (!response.ok) {
      throw new Error(data.message || 'Could not fetch courses');
    }
    return data;
  } catch (error) {
    throw error;
  } 
}

  export async function enrollCourse(course_id, enroll_key) {
    try {
    
      const response = await fetch(API_ROUTES.COURSE.ENROLL, {  
        method: 'POST',
        headers: {
           'Content-Type': 'application/json',
        'Authorization': `Bearer ${useUserStore.getState().token}`,
      },
        body: JSON.stringify({ courseId: course_id, enrollKey: enroll_key }),

      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Enrollment failed');
      }
      return data;
    } catch (error) {
      throw error;
    } 
  }
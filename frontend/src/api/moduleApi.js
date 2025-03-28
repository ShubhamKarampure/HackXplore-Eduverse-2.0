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

// Create a new module
export async function createModule(moduleData) {
  try {
    const response = await fetch(API_ROUTES.MODULE.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(moduleData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not create module');
    }

    return data;
  } catch (error) {
    console.error('Module creation error:', error);
    throw error;
  }
}

// Update a module
export async function updateModule(moduleId, moduleData) {
  try {
    const response = await fetch(API_ROUTES.MODULE.UPDATE(moduleId), {
      method: 'PUT', // Using PUT for full update, can change to PATCH for partial update
      headers: getAuthHeaders(),
      body: JSON.stringify(moduleData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not update module');
    }

    return data;
  } catch (error) {
    console.error('Module update error:', error);
    throw error;
  }
}

// Delete a module
export async function deleteModule(moduleId) {
  try {
    const response = await fetch(API_ROUTES.MODULE.DELETE(moduleId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Could not delete module');
    }

    return data;
  } catch (error) {
    console.error('Module deletion error:', error);
    throw error;
  }
}

// Generate modules for a course
export async function generateModules(courseId){
  try {   
    const response = await fetch(`${API_ROUTES.MODULE.GENERATE}/${courseId}`, {  
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();
   
    if (!response.ok) {
      throw new Error(data.message || 'Could not generate modules');
    }

    // Assuming the API returns modules under the 'module' key
    return data.module || data.modules;
  } catch (error) {
    console.error('Module generation error:', error);
    throw error;
  } 
}
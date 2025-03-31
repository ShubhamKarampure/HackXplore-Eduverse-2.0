import useUserStore from '@/store/userStore';
import API_ROUTES from './route';

export async function registerUser(userData) {
  const login = useUserStore.getState().login;
  
  try {  
    const response = await fetch(API_ROUTES.AUTH.REGISTER, {  // Using API_ROUTES
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log(data)
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    await login(data.user, data.token, data.onboardingRequired);
    return data;
  } catch (error) {
    throw error;
  } 
}

export async function loginUser(credentials) {
  const login = useUserStore.getState().login;
  
  try {
   
    const response = await fetch(API_ROUTES.AUTH.LOGIN, {  // Using API_ROUTES
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log(data)
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    console.log(data)
    await login(data.user, data.token, data.onboardingRequired);
    return data;
  } catch (error) {
    throw error;
  } 
}


export async function googleloginUser(credentials) {
  const login = useUserStore.getState().login;
  
  try {  
    const response = await fetch(API_ROUTES.AUTH.GOOGLE_LOGIN, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log(data)
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    await login(data.user, data.token, data.onboardingRequired);
    
    return data;
  } catch (error) {
    console.log(error.message)
    throw error;
  } 
}

export async function createUserProfile(formData) { // Accept formData as argument
    const onboarding = useUserStore.getState().completeOnboarding;
    const update = useUserStore.getState().updateUser;
    const token = useUserStore.getState().token; // Get token

    if (!token) {
        console.error("No auth token found for createUserProfile");
        throw new Error("Authentication required."); // Or handle appropriately
    }

    try {
        const response = await fetch(`${API_ROUTES.AUTH.CREATE_PROFILE}`, { // Use your actual endpoint
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData, // Send the FormData object directly
        });

        const responseData = await response.json(); // Always try to parse JSON response

        if (!response.ok) {
            // Use the message from the backend response if available
            throw new Error(responseData.message || `Profile Update failed (${response.status})`);
        }

        // Assuming backend returns the updated user data upon success
        await update(responseData); // Update zustand store
        await onboarding(); // Mark onboarding as complete
        return { success: true, data: responseData }; // Return success and data

    } catch (error) {
        console.error('Error in createUserProfile API call:', error);
        // Rethrow the error so the component's catch block can handle it
        // Ensure it's an Error object for consistent handling
        throw error instanceof Error ? error : new Error(error.message || 'An unknown error occurred during profile creation');
    }
}

export async function logoutUser() {
  const logout = useUserStore.getState().logout;
  
  try {  
    const response = await fetch(`${API_ROUTES.AUTH.LOGOUT}`, { // Using API_ROUTES
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useUserStore.getState().token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Logout failed');
    }

    await logout();
    return { success: true };
  } catch (error) {
    throw error;
  }
}




export const getCurrentUser = async () => {

  try {
    const response = await fetch(`${API_ROUTES.AUTH.ME}`, {  
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${useUserStore.getState().token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.user; // Return the user object
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};
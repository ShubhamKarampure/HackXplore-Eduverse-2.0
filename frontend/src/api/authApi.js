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

export async function createUserProfile(profile) {
  const onboarding = useUserStore.getState().completeOnboarding;
  const update = useUserStore.getState().updateUser;
  
  try {
    const response = await fetch(`${API_ROUTES.AUTH.CREATE_PROFILE}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${useUserStore.getState().token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(profile),
});

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Profile Creation failed');
    }
    
    const data = await response.json();
   await update(data)
    await onboarding();
    return { success: true };
  } catch (error) {
    throw error;
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


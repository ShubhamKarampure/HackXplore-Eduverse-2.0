import useUserStore from "@/store/userStore";
import API_ROUTES from "./route";

export async function registerUser(userData) {
  const login = useUserStore.getState().login;
  try {
    const response = await fetch(API_ROUTES.AUTH.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
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
    const response = await fetch(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    await login(data.user, data.token, data.onboardingRequired);
    return data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export async function createUserProfile(formData) {
  const onboarding = useUserStore.getState().completeOnboarding;
  const update = useUserStore.getState().updateUser;
  const token = useUserStore.getState().token;

  if (!token) {
    throw new Error("Authentication required.");
  }

  try {
    const response = await fetch(API_ROUTES.AUTH.CREATE_PROFILE, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(
        responseData.message || `Profile Update failed (${response.status})`
      );
    }

    await update(responseData);
    await onboarding();
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error in createUserProfile API call:", error);
    throw error instanceof Error
      ? error
      : new Error(
          error.message || "An unknown error occurred during profile creation"
        );
  }
}

export async function logoutUser() {
  const logout = useUserStore.getState().logout;

  try {
    const response = await fetch(API_ROUTES.AUTH.LOGOUT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Logout failed");
    }

    await logout();
    return { success: true };
  } catch (error) {
    throw error;
  }
}

export async function getShareableUsersApi() {
  try {
    const response = await fetch(API_ROUTES.USER.SHARE_LIST, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data.message || `Could not fetch users (Status: ${response.status})`
      );
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error("API Error (getShareableUsersApi):", error);
    throw error;
  }
}

import API_ROUTES from "./route";
import useUserStore from "../store/userStore";

const getAuthHeaders = () => {
  const token = useUserStore.getState().token;
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export async function createDocumentApi(name, type = "text") {
  try {
    const response = await fetch(API_ROUTES.DOCUMENT.CREATE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: name || "Untitled Document",
        type: type,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(
        data.message || `Could not create document (Status: ${response.status})`
      );
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    console.error("API Error (createDocumentApi):", error);
    throw error;
  }
}

export async function getMyDocumentsApi() {
  try {
    const response = await fetch(API_ROUTES.DOCUMENT.MY, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${useUserStore.getState().token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(
        data.message || `Could not fetch documents (Status: ${response.status})`
      );
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    console.error("API Error (getMyDocumentsApi):", error);
    throw error;
  }
}

export async function addCollaboratorApi(documentId, userIdToAdd) {
  try {
    const response = await fetch(API_ROUTES.DOCUMENT.ADD_COLLABORATOR, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        documentId: documentId,
        userIdToAdd: userIdToAdd,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(
        data.message ||
          `Could not add collaborator (Status: ${response.status})`
      );
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    console.error("API Error (addCollaboratorApi):", error);
    throw error;
  }
}

// api/documentApi.js
import API_ROUTES from './route';
import useUserStore from '../store/userStore';

export async function createDocumentApi(name) {
    try {
        const response = await fetch(API_ROUTES.DOCUMENT.CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Sending JSON body
                'Authorization': `Bearer ${useUserStore.getState().token}`,
            },
            body: JSON.stringify({ name: name || 'Untitled Document' }), // Send name in JSON body
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || `Could not create document (Status: ${response.status})`);
            error.status = response.status;
            throw error;
        }

        return data; // Returns the newly created document object
    } catch (error) {
        console.error("API Error (createDocumentApi):", error);
        throw error;
    }
}

export async function getMyDocumentsApi() {
    try {
        const response = await fetch(API_ROUTES.DOCUMENT.MY, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${useUserStore.getState().token}`,
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || `Could not fetch documents (Status: ${response.status})`);
            error.status = response.status;
            throw error;
        }

        return data; // Returns array of document objects
    } catch (error) {
        console.error("API Error (getMyDocumentsApi):", error);
        throw error;
    }
}

export async function addCollaboratorApi(documentId, userIdToAdd) {
    const url = API_ROUTES.DOCUMENT.ADD_COLLABORATOR(documentId);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${useUserStore.getState().token}`,
            },
            body: JSON.stringify({ userId: userIdToAdd }), 
        });

        const data = await response.json();

        if (!response.ok) {
             const error = new Error(data.message || `Could not add collaborator (Status: ${response.status})`);
             error.status = response.status;
             throw error;
        }

        return data; 
    } catch (error) {
        console.error("API Error (addCollaboratorApi):", error);
        throw error;
    }
}
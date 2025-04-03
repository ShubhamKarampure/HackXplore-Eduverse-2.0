"use client"
// pages/room/index.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';
import { getMyDocumentsApi,createDocumentApi } from '@/api/documentApi';

export default function RoomDashboard() {
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newDocName, setNewDocName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    
    useEffect(() => {
       
        setIsLoading(true);
        setError(null);
        
        getMyDocumentsApi()
            .then(data => {
                setDocuments(data || []);
            })
            .catch(err => {
                console.error("Failed to fetch documents:", err);
                setError(err.message || "Could not load documents.");
                setDocuments([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleCreateDocument = async (e) => {
         e.preventDefault();
         if (!newDocName.trim() || isCreating) return;

         setIsCreating(true);
         setError(null);
         try {
           
             const newDoc = await createDocumentApi(newDocName);
             router.push(`/room/${newDoc._id}`);
         } catch (err) {
             console.error("Failed to create document:", err);
             setError(err.message || "Could not create document.");
             setIsCreating(false);
         }
     };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Collaborative Documents</h1>
            <form onSubmit={handleCreateDocument} style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="Enter new document name..."
                    disabled={isCreating}
                    required
                    style={{ marginRight: '10px' }}
                />
                <button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Document'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <h2>Your Documents</h2>
            {isLoading ? (
                <p>Loading your documents...</p>
            ) : documents.length === 0 && !error ? (
                 <p>You haven't created or joined any documents yet.</p>
             ) : documents.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {documents.map((doc) => (
                        <li key={doc._id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}>
                            <Link href={`/room/${doc._id}`} legacyBehavior>
                                <a style={{ fontWeight: 'bold', textDecoration: 'none', color: 'blue' }}>
                                    {doc.name || 'Untitled Document'}
                                </a>
                            </Link>
                            <div style={{ fontSize: '0.9em', color: '#555' }}>
                                Created: {new Date(doc.createdAt).toLocaleDateString()} |
                                Last Updated: {new Date(doc.updatedAt).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
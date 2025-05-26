// components/collab/ShareFeature.js
import React, { useState, useCallback, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { getShareableUsersApi } from '@/api/authApi';
import { addCollaboratorApi } from '@/api/documentApi';

export default function ShareFeature({ documentId, onClose }) {
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [addStatus, setAddStatus] = useState({});
    
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setError(null);
        setAddStatus({});
        try {
            const fetchedUsers = await getShareableUsersApi();
            setUsers(fetchedUsers || []);
        } catch (err) {
            setError(err.message || "Failed to load users.");
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    // Fetch users when component mounts
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddCollaborator = async (userIdToAdd) => {
        setAddStatus(prev => ({ ...prev, [userIdToAdd]: { status: 'adding' } }));
        setError(null);
        try {
            const result = await addCollaboratorApi(documentId, userIdToAdd);
            setAddStatus(prev => ({ ...prev, [userIdToAdd]: { status: 'added', message: result.message || 'Added successfully' } }));
        } catch (err) {
            setAddStatus(prev => ({ ...prev, [userIdToAdd]: { status: 'error', message: err.message || 'Failed to add' } }));
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-100 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Share Document</h2>
                    <button 
                        onClick={onClose} 
                        className="p-1 hover:bg-gray-100 rounded-full"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <div className="mb-4">
                    <p className="text-gray-600 text-sm">Select users to share this document with:</p>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                    {isLoadingUsers ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                            No users available to share with.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {users.map(user => {
                                const currentStatus = addStatus[user._id] || {};
                                const isDisabled = currentStatus.status === 'adding' || currentStatus.status === 'added';
                                
                                return (
                                    <li key={user._id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img 
                                                    className="h-10 w-10 rounded-full" 
                                                    src={user.profile?.image?.url || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
                                                    alt={`${user.firstName} ${user.lastName}`}
                                                />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                {currentStatus.message && (
                                                    <p className={`text-xs ${currentStatus.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                                        {currentStatus.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddCollaborator(user._id)}
                                            disabled={isDisabled}
                                            className={`px-3 py-1.5 text-sm rounded-md ${
                                                currentStatus.status === 'added'
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : currentStatus.status === 'error'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {currentStatus.status === 'adding' ? (
                                                <span className="flex items-center">
                                                    <Loader2 className="animate-spin h-3 w-3 mr-1" />
                                                    Adding...
                                                </span>
                                            ) : currentStatus.status === 'added' ? (
                                                <span className="flex items-center">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Added
                                                </span>
                                            ) : (
                                                'Add'
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
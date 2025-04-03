// components/ShareFeature.js
import React, { useState, useCallback } from 'react';
import { getShareableUsersApi } from '@/api/authApi';
import { addCollaboratorApi } from '@/api/documentApi'; // Adjust path

export default function ShareFeature({ documentId }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState(null);
    const [addStatus, setAddStatus] = useState({}); // { userId: { status: '...', message: '...' } }

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

    const openModal = () => { setIsModalOpen(true); fetchUsers(); };
    const closeModal = () => { setIsModalOpen(false); /* Reset states if needed */ };

    const handleAddCollaborator = async (userIdToAdd) => {
         setAddStatus(prev => ({ ...prev, [userIdToAdd]: { status: 'adding' } }));
         setError(null);
         try {
             const result = await addCollaboratorApi(documentId, userIdToAdd);
             setAddStatus(prev => ({ ...prev, [userIdToAdd]: { status: 'added', message: result.message } }));
         } catch (err) {
             setAddStatus(prev => ({ ...prev, [userIdToAdd]: { status: 'error', message: err.message || 'Failed' } }));
         }
     };

    // Basic Modal / Button JSX structure (add proper styling)
    return (
        <div>
            <button onClick={openModal} title="Share this document">Share</button>
            {isModalOpen && (
                <div className="modal-backdrop" style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '5px', minWidth: '350px', maxWidth: '500px' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                             <h2>Share Document</h2>
                             <button onClick={closeModal}>&times;</button>
                        </div>
                        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                        {isLoadingUsers ? ( <p>Loading users...</p> )
                         : users.length === 0 ? ( <p>No other users found.</p> )
                         : (
                            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto', margin:'10px 0' }}>
                                {users.map(user => {
                                    const currentStatus = addStatus[user._id] || {};
                                    const isDisabled = currentStatus.status === 'adding' || currentStatus.status === 'added';
                                    return (
                                        <li key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                            <span>
                                                <img src={user.profile?.image?.url || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`} alt={user.firstName} style={{width: 24, height: 24, borderRadius:'50%', marginRight: 8, verticalAlign: 'middle'}} />
                                                {user.firstName} {user.lastName}
                                                 {currentStatus.message && (<em style={{ marginLeft: 10, fontSize:'0.8em', color: currentStatus.status === 'error' ? 'red' : 'green' }}>({currentStatus.message})</em>)}
                                            </span>
                                            <button onClick={() => handleAddCollaborator(user._id)} disabled={isDisabled} style={{padding: '3px 8px'}}>
                                                {currentStatus.status === 'adding' ? 'Adding...' : currentStatus.status === 'added' ? 'Added' : 'Add'}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
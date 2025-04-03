// components/PresenceDisplay.js
import React from 'react';
import { useOthers } from '@liveblocks/react';

const Avatar = ({ src, name }) => (
    <img
        src={src || `https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        alt={name || 'User'} title={name || 'User'}
        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', marginLeft: '-8px', backgroundColor: '#ccc' }}
    />
);

export default function PresenceDisplay() {
    const others = useOthers();
    const userCount = others.length;

    return (
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
            {userCount > 0 ? (
                others.slice(0, 3).map(({ connectionId, info }) => (
                    <Avatar key={connectionId} src={info?.picture} name={info?.name} />
                ))
            ) : null}
            {userCount > 3 && (
                <div style={{ /* Styles for +N indicator */ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', marginLeft: '-8px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', fontWeight: 'bold', color: '#555' }}>
                    +{userCount - 3}
                </div>
            )}
        </div>
    );
}
'use client';

import React from 'react';
import CollaborativeEditor from '@/components/collab/CollaborativeEditor';
import { useParams } from 'next/navigation';

export default function DocumentPage() {
    const params = useParams();
    const documentId = params?.documentId;

    if (!documentId) {
        return <div>Invalid Document ID.</div>;
    }

    return <CollaborativeEditor roomId={documentId} />;
}
'use client';

import dynamic from 'next/dynamic';

const PdfEditor = dynamic(() => import('@/components/PdfEditor'), {
    ssr: false,
});

export default function HomePage() {
    return <PdfEditor />;
}

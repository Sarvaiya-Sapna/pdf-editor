import { UploadCloud } from 'lucide-react';
import styles from '@/app/styles/PdfEditor.module.scss';

export function UploadPdf() {
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyStateInner}>
                <UploadCloud size={42} />
                <h3 className={styles.emptyTitle}>Upload a PDF to begin</h3>
                <p className={styles.emptyText}>
                    Start by uploading a PDF file. Then add shapes, text, and annotations across multiple pages.
                </p>
            </div>
        </div>
    );
}

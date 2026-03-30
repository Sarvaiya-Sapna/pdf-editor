import { FileText, Layers3, MousePointerClick } from 'lucide-react';
import { ToolType } from '@/types/annotation';
import styles from '@/app/styles/PdfEditor.module.scss';

type EditorHeaderProps = {
    pagesCount: number;
    annotationsCount: number;
    activeTool: ToolType;
};

export function EditorHeader({ pagesCount, annotationsCount, activeTool }: EditorHeaderProps) {
    return (
        <section className={styles.headerCard}>
            <div className={styles.headerTop}>
                <div>
                    <h1 className={styles.title}>PDF Editor</h1>
                    <p className={styles.subtitle}>
                        Modern multi-page PDF annotation editor with shape tools, text editing, JSON import/export, and
                        final PDF export.
                    </p>
                </div>

                <div className={styles.headerBadges}>
                    <div className={styles.badge}>
                        <FileText size={14} />
                        <span>{pagesCount} Pages</span>
                    </div>
                    <div className={styles.badge}>
                        <Layers3 size={14} />
                        <span>{annotationsCount} Annotations</span>
                    </div>
                    <div className={styles.badge}>
                        <MousePointerClick size={14} />
                        <span>{activeTool}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

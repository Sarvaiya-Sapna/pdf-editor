import { Annotation, ToolType } from '@/types/annotation';
import { AnnotationCanvas } from '@/components/AnnotationCanvas';
import styles from '@/app/styles/PdfEditor.module.scss';

type PageMeta = {
    pageNumber: number;
    width: number;
    height: number;
};

type PdfPagesViewerProps = {
    pdfUrl: string;
    pages: PageMeta[];
    annotations: Annotation[];
    activeTool: ToolType;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onCreate: (tool: Exclude<ToolType, 'select'>, x: number, y: number, pageNumber: number) => void;
    onUpdateLive: (updated: Annotation) => void;
    onCommitUpdate: (updated: Annotation) => void;
};

export function PdfPagesViewer({
    pdfUrl,
    pages,
    annotations,
    activeTool,
    selectedId,
    onSelect,
    onCreate,
    onUpdateLive,
    onCommitUpdate,
}: PdfPagesViewerProps) {
    return (
        <section className={styles.viewerPanel}>
            <div className={styles.pagesColumn}>
                {pages.map((page) => {
                    const pageAnnotations = annotations.filter(
                        (annotation) => annotation.pageNumber === page.pageNumber,
                    );

                    return (
                        <div key={page.pageNumber} className={styles.pageSection}>
                            <div className={styles.pageLabel}>Page {page.pageNumber}</div>

                            <div className={styles.pageViewport}>
                                <div
                                    className={styles.pageViewportInner}
                                    style={{
                                        width: page.width,
                                        height: page.height,
                                    }}
                                >
                                    <iframe
                                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&page=${page.pageNumber}&zoom=page-width`}
                                        width={page.width}
                                        height={page.height}
                                        className={styles.pdfFrame}
                                        title={`PDF Page ${page.pageNumber}`}
                                        tabIndex={-1}
                                    />

                                    <div className={styles.annotationLayer}>
                                        <AnnotationCanvas
                                            backgroundUrl={null}
                                            width={page.width}
                                            height={page.height}
                                            annotations={pageAnnotations}
                                            activeTool={activeTool}
                                            selectedId={selectedId}
                                            onSelect={onSelect}
                                            onCreate={(tool, x, y) => onCreate(tool, x, y, page.pageNumber)}
                                            onUpdateLive={onUpdateLive}
                                            onCommitUpdate={onCommitUpdate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

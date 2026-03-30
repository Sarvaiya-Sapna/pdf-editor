import type { Dispatch, SetStateAction } from 'react';
import { UploadCloud } from 'lucide-react';
import { Annotation, TextAnnotation, ToolType } from '@/types/annotation';
import { Toolbar } from '@/components/Toolbar';
import { HistoryState, redoHistory, undoHistory } from '@/lib/history';
import styles from '@/app/styles/PdfEditor.module.scss';

type EditorSidebarProps = {
    pdfUrl: string | null;
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
    history: HistoryState<Annotation[]>;
    setHistory: Dispatch<SetStateAction<HistoryState<Annotation[]>>>;
    selectedAnnotation: Annotation | null;
    handleDelete: () => void;
    handleExportJson: () => void;
    handleImportJson: (file: File) => Promise<void>;
    handleExportPdf: () => Promise<void>;
    handlePdfUpload: (file: File) => Promise<void>;
    setErrorMessage: (value: string) => void;
    shapeColor: string;
    textColor: string;
    fontSize: number;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    setShapeColor: (value: string) => void;
    setTextColor: (value: string) => void;
    setFontSize: (value: number) => void;
    setFontFamily: (value: string) => void;
    setIsBold: (value: boolean) => void;
    setIsItalic: (value: boolean) => void;
    setIsUnderline: (value: boolean) => void;
    updateSelectedTextAnnotation: (updater: (annotation: TextAnnotation) => TextAnnotation) => void;
};

export function EditorSidebar({
    pdfUrl,
    activeTool,
    setActiveTool,
    history,
    setHistory,
    selectedAnnotation,
    handleDelete,
    handleExportJson,
    handleImportJson,
    handleExportPdf,
    handlePdfUpload,
    setErrorMessage,
    shapeColor,
    textColor,
    fontSize,
    fontFamily,
    isBold,
    isItalic,
    isUnderline,
    setShapeColor,
    setTextColor,
    setFontSize,
    setFontFamily,
    setIsBold,
    setIsItalic,
    setIsUnderline,
    updateSelectedTextAnnotation,
}: EditorSidebarProps) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
                <label className={styles.uploadBox}>
                    <span className={styles.uploadContent}>
                        <UploadCloud size={18} />
                        <span>{pdfUrl ? 'Replace PDF File' : 'Upload PDF File'}</span>
                    </span>

                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple={false}
                        style={{ display: 'none' }}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

                            if (!isPdf) {
                                setErrorMessage('Please select a valid PDF file only.');
                                event.currentTarget.value = '';
                                return;
                            }

                            void handlePdfUpload(file);
                            event.currentTarget.value = '';
                        }}
                    />
                </label>

                <Toolbar
                    activeTool={activeTool}
                    onToolChange={setActiveTool}
                    onDelete={handleDelete}
                    onExportJson={handleExportJson}
                    onImportJson={(file) => void handleImportJson(file)}
                    onExportPdf={() => void handleExportPdf()}
                    onUndo={() => setHistory((current) => undoHistory(current))}
                    onRedo={() => setHistory((current) => redoHistory(current))}
                    canUndo={history.past.length > 0}
                    canRedo={history.future.length > 0}
                    hasSelection={Boolean(selectedAnnotation)}
                    shapeColor={shapeColor}
                    textColor={textColor}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    isBold={isBold}
                    isItalic={isItalic}
                    isUnderline={isUnderline}
                    onShapeColorChange={setShapeColor}
                    onTextColorChange={(value) => {
                        setTextColor(value);
                        updateSelectedTextAnnotation((annotation) => ({
                            ...annotation,
                            fill: value,
                        }));
                    }}
                    onFontSizeChange={(value) => {
                        setFontSize(value);
                        updateSelectedTextAnnotation((annotation) => ({
                            ...annotation,
                            fontSize: value,
                        }));
                    }}
                    onFontFamilyChange={(value) => {
                        setFontFamily(value);
                        updateSelectedTextAnnotation((annotation) => ({
                            ...annotation,
                            fontFamily: value,
                        }));
                    }}
                    onBoldToggle={() => {
                        const next = !isBold;
                        setIsBold(next);
                        updateSelectedTextAnnotation((annotation) => ({
                            ...annotation,
                            fontWeight: next ? 'bold' : 'normal',
                        }));
                    }}
                    onItalicToggle={() => {
                        const next = !isItalic;
                        setIsItalic(next);
                        updateSelectedTextAnnotation((annotation) => ({
                            ...annotation,
                            fontStyle: next ? 'italic' : 'normal',
                        }));
                    }}
                    onUnderlineToggle={() => {
                        const next = !isUnderline;
                        setIsUnderline(next);
                        updateSelectedTextAnnotation((annotation) => ({
                            ...annotation,
                            underline: next,
                        }));
                    }}
                />

                <div className={styles.sidebarHelp}>
                    <strong>{pdfUrl ? 'Quick Tips' : 'Getting Started'}</strong>
                    <ul className={styles.tipList}>
                        {pdfUrl ? (
                            <>
                                <li>Select a tool, then click on a page to place annotation</li>
                                <li>Double-click text annotation to edit inline</li>
                                <li>Use blue handles to resize / rotate</li>
                                <li>Undo / Redo now works cleanly for drag operations</li>
                            </>
                        ) : (
                            <>
                                <li>Upload a PDF document</li>
                                <li>Choose a tool from the toolbar</li>
                                <li>Add annotations on any page</li>
                                <li>Export JSON or final annotated PDF</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </aside>
    );
}

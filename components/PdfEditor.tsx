'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { Annotation, TextAnnotation, ToolType } from '@/types/annotation';
import { createHistory, pushHistory } from '@/lib/history';
import { downloadBlob, exportAnnotatedPdf } from '@/lib/pdfUtils';
import { EditorHeader } from '@/components/pdf-editor/EditorHeader';
import { EditorSidebar } from '@/components/pdf-editor/EditorSidebar';
import { PdfPagesViewer } from '@/components/pdf-editor/PdfPagesViewer';
import { UploadPdf } from '@/components/pdf-editor/UploadPdf';
import styles from '@/app/styles/PdfEditor.module.scss';

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 1100;
const DEFAULT_BLACK = '#000000';

type PageMeta = {
    pageNumber: number;
    width: number;
    height: number;
};

export default function PdfEditor() {
    const [activeTool, setActiveTool] = useState<ToolType>('select');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pages, setPages] = useState<PageMeta[]>([]);
    const [history, setHistory] = useState(createHistory<Annotation[]>([]));
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [shapeColor, setShapeColor] = useState<string>(DEFAULT_BLACK);
    const [textColor, setTextColor] = useState<string>(DEFAULT_BLACK);
    const [fontSize, setFontSize] = useState<number>(24);
    const [fontFamily, setFontFamily] = useState<string>('Arial');
    const [isBold, setIsBold] = useState<boolean>(false);
    const [isItalic, setIsItalic] = useState<boolean>(false);
    const [isUnderline, setIsUnderline] = useState<boolean>(false);

    const annotations = history.present;

    const selectedAnnotation = useMemo(
        () => annotations.find((annotation) => annotation.id === selectedId) ?? null,
        [annotations, selectedId],
    );

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    const handleDelete = useCallback(() => {
        if (!selectedId) return;

        updateAnnotations(history.present.filter((annotation) => annotation.id !== selectedId));
        setSelectedId(null);
    }, [selectedId, history.present]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTypingInField =
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target?.isContentEditable === true;

            if (isTypingInField) return;

            if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
                event.preventDefault();
                handleDelete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, handleDelete]);

    useEffect(() => {
        if (selectedAnnotation?.type === 'text') {
            setTextColor(selectedAnnotation.fill);
            setFontSize(selectedAnnotation.fontSize);
            setFontFamily(selectedAnnotation.fontFamily);
            setIsBold(selectedAnnotation.fontWeight === 'bold');
            setIsItalic(selectedAnnotation.fontStyle === 'italic');
            setIsUnderline(selectedAnnotation.underline);
        }
    }, [selectedAnnotation]);

    const resetEditorState = () => {
        setHistory(createHistory<Annotation[]>([]));
        setSelectedId(null);
        setActiveTool('select');
        setPages([]);
    };

    const updateAnnotations = (next: Annotation[]) => {
        setHistory((current) => pushHistory(current, next));
    };

    const setAnnotationsWithoutHistory = (next: Annotation[]) => {
        setHistory((current) => ({ ...current, present: next }));
    };

    const handleUpdateAnnotation = (updated: Annotation) => {
        updateAnnotations(history.present.map((annotation) => (annotation.id === updated.id ? updated : annotation)));
    };

    const handleUpdateAnnotationLive = (updated: Annotation) => {
        setAnnotationsWithoutHistory(
            history.present.map((annotation) => (annotation.id === updated.id ? updated : annotation)),
        );
    };

    const handleCommitAnnotation = (updated: Annotation) => {
        updateAnnotations(history.present.map((annotation) => (annotation.id === updated.id ? updated : annotation)));
    };

    const updateSelectedTextAnnotation = (updater: (annotation: TextAnnotation) => TextAnnotation) => {
        if (!selectedAnnotation || selectedAnnotation.type !== 'text') return;
        handleUpdateAnnotation(updater(selectedAnnotation));
    };

    const handlePdfUpload = async (file: File) => {
        try {
            setErrorMessage('');
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            if (!isPdf) {
                setErrorMessage('Please upload a valid PDF file.');
                return;
            }

            const bytes = new Uint8Array(await file.arrayBuffer());
            const blobUrl = URL.createObjectURL(file);
            const pdfDoc = await PDFDocument.load(bytes, {
                throwOnInvalidObject: true,
            });
            const pdfPages = pdfDoc.getPages();

            const nextPages: PageMeta[] = pdfPages.map((page, index) => {
                const { width, height } = page.getSize();
                const scale = Math.min(DEFAULT_WIDTH / width, DEFAULT_HEIGHT / height);

                return {
                    pageNumber: index + 1,
                    width: Math.round(width * scale),
                    height: Math.round(height * scale),
                };
            });

            if (pdfUrl) URL.revokeObjectURL(pdfUrl);

            resetEditorState();
            setPdfData(bytes);
            setPdfUrl(blobUrl);
            setPages(nextPages);
        } catch (error) {
            console.error('PDF upload failed', error);
            setErrorMessage('Failed to load PDF file. Please try another PDF.');
        }
    };

    const handleCreate = (tool: Exclude<ToolType, 'select'>, x: number, y: number, pageNumber: number) => {
        if (!pdfUrl) {
            setErrorMessage('Please upload a PDF before adding annotations.');
            return;
        }

        const id = uuidv4();
        let annotation: Annotation;

        switch (tool) {
            case 'rectangle':
                annotation = {
                    id,
                    pageNumber,
                    type: 'rectangle',
                    x,
                    y,
                    width: 140,
                    height: 90,
                    stroke: shapeColor,
                    rotation: 0,
                };
                break;
            case 'circle':
                annotation = {
                    id,
                    pageNumber,
                    type: 'circle',
                    x,
                    y,
                    radius: 45,
                    stroke: shapeColor,
                    rotation: 0,
                };
                break;
            case 'line':
                annotation = {
                    id,
                    pageNumber,
                    type: 'line',
                    x,
                    y,
                    x2: x + 120,
                    y2: y + 40,
                    stroke: shapeColor,
                    rotation: 0,
                };
                break;
            case 'text':
                annotation = {
                    id,
                    pageNumber,
                    type: 'text',
                    x,
                    y,
                    text: 'Edit text',
                    fontSize,
                    fill: textColor,
                    fontFamily,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    underline: isUnderline,
                    rotation: 0,
                };
                break;
            default:
                return;
        }

        updateAnnotations([...history.present, annotation]);
        setSelectedId(annotation.id);
        setActiveTool('select');
    };

    const handleExportJson = () => {
        try {
            downloadBlob(JSON.stringify(history.present, null, 2), 'annotations.json', 'application/json');
            setErrorMessage('');
        } catch (error) {
            console.error('JSON export failed', error);
            setErrorMessage('Failed to export annotation JSON.');
        }
    };

    const handleImportJson = async (file: File) => {
        try {
            setErrorMessage('');
            const content = await file.text();
            const parsed = JSON.parse(content);

            if (!Array.isArray(parsed)) throw new Error('Imported JSON is not an array.');

            updateAnnotations(parsed as Annotation[]);
            setSelectedId(null);
            setActiveTool('select');
        } catch (error) {
            console.error('JSON import failed', error);
            setErrorMessage('Invalid annotation JSON file.');
        }
    };

    const handleExportPdf = async () => {
        if (!pdfData) {
            setErrorMessage('Please upload a PDF before exporting.');
            return;
        }

        try {
            setErrorMessage('');
            const bytes = await exportAnnotatedPdf(pdfData, history.present, pages);
            downloadBlob(bytes as BlobPart, 'annotated.pdf', 'application/pdf');
        } catch (error) {
            console.error('PDF export failed', error);
            setErrorMessage('Failed to export annotated PDF.');
        }
    };

    return (
        <main className={styles.page}>
            <EditorHeader pagesCount={pages.length} annotationsCount={history.present.length} activeTool={activeTool} />

            {errorMessage ? <div className={styles.error}>{errorMessage}</div> : null}

            <section className={styles.workspace}>
                <EditorSidebar
                    pdfUrl={pdfUrl}
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    history={history}
                    setHistory={setHistory}
                    selectedAnnotation={selectedAnnotation}
                    handleDelete={handleDelete}
                    handleExportJson={handleExportJson}
                    handleImportJson={handleImportJson}
                    handleExportPdf={handleExportPdf}
                    handlePdfUpload={handlePdfUpload}
                    setErrorMessage={setErrorMessage}
                    shapeColor={shapeColor}
                    textColor={textColor}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    isBold={isBold}
                    isItalic={isItalic}
                    isUnderline={isUnderline}
                    setShapeColor={setShapeColor}
                    setTextColor={setTextColor}
                    setFontSize={setFontSize}
                    setFontFamily={setFontFamily}
                    setIsBold={setIsBold}
                    setIsItalic={setIsItalic}
                    setIsUnderline={setIsUnderline}
                    updateSelectedTextAnnotation={updateSelectedTextAnnotation}
                />

                {pdfUrl && pages.length > 0 ? (
                    <PdfPagesViewer
                        pdfUrl={pdfUrl}
                        pages={pages}
                        annotations={history.present}
                        activeTool={activeTool}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onCreate={handleCreate}
                        onUpdateLive={handleUpdateAnnotationLive}
                        onCommitUpdate={handleCommitAnnotation}
                    />
                ) : (
                    <section className={styles.viewerPanel}>
                        <UploadPdf />
                    </section>
                )}
            </section>
        </main>
    );
}

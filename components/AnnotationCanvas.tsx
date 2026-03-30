'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Annotation, TextAnnotation, ToolType } from '@/types/annotation';
import { renderAnnotation } from '@/components/annotation/renderAnnotation';
import { TextEditorOverlay } from '@/components/annotation/TextEditorOverlay';
import { EditingTextState, Point, ResizeMode } from '@/components/annotation/types';
import { applyMove, applyResize, applyRotation } from '@/utils/annotationCanvas.utils';

type AnnotationCanvasProps = {
    backgroundUrl: string | null;
    width: number;
    height: number;
    annotations: Annotation[];
    activeTool: ToolType;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onCreate: (tool: Exclude<ToolType, 'select'>, x: number, y: number) => void;
    onUpdateLive: (annotation: Annotation) => void;
    onCommitUpdate: (annotation: Annotation) => void;
};

export function AnnotationCanvas({
    backgroundUrl,
    width,
    height,
    annotations,
    activeTool,
    selectedId,
    onSelect,
    onCreate,
    onUpdateLive,
    onCommitUpdate,
}: AnnotationCanvasProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const textInputRef = useRef<HTMLInputElement | null>(null);

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
    const [dragStartAnnotation, setDragStartAnnotation] = useState<Annotation | null>(null);

    const [resizingId, setResizingId] = useState<string | null>(null);
    const [resizeMode, setResizeMode] = useState<ResizeMode>(null);
    const [resizeStartAnnotation, setResizeStartAnnotation] = useState<Annotation | null>(null);

    const [rotatingId, setRotatingId] = useState<string | null>(null);
    const [rotateStartAnnotation, setRotateStartAnnotation] = useState<Annotation | null>(null);

    const [editingText, setEditingText] = useState<EditingTextState | null>(null);

    useEffect(() => {
        if (editingText && textInputRef.current) {
            textInputRef.current.focus();
            const length = textInputRef.current.value.length;
            textInputRef.current.setSelectionRange(length, length);
        }
    }, [editingText]);

    const editingAnnotation = useMemo(
        () =>
            editingText
                ? (annotations.find(
                      (item): item is TextAnnotation => item.id === editingText.id && item.type === 'text',
                  ) ?? null)
                : null,
        [annotations, editingText],
    );

    const getRelativePoint = (event: React.MouseEvent<SVGSVGElement | SVGElement>): Point => {
        const rect = svgRef.current?.getBoundingClientRect();

        if (!rect) {
            return { x: 0, y: 0 };
        }

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const resetInteractionState = () => {
        setDraggingId(null);
        setDragStartPoint(null);
        setDragStartAnnotation(null);
        setResizingId(null);
        setResizeMode(null);
        setResizeStartAnnotation(null);
        setRotatingId(null);
        setRotateStartAnnotation(null);
    };

    const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
        if (event.target !== event.currentTarget) return;

        if (editingText) {
            commitTextEdit();
            return;
        }

        if (activeTool === 'select') {
            onSelect(null);
            return;
        }

        const point = getRelativePoint(event);
        onCreate(activeTool, point.x, point.y);
    };

    const handleAnnotationMouseDown = (event: React.MouseEvent<SVGElement>, annotation: Annotation) => {
        if (editingText?.id === annotation.id || activeTool !== 'select') return;

        event.preventDefault();
        event.stopPropagation();

        const point = getRelativePoint(event);

        onSelect(annotation.id);
        setDraggingId(annotation.id);
        setDragStartPoint(point);
        setDragStartAnnotation(annotation);
    };

    const handleResizeMouseDown = (event: React.MouseEvent<SVGElement>, annotation: Annotation, mode: ResizeMode) => {
        event.preventDefault();
        event.stopPropagation();

        onSelect(annotation.id);
        setResizingId(annotation.id);
        setResizeMode(mode);
        setResizeStartAnnotation(annotation);
    };

    const handleRotateMouseDown = (event: React.MouseEvent<SVGElement>, annotation: Annotation) => {
        event.preventDefault();
        event.stopPropagation();

        onSelect(annotation.id);
        setRotatingId(annotation.id);
        setRotateStartAnnotation(annotation);
    };

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (editingText) return;

        const point = getRelativePoint(event);

        if (draggingId && dragStartPoint && dragStartAnnotation) {
            const dx = point.x - dragStartPoint.x;
            const dy = point.y - dragStartPoint.y;
            onUpdateLive(applyMove(dragStartAnnotation, dx, dy));
            return;
        }

        if (resizingId && resizeMode && resizeStartAnnotation) {
            onUpdateLive(applyResize(resizeStartAnnotation, resizeMode, point));
            return;
        }

        if (rotatingId && rotateStartAnnotation) {
            onUpdateLive(applyRotation(rotateStartAnnotation, point));
        }
    };

    const handleMouseUp = (event: React.MouseEvent<SVGSVGElement>) => {
        if (editingText) return;

        const point = getRelativePoint(event);

        if (draggingId && dragStartPoint && dragStartAnnotation) {
            const dx = point.x - dragStartPoint.x;
            const dy = point.y - dragStartPoint.y;
            onCommitUpdate(applyMove(dragStartAnnotation, dx, dy));
        } else if (resizingId && resizeMode && resizeStartAnnotation) {
            onCommitUpdate(applyResize(resizeStartAnnotation, resizeMode, point));
        } else if (rotatingId && rotateStartAnnotation) {
            onCommitUpdate(applyRotation(rotateStartAnnotation, point));
        }

        resetInteractionState();
    };

    const startInlineTextEdit = (annotation: TextAnnotation) => {
        resetInteractionState();
        onSelect(annotation.id);
        setEditingText({
            id: annotation.id,
            value: annotation.text,
        });
    };

    const commitTextEdit = () => {
        if (!editingText) return;

        const target = annotations.find(
            (annotation): annotation is TextAnnotation =>
                annotation.id === editingText.id && annotation.type === 'text',
        );

        if (!target) {
            setEditingText(null);
            return;
        }

        onCommitUpdate({
            ...target,
            text: editingText.value.length > 0 ? editingText.value : target.text,
        });

        setEditingText(null);
    };

    const cancelTextEdit = () => {
        setEditingText(null);
    };

    return (
        <div style={{ position: 'relative', width, height }}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    display: 'block',
                    width,
                    height,
                    backgroundColor: 'transparent',
                    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                    backgroundSize: 'cover',
                    cursor: activeTool === 'select' ? 'default' : 'crosshair',
                }}
            >
                {annotations.map((annotation) =>
                    renderAnnotation({
                        annotation,
                        selectedId,
                        editingTextId: editingText?.id ?? null,
                        onMouseDown: handleAnnotationMouseDown,
                        onResizeMouseDown: handleResizeMouseDown,
                        onRotateMouseDown: handleRotateMouseDown,
                        onStartInlineEdit: startInlineTextEdit,
                    }),
                )}
            </svg>

            {editingText && editingAnnotation && (
                <TextEditorOverlay
                    annotation={editingAnnotation}
                    value={editingText.value}
                    inputRef={textInputRef}
                    onChange={(value) => setEditingText((current) => (current ? { ...current, value } : current))}
                    onCommit={commitTextEdit}
                    onCancel={cancelTextEdit}
                />
            )}
        </div>
    );
}

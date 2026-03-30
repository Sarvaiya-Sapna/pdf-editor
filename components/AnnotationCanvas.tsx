'use client';

import { useEffect, useRef, useState } from 'react';
import { Annotation, TextAnnotation, ToolType } from '@/types/annotation';

type ResizeMode = 'rectangle-se' | 'circle-radius' | 'line-start' | 'line-end' | null;

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

type Point = {
    x: number;
    y: number;
};

type EditingTextState = {
    id: string;
    value: string;
};

const HANDLE_SIZE = 12;
const ROTATE_HANDLE_SIZE = 12;
const ROTATE_HANDLE_OFFSET = 28;
const MIN_RECT_SIZE = 24;
const MIN_CIRCLE_RADIUS = 12;

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
        if (event.target !== event.currentTarget) {
            return;
        }

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
        if (editingText?.id === annotation.id) {
            return;
        }

        if (activeTool !== 'select') {
            return;
        }

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
        if (editingText) {
            return;
        }

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
        if (editingText) {
            return;
        }

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
        if (!editingText) {
            return;
        }

        const target = annotations.find(
            (annotation): annotation is TextAnnotation =>
                annotation.id === editingText.id && annotation.type === 'text',
        );

        if (!target) {
            setEditingText(null);
            return;
        }

        const nextValue = editingText.value;

        onCommitUpdate({
            ...target,
            text: nextValue.length > 0 ? nextValue : target.text,
        });

        setEditingText(null);
    };

    const cancelTextEdit = () => {
        setEditingText(null);
    };

    const renderRotateHandle = (annotation: Annotation) => {
        const handlePoint = getRotateHandlePoint(annotation);

        return (
            <circle
                cx={handlePoint.x}
                cy={handlePoint.y}
                r={ROTATE_HANDLE_SIZE / 2}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth={2}
                style={{ cursor: 'grab' }}
                onMouseDown={(event) => handleRotateMouseDown(event, annotation)}
            />
        );
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
                {annotations.map((annotation) => {
                    const isSelected = annotation.id === selectedId;

                    switch (annotation.type) {
                        case 'rectangle': {
                            const center = getAnnotationCenter(annotation);

                            return (
                                <g
                                    key={annotation.id}
                                    transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}
                                >
                                    <rect
                                        x={annotation.x}
                                        y={annotation.y}
                                        width={annotation.width}
                                        height={annotation.height}
                                        fill="transparent"
                                        stroke={annotation.stroke}
                                        strokeWidth={2}
                                        onMouseDown={(event) => handleAnnotationMouseDown(event, annotation)}
                                    />
                                    {isSelected && (
                                        <>
                                            <rect
                                                x={annotation.x}
                                                y={annotation.y}
                                                width={annotation.width}
                                                height={annotation.height}
                                                fill="none"
                                                stroke="#2563eb"
                                                strokeWidth={1}
                                                strokeDasharray="4 2"
                                                pointerEvents="none"
                                            />
                                            <rect
                                                x={annotation.x + annotation.width - HANDLE_SIZE / 2}
                                                y={annotation.y + annotation.height - HANDLE_SIZE / 2}
                                                width={HANDLE_SIZE}
                                                height={HANDLE_SIZE}
                                                fill="#2563eb"
                                                rx={2}
                                                ry={2}
                                                onMouseDown={(event) =>
                                                    handleResizeMouseDown(event, annotation, 'rectangle-se')
                                                }
                                            />
                                            {renderRotateHandle(annotation)}
                                        </>
                                    )}
                                </g>
                            );
                        }

                        case 'circle': {
                            const center = getAnnotationCenter(annotation);

                            return (
                                <g
                                    key={annotation.id}
                                    transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}
                                >
                                    <circle
                                        cx={annotation.x}
                                        cy={annotation.y}
                                        r={annotation.radius}
                                        fill="transparent"
                                        stroke={annotation.stroke}
                                        strokeWidth={2}
                                        onMouseDown={(event) => handleAnnotationMouseDown(event, annotation)}
                                    />
                                    {isSelected && (
                                        <>
                                            <circle
                                                cx={annotation.x}
                                                cy={annotation.y}
                                                r={annotation.radius}
                                                fill="none"
                                                stroke="#2563eb"
                                                strokeWidth={1}
                                                strokeDasharray="4 2"
                                                pointerEvents="none"
                                            />
                                            <rect
                                                x={annotation.x + annotation.radius - HANDLE_SIZE / 2}
                                                y={annotation.y - HANDLE_SIZE / 2}
                                                width={HANDLE_SIZE}
                                                height={HANDLE_SIZE}
                                                fill="#2563eb"
                                                rx={2}
                                                ry={2}
                                                onMouseDown={(event) =>
                                                    handleResizeMouseDown(event, annotation, 'circle-radius')
                                                }
                                            />
                                            {renderRotateHandle(annotation)}
                                        </>
                                    )}
                                </g>
                            );
                        }

                        case 'line': {
                            const center = getAnnotationCenter(annotation);

                            return (
                                <g
                                    key={annotation.id}
                                    transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}
                                >
                                    <line
                                        x1={annotation.x}
                                        y1={annotation.y}
                                        x2={annotation.x2}
                                        y2={annotation.y2}
                                        stroke={annotation.stroke}
                                        strokeWidth={3}
                                        onMouseDown={(event) => handleAnnotationMouseDown(event, annotation)}
                                    />
                                    {isSelected && (
                                        <>
                                            <circle
                                                cx={annotation.x}
                                                cy={annotation.y}
                                                r={HANDLE_SIZE / 2}
                                                fill="#2563eb"
                                                onMouseDown={(event) =>
                                                    handleResizeMouseDown(event, annotation, 'line-start')
                                                }
                                            />
                                            <circle
                                                cx={annotation.x2}
                                                cy={annotation.y2}
                                                r={HANDLE_SIZE / 2}
                                                fill="#2563eb"
                                                onMouseDown={(event) =>
                                                    handleResizeMouseDown(event, annotation, 'line-end')
                                                }
                                            />
                                            {renderRotateHandle(annotation)}
                                        </>
                                    )}
                                </g>
                            );
                        }

                        case 'text': {
                            const center = getAnnotationCenter(annotation);
                            const textWidth = Math.max(annotation.text.length * (annotation.fontSize * 0.6), 60);
                            const textHeight = annotation.fontSize + 10;
                            const isEditing = editingText?.id === annotation.id;

                            return (
                                <g
                                    key={annotation.id}
                                    transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}
                                >
                                    {!isEditing && (
                                        <>
                                            <text
                                                x={annotation.x}
                                                y={annotation.y}
                                                fontSize={annotation.fontSize}
                                                fill={annotation.fill}
                                                fontFamily={annotation.fontFamily}
                                                fontWeight={annotation.fontWeight}
                                                fontStyle={annotation.fontStyle}
                                                textDecoration={annotation.underline ? 'underline' : 'none'}
                                                onMouseDown={(event) => handleAnnotationMouseDown(event, annotation)}
                                                onDoubleClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    startInlineTextEdit(annotation);
                                                }}
                                            >
                                                {annotation.text}
                                            </text>

                                            {annotation.underline && (
                                                <line
                                                    x1={annotation.x}
                                                    y1={annotation.y + 3}
                                                    x2={annotation.x + textWidth}
                                                    y2={annotation.y + 3}
                                                    stroke={annotation.fill}
                                                    strokeWidth={1}
                                                    pointerEvents="none"
                                                />
                                            )}
                                        </>
                                    )}

                                    {isSelected && !isEditing && (
                                        <>
                                            <rect
                                                x={annotation.x - 4}
                                                y={annotation.y - annotation.fontSize}
                                                width={textWidth + 8}
                                                height={textHeight}
                                                fill="none"
                                                stroke="#2563eb"
                                                strokeWidth={1}
                                                strokeDasharray="4 2"
                                                pointerEvents="none"
                                            />
                                            {renderRotateHandle(annotation)}
                                        </>
                                    )}
                                </g>
                            );
                        }

                        default:
                            return null;
                    }
                })}
            </svg>

            {editingText &&
                (() => {
                    const annotation = annotations.find(
                        (item): item is TextAnnotation => item.id === editingText.id && item.type === 'text',
                    );

                    if (!annotation) {
                        return null;
                    }

                    const textWidth = Math.max(editingText.value.length * (annotation.fontSize * 0.6), 120);

                    return (
                        <input
                            ref={textInputRef}
                            type="text"
                            value={editingText.value}
                            onChange={(event) =>
                                setEditingText((current) =>
                                    current ? { ...current, value: event.target.value } : current,
                                )
                            }
                            onBlur={commitTextEdit}
                            onMouseDown={(event) => {
                                event.stopPropagation();
                            }}
                            onKeyDown={(event) => {
                                event.stopPropagation();

                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    commitTextEdit();
                                }

                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    cancelTextEdit();
                                }
                            }}
                            style={{
                                position: 'absolute',
                                left: annotation.x,
                                top: annotation.y - annotation.fontSize - 6,
                                width: textWidth + 24,
                                height: annotation.fontSize + 16,
                                fontSize: annotation.fontSize,
                                fontFamily: annotation.fontFamily,
                                fontWeight: annotation.fontWeight,
                                fontStyle: annotation.fontStyle,
                                textDecoration: annotation.underline ? 'underline' : 'none',
                                border: '2px solid #2563eb',
                                borderRadius: 6,
                                outline: 'none',
                                padding: '2px 6px',
                                background: '#ffffff',
                                color: annotation.fill,
                                transform: `rotate(${annotation.rotation}deg)`,
                                transformOrigin: 'left center',
                            }}
                        />
                    );
                })()}
        </div>
    );
}

function applyMove(annotation: Annotation, dx: number, dy: number): Annotation {
    switch (annotation.type) {
        case 'rectangle':
            return { ...annotation, x: annotation.x + dx, y: annotation.y + dy };
        case 'circle':
            return { ...annotation, x: annotation.x + dx, y: annotation.y + dy };
        case 'line':
            return {
                ...annotation,
                x: annotation.x + dx,
                y: annotation.y + dy,
                x2: annotation.x2 + dx,
                y2: annotation.y2 + dy,
            };
        case 'text':
            return { ...annotation, x: annotation.x + dx, y: annotation.y + dy };
        default:
            return annotation;
    }
}

function applyResize(annotation: Annotation, resizeMode: ResizeMode, point: Point): Annotation {
    switch (annotation.type) {
        case 'rectangle':
            if (resizeMode !== 'rectangle-se') return annotation;
            return {
                ...annotation,
                width: Math.max(MIN_RECT_SIZE, point.x - annotation.x),
                height: Math.max(MIN_RECT_SIZE, point.y - annotation.y),
            };

        case 'circle': {
            if (resizeMode !== 'circle-radius') return annotation;
            const dx = point.x - annotation.x;
            const dy = point.y - annotation.y;

            return {
                ...annotation,
                radius: Math.max(MIN_CIRCLE_RADIUS, Math.sqrt(dx * dx + dy * dy)),
            };
        }

        case 'line':
            if (resizeMode === 'line-start') {
                return { ...annotation, x: point.x, y: point.y };
            }
            if (resizeMode === 'line-end') {
                return { ...annotation, x2: point.x, y2: point.y };
            }
            return annotation;

        default:
            return annotation;
    }
}

function applyRotation(annotation: Annotation, point: Point): Annotation {
    const center = getAnnotationCenter(annotation);
    const angle = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
    return { ...annotation, rotation: angle };
}

function getAnnotationCenter(annotation: Annotation): Point {
    switch (annotation.type) {
        case 'rectangle':
            return {
                x: annotation.x + annotation.width / 2,
                y: annotation.y + annotation.height / 2,
            };

        case 'circle':
            return { x: annotation.x, y: annotation.y };

        case 'line':
            return {
                x: (annotation.x + annotation.x2) / 2,
                y: (annotation.y + annotation.y2) / 2,
            };

        case 'text': {
            const width = Math.max(annotation.text.length * (annotation.fontSize * 0.6), 60);
            return {
                x: annotation.x + width / 2,
                y: annotation.y - annotation.fontSize / 2,
            };
        }

        default:
            return { x: 0, y: 0 };
    }
}

function getRotateHandlePoint(annotation: Annotation): Point {
    const center = getAnnotationCenter(annotation);

    switch (annotation.type) {
        case 'rectangle':
            return { x: center.x, y: annotation.y - ROTATE_HANDLE_OFFSET };
        case 'circle':
            return {
                x: center.x,
                y: center.y - annotation.radius - ROTATE_HANDLE_OFFSET,
            };
        case 'line':
            return { x: center.x, y: center.y - ROTATE_HANDLE_OFFSET };
        case 'text':
            return {
                x: center.x,
                y: annotation.y - annotation.fontSize - ROTATE_HANDLE_OFFSET,
            };
        default:
            return center;
    }
}

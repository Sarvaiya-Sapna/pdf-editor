import { getAnnotationCenter, getTextMetrics } from '@/utils/annotationCanvas.utils';
import { RotateHandle } from './RotateHandle';
import { TextRendererProps } from './types';

export function TextAnnotationShape({
    annotation,
    isSelected,
    isEditing,
    onMouseDown,
    onRotateMouseDown,
    onStartInlineEdit,
}: TextRendererProps) {
    const center = getAnnotationCenter(annotation);
    const { width: textWidth, height: textHeight } = getTextMetrics(annotation);

    return (
        <g transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}>
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
                        onMouseDown={(event) => onMouseDown(event, annotation)}
                        onDoubleClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onStartInlineEdit(annotation);
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
                    <RotateHandle annotation={annotation} onMouseDown={onRotateMouseDown} />
                </>
            )}
        </g>
    );
}

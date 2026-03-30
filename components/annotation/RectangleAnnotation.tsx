import { getAnnotationCenter } from '@/utils/annotationCanvas.utils';
import { HANDLE_SIZE } from '@/utils/annotationCanvas.constants';
import { RotateHandle } from './RotateHandle';
import { ShapeRendererProps } from './types';

export function RectangleAnnotation({
    annotation,
    isSelected,
    onMouseDown,
    onResizeMouseDown,
    onRotateMouseDown,
}: ShapeRendererProps) {
    if (annotation.type !== 'rectangle') return null;

    const center = getAnnotationCenter(annotation);

    return (
        <g transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}>
            <rect
                x={annotation.x}
                y={annotation.y}
                width={annotation.width}
                height={annotation.height}
                fill="transparent"
                stroke={annotation.stroke}
                strokeWidth={2}
                onMouseDown={(event) => onMouseDown(event, annotation)}
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
                        onMouseDown={(event) => onResizeMouseDown(event, annotation, 'rectangle-se')}
                    />
                    <RotateHandle annotation={annotation} onMouseDown={onRotateMouseDown} />
                </>
            )}
        </g>
    );
}

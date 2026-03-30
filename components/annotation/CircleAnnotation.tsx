import { getAnnotationCenter } from '@/utils/annotationCanvas.utils';
import { HANDLE_SIZE } from '@/utils/annotationCanvas.constants';
import { RotateHandle } from './RotateHandle';
import { ShapeRendererProps } from './types';

export function CircleAnnotation({
    annotation,
    isSelected,
    onMouseDown,
    onResizeMouseDown,
    onRotateMouseDown,
}: ShapeRendererProps) {
    if (annotation.type !== 'circle') return null;

    const center = getAnnotationCenter(annotation);

    return (
        <g transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}>
            <circle
                cx={annotation.x}
                cy={annotation.y}
                r={annotation.radius}
                fill="transparent"
                stroke={annotation.stroke}
                strokeWidth={2}
                onMouseDown={(event) => onMouseDown(event, annotation)}
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
                        onMouseDown={(event) => onResizeMouseDown(event, annotation, 'circle-radius')}
                    />
                    <RotateHandle annotation={annotation} onMouseDown={onRotateMouseDown} />
                </>
            )}
        </g>
    );
}

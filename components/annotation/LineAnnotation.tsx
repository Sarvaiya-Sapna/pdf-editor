import { getAnnotationCenter } from '@/utils/annotationCanvas.utils';
import { HANDLE_SIZE } from '@/utils/annotationCanvas.constants';
import { RotateHandle } from './RotateHandle';
import { ShapeRendererProps } from './types';

export function LineAnnotation({
    annotation,
    isSelected,
    onMouseDown,
    onResizeMouseDown,
    onRotateMouseDown,
}: ShapeRendererProps) {
    if (annotation.type !== 'line') return null;

    const center = getAnnotationCenter(annotation);

    return (
        <g transform={`rotate(${annotation.rotation} ${center.x} ${center.y})`}>
            <line
                x1={annotation.x}
                y1={annotation.y}
                x2={annotation.x2}
                y2={annotation.y2}
                stroke={annotation.stroke}
                strokeWidth={3}
                onMouseDown={(event) => onMouseDown(event, annotation)}
            />
            {isSelected && (
                <>
                    <circle
                        cx={annotation.x}
                        cy={annotation.y}
                        r={HANDLE_SIZE / 2}
                        fill="#2563eb"
                        onMouseDown={(event) => onResizeMouseDown(event, annotation, 'line-start')}
                    />
                    <circle
                        cx={annotation.x2}
                        cy={annotation.y2}
                        r={HANDLE_SIZE / 2}
                        fill="#2563eb"
                        onMouseDown={(event) => onResizeMouseDown(event, annotation, 'line-end')}
                    />
                    <RotateHandle annotation={annotation} onMouseDown={onRotateMouseDown} />
                </>
            )}
        </g>
    );
}

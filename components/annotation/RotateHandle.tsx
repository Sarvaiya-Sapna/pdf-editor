import { Annotation } from '@/types/annotation';
import { getRotateHandlePoint } from '@/utils/annotationCanvas.utils';
import { ROTATE_HANDLE_SIZE } from '@/utils/annotationCanvas.constants';

type Props = {
    annotation: Annotation;
    onMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
};

export function RotateHandle({ annotation, onMouseDown }: Props) {
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
            onMouseDown={(event) => onMouseDown(event, annotation)}
        />
    );
}

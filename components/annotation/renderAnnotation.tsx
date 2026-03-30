import { Annotation, TextAnnotation } from '@/types/annotation';
import { CircleAnnotation } from './CircleAnnotation';
import { LineAnnotation } from './LineAnnotation';
import { RectangleAnnotation } from './RectangleAnnotation';
import { TextAnnotationShape } from './TextAnnotationShape';
import { ResizeMode } from './types';

type RenderArgs = {
    annotation: Annotation;
    selectedId: string | null;
    editingTextId: string | null;
    onMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
    onResizeMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation, mode: ResizeMode) => void;
    onRotateMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
    onStartInlineEdit: (annotation: TextAnnotation) => void;
};

export function renderAnnotation({
    annotation,
    selectedId,
    editingTextId,
    onMouseDown,
    onResizeMouseDown,
    onRotateMouseDown,
    onStartInlineEdit,
}: RenderArgs) {
    const isSelected = annotation.id === selectedId;

    switch (annotation.type) {
        case 'rectangle':
            return (
                <RectangleAnnotation
                    key={annotation.id}
                    annotation={annotation}
                    isSelected={isSelected}
                    onMouseDown={onMouseDown}
                    onResizeMouseDown={onResizeMouseDown}
                    onRotateMouseDown={onRotateMouseDown}
                />
            );

        case 'circle':
            return (
                <CircleAnnotation
                    key={annotation.id}
                    annotation={annotation}
                    isSelected={isSelected}
                    onMouseDown={onMouseDown}
                    onResizeMouseDown={onResizeMouseDown}
                    onRotateMouseDown={onRotateMouseDown}
                />
            );

        case 'line':
            return (
                <LineAnnotation
                    key={annotation.id}
                    annotation={annotation}
                    isSelected={isSelected}
                    onMouseDown={onMouseDown}
                    onResizeMouseDown={onResizeMouseDown}
                    onRotateMouseDown={onRotateMouseDown}
                />
            );

        case 'text':
            return (
                <TextAnnotationShape
                    key={annotation.id}
                    annotation={annotation}
                    isSelected={isSelected}
                    isEditing={editingTextId === annotation.id}
                    onMouseDown={onMouseDown}
                    onRotateMouseDown={onRotateMouseDown}
                    onStartInlineEdit={onStartInlineEdit}
                />
            );

        default:
            return null;
    }
}

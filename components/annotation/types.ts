import { Annotation, TextAnnotation } from '@/types/annotation';

export type ResizeMode = 'rectangle-se' | 'circle-radius' | 'line-start' | 'line-end' | null;

export type Point = {
    x: number;
    y: number;
};

export type EditingTextState = {
    id: string;
    value: string;
};

export type ShapeRendererProps = {
    annotation: Annotation;
    isSelected: boolean;
    onMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
    onResizeMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation, mode: ResizeMode) => void;
    onRotateMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
};

export type TextRendererProps = {
    annotation: TextAnnotation;
    isSelected: boolean;
    isEditing: boolean;
    onMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
    onRotateMouseDown: (event: React.MouseEvent<SVGElement>, annotation: Annotation) => void;
    onStartInlineEdit: (annotation: TextAnnotation) => void;
};

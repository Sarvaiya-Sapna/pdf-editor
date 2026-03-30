export type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'text';

type BaseAnnotation = {
    id: string;
    pageNumber: number;
    rotation: number;
};

export type RectangleAnnotation = BaseAnnotation & {
    type: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
    stroke: string;
};

export type CircleAnnotation = BaseAnnotation & {
    type: 'circle';
    x: number;
    y: number;
    radius: number;
    stroke: string;
};

export type LineAnnotation = BaseAnnotation & {
    type: 'line';
    x: number;
    y: number;
    x2: number;
    y2: number;
    stroke: string;
};

export type TextAnnotation = BaseAnnotation & {
    type: 'text';
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fill: string;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    underline: boolean;
};

export type Annotation = RectangleAnnotation | CircleAnnotation | LineAnnotation | TextAnnotation;

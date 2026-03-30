import { Annotation, TextAnnotation } from '@/types/annotation';
import { MIN_CIRCLE_RADIUS, MIN_RECT_SIZE, ROTATE_HANDLE_OFFSET } from './annotationCanvas.constants';
import { Point, ResizeMode } from '@/components/annotation/types';

export function applyMove(annotation: Annotation, dx: number, dy: number): Annotation {
    switch (annotation.type) {
        case 'line':
            return {
                ...annotation,
                x: annotation.x + dx,
                y: annotation.y + dy,
                x2: annotation.x2 + dx,
                y2: annotation.y2 + dy,
            };
        case 'rectangle':
        case 'circle':
        case 'text':
            return { ...annotation, x: annotation.x + dx, y: annotation.y + dy };
        default:
            return annotation;
    }
}

export function applyResize(annotation: Annotation, resizeMode: ResizeMode, point: Point): Annotation {
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
                radius: Math.max(MIN_CIRCLE_RADIUS, Math.hypot(dx, dy)),
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

export function applyRotation(annotation: Annotation, point: Point): Annotation {
    const center = getAnnotationCenter(annotation);
    const angle = (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
    return { ...annotation, rotation: angle };
}

export function getTextMetrics(annotation: TextAnnotation, value?: string) {
    const text = value ?? annotation.text;
    const width = Math.max(text.length * (annotation.fontSize * 0.6), 60);
    const height = annotation.fontSize + 10;

    return { width, height };
}

export function getAnnotationCenter(annotation: Annotation): Point {
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
            const { width } = getTextMetrics(annotation);
            return {
                x: annotation.x + width / 2,
                y: annotation.y - annotation.fontSize / 2,
            };
        }

        default:
            return { x: 0, y: 0 };
    }
}

export function getRotateHandlePoint(annotation: Annotation): Point {
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

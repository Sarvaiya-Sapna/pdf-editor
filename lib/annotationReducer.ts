import { Annotation } from '@/types/annotation';

export type AnnotationAction =
    | { type: 'set'; payload: Annotation[] }
    | { type: 'add'; payload: Annotation }
    | { type: 'update'; payload: Annotation }
    | { type: 'delete'; payload: { id: string } };

export function annotationReducer(state: Annotation[], action: AnnotationAction): Annotation[] {
    switch (action.type) {
        case 'set':
            return action.payload;
        case 'add':
            return [...state, action.payload];
        case 'update':
            return state.map((annotation) => (annotation.id === action.payload.id ? action.payload : annotation));
        case 'delete':
            return state.filter((annotation) => annotation.id !== action.payload.id);
        default:
            return state;
    }
}

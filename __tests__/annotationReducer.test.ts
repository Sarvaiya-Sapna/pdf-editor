import { annotationReducer } from '@/lib/annotationReducer';
import { Annotation } from '@/types/annotation';

describe('annotationReducer', () => {
    const rectangle: Annotation = {
        id: '1',
        pageNumber: 1,
        rotation: 0,
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        stroke: '#f00',
    };

    it('creates, updates and deletes an annotation', () => {
        const afterAdd = annotationReducer([], { type: 'add', payload: rectangle });
        expect(afterAdd).toHaveLength(1);

        const updated = { ...rectangle, x: 40 } as Annotation;
        const afterUpdate = annotationReducer(afterAdd, { type: 'update', payload: updated });
        expect(afterUpdate[0].x).toBe(40);

        const afterDelete = annotationReducer(afterUpdate, {
            type: 'delete',
            payload: { id: '1' },
        });
        expect(afterDelete).toHaveLength(0);
    });
});

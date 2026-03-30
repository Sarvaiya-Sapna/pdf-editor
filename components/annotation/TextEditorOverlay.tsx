import { TextAnnotation } from '@/types/annotation';

type Props = {
    annotation: TextAnnotation;
    value: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (value: string) => void;
    onCommit: () => void;
    onCancel: () => void;
};

export function TextEditorOverlay({
    annotation,
    value,
    inputRef,
    onChange,
    onCommit,
    onCancel,
}: Props) {
    const textWidth = Math.max(value.length * (annotation.fontSize * 0.6), 120);

    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onCommit}
            onMouseDown={(event) => {
                event.stopPropagation();
            }}
            onKeyDown={(event) => {
                event.stopPropagation();

                if (event.key === 'Enter') {
                    event.preventDefault();
                    onCommit();
                }

                if (event.key === 'Escape') {
                    event.preventDefault();
                    onCancel();
                }
            }}
            style={{
                position: 'absolute',
                left: annotation.x,
                top: annotation.y - annotation.fontSize - 6,
                width: textWidth + 24,
                height: annotation.fontSize + 16,
                fontSize: annotation.fontSize,
                fontFamily: annotation.fontFamily,
                fontWeight: annotation.fontWeight,
                fontStyle: annotation.fontStyle,
                textDecoration: annotation.underline ? 'underline' : 'none',
                border: '2px solid #2563eb',
                borderRadius: 6,
                outline: 'none',
                padding: '2px 6px',
                background: '#ffffff',
                color: annotation.fill,
                transform: `rotate(${annotation.rotation}deg)`,
                transformOrigin: 'left center',
            }}
        />
    );
}

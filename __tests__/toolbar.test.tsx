import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Toolbar } from '@/components/Toolbar';

describe('Toolbar', () => {
    it('changes active tool', async () => {
        const user = userEvent.setup();
        const onToolChange = vi.fn();

        render(
            <Toolbar
                activeTool="select"
                onToolChange={onToolChange}
                onDelete={vi.fn()}
                onExportJson={vi.fn()}
                onImportJson={vi.fn()}
                onExportPdf={vi.fn()}
                onUndo={vi.fn()}
                onRedo={vi.fn()}
                canUndo={false}
                canRedo={false}
                hasSelection={false}
                shapeColor="#000000"
                textColor="#000000"
                fontSize={16}
                fontFamily="Arial"
                isBold={false}
                isItalic={false}
                isUnderline={false}
                onShapeColorChange={vi.fn()}
                onTextColorChange={vi.fn()}
                onFontSizeChange={vi.fn()}
                onFontFamilyChange={vi.fn()}
                onBoldToggle={vi.fn()}
                onItalicToggle={vi.fn()}
                onUnderlineToggle={vi.fn()}
            />,
        );

        await user.click(screen.getByRole('button', { name: /rectangle/i }));
        expect(onToolChange).toHaveBeenCalledWith('rectangle');
    });
});

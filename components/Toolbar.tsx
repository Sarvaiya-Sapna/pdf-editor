'use client';

import { useEffect, useState } from 'react';
import {
    Circle,
    Download,
    FileJson,
    MousePointer2,
    Redo2,
    Slash,
    Square,
    Trash2,
    Type,
    Undo2,
    Upload,
    Bold,
    Italic,
    Underline,
    Palette,
    TypeOutline,
} from 'lucide-react';
import { ToolType } from '@/types/annotation';
import styles from '@/app/styles/Toolbar.module.scss';

type ToolbarProps = {
    activeTool: ToolType;
    onToolChange: (tool: ToolType) => void;
    onDelete: () => void;
    onExportJson: () => void;
    onImportJson: (file: File) => void;
    onExportPdf: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    hasSelection: boolean;

    shapeColor: string;
    textColor: string;
    fontSize: number;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;

    onShapeColorChange: (value: string) => void;
    onTextColorChange: (value: string) => void;
    onFontSizeChange: (value: number) => void;
    onFontFamilyChange: (value: string) => void;
    onBoldToggle: () => void;
    onItalicToggle: () => void;
    onUnderlineToggle: () => void;
};

const TOOL_OPTIONS: ToolType[] = ['select', 'rectangle', 'circle', 'line', 'text'];

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];

const TOOL_LABELS: Record<ToolType, string> = {
    select: 'Select',
    rectangle: 'Rectangle',
    circle: 'Circle',
    line: 'Line',
    text: 'Text',
};

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
    select: <MousePointer2 size={16} />,
    rectangle: <Square size={16} />,
    circle: <Circle size={16} />,
    line: <Slash size={16} />,
    text: <Type size={16} />,
};

export function Toolbar({
    activeTool,
    onToolChange,
    onDelete,
    onExportJson,
    onImportJson,
    onExportPdf,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    hasSelection,
    shapeColor,
    textColor,
    fontSize,
    fontFamily,
    isBold,
    isItalic,
    isUnderline,
    onShapeColorChange,
    onTextColorChange,
    onFontSizeChange,
    onFontFamilyChange,
    onBoldToggle,
    onItalicToggle,
    onUnderlineToggle,
}: ToolbarProps) {
    const [fontSizeInput, setFontSizeInput] = useState(String(fontSize));

    useEffect(() => {
        setFontSizeInput(String(fontSize));
    }, [fontSize]);

    const commitFontSize = () => {
        const trimmed = fontSizeInput.trim();

        if (trimmed === '') {
            setFontSizeInput('1');
            onFontSizeChange(1);
            return;
        }

        const parsed = Number(trimmed);

        if (Number.isNaN(parsed)) {
            setFontSizeInput(String(fontSize));
            return;
        }

        const clamped = Math.min(72, Math.max(1, parsed));

        setFontSizeInput(String(clamped));
        onFontSizeChange(clamped);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.section}>
                <div className={styles.sectionHeader}>Tools</div>
                <div className={styles.toolGrid}>
                    {TOOL_OPTIONS.map((tool) => (
                        <button
                            key={tool}
                            type="button"
                            onClick={() => onToolChange(tool)}
                            className={`${styles.toolButton} ${activeTool === tool ? styles.activeButton : ''}`}
                        >
                            <span className={styles.buttonIcon}>{TOOL_ICONS[tool]}</span>
                            <span>{TOOL_LABELS[tool]}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>Text & Style</div>

                <div className={styles.controlsGrid}>
                    <label className={styles.controlCard}>
                        <span className={styles.controlLabel}>
                            <Palette size={14} />
                            Shape Color
                        </span>
                        <input
                            type="color"
                            value={shapeColor}
                            onChange={(event) => onShapeColorChange(event.target.value)}
                            className={styles.colorInput}
                        />
                    </label>

                    <label className={styles.controlCard}>
                        <span className={styles.controlLabel}>
                            <TypeOutline size={14} />
                            Text Color
                        </span>
                        <input
                            type="color"
                            value={textColor}
                            onChange={(event) => onTextColorChange(event.target.value)}
                            className={styles.colorInput}
                        />
                    </label>

                    <label className={styles.controlCard}>
                        <span className={styles.controlLabel}>Font Family</span>
                        <select
                            value={fontFamily}
                            onChange={(event) => onFontFamilyChange(event.target.value)}
                            className={styles.select}
                        >
                            {FONT_FAMILIES.map((family) => (
                                <option key={family} value={family}>
                                    {family}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={styles.controlCard}>
                        <span className={styles.controlLabel}>Font Size</span>
                        <input
                            type="number"
                            min={1}
                            max={72}
                            value={fontSizeInput}
                            onChange={(event) => {
                                setFontSizeInput(event.target.value);
                            }}
                            onBlur={commitFontSize}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    commitFontSize();
                                    (event.target as HTMLInputElement).blur();
                                }
                            }}
                            className={styles.numberInput}
                        />
                    </label>
                </div>

                <div className={styles.inlineActions}>
                    <button
                        type="button"
                        onClick={onBoldToggle}
                        className={`${styles.iconButton} ${isBold ? styles.activeButton : ''}`}
                        title="Bold"
                    >
                        <Bold size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={onItalicToggle}
                        className={`${styles.iconButton} ${isItalic ? styles.activeButton : ''}`}
                        title="Italic"
                    >
                        <Italic size={16} />
                    </button>

                    <button
                        type="button"
                        onClick={onUnderlineToggle}
                        className={`${styles.iconButton} ${isUnderline ? styles.activeButton : ''}`}
                        title="Underline"
                    >
                        <Underline size={16} />
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>Actions</div>

                <div className={styles.actionGrid}>
                    <button type="button" className={styles.actionButton} onClick={onUndo} disabled={!canUndo}>
                        <Undo2 size={16} />
                        <span>Undo</span>
                    </button>

                    <button type="button" className={styles.actionButton} onClick={onRedo} disabled={!canRedo}>
                        <Redo2 size={16} />
                        <span>Redo</span>
                    </button>

                    <button type="button" className={styles.actionButton} onClick={onDelete} disabled={!hasSelection}>
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>

                    <button type="button" className={styles.actionButton} onClick={onExportJson}>
                        <FileJson size={16} />
                        <span>Export JSON</span>
                    </button>

                    <label className={styles.actionButton}>
                        <Upload size={16} />
                        <span>Import JSON</span>
                        <input
                            type="file"
                            accept="application/json"
                            style={{ display: 'none' }}
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) {
                                    onImportJson(file);
                                }
                                event.currentTarget.value = '';
                            }}
                        />
                    </label>

                    <button
                        type="button"
                        className={`${styles.actionButton} ${styles.primaryAction}`}
                        onClick={onExportPdf}
                    >
                        <Download size={16} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

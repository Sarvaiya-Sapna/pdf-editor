import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Annotation } from '@/types/annotation';

type PageMeta = {
    pageNumber: number;
    width: number;
    height: number;
};

export async function exportAnnotatedPdf(
    pdfData: Uint8Array,
    annotations: Annotation[],
    pagesMeta: PageMeta[],
): Promise<Uint8Array | BlobPart> {
    const pdfDoc = await PDFDocument.load(pdfData);
    const pages = pdfDoc.getPages();

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    for (const annotation of annotations) {
        const pageIndex = annotation.pageNumber - 1;
        const page = pages[pageIndex];
        const pageMeta = pagesMeta.find((item) => item.pageNumber === annotation.pageNumber);

        if (!page || !pageMeta) {
            continue;
        }

        const { width: pdfWidth, height: pdfHeight } = page.getSize();

        const scaleX = pdfWidth / pageMeta.width;
        const scaleY = pdfHeight / pageMeta.height;

        const toPdfX = (x: number) => x * scaleX;
        const toPdfY = (y: number) => pdfHeight - y * scaleY;

        switch (annotation.type) {
            case 'rectangle': {
                const x = toPdfX(annotation.x);
                const y = pdfHeight - (annotation.y + annotation.height) * scaleY;

                page.drawRectangle({
                    x,
                    y,
                    width: annotation.width * scaleX,
                    height: annotation.height * scaleY,
                    borderWidth: 2,
                    borderColor: hexToRgb(annotation.stroke),
                    rotate: degrees(annotation.rotation || 0),
                });
                break;
            }

            case 'circle': {
                page.drawEllipse({
                    x: toPdfX(annotation.x),
                    y: toPdfY(annotation.y),
                    xScale: annotation.radius * scaleX,
                    yScale: annotation.radius * scaleY,
                    borderWidth: 2,
                    borderColor: hexToRgb(annotation.stroke),
                    rotate: degrees(annotation.rotation || 0),
                });
                break;
            }

            case 'line': {
                page.drawLine({
                    start: {
                        x: toPdfX(annotation.x),
                        y: toPdfY(annotation.y),
                    },
                    end: {
                        x: toPdfX(annotation.x2),
                        y: toPdfY(annotation.y2),
                    },
                    thickness: 2,
                    color: hexToRgb(annotation.stroke),
                });
                break;
            }

            case 'text': {
                const x = toPdfX(annotation.x);
                const y = toPdfY(annotation.y);
                const fontSize = annotation.fontSize * scaleY;
                let font = helvetica;

                if (annotation.fontWeight === 'bold' && annotation.fontStyle === 'italic') {
                    font = helveticaBoldOblique;
                } else if (annotation.fontWeight === 'bold') {
                    font = helveticaBold;
                } else if (annotation.fontStyle === 'italic') {
                    font = helveticaOblique;
                }

                page.drawText(annotation.text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: hexToRgb(annotation.fill),
                    rotate: degrees(annotation.rotation || 0),
                });

                if (annotation.underline) {
                    const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);

                    page.drawLine({
                        start: { x, y: y - 2 },
                        end: { x: x + textWidth, y: y - 2 },
                        thickness: 1,
                        color: hexToRgb(annotation.fill),
                    });
                }

                break;
            }

            default:
                break;
        }
    }

    return pdfDoc.save();
}

export function downloadBlob(data: BlobPart, fileName: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
}

function hexToRgb(hex: string) {
    const normalized = hex.replace('#', '');
    const safeHex =
        normalized.length === 3
            ? normalized
                  .split('')
                  .map((char) => char + char)
                  .join('')
            : normalized;

    const value = parseInt(safeHex, 16);

    const r = ((value >> 16) & 255) / 255;
    const g = ((value >> 8) & 255) / 255;
    const b = (value & 255) / 255;

    return rgb(r, g, b);
}

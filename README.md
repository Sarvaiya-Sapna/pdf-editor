# PDF Editor (Basic Annotation) - Next.js + TypeScript

A modern, responsive PDF annotation editor built with **Next.js 14 + TypeScript** using an **SVG overlay** approach for drawing annotations on top of uploaded PDF pages.

This implementation is intentionally designed to be **simple, reliable** without relying on heavy canvas libraries like `react-konva`.

---

## ✨ Overview

This project allows users to:

- Upload and preview **multi-page PDF files**
- Add and edit annotations on top of PDF pages
- Export annotations as **JSON**
- Import annotations from **JSON**
- Export the final **annotated PDF**
- Work with a **responsive UI** across desktop, tablet, and mobile

Instead of using a canvas-based rendering library, this project uses:

- **Browser PDF viewer (`iframe`)** for PDF page preview
- **SVG overlay** for annotations
- **pdf-lib** for reading page sizes and exporting annotations back into the PDF

This makes the app easier to maintain, avoids native dependency issues, and is safer in Next.js environments.

---

# 🚀 Features

## Core Features

### PDF Handling

- Upload and preview **PDF files**
- Supports **multi-page PDFs**
- Automatically calculates page viewport sizes using original PDF dimensions
- Preserves page aspect ratio

### Annotation Tools

- **Rectangle**
- **Circle**
- **Line**
- **Text**

### Annotation Interactions

- Select annotations
- Move annotations
- Resize annotations
- Rotate annotations
- Delete annotations
- Per-page annotation support

### Text Annotation Features

- Click to place text
- Double-click to edit text inline
- Change:
    - Text color
    - Font size
    - Font family
    - Bold
    - Italic
    - Underline

### Persistence / Export

- Export annotations as **JSON**
- Import annotations from **JSON**
- Export final **annotated PDF**
- PDF export preserves:
    - Shapes
    - Lines
    - Text
    - Rotation
    - Bold / italic / underline support (via PDF standard fonts)

### History / Editing UX

- Undo / Redo support
- Improved history behavior:
    - **Dragging / resizing / rotating only create one undo step**
    - Prevents history spam during continuous mouse movement

### Responsive UI

- Modern responsive layout
- Works across:
    - Desktop
    - Tablet
    - Mobile
- Sticky sidebar on larger screens
- Stacked layout on smaller screens
- Responsive toolbar controls
- Improved mobile-friendly interaction layout

---

# 🛠 Tech Stack

### Major Libraries Used

- **Next.js 14** – application framework
- **React 18** – UI rendering
- **TypeScript** – strong typing and safer architecture
- **pdf-lib** – PDF parsing and annotated PDF export
- **uuid** – unique annotation IDs
- **lucide-react** – icons for modern UI
- **ESLint** – linting
- **Prettier** – formatting
- **Vitest + Testing Library** – unit/UI tests

---

# 🧠 Design Decisions

### Why SVG Overlay Instead of Canvas / Konva?

This project intentionally avoids `react-konva` / canvas-heavy solutions because those often introduce:

- Native dependency issues in Next.js builds
- More complex SSR/client-only handling
- Harder debugging during interviews or code reviews

### Instead, this project uses:

- **PDF rendered via browser `iframe` viewer**
- **SVG overlay** positioned on top of each page

### Benefits:

- Simpler architecture
- More reliable in browser-only environments
- No native `canvas` package issues
- Clear separation between:
    - PDF preview layer
    - Annotation interaction layer
    - Export layer

---

# 🧩 Architecture

### Rendering Strategy

1. User uploads a PDF file
2. `pdf-lib` reads the original page dimensions
3. Each page is scaled to a viewport size for the editor
4. Each page is rendered using the browser PDF viewer (`iframe`)
5. An **SVG overlay** is positioned above the PDF page
6. Annotations are drawn and manipulated inside the SVG layer

---

### Export Strategy

1. Original PDF bytes are loaded with `pdf-lib`
2. Each annotation is mapped to its correct PDF page
3. Viewport coordinates are converted to real PDF coordinates
4. Shapes / text are drawn onto the PDF pages
5. Final file is downloaded as `annotated.pdf`

---

# 🧱 Custom Logic Implemented

This project includes custom logic for:

- Strongly typed annotation models:
    - Rectangle
    - Circle
    - Line
    - Text
- Annotation creation per tool
- Annotation selection / deselection
- Drag / move interactions
- Resize handles for shapes and lines
- Rotation handles
- Inline text editing
- Text style synchronization with toolbar
- Undo / redo history stack
- Optimized drag history (commit on mouse-up)
- JSON import/export
- PDF coordinate scaling (viewport → PDF page)
- Responsive layout behavior
- Error handling for invalid file uploads / export failures

---

# 📁 Supported Annotation Types

### Rectangle

- Position
- Width / Height
- Stroke color
- Rotation

### Circle

- Center position
- Radius
- Stroke color
- Rotation

### Line

- Start point
- End point
- Stroke color
- Rotation

### Text

- Position
- Editable content
- Font size
- Font family
- Text color
- Bold
- Italic
- Underline
- Rotation

---

# 🔁 Undo / Redo Behavior

Undo/redo is implemented using a custom history stack.

### Current behavior

- Toolbar actions create one history entry
- Delete creates one history entry
- Create annotation creates one history entry
- **Drag / resize / rotate now only create one undo step**
    - Live movement updates the UI without pushing history
    - Final state is committed only on mouse-up

### Why this matters

- Without this optimization, dragging would create dozens of history states and make undo frustrating.

---

# ⚠️ Key Limitations

- Password-protected or encrypted PDFs are not supported.
- PDFs that require a password to open or view cannot be loaded in the editor.

---

# 🎥 Demo Video Link

- [▶️ Watch Demo Video] (https://drive.google.com/file/d/1aptN6ViwcSaKmdGlVb2ubr0fCBYjJlJX/view?usp=sharing)

---

# 📦 Installation

## 1. Install dependencies

### Run Locally

```bash
npm install
npm run dev
```

Open:
`http://localhost:3000`

---

### Lint

```bash
npm run lint
```

---

### Tests

```bash
npm run test
```

---

### Format

```bash
npm run format
```

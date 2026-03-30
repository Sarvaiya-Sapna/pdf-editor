export type HistoryState<T> = {
    past: T[];
    present: T;
    future: T[];
};

export function createHistory<T>(initial: T): HistoryState<T> {
    return { past: [], present: initial, future: [] };
}

export function pushHistory<T>(history: HistoryState<T>, next: T): HistoryState<T> {
    if (Object.is(history.present, next)) {
        return history;
    }

    if (JSON.stringify(history.present) === JSON.stringify(next)) {
        return history;
    }

    return {
        past: [...history.past, history.present],
        present: next,
        future: [],
    };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
    if (history.past.length === 0) return history;

    const previous = history.past[history.past.length - 1];

    return {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
    };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
    if (history.future.length === 0) return history;

    const next = history.future[0];

    return {
        past: [...history.past, history.present],
        present: next,
        future: history.future.slice(1),
    };
}

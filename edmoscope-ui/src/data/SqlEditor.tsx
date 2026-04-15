import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { sql, PostgreSQL } from "@codemirror/lang-sql";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from "@codemirror/language";

/** Props for the SQL editor panel. */
interface SqlEditorProps {
  /** Controlled SQL string value. */
  value: string;
  /** Called on every document change. */
  onChange: (value: string) => void;
  /** Explicit height in pixels for the editor container. */
  height: number;
  /** ARIA label forwarded to the CodeMirror content element. */
  ariaLabel?: string;
}

/**
 * CodeMirror theme matching the ODM warm-grey palette.
 * Colours are taken directly from tokens.ts / tailwind.config.ts.
 */
const odmSqlTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
    backgroundColor: "#EFEFED",
    color: "#1A1A1A",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    overflow: "auto",
    lineHeight: "1.9",
    fontFamily: "inherit",
  },
  ".cm-content": {
    padding: "14px 16px",
    caretColor: "#C7001E",
  },
  ".cm-gutters": {
    backgroundColor: "#E8E8E5",
    borderRight: "1px solid #D0D0CC",
    color: "#909090",
    fontSize: "11px",
    userSelect: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 8px 0 12px",
    minWidth: "2.5em",
  },
  ".cm-activeLineGutter": { backgroundColor: "#DEDEDE" },
  ".cm-activeLine": { backgroundColor: "rgba(199, 0, 30, 0.04)" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "#C7001E" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(199, 0, 30, 0.14)",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(199, 0, 30, 0.20)",
  },
  ".cm-tooltip-autocomplete": {
    fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
    fontSize: "12px",
    backgroundColor: "#FAFAF8",
    border: "1px solid #D0D0CC",
    borderRadius: "2px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "#C7001E",
    color: "white",
  },
  ".cm-completionMatchedText": {
    textDecoration: "none",
    fontWeight: "600",
    color: "#C7001E",
  },
  "li[aria-selected] .cm-completionMatchedText": { color: "white" },
});

/**
 * SqlEditor — CodeMirror 6 editor with PostgreSQL dialect.
 *
 * Provides SQL syntax highlighting, keyword/function autocompletion,
 * bracket matching, undo/redo history, and a line-number gutter — all
 * styled to match the ODM warm-grey palette.
 *
 * This is an internal helper used by {@link SqlWorkbench}.
 * It is **not** exported from the library index.
 */
export function SqlEditor({
  value,
  onChange,
  height,
  ariaLabel = "SQL query editor",
}: SqlEditorProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  /** Always points to the latest onChange without recreating extensions. */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /* ── Initialise the editor once on mount ────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        drawSelection(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        sql({ dialect: PostgreSQL }),
        autocompletion(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        updateListener,
        odmSqlTheme,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Sync externally-driven value changes (e.g. loading a query) ────── */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  /* ── Forward the aria-label to CodeMirror's content element ─────────── */
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.contentDOM.setAttribute("aria-label", ariaLabel);
  }, [ariaLabel]);

  return (
    <div
      ref={containerRef}
      className="border-b border-odm-line shrink-0 overflow-hidden"
      style={{ height }}
    />
  );
}

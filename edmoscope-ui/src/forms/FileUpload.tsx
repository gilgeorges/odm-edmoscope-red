import React, { useCallback, useId, useRef, useState } from "react";

/**
 * Status of a single file upload entry.
 * - `pending`   — queued but not yet started
 * - `uploading` — in progress; `progress` value is meaningful
 * - `ok`        — completed successfully
 * - `error`     — upload failed; `error` contains the reason
 */
export type UploadStatus = "pending" | "uploading" | "ok" | "error";

/**
 * Represents a single file in the upload queue, including its runtime state.
 * Exposed so consumers can read the queue via `onEntriesChange` if needed.
 */
export interface UploadEntry {
  /** Stable unique ID generated on file addition. */
  id: string;
  /** The browser `File` object. */
  file: File;
  /** Current upload status. */
  status: UploadStatus;
  /**
   * Upload progress as a 0–100 integer.
   * Only meaningful when `status === "uploading"`.
   */
  progress: number;
  /**
   * Human-readable failure reason.
   * Only set when `status === "error"`.
   */
  error?: string;
}

/**
 * Props for {@link FileUpload}.
 */
export interface FileUploadProps {
  /**
   * Upload handler called once per file as soon as it is added to the queue.
   *
   * - Call `onProgress(0..100)` at any point to advance the progress bar.
   * - **Resolve** the returned promise to mark the file as uploaded (`ok`).
   * - **Reject** with a string or `Error` to mark it as failed (`error`).
   *
   * @example
   * async function handleUpload(file, onProgress) {
   *   const formData = new FormData();
   *   formData.append("file", file);
   *   await fetch("/api/upload", { method: "POST", body: formData });
   *   onProgress(100);
   * }
   */
  onUpload: (file: File, onProgress: (pct: number) => void) => Promise<void>;
  /**
   * `accept` attribute forwarded to the hidden `<input type="file">`.
   * @example ".csv,.json" or "image/*"
   */
  accept?: string;
  /**
   * Allow selecting multiple files in a single browse session.
   * @default true
   */
  multiple?: boolean;
  /**
   * Label shown inside the drop zone.
   * @default "Drop files here or browse"
   */
  dropLabel?: string;
  /**
   * Called whenever the internal `UploadEntry[]` array changes, letting the
   * parent observe queue state without taking ownership of it.
   */
  onEntriesChange?: (entries: UploadEntry[]) => void;
  /** Extra classes applied to the root wrapper. */
  className?: string;
}

/* ── Variant maps ────────────────────────────────────────────────────────── */

const STATUS_CARD: Record<UploadStatus, string> = {
  pending:   "border-odm-line    bg-odm-card",
  uploading: "border-odm-info-bd bg-odm-info-bg",
  ok:        "border-odm-ok-bd   bg-odm-ok-bg",
  error:     "border-odm-bad-bd  bg-odm-bad-bg",
};

const STATUS_TEXT: Record<UploadStatus, string> = {
  pending:   "text-odm-muted",
  uploading: "text-odm-info",
  ok:        "text-odm-ok",
  error:     "text-odm-bad",
};

const STATUS_LABEL: Record<UploadStatus, string> = {
  pending:   "Queued",
  uploading: "Uploading",
  ok:        "Uploaded",
  error:     "Failed",
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Internal sub-component ──────────────────────────────────────────────── */

interface UploadFileCardProps {
  /** The entry to display. */
  entry: UploadEntry;
  /** Called when the user clicks the remove button. */
  onRemove: (id: string) => void;
}

/**
 * Card that represents a single file in the upload queue.
 * Shows filename, size, status label, a progress bar while uploading,
 * and a remove button when not actively uploading.
 */
function UploadFileCard({ entry, onRemove }: UploadFileCardProps): React.ReactElement {
  return (
    <div
      role="listitem"
      className={[
        "flex flex-col gap-1.5 rounded border px-3 py-2.5 transition-colors duration-200",
        STATUS_CARD[entry.status],
      ].join(" ")}
    >
      {/* Top row: icon · filename · size · status label · remove */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Left: file icon + name + size */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <svg
            aria-hidden="true"
            className={["w-4 h-4 shrink-0", STATUS_TEXT[entry.status]].join(" ")}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 2a1 1 0 011-1h5.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0113 4.414V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2z"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
            />
            <path d="M9 1v3.5a.5.5 0 00.5.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-[12px] font-semibold text-odm-ink font-sans truncate">
            {entry.file.name}
          </span>
          <span className="text-[11px] text-odm-muted font-sans shrink-0">
            {formatBytes(entry.file.size)}
          </span>
        </div>

        {/* Right: status label + remove button */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={[
              "text-[11px] font-bold font-sans uppercase tracking-[0.06em]",
              STATUS_TEXT[entry.status],
            ].join(" ")}
          >
            {entry.status === "error" && entry.error ? entry.error : STATUS_LABEL[entry.status]}
          </span>

          {entry.status !== "uploading" && (
            <button
              type="button"
              aria-label={`Remove ${entry.file.name}`}
              onClick={() => onRemove(entry.id)}
              className={[
                "flex items-center justify-center w-5 h-5 rounded",
                "text-odm-muted hover:text-odm-bad hover:bg-odm-bad-bg",
                "transition-colors duration-100 cursor-pointer",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-1",
              ].join(" ")}
            >
              {/* × close icon */}
              <svg aria-hidden="true" className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Progress bar — only during upload */}
      {entry.status === "uploading" && (
        <progress
          value={entry.progress}
          max={100}
          aria-label={`Uploading ${entry.file.name} — ${entry.progress}%`}
          className={[
            "w-full h-1 appearance-none rounded-full",
            "[&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-odm-info-bd/30",
            "[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-odm-info",
            "[&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-300",
            "[&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-odm-info",
          ].join(" ")}
        />
      )}
    </div>
  );
}

/* ── Public component ────────────────────────────────────────────────────── */

/**
 * FileUpload — drag-and-drop or browse-based file uploader.
 *
 * Maintains its own queue of `UploadEntry` items. Each file is passed to the
 * `onUpload` callback immediately upon selection. Files can be added at any
 * time — even while other uploads are in progress.
 *
 * Each entry is rendered as a card that shows a progress bar while uploading
 * and turns green (`odm-ok`) or red (`odm-bad`) based on the promise outcome.
 * A remove button lets the user dismiss any non-active entry from the list.
 *
 * @example
 * <FileUpload
 *   accept=".csv,.json"
 *   onUpload={async (file, onProgress) => {
 *     const body = new FormData();
 *     body.append("file", file);
 *     // ...use XHR to report progress, then resolve or reject
 *     await uploadToServer(body, onProgress);
 *   }}
 * />
 */
export function FileUpload({
  onUpload,
  accept,
  multiple = true,
  dropLabel = "Drop files here or browse",
  onEntriesChange,
  className = "",
}: FileUploadProps): React.ReactElement {
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const updateEntries = useCallback(
    (updater: (prev: UploadEntry[]) => UploadEntry[]) => {
      setEntries((prev) => {
        const next = updater(prev);
        onEntriesChange?.(next);
        return next;
      });
    },
    [onEntriesChange],
  );

  const startUploads = useCallback(
    (files: FileList | File[]) => {
      const newEntries: UploadEntry[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "pending" as const,
        progress: 0,
      }));

      updateEntries((prev) => [...prev, ...newEntries]);

      for (const entry of newEntries) {
        const patch = (partial: Partial<UploadEntry>) =>
          updateEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, ...partial } : e)),
          );

        patch({ status: "uploading" });

        onUpload(entry.file, (pct) =>
          patch({ progress: Math.min(100, Math.max(0, Math.round(pct))) }),
        )
          .then(() => patch({ status: "ok", progress: 100 }))
          .catch((err: unknown) => {
            const message =
              typeof err === "string"
                ? err
                : err instanceof Error
                  ? err.message
                  : "Upload failed";
            patch({ status: "error", error: message });
          });
      }
    },
    [onUpload, updateEntries],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      startUploads(files);
    },
    [startUploads],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset value so the same file path can be re-added after removal.
      e.target.value = "";
    },
    [handleFiles],
  );

  const handleRemove = useCallback(
    (id: string) => {
      updateEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [updateEntries],
  );

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  return (
    <div className={["flex flex-col gap-3", className].join(" ")}>
      {/* ── Drop zone ───────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={dropLabel}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        className={[
          "flex flex-col items-center justify-center gap-2.5",
          "min-h-[120px] rounded border-2 border-dashed",
          "cursor-pointer select-none transition-colors duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red focus-visible:outline-offset-2",
          isDragging
            ? "border-lux-red bg-lux-red-20"
            : "border-odm-line bg-odm-card hover:border-odm-line-h hover:bg-odm-surface",
        ].join(" ")}
      >
        {/* Upload arrow icon */}
        <svg
          aria-hidden="true"
          className={["w-7 h-7 transition-colors duration-150", isDragging ? "text-lux-red" : "text-odm-faint"].join(" ")}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3v13M7 8l5-5 5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        <div className="text-center px-4">
          <span
            className={[
              "block text-[13px] font-semibold font-sans transition-colors duration-150",
              isDragging ? "text-lux-red" : "text-odm-soft",
            ].join(" ")}
          >
            {isDragging ? "Release to upload" : dropLabel}
          </span>
          {accept && (
            <span className="block text-[11px] text-odm-muted font-sans mt-0.5">
              {accept}
            </span>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onChange={handleInputChange}
      />

      {/* ── File card list ───────────────────────────────────────────────── */}
      {entries.length > 0 && (
        <div
          role="list"
          aria-label="Upload queue"
          className="flex flex-col gap-1.5"
        >
          {entries.map((entry) => (
            <UploadFileCard key={entry.id} entry={entry} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

import React from "react";

/**
 * Input — single-line text input field.
 *
 * Spreads remaining props onto the underlying `<input>` for full flexibility.
 * Use inside a `<Label>` + `<Input>` pair for proper form structure.
 *
 * @example
 * <Label htmlFor="title">Asset title</Label>
 * <Input id="title" value={title} onChange={e => setTitle(e.target.value)} />
 *
 * // With error state
 * <Input value={val} error onChange={...} />
 */
export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  /**
   * Error state — applies error border styling.
   * @default false
   */
  error?: boolean;
}

export function Input({
  error = false,
  className = "",
  ...rest
}: InputProps): React.ReactElement {
  return (
    <input
      {...rest}
      className={[
        "block w-full font-sans text-[13px] text-odm-ink",
        "bg-white border border-odm-line border-b-2",
        "px-2.5 py-1.5 outline-none appearance-none",
        "placeholder:text-odm-faint",
        "transition-colors duration-100",
        error
          ? "border-b-odm-bad-bd focus:border-odm-bad-bd"
          : "border-b-odm-line-h focus:border-b-lux-red",
        "focus:border-odm-line-h",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}

/**
 * Textarea — multi-line text input.
 *
 * Same styling conventions as Input but renders a `<textarea>`.
 *
 * @example
 * <Label htmlFor="desc">Description</Label>
 * <Textarea id="desc" rows={4} value={desc} onChange={...} />
 */
export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  /** Error state — applies error border styling. */
  error?: boolean;
}

export function Textarea({ error = false, className = "", ...rest }: TextareaProps): React.ReactElement {
  return (
    <textarea
      {...rest}
      className={[
        "block w-full font-sans text-[13px] text-odm-ink",
        "bg-white border border-odm-line border-b-2",
        "px-2.5 py-1.5 outline-none resize-y leading-relaxed",
        "placeholder:text-odm-faint",
        "transition-colors duration-100",
        error
          ? "border-b-odm-bad-bd focus:border-odm-bad-bd"
          : "border-b-odm-line-h focus:border-b-lux-red",
        "focus:border-odm-line-h",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}

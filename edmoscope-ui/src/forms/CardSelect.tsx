import React from "react";

/* ── Variant / state classes ──────────────────────────────────────────────── */

const CARD_BASE = [
  "relative flex items-start gap-3 rounded-md border px-4 py-3.5 cursor-pointer",
  "transition-colors duration-100",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-lux-red",
].join(" ");

const CARD_IDLE =
  "bg-white border-odm-line text-odm-ink hover:border-odm-soft hover:bg-odm-wash";

const CARD_ACTIVE =
  "bg-white border-odm-ink border-l-[3px] border-l-odm-ink";

const CARD_DISABLED =
  "bg-odm-wash border-odm-line text-odm-muted cursor-not-allowed opacity-60";

/* ── Types ────────────────────────────────────────────────────────────────── */

/**
 * CardSelectOption — a single selectable card item.
 */
export interface CardSelectOption {
  /** Unique option value. */
  value: string;
  /** Primary label shown in bold. */
  label: string;
  /** Optional secondary description line. */
  description?: string;
  /** When true the card cannot be selected. */
  disabled?: boolean;
}

/**
 * CardSelectProps — props for the CardSelect component.
 */
export interface CardSelectProps {
  /** Array of selectable cards to render. */
  options: CardSelectOption[];
  /**
   * Currently selected value. Pass `null` or `undefined` for no selection.
   * For multi-select use the `multiple` prop.
   */
  value?: string | null;
  /** Called when a card is clicked; receives the newly selected value. */
  onChange?: (value: string) => void;
  /**
   * When true the component acts as a multi-select checkbox group:
   * `value` should be a `string[]` and `onChange` receives the new array.
   */
  multiple?: false;
  /** Layout direction of the card grid. @default "column" */
  direction?: "column" | "row";
  /** Additional CSS classes on the wrapping element. */
  className?: string;
}

/** Multi-select variant of CardSelectProps. */
export interface CardSelectMultiProps
  extends Omit<CardSelectProps, "value" | "onChange" | "multiple"> {
  multiple: true;
  /** Array of currently selected values. */
  value?: string[];
  /** Called when the selection changes; receives the new full array. */
  onChange?: (value: string[]) => void;
}

/* ── CardSelectItem ───────────────────────────────────────────────────────── */

interface ItemProps {
  option: CardSelectOption;
  isActive: boolean;
  onSelect: () => void;
  multiple: boolean;
  groupName: string;
}

function CardSelectItem({
  option,
  isActive,
  onSelect,
  multiple,
  groupName,
}: ItemProps): React.ReactElement {
  const inputType = multiple ? "checkbox" : "radio";

  return (
    <label
      className={[
        CARD_BASE,
        option.disabled ? CARD_DISABLED : isActive ? CARD_ACTIVE : CARD_IDLE,
      ].join(" ")}
    >
      <input
        type={inputType}
        name={multiple ? undefined : groupName}
        value={option.value}
        checked={isActive}
        disabled={option.disabled}
        onChange={option.disabled ? undefined : onSelect}
        className="mt-0.5 shrink-0 accent-odm-ink focus-visible:outline-none"
        aria-label={option.label}
      />
      <div className="flex flex-col min-w-0">
        <span
          className={[
            "font-sans text-[13px] font-semibold leading-snug",
            isActive ? "text-odm-ink" : "text-odm-ink",
            option.disabled ? "text-odm-muted" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {option.label}
        </span>
        {option.description && (
          <span className="font-sans text-[11px] text-odm-muted leading-relaxed mt-0.5">
            {option.description}
          </span>
        )}
      </div>
    </label>
  );
}

/* ── CardSelect ──────────────────────────────────────────────────────────── */

/**
 * CardSelect — radio-style (or checkbox-style) selectable card group.
 *
 * Each option is displayed as a card with a bold `label` and an optional
 * `description` line. The active card gets a left accent border matching the
 * design pattern from the EDMoScope wizard provenance-category selector.
 *
 * @example
 * // Single-select (radio semantics)
 * <CardSelect
 *   options={[
 *     { value: "upload", label: "File upload", description: "CSV, Excel, JSON…" },
 *     { value: "api",    label: "API endpoint", description: "REST or GraphQL feed" },
 *     { value: "manual", label: "Manual entry", description: "Enter data by hand" },
 *   ]}
 *   value={provenance}
 *   onChange={setProvenance}
 * />
 *
 * @example
 * // Multi-select (checkbox semantics)
 * <CardSelect
 *   multiple
 *   options={[
 *     { value: "mobility", label: "Mobility",  description: "Transport & movement data" },
 *     { value: "env",      label: "Environment", description: "Air, noise, green spaces" },
 *   ]}
 *   value={categories}
 *   onChange={setCategories}
 *   direction="row"
 * />
 */
export function CardSelect(
  props: CardSelectProps | CardSelectMultiProps
): React.ReactElement {
  const {
    options,
    direction = "column",
    className = "",
  } = props;

  const groupName = React.useId();

  const isMulti = (props as CardSelectMultiProps).multiple === true;

  const singleValue =
    !isMulti ? ((props as CardSelectProps).value ?? null) : null;
  const multiValues = isMulti
    ? ((props as CardSelectMultiProps).value ?? [])
    : [];

  function isActive(v: string): boolean {
    if (isMulti) return multiValues.includes(v);
    return singleValue === v;
  }

  function handleSelect(v: string): void {
    if (isMulti) {
      const next = multiValues.includes(v)
        ? multiValues.filter((x) => x !== v)
        : [...multiValues, v];
      (props as CardSelectMultiProps).onChange?.(next);
    } else {
      (props as CardSelectProps).onChange?.(v);
    }
  }

  return (
    <div
      role={isMulti ? "group" : undefined}
      className={[
        direction === "row"
          ? "flex flex-wrap gap-3"
          : "flex flex-col gap-2",
        className,
      ].join(" ")}
    >
      {options.map((opt) => (
        <CardSelectItem
          key={opt.value}
          option={opt}
          isActive={isActive(opt.value)}
          onSelect={() => handleSelect(opt.value)}
          multiple={isMulti}
          groupName={groupName}
        />
      ))}
    </div>
  );
}

/**
 * EDMoScope UI — barrel export.
 *
 * Import from "@edmoscope-ui" (or the configured path alias) to access all
 * public components. This file is the single source of truth for the public
 * API surface of the library.
 *
 * HOW TO ADD A COMPONENT
 * ──────────────────────
 * 1. Create the file in the appropriate src/ subfolder.
 * 2. Export the component and its Props interface from that file.
 * 3. Add an export line here in the appropriate section.
 * 4. Add an entry to catalogue/Catalogue.tsx.
 * 5. See ARCHITECTURE.md § "How to add a component" for the full checklist.
 */

// ── Primitives ──────────────────────────────────────────────────────────────
export { Badge }                  from "./primitives/Badge.tsx";
export type { BadgeProps }        from "./primitives/Badge.tsx";

export { Button }                 from "./primitives/Button.tsx";
export type { ButtonProps }       from "./primitives/Button.tsx";

export { Icon }                   from "./primitives/Icon.tsx";
export type { IconProps }         from "./primitives/Icon.tsx";

export { Spinner }                from "./primitives/Spinner.tsx";
export type { SpinnerProps }      from "./primitives/Spinner.tsx";

export { Tooltip }                from "./primitives/Tooltip.tsx";
export type { TooltipProps }      from "./primitives/Tooltip.tsx";

// ── Typography ───────────────────────────────────────────────────────────────
export { Heading, Eyebrow }            from "./typography/Heading.tsx";
export type { HeadingProps, EyebrowProps } from "./typography/Heading.tsx";

export { Label }                  from "./typography/Label.tsx";
export type { LabelProps }        from "./typography/Label.tsx";

// ── Layout ───────────────────────────────────────────────────────────────────
export { AppShell }               from "./layout/AppShell.tsx";
export type { AppShellProps, NavItem } from "./layout/AppShell.tsx";

export { PageHeader }             from "./layout/PageHeader.tsx";
export type { PageHeaderProps }   from "./layout/PageHeader.tsx";

export { Section }                from "./layout/Section.tsx";

export { TopNavShell }            from "./layout/TopNavShell.tsx";
export type { TopNavShellProps }  from "./layout/TopNavShell.tsx";
export type { SectionProps }      from "./layout/Section.tsx";

export { Divider }                from "./layout/Divider.tsx";
export type { DividerProps }      from "./layout/Divider.tsx";

export { ListDetailPanel }        from "./layout/ListDetailPanel.tsx";
export type { ListDetailPanelProps } from "./layout/ListDetailPanel.tsx";

// ── Navigation ───────────────────────────────────────────────────────────────
export { TopBar, IDMLogo, LuxLion, UserChip } from "./navigation/TopBar.tsx";
export type { TopBarProps, IDMLogoProps, LuxLionProps, UserChipProps } from "./navigation/TopBar.tsx";

export { Sidebar, SidebarItem }   from "./navigation/Sidebar.tsx";
export type { SidebarProps, SidebarItemProps } from "./navigation/Sidebar.tsx";

export { NavTab }                 from "./navigation/NavTab.tsx";
export type { NavTabProps }       from "./navigation/NavTab.tsx";

export { Breadcrumb }             from "./navigation/Breadcrumb.tsx";
export type { BreadcrumbProps, BreadcrumbItem } from "./navigation/Breadcrumb.tsx";

export { GlobalSearch }           from "./navigation/GlobalSearch.tsx";
export type { GlobalSearchProps, SearchResult, SearchResultGroup } from "./navigation/GlobalSearch.tsx";

export { Tabs }                   from "./navigation/Tabs.tsx";
export type { TabsProps, TabListProps, TabProps, TabPanelProps } from "./navigation/Tabs.tsx";

// ── Feedback ──────────────────────────────────────────────────────────────────
export { EmptyState }             from "./feedback/EmptyState.tsx";
export type { EmptyStateProps }   from "./feedback/EmptyState.tsx";

export { ErrorBoundary }          from "./feedback/ErrorBoundary.tsx";
export type { ErrorBoundaryProps } from "./feedback/ErrorBoundary.tsx";

export { ToastProvider, useToast } from "./feedback/Toast.tsx";
export type { ToastProviderProps } from "./feedback/Toast.tsx";

export { Notice }                 from "./feedback/Notice.tsx";
export type { NoticeProps }       from "./feedback/Notice.tsx";

// ── Forms ────────────────────────────────────────────────────────────────────
export { Input, Textarea }        from "./forms/Input.tsx";
export type { InputProps, TextareaProps } from "./forms/Input.tsx";

export { Select }                 from "./forms/Select.tsx";
export type { SelectProps, SelectOption } from "./forms/Select.tsx";

export { SearchBox }              from "./forms/SearchBox.tsx";
export type { SearchBoxProps }    from "./forms/SearchBox.tsx";

export { FilterBar }              from "./forms/FilterBar.tsx";
export type { FilterBarProps, FilterDefinition, FilterState } from "./forms/FilterBar.tsx";

export { Combobox }               from "./forms/Combobox.tsx";
export type { ComboboxProps, ComboboxOption } from "./forms/Combobox.tsx";

export { CardSelect }             from "./forms/CardSelect.tsx";
export type { CardSelectProps, CardSelectMultiProps, CardSelectOption } from "./forms/CardSelect.tsx";

// ── Data display ──────────────────────────────────────────────────────────────
export { DataTable }              from "./data/DataTable.tsx";
export type { DataTableProps, ColumnDef } from "./data/DataTable.tsx";

export { MetadataList }           from "./data/MetadataList.tsx";
export type { MetadataListProps, MetadataEntry } from "./data/MetadataList.tsx";

export { StatCard, StatRow }      from "./data/StatCard.tsx";
export type { StatCardProps, StatRowProps } from "./data/StatCard.tsx";

export { TierBadge }              from "./data/TierBadge.tsx";
export type { TierBadgeProps }    from "./data/TierBadge.tsx";

export { SqlWorkbench }           from "./data/SqlWorkbench.tsx";
export type { SqlWorkbenchProps, SavedQuery, ResultRow, DrawerState } from "./data/SqlWorkbench.tsx";

// ── Cards ─────────────────────────────────────────────────────────────────────
export { EntryCard }               from "./cards/EntryCard.tsx";
export type { EntryCardProps, EntryCardStatus } from "./cards/EntryCard.tsx";

export { StackPanel }              from "./cards/StackPanel.tsx";
export type { StackPanelProps }    from "./cards/StackPanel.tsx";

export { ProvenanceCard }          from "./cards/ProvenanceCard.tsx";
export type { ProvenanceCardProps, ProvenanceAccent, ProvenancePanelEntry } from "./cards/ProvenanceCard.tsx";

// ── Overlays ──────────────────────────────────────────────────────────────────
export { Modal }                  from "./overlays/Modal.tsx";
export type { ModalProps }        from "./overlays/Modal.tsx";

export { Drawer }                 from "./overlays/Drawer.tsx";
export type { DrawerProps }       from "./overlays/Drawer.tsx";

export { ConfirmDialog }          from "./overlays/ConfirmDialog.tsx";
export type { ConfirmDialogProps } from "./overlays/ConfirmDialog.tsx";

// ── Design tokens (re-exported for consumers that need JS access) ─────────────
export { COLORS, TIER_COLORS, TIER_DESCRIPTIONS, SURFACE, SEMANTIC } from "../tokens.ts";
export type { Tier } from "../tokens.ts";

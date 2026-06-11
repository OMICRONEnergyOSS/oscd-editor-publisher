# ClientLN Dialog Notes

## Current Decision

The ClientLN assignment dialog should move away from `oscd-tree-grid`.

`oscd-tree-grid` was tried as a pragmatic existing control, but its layout model
does not match the UX needed here. It renders tree paths across columns:

```text
PUB_A | AP1 | LD_A | TCTR1
PUB_A | AP1 | LD_A | XCBR1
```

The desired interaction is a conventional vertical tree:

```text
PUB_A
  AP1
    LD_A
      LLN0
      TCTR1
      XCBR1
PUB_B
  AP1
    LD_B
      LLN0
      TCTR1
```

Because `oscd-tree-grid` treats depth as columns, expanded children appear on
the same row as their parents. It also renders repeated parent cells as grey
`noninteractive` placeholders to align path rows. Those behaviors are not bugs
in our usage; they are part of the component's design.

Conclusion: build a plugin-local `oscd-tree`/`oscd-tree-item` pair for this
dialog first. If the API proves useful, move it to `@omicronenergy/oscd-ui`.

## Design Principle

The tree should follow this contract:

```text
Data is structured. Rendering is flexible.
```

The tree owns behavior:

- visible-row flattening
- expansion state
- selection state
- filtering support
- active/focused row
- keyboard navigation
- ARIA roles
- a future path to virtualization

The caller owns presentation through a required `renderItem` function.

This avoids both extremes:

- Arbitrary slotted DOM is flexible, but difficult to filter, virtualize, and
  coordinate with keyboard navigation.
- A fully prescriptive node model is easy to implement, but constrains future
  row designs too much.

## Proposed `oscd-tree` API

Keep the base node intentionally small:

```ts
export type OscdTreeNode = {
  id: string;
  children: OscdTreeNode[];
};
```

Consumers extend it with app-specific fields:

```ts
type ClientLnTreeNode = OscdTreeNode & {
  kind: 'ied' | 'access-point' | 'l-device' | 'logical-node';
  label: string;
  pathLabel: string;
  element?: Element;
  clientLnId?: string;
};
```

Do not add a generic `metadata` field. Direct type extension is clearer.

Do not put `selected` or `expanded` into node data. Those are view state and
should be controlled separately.

Suggested properties:

```ts
data: T[];
selectedIds: string[];
expandedIds: string[];
renderItem: (context: OscdTreeRenderContext<T>) => TemplateResult;
isSelectable?: (node: T) => boolean;
isDisabled?: (node: T) => boolean;
selectionMode?: 'none' | 'single' | 'multiple';
```

Possible later properties:

```ts
filter?: string;
filterPredicate?: (node: T, filter: string) => boolean;
showSelectedOnly?: boolean;
autoExpandMatches?: boolean;
```

Suggested events:

```text
selected-ids-changed
expanded-ids-changed
node-click
node-toggle
node-activate
```

Event names can still be adjusted to match `oscd-ui` conventions.

## Render Context

The row renderer needs more than the raw node. It needs tree-derived state for
the node's current rendered relationship to the tree.

```ts
export type OscdTreeRenderContext<T extends OscdTreeNode> = {
  node: T;
  level: number;
  expanded: boolean;
  selected: boolean;
  active: boolean;
  hasChildren: boolean;
  selectable: boolean;
  disabled: boolean;
};
```

Field meanings:

- `node`: the caller's app-specific node object.
- `level`: indentation depth.
- `expanded`: current expand/collapse state.
- `selected`: current selection state.
- `active`: current keyboard/focus row.
- `hasChildren`: whether an expand affordance should be shown.
- `selectable`: computed from tree mode or `isSelectable`.
- `disabled`: computed from `isDisabled`.

Example usage:

```ts
private renderClientLnTreeItem = (
  context: OscdTreeRenderContext<ClientLnTreeNode>,
) => html`
  <oscd-tree-item
    .level=${context.level}
    ?expanded=${context.expanded}
    ?selected=${context.selected}
    ?active=${context.active}
    ?hasChildren=${context.hasChildren}
    ?selectable=${context.selectable}
    ?disabled=${context.disabled}
  >
    <span slot="headline">${context.node.label}</span>
    <span slot="supporting-text">${context.node.pathLabel}</span>
  </oscd-tree-item>
`;
```

## Proposed `oscd-tree-item`

`oscd-tree-item` should be the default row shell and styling primitive. It
should not be the only possible row implementation.

Suggested slots:

```text
start
headline
supporting-text
end
```

It should handle:

- indentation
- expand/collapse affordance location
- selected styling
- active/focus styling
- disabled styling
- minimum row height
- row layout and hit target sizing

The parent `oscd-tree` should still centralize behavior, selection, expansion,
and keyboard navigation.

## Accessibility Requirements

The first version should be accessible enough to become an `oscd-ui` candidate.

Root:

```html
role="tree"
```

Rows/items:

```html
role="treeitem"
aria-level="..."
aria-expanded="..."  // only when the node has children
aria-selected="..."  // only when selectable
```

Keyboard behavior:

- `ArrowDown`: move active row down.
- `ArrowUp`: move active row up.
- `ArrowRight`: expand if collapsed; otherwise move to first child when
  possible.
- `ArrowLeft`: collapse if expanded; otherwise move to parent when possible.
- `Home`: move to first visible row.
- `End`: move to last visible row.
- `Enter` / `Space`: toggle selection or activate the row.

Use roving `tabindex` so only one visible item is tabbable.

## Rendering And Virtualization

Internally, flatten visible nodes into rows:

```ts
type VisibleTreeNode<T extends OscdTreeNode> = {
  node: T;
  level: number;
  parentIds: string[];
};
```

The first implementation can render visible rows with Lit `map()`.

Because the tree is already flattened internally, it can later swap the row
renderer to `@lit-labs/virtualizer` without changing the public API. This
matters for large SCL files.

## ClientLN Dialog Requirements

The ClientLN dialog starts from one selected `ReportControl` and edits its
`RptEnabled > ClientLN` children:

```text
selected ReportControl -> selected LNs
```

The candidate tree should be:

```text
IED
  AccessPoint
    AP-level LN
    LDevice
      LN0
      LN
```

Selection rules:

- Only logical-node rows are selectable.
- Branch rows expand/collapse but are not selected.
- If `RptEnabled@max` is reached, unselected logical-node rows should be
  disabled.
- Already selected rows must remain enabled so they can be deselected.
- Applying changes writes/removes `RptEnabled > ClientLN` edits as today.

The dialog should keep:

- `selectedClientLnIds`
- `initialClientLnIds`
- `expandedClientLnIds`
- `showSelectedClientLnsOnly`

The selected count remains:

```text
selected / RptEnabled max
```

The "show selected only" toolbar button can remain outside the tree. For the
first version, the dialog can filter the tree data before passing it to
`oscd-tree`.

## ClientLN Attribute Constraints

The concrete constraints discussed:

- `iedName` must be non-empty.
- `ldInst` must be non-empty.
- If the reference is to an LN at a pure client access point, `ldInst` should be
  `LD0`.
- `prefix` is optional only when the referenced LN has no prefix.
- `lnInst` is required; for `LLN0`, it is the empty string.
- Spec examples using `IHMI1` suggest client-side access points/client LNs, but
  legacy also allowed server-side `LDevice` LNs and `LN0`s.

## Legacy Reference

The legacy OpenSCD ClientLN wizard lives at:

```text
/home/steren00/code/OmicronEnergyOSS/oscd-legacy-wizard/submodules/open-scd/packages/plugins/src/wizards/clientln.ts
```

It was launched from the Substation IED editor:

```text
/home/steren00/code/OmicronEnergyOSS/oscd-legacy-wizard/submodules/open-scd/packages/plugins/src/editors/substation/ied-editor.ts
```

The call site was:

```ts
const sendingIeds = Array.from(
  this.element.closest('SCL')?.querySelectorAll('IED') ?? []
);
const wizard = createClientLnWizard(sendingIeds, this.element);
```

Important clarification:

- `this.element` is the IED currently selected in the Substation editor.
- `sendingIeds` is badly named; it is all IEDs in the SCL.
- The left list in the legacy wizard is all `ReportControl`s from all IEDs.
- The right list is all candidate LNs under the currently selected IED.

Legacy candidate LN selectors were:

```ts
sinkIED.querySelectorAll(':root > IED > AccessPoint > LN')
sinkIED.querySelectorAll(':root > IED > AccessPoint > Server > LDevice > LN')
sinkIED.querySelectorAll(':root > IED > AccessPoint > Server > LDevice > LN0')
```

So legacy supported:

- AP-level LNs.
- Server/LDevice LNs.
- Server/LDevice LN0s.

The old legacy flow was:

```text
selected IED -> selected LNs -> selected ReportControls
```

The publisher plugin's current flow is the inverse:

```text
selected ReportControl -> selected LNs
```

That means the new dialog does not naturally have the legacy concept of the
currently selected IED.

## Current Tree-Grid Fixes Already Made

These are useful historical notes while the temporary `oscd-tree-grid`
implementation is still in the branch:

- The dialog was refactored out of `report-control-editor` into
  `client-ln-assignment-dialog`.
- The tree data builder now preserves existing branch children so sibling LNs
  under the same LD are not overwritten.
- A regression test checks that both `TCTR1` and `XCBR1` stay under
  `PUB_A > AP1 > LD_A`.
- A local subclass hides `oscd-tree-grid`'s grey `noninteractive` repeated cells
  in this dialog only.

These fixes should not be treated as the final UX direction.

## Superseded Ideas

### Virtualized Flat List

The dialog previously used a very large flat list of candidate LNs. That caused
browser performance problems on large files and made navigation poor. A
virtualized flat list would reduce DOM pressure, but would not solve the user
workflow problem of finding LNs in a meaningful hierarchy.

### Two-Pane Picker

A two-pane picker was considered:

```text
Browse tree | Selected list
```

The benefit was always-visible selected items. The downside is extra dialog
width and complexity. The current direction is a single tree with selected
count and a "show selected only" toggle. A selected summary pane can be
reconsidered later if users struggle to review selected LNs.

### `oscd-action-tree`

`oscd-action-tree` exists in `@omicronenergy/oscd-ui`, but its API is
value/action-column oriented:

```ts
type TreeNode = {
  name: string;
  icon?: SVGElement | string;
  info?: string;
  leaf?: { val: string | number | boolean | null; edit?: () => void }[];
  children?: TreeNode[];
};
```

It does not fit a selectable ClientLN tree with custom row rendering.

## Open Questions

- Should candidates include all IEDs by default?
- Should the selected `ReportControl`'s own IED be included as a possible client
  target?
- Should AP-level `LN` and server-side `LDevice > LN/LN0` be visually separated
  beyond the hierarchy itself?
- Should stale/unresolved existing `ClientLN`s appear in a separate "Existing
  unresolved" group so they can always be removed?
- Should filtering be owned by the generic tree in v1, or remain external in
  the ClientLN dialog until the tree API stabilizes?

## Monday Implementation Plan

1. Keep the current `oscd-tree-grid` implementation as a working baseline.

2. Add plugin-local components:

   ```text
   src/components/oscd-tree.ts
   src/components/oscd-tree-item.ts
   ```

3. Implement minimal generic tree behavior:

   - `data`
   - `selectedIds`
   - `expandedIds`
   - required `renderItem`
   - `isSelectable`
   - `isDisabled`
   - visible row flattening
   - click to expand/collapse
   - click/keyboard to select

4. Add focused component tests:

   - flattening collapsed/expanded trees
   - preserving row levels
   - expansion events
   - selection events
   - leaf-only selection via `isSelectable`
   - disabled row enforcement via `isDisabled`

5. Replace the ClientLN dialog's `oscd-tree-grid` with the new local
   `oscd-tree`.

6. Add/adjust ClientLN dialog tests:

   - vertical hierarchy for `PUB_A > AP1 > LD_A > TCTR1/XCBR1`
   - selected count
   - max selection behavior
   - show-selected-only behavior
   - applying additions/removals still emits the same edit structure

7. Once the component works well in this plugin, consider moving the generic
   tree and item components to `@omicronenergy/oscd-ui` with stories, docs, API
   review, accessibility review, and virtualization follow-up.

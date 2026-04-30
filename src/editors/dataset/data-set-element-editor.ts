import { css, html, LitElement, TemplateResult } from 'lit';
import { property, query, queryAll, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import {
  ActionItem,
  OscdActionList,
} from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { OscdTreeGrid } from '@omicronenergy/oscd-ui/tree-grid/OscdTreeGrid.js';

import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import {
  canAddFCDA,
  find,
  identity,
  maxAttributes,
  removeFCDA,
  updateDataSet,
} from '@openscd/scl-lib';

import { addFCDAs, addFCDOs, getFcdaInstDesc } from './foundation.js';
import { dataAttributeTree } from './dataAttributePicker.js';
import { dataObjectTree } from './dataObjectPicker.js';

function dataAttributePaths(doc: XMLDocument, paths: string[][]): Element[][] {
  const daPaths: Element[][] = [];
  for (const path of paths) {
    const daPath: Element[] = [];
    for (const section of path) {
      const [tag, id] = section.split(': ');
      const ancestor = find(doc, tag, id);
      if (ancestor) {
        daPath.push(ancestor);
      }
    }
    daPaths.push(daPath);
  }

  return daPaths;
}

function functionalConstraintPaths(
  doc: XMLDocument,
  paths: string[][],
): { path: Element[]; fc: string }[] {
  const fcPaths: { path: Element[]; fc: string }[] = [];
  for (const path of paths) {
    const doPath: Element[] = [];
    let fc = '';
    for (const section of path) {
      const [tag, id] = section.split(': ');
      if (tag === 'FC') {
        fc = id;
      }
      const ancestor = find(doc, tag, id);
      if (ancestor) {
        doPath.push(ancestor);
      }
    }
    fcPaths.push({ path: doPath, fc });
  }

  return fcPaths;
}

function loadIcon(percent: number): string {
  if (percent < 0.1) {
    return 'circle';
  }
  if (percent < 0.2) {
    return 'clock_loader_10';
  }
  if (percent < 0.4) {
    return 'clock_loader_20';
  }
  if (percent < 0.6) {
    return 'clock_loader_40';
  }
  if (percent < 0.8) {
    return 'clock_loader_60';
  }
  if (percent < 0.9) {
    return 'clock_loader_80';
  }
  if (percent < 1) {
    return 'clock_loader_90';
  }

  return 'stroke_full';
}

export class DataSetElementEditor extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-action-list': OscdActionList,
    'oscd-text-button': OscdTextButton,
    'oscd-dialog': OscdDialog,
    'oscd-icon': OscdIcon,
    'oscd-tree-grid': OscdTreeGrid,
    'oscd-scl-text-field': OscdSclTextField,
  };

  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** The element being edited */
  @property({ attribute: false })
  element: Element | null = null;

  /** SCL change indicator */
  @property({ attribute: false })
  docVersion?: unknown;

  @state()
  private get name(): string | null {
    return this.element?.getAttribute('name') ?? null;
  }

  @state()
  private get desc(): string | null {
    return this.element?.getAttribute('desc') ?? null;
  }

  @state()
  private get fcdaCount(): number {
    return this.element?.querySelectorAll('FCDA').length ?? 0;
  }

  @state()
  private someDiffOnInputs = false;

  @queryAll('oscd-scl-text-field') inputs!: OscdSclTextField[];

  @query('.dataset.save') saveButton!: OscdTextButton;

  @query('.list.fcda') fcdaList!: OscdActionList;

  @query('#dapickerbutton') daPickerButton!: OscdTextButton;

  @query('#dapicker') daPickerDialog!: OscdDialog;

  @query('#dapicker > oscd-tree-grid') daPicker!: OscdTreeGrid;

  @query('.da.picker.save') daPickerSaveButton!: OscdTextButton;

  @query('#dopickerbutton') doPickerButton!: OscdTextButton;

  @query('#dopicker') doPickerDialog!: OscdDialog;

  @query('#dopicker > oscd-tree-grid') doPicker!: OscdTreeGrid;

  @query('.do.picker.save') doPickerSaveButton!: OscdTextButton;

  public resetInputs(): void {
    this.element = null; // removes inputs and forces a re-render

    // reset save button
    this.someDiffOnInputs = false;

    for (const input of this.inputs) {
      if (input instanceof OscdSclTextField) {
        input.reset();
      }
    }
  }

  onInputChange(): void {
    if (!this.element) {
      return;
    }

    this.someDiffOnInputs = Array.from(this.inputs ?? []).some(
      input => this.element?.getAttribute(input.label) !== input.value,
    );
  }

  private saveChanges(): void {
    if (!this.element) {
      return;
    }

    const attributes: Record<string, string | null> = {};
    for (const input of this.inputs ?? []) {
      if (this.element.getAttribute(input.label) !== input.value) {
        attributes[input.label] = input.value;
      }
    }

    this.dispatchEvent(
      newEditEventV2(updateDataSet({ element: this.element, attributes }), {
        title: `Update DataSet ${identity(this.element)}`,
      }),
    );

    this.resetInputs();

    this.onInputChange();
  }

  private saveDataObjects(): void {
    const { paths } = this.doPicker;

    const actions = addFCDOs(
      this.element!,
      functionalConstraintPaths(this.element!.ownerDocument, paths),
    );

    this.dispatchEvent(
      newEditEventV2(actions, {
        title: `Add Data Object to DataSet ${identity(this.element)}`,
      }),
    );
    this.doPickerDialog.close();
  }

  private saveDataAttributes(): void {
    const { paths } = this.daPicker;

    const actions = addFCDAs(
      this.element!,
      dataAttributePaths(this.element!.ownerDocument, paths),
    );

    this.dispatchEvent(
      newEditEventV2(actions, {
        title: `Add Data Attributes to DataSet ${identity(this.element)}`,
      }),
    );
    this.daPickerDialog.close();
  }

  private onMoveFCDAUp(fcda: Element): void {
    const remove = { node: fcda };
    const insert = {
      parent: fcda.parentElement,
      node: fcda,
      reference: fcda.previousElementSibling,
    };

    this.dispatchEvent(
      newEditEventV2([remove, insert], { title: 'Change FCDA order' }),
    );
  }

  private onMoveFCDADown(fcda: Element): void {
    const remove = { node: fcda };
    const insert = {
      parent: fcda.parentElement,
      node: fcda,
      reference: fcda.nextElementSibling?.nextElementSibling,
    };

    this.dispatchEvent(
      newEditEventV2([remove, insert], { title: 'Change FCDA order' }),
    );
  }

  private renderFCDAList(): TemplateResult {
    const items: ActionItem[] = Array.from(
      this.element!.querySelectorAll('FCDA'),
    ).map((fcda, i, arr) => {
      const [ldInst, prefix, lnClass, lnInst, doName, daName, fc] = [
        'ldInst',
        'prefix',
        'lnClass',
        'lnInst',
        'doName',
        'daName',
        'fc',
      ].map(attributeName => fcda.getAttribute(attributeName) ?? '');

      const actions = [
        {
          icon: 'delete',
          label: '',
          callback: () => {
            this.dispatchEvent(
              newEditEventV2(removeFCDA({ node: fcda }), {
                title: 'Remove FCDA',
              }),
            );
          },
        },
      ];

      if (i > 0) {
        actions.push({
          icon: 'text_select_move_up',
          label: 'move up',
          callback: () => {
            this.onMoveFCDAUp(fcda);
          },
        });
      }
      if (arr.length !== i + 1) {
        actions.push({
          icon: 'text_select_move_down',
          label: 'move down',
          callback: () => {
            this.onMoveFCDADown(fcda);
          },
        });
      }

      const description = Object.values(getFcdaInstDesc(fcda))
        .flat(Infinity as 1)
        .join(' > ');

      return {
        headline: `${ldInst}/${prefix}${lnClass}${lnInst}.${doName}${
          daName ? `.${daName} [${fc}]` : ` [${fc}]`
        }`,
        supportingText: description,
        actions,
      };
    });

    return html`<oscd-action-list
      class="list fcda"
      .items=${items}
      height="84"
      filterable
      searchhelper="Filter Data"
    ></oscd-action-list>`;
  }

  private renderDataObjectPicker(): TemplateResult {
    const server = this.element?.closest('Server');
    if (!server) {
      return html``;
    }

    return html` <oscd-text-button
        id="doPickerButton"
        icon="playlist_add"
        ?disabled=${!canAddFCDA(this.element!)}
        @click=${() => this.doPickerDialog?.show()}
        >Add data object<oscd-icon slot="icon"
          >playlist_add</oscd-icon
        ></oscd-text-button
      ><oscd-dialog id="dopicker">
        <div slot="headline">Add Data Objects</div>
        <oscd-tree-grid
          slot="content"
          .tree=${dataObjectTree(server)}
        ></oscd-tree-grid>
        <div slot="actions">
          <oscd-text-button @click=${() => this.doPickerDialog?.close()}
            >Close</oscd-text-button
          >
          <oscd-text-button
            class="do picker save"
            @click=${this.saveDataObjects}
            >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
          >
        </div>
      </oscd-dialog>`;
  }

  private renderDataAttributePicker(): TemplateResult {
    const server = this.element?.closest('Server');
    if (!server) {
      return html``;
    }

    return html` <oscd-text-button
        id="daPickerButton"
        icon="playlist_add"
        ?disabled=${!canAddFCDA(this.element!)}
        @click=${() => this.daPickerDialog.show()}
        >Add data attribute<oscd-icon slot="icon"
          >playlist_add</oscd-icon
        ></oscd-text-button
      ><oscd-dialog id="dapicker">
        <div slot="headline">Add Data Attributes</div>
        <oscd-tree-grid
          slot="content"
          .tree="${dataAttributeTree(server)}"
        ></oscd-tree-grid>
        <div slot="actions">
          <oscd-text-button @click=${() => this.daPickerDialog?.close()}
            >Close</oscd-text-button
          >
          <oscd-text-button
            class="da picker save"
            @click=${this.saveDataAttributes}
          >
            Save
            <oscd-icon slot="icon">Save</oscd-icon>
          </oscd-text-button>
        </div>
      </oscd-dialog>`;
  }

  private renderDataPickers(): TemplateResult {
    return html`
      <div style="display: flex; flex-direction:row;align-self: center;">
        ${this.renderDataAttributePicker()} ${this.renderDataObjectPicker()}
      </div>
    `;
  }

  private renderLimits(): TemplateResult {
    if (!this.element) {
      return html``;
    }

    const { max } = maxAttributes(this.element);
    const is = this.fcdaCount;

    return html`<h3
      style="display: flex; flex-direction:row;align-self: center;"
    >
      Entries: <oscd-icon>${loadIcon(is / max)}</oscd-icon> ${is}/${max}
    </h3>`;
  }

  private renderDataSetAttributes(): TemplateResult {
    return html`<oscd-scl-text-field
        id="${identity(this.element)}"
        tag="${this.element?.tagName ?? ''}"
        label="name"
        .value=${this.name}
        supportingText="DataSet name"
        required
        @input=${() => this.onInputChange()}
      >
      </oscd-scl-text-field>
      <oscd-scl-text-field
        id="${identity(this.element)}"
        label="desc"
        .value=${this.desc}
        supportingText="DataSet Description"
        nullable
        @input=${() => this.onInputChange()}
      >
      </oscd-scl-text-field>
      <oscd-text-button
        class="dataset save"
        ?disabled=${!this.someDiffOnInputs}
        @click=${() => this.saveChanges()}
        >Save<oscd-icon slot="icon">save</oscd-icon></oscd-text-button
      >
      <hr color="lightgrey" />`;
  }

  private renderHeader(): TemplateResult {
    const subtitle = this.element
      ? identity(this.element)
      : 'No DataSet connected';

    return html`<h2>
      <div style="display:flex; flex-direction:row;">
        <div style="flex:auto;">
          <div>DataSet</div>
          <div class="headersubtitle">${subtitle}</div>
        </div>
        <slot name="change"></slot>
        <slot name="new"></slot>
      </div>
    </h2>`;
  }

  render(): TemplateResult {
    if (this.element) {
      return html`<div class="content">
        ${this.renderHeader()}${this.renderDataSetAttributes()}
        ${this.renderLimits()}${this.renderDataPickers()}${this.renderFCDAList()}
      </div>`;
    }

    return html`<div class="content">${this.renderHeader()}</div>`;
  }

  static styles = css`
    .content {
      display: flex;
      flex-direction: column;
      background-color: var(--mdc-theme-surface);
    }

    .content > * {
      display: block;
      margin: 4px 8px 16px;
    }

    .save {
      display: flex;
      align-self: flex-end;
    }

    h2,
    h3 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;

      margin: 0px;
      padding-left: 0.3em;
      transition: background-color 150ms linear;
    }

    .headersubtitle {
      font-size: 16px;
      font-weight: 200;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    oscd-dialog {
      min-width: 80%;
      min-height: 80%;
    }

    *[iconTrailing='search'] {
      --mdc-shape-small: 28px;
    }

    ::slotted(oscd-icon-button[disabled]) {
      display: none;
    }
  `;
}

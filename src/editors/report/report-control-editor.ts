import { css, html, TemplateResult } from 'lit';
import { query, state } from 'lit/decorators.js';

import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdCheckbox } from '@omicronenergy/oscd-ui/checkbox/OscdCheckbox.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdList } from '@omicronenergy/oscd-ui/list/OscdList.js';
import { OscdListItem } from '@omicronenergy/oscd-ui/list/OscdListItem.js';
import { OscdMenu } from '@omicronenergy/oscd-ui/menu/OscdMenu.js';
import { OscdMenuItem } from '@omicronenergy/oscd-ui/menu/OscdMenuItem.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdOutlinedTextField } from '@omicronenergy/oscd-ui/textfield/OscdOutlinedTextField.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';

import type { EditV2, Insert } from '@openscd/oscd-api';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import {
  createReportControl,
  getReference,
  identity,
  removeControlBlock,
} from '@openscd/scl-lib';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';

import { pathIdentity, styles } from '../../foundation.js';

import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { ReportControlElementEditor } from './report-control-element-editor.js';
import { BaseElementEditor } from '../base-element-editor.js';

export class ReportControlEditor extends BaseElementEditor {
  static scopedElements = {
    'oscd-action-list': OscdActionList,
    'oscd-checkbox': OscdCheckbox,
    'data-set-element-editor': DataSetElementEditor,
    'oscd-list': OscdList,
    'oscd-list-item': OscdListItem,
    'oscd-menu': OscdMenu,
    'oscd-menu-item': OscdMenuItem,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-outlined-text-field': OscdOutlinedTextField,
    'oscd-text-button': OscdTextButton,
    'report-control-element-editor': ReportControlElementEditor,
    'oscd-icon-button': OscdIconButton,
    'oscd-icon': OscdIcon,
    'oscd-dialog': OscdDialog,
  };

  @state()
  private clientLnAssignmentReport?: Element;

  @state()
  private reportFilter = '';

  @state()
  private selectedClientLnIds: string[] = [];

  @state()
  private initialClientLnIds: string[] = [];

  @query('.selectionlist') selectionList!: HTMLElement;

  @query('.client-ln.assignment.dialog')
  clientLnAssignmentDialog!: OscdDialog;

  @query('.change.scl.element') selectReportControlButton!: OscdOutlinedButton;

  @query('report-control-element-editor')
  rpControlElementEditor!: ReportControlElementEditor;

  @query('data-set-element-editor')
  dataSetElementEditor!: DataSetElementEditor;

  private get reportClientLNs(): Element[] {
    return Array.from(
      this.doc.querySelectorAll(
        ':root > IED > AccessPoint > LN, :root > IED > AccessPoint > Server > LDevice > LN, :root > IED > AccessPoint > Server > LDevice > LN0',
      ),
    );
  }

  private renderElementEditorContainer(): TemplateResult {
    if (this.selectedControlBlock !== undefined) {
      return html`<div class="elementeditorcontainer">
        ${this.renderDataSetElementContainer()}
        <report-control-element-editor
          .doc=${this.doc}
          .element=${this.selectedControlBlock}
          .docVersion=${this.docVersion}
        ></report-control-element-editor>
      </div>`;
    }

    return html``;
  }

  private createReportControl(ied: Element): void {
    const insertReportControl = createReportControl(ied);
    if (insertReportControl) {
      this.dispatchEvent(
        newEditEventV2(insertReportControl, {
          title: 'Create New ReportControl',
        }),
      );
    }
  }

  private canCreateReportControl(ied: Element): boolean {
    return createReportControl(ied) !== null;
  }

  private selectReportControl(reportControl: Element): void {
    if (this.selectedControlBlock === reportControl) {
      return;
    }

    if (this.rpControlElementEditor) {
      this.rpControlElementEditor.resetInputs();
    }

    if (this.dataSetElementEditor) {
      this.dataSetElementEditor.resetInputs();
    }

    this.selectControlBlock(reportControl);
    this.selectionList.classList.add('hidden');
    this.selectReportControlButton.classList.remove('hidden');
  }

  private removeReportControl(reportControl: Element): void {
    this.dispatchEvent(
      newEditEventV2(removeControlBlock({ node: reportControl }), {
        title: `Remove ReportControl ${identity(reportControl)}`,
      }),
    );

    if (this.selectedControlBlock === reportControl) {
      this.clearSelectedControlBlock();
    }
  }

  private openClientLnAssignmentDialog(reportControl: Element): void {
    this.clientLnAssignmentReport = reportControl;
    this.selectedClientLnIds = this.assignedClientLogicalNodes(
      reportControl,
    ).map(logicalNode => this.clientLnId(logicalNode));
    this.initialClientLnIds = [...this.selectedClientLnIds];
    this.clientLnAssignmentDialog.show();
  }

  private showReportActionsMenu(event: Event): void {
    event.stopPropagation();

    const button = event.currentTarget as OscdIconButton;
    const menu = button.nextElementSibling as OscdMenu;
    menu.anchorElement = button;
    menu.show();
  }

  private clientLnId(logicalNode: Element): string {
    const ied = logicalNode.closest('IED');
    const accessPoint = logicalNode.closest('AccessPoint');
    const lDevice = logicalNode.closest('LDevice');

    return [
      ied?.getAttribute('name') ?? '',
      accessPoint?.getAttribute('name') ?? '',
      lDevice?.getAttribute('inst') ?? '',
      logicalNode.getAttribute('prefix') ?? '',
      logicalNode.getAttribute('lnClass') ?? '',
      logicalNode.getAttribute('inst') ?? '',
    ].join('|');
  }

  private hasClientLn(reportControl: Element, logicalNode: Element): boolean {
    const [iedName, apRef, ldInst, prefix, lnClass, lnInst] =
      this.clientLnId(logicalNode).split('|');

    return Array.from(
      reportControl.querySelectorAll(':scope > RptEnabled > ClientLN'),
    ).some(
      clientLn =>
        (clientLn.getAttribute('iedName') ?? '') === iedName &&
        (clientLn.getAttribute('apRef') ?? '') === apRef &&
        (clientLn.getAttribute('ldInst') ?? '') === ldInst &&
        (clientLn.getAttribute('prefix') ?? '') === prefix &&
        (clientLn.getAttribute('lnClass') ?? '') === lnClass &&
        (clientLn.getAttribute('lnInst') ?? '') === lnInst,
    );
  }

  private clientLnForLogicalNode(
    reportControl: Element,
    logicalNode: Element,
  ): Element | undefined {
    const [iedName, apRef, ldInst, prefix, lnClass, lnInst] =
      this.clientLnId(logicalNode).split('|');

    return Array.from(
      reportControl.querySelectorAll(':scope > RptEnabled > ClientLN'),
    ).find(
      clientLn =>
        (clientLn.getAttribute('iedName') ?? '') === iedName &&
        (clientLn.getAttribute('apRef') ?? '') === apRef &&
        (clientLn.getAttribute('ldInst') ?? '') === ldInst &&
        (clientLn.getAttribute('prefix') ?? '') === prefix &&
        (clientLn.getAttribute('lnClass') ?? '') === lnClass &&
        (clientLn.getAttribute('lnInst') ?? '') === lnInst,
    );
  }

  private assignedClientLogicalNodes(reportControl: Element): Element[] {
    return this.reportClientLNs.filter(logicalNode =>
      this.hasClientLn(reportControl, logicalNode),
    );
  }

  private clientLnInsert(
    reportControl: Element,
    logicalNode: Element,
    parent: Element,
  ): Insert {
    return {
      parent,
      node: createElement(reportControl.ownerDocument, 'ClientLN', {
        iedName: logicalNode.closest('IED')?.getAttribute('name') ?? null,
        apRef: logicalNode.closest('AccessPoint')?.getAttribute('name') ?? null,
        ldInst: logicalNode.closest('LDevice')?.getAttribute('inst') ?? 'LD0',
        prefix: logicalNode.getAttribute('prefix') ?? '',
        lnClass: logicalNode.getAttribute('lnClass') ?? '',
        lnInst: logicalNode.getAttribute('inst') ?? '',
      }),
      reference: null,
    };
  }

  private updateSelectedClientLns(): void {
    const reportControl = this.clientLnAssignmentReport;
    if (!reportControl) {
      return;
    }

    const selectedIds = new Set(this.selectedClientLnIds);
    const initialIds = new Set(this.initialClientLnIds);
    const logicalNodesById = new Map(
      this.reportClientLNs.map(
        logicalNode => [this.clientLnId(logicalNode), logicalNode] as const,
      ),
    );

    let rptEnabled = reportControl.querySelector(':scope > RptEnabled');
    const edits: EditV2[] = [];

    const clientLnsToAdd = this.selectedClientLnIds
      .filter(id => !initialIds.has(id))
      .map(id => logicalNodesById.get(id))
      .filter((logicalNode): logicalNode is Element => !!logicalNode);

    const clientLnsToRemove = this.initialClientLnIds
      .filter(id => !selectedIds.has(id))
      .map(id => logicalNodesById.get(id))
      .filter((logicalNode): logicalNode is Element => !!logicalNode)
      .map(logicalNode =>
        this.clientLnForLogicalNode(reportControl, logicalNode),
      )
      .filter((clientLn): clientLn is Element => !!clientLn);

    if (!rptEnabled && clientLnsToAdd.length) {
      rptEnabled = createElement(reportControl.ownerDocument, 'RptEnabled', {
        max: `${Math.max(1, clientLnsToAdd.length)}`,
      });

      edits.push({
        parent: reportControl,
        node: rptEnabled,
        reference: getReference(reportControl, 'RptEnabled'),
      });
    }

    clientLnsToAdd.forEach(logicalNode => {
      if (!this.hasClientLn(reportControl, logicalNode)) {
        edits.push(
          this.clientLnInsert(reportControl, logicalNode, rptEnabled!),
        );
      }
    });

    clientLnsToRemove.forEach(clientLn => {
      edits.push({ node: clientLn });
    });

    if (edits.length > 0) {
      this.dispatchEvent(
        newEditEventV2(edits, {
          title: `Update Client LNs of ReportControl ${identity(reportControl)}`,
        }),
      );
    }

    this.clientLnAssignmentDialog.close();
    this.clientLnAssignmentReport = undefined;
    this.selectedClientLnIds = [];
    this.initialClientLnIds = [];
  }

  private toggleClientLnSelection(
    logicalNode: Element,
    selected: boolean,
  ): void {
    const id = this.clientLnId(logicalNode);
    const selectedIds = new Set(this.selectedClientLnIds);

    if (selected) {
      selectedIds.add(id);
    } else {
      selectedIds.delete(id);
    }

    this.selectedClientLnIds = [...selectedIds];
  }

  private matchesReportFilter(ied: Element, reports: Element[]): boolean {
    const filter = this.reportFilter.trim().toLowerCase();
    if (!filter) {
      return true;
    }

    return [
      ied.getAttribute('name') ?? '',
      ...reports.flatMap(reportControl => [
        reportControl.getAttribute('name') ?? '',
        identity(reportControl).toString(),
        pathIdentity(reportControl),
      ]),
    ].some(term => term.toLowerCase().includes(filter));
  }

  private renderClientLnAssignmentDialog(): TemplateResult {
    const reportControl = this.clientLnAssignmentReport;
    const selectedIds = new Set(this.selectedClientLnIds);
    const rptEnabled = reportControl?.querySelector(':scope > RptEnabled');
    const maxClients = parseInt(rptEnabled?.getAttribute('max') ?? '1', 10);
    const clientLimit = Number.isNaN(maxClients) ? 1 : maxClients;
    const selectedClientCount = selectedIds.size;
    const clientLimitReached = selectedClientCount >= clientLimit;
    const hasClientLnChanges =
      this.selectedClientLnIds.some(
        id => !this.initialClientLnIds.includes(id),
      ) ||
      this.initialClientLnIds.some(
        id => !this.selectedClientLnIds.includes(id),
      );

    return html`<oscd-dialog class="client-ln assignment dialog">
      <div slot="headline">Edit Clients</div>
      <div slot="content" class="client-ln-list">
        <div class="client-ln-count">
          ${selectedClientCount}/${clientLimit} clients
        </div>
        ${this.reportClientLNs.map(logicalNode => {
          const id = this.clientLnId(logicalNode);
          const selected = selectedIds.has(id);
          const disabled = clientLimitReached && !selected;

          return html`<label class="client-ln-option">
            <oscd-checkbox
              ?checked=${selected}
              ?disabled=${disabled}
              @change=${(event: Event) => {
                const checkbox = event.target as OscdCheckbox;
                this.toggleClientLnSelection(logicalNode, checkbox.checked);
              }}
            ></oscd-checkbox>
            <span>
              <span class="client-ln-name"
                >${this.logicalNodeName(logicalNode)}</span
              >
              <span class="client-ln-path">${identity(logicalNode)}</span>
            </span>
          </label>`;
        })}
      </div>
      <div slot="actions">
        <oscd-text-button
          @click=${() => {
            this.clientLnAssignmentDialog.close();
            this.clientLnAssignmentReport = undefined;
            this.selectedClientLnIds = [];
            this.initialClientLnIds = [];
          }}
          >Cancel</oscd-text-button
        >
        <oscd-text-button
          ?disabled=${!hasClientLnChanges}
          @click=${() => this.updateSelectedClientLns()}
          >Apply</oscd-text-button
        >
      </div>
    </oscd-dialog>`;
  }

  private logicalNodeName(logicalNode: Element): string {
    return `${logicalNode.getAttribute('prefix') ?? ''}${logicalNode.getAttribute(
      'lnClass',
    )}${logicalNode.getAttribute('inst') ?? ''}`;
  }

  private renderReportListItem(reportControl: Element): TemplateResult {
    return html`<oscd-list-item
      class="report-list-item"
      type="button"
      @click=${() => this.selectReportControl(reportControl)}
    >
      <div slot="headline">${reportControl.getAttribute('name')}</div>
      <div slot="supporting-text">${pathIdentity(reportControl)}</div>
      <oscd-icon-button
        slot="end"
        class="report-actions-button"
        @click=${this.showReportActionsMenu}
        ><oscd-icon>more_vert</oscd-icon></oscd-icon-button
      >
      <oscd-menu positioning="fixed">
        <oscd-menu-item
          @click=${(event: Event) => {
            event.stopPropagation();
            this.openClientLnAssignmentDialog(reportControl);
          }}
        >
          <div slot="headline">Edit Clients</div>
          <oscd-icon slot="start">lan</oscd-icon>
        </oscd-menu-item>
        <oscd-menu-item
          @click=${(event: Event) => {
            event.stopPropagation();
            this.removeReportControl(reportControl);
          }}
        >
          <div slot="headline">Delete</div>
          <oscd-icon slot="start">delete</oscd-icon>
        </oscd-menu-item>
      </oscd-menu>
    </oscd-list-item>`;
  }

  private renderSelectionList(): TemplateResult {
    return html`<div class="selectionlist report-selectionlist">
      <oscd-outlined-text-field
        class="report-filter"
        placeholder="Filter ReportControl's"
        iconTrailing="search"
        .value=${this.reportFilter}
        @input=${(event: Event) => {
          this.reportFilter = (event.target as OscdOutlinedTextField).value;
        }}
      ></oscd-outlined-text-field>
      <oscd-list>
        ${Array.from(this.doc.querySelectorAll(':root > IED')).map(ied => {
          const canCreateReportControl = this.canCreateReportControl(ied);
          const rpControls = Array.from(
            ied.querySelectorAll(
              ':scope > AccessPoint > Server > LDevice > LN0 > ReportControl, :scope > AccessPoint > Server > LDevice > LN > ReportControl',
            ),
          );

          if (!this.matchesReportFilter(ied, rpControls)) {
            return html``;
          }

          return html`<oscd-list-item class="ied-list-item">
              <div slot="headline">${ied.getAttribute('name')}</div>
              <oscd-icon slot="start">developer_board</oscd-icon>
              <oscd-icon-button
                class="create-report-control"
                slot="end"
                ?disabled=${!canCreateReportControl}
                @click=${(event: Event) => {
                  event.stopPropagation();
                  if (!canCreateReportControl) {
                    return;
                  }
                  this.createReportControl(ied);
                }}
                ><oscd-icon>playlist_add</oscd-icon></oscd-icon-button
              >
            </oscd-list-item>
            ${rpControls
              .filter(reportControl =>
                this.matchesReportFilter(ied, [reportControl]),
              )
              .map(reportControl => this.renderReportListItem(reportControl))}`;
        })}
      </oscd-list>
      ${this.renderClientLnAssignmentDialog()}
    </div>`;
  }

  private renderToggleButton(): TemplateResult {
    return html`<oscd-outlined-button
      class="change scl element"
      @click=${() => {
        this.selectionList.classList.remove('hidden');
        this.selectReportControlButton.classList.add('hidden');
      }}
      >Select Report</oscd-outlined-button
    >`;
  }

  render(): TemplateResult {
    if (!this.doc) {
      return html`No SCL loaded`;
    }

    return html`${this.renderToggleButton()}
      <div class="section">
        ${this.renderSelectionList()}${this.renderElementEditorContainer()}
      </div>`;
  }

  static styles = css`
    ${styles}

    .elementeditorcontainer {
      flex: 65%;
      margin: 4px 8px 4px 4px;
      background-color: var(--md-sys-color-surface);
      overflow-y: scroll;
      display: grid;
      grid-gap: 12px;
      padding: 8px 12px 16px;
      grid-template-columns: repeat(3, 1fr);
      z-index: 0;
    }

    .content.dataSet {
      display: flex;
      flex-direction: column;
    }

    oscd-list-item {
      --md-list-item-trailing-space: 48px;
    }

    oscd-icon-button.create-report-control,
    oscd-icon-button.report-actions-button {
      width: 48px;
      height: 48px;
      pointer-events: all;
    }

    .report-filter {
      box-sizing: border-box;
      padding: 8px;
      width: 100%;
      --md-outlined-text-field-container-shape: 32px;
    }

    .report-actions {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 48px;
    }

    .report-list-item {
      --md-list-item-trailing-space: 48px;
    }

    .report-selectionlist {
      position: relative;
      z-index: 1;
    }

    oscd-menu {
      z-index: 20;
    }

    .client-ln-list {
      display: flex;
      flex-direction: column;
      min-width: min(640px, 80vw);
      max-height: min(520px, 60vh);
      overflow: auto;
    }

    .client-ln-option {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 12px;
      align-items: center;
      padding: 8px 0;
      font-family: var(--oscd-text-font), sans-serif;
    }

    .client-ln-name,
    .client-ln-path {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .client-ln-path {
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.875rem;
    }

    data-set-element-editor {
      grid-column: 1 / 2;
    }

    report-control-element-editor {
      grid-column: 2 / 4;
    }

    @media (max-width: 950px) {
      .elementeditorcontainer {
        display: block;
      }
    }
  `;
}

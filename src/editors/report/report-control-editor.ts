import { css, html, TemplateResult } from 'lit';
import { query, state } from 'lit/decorators.js';

import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
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

import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import {
  createReportControl,
  identity,
  removeControlBlock,
} from '@openscd/scl-lib';

import { pathIdentity, styles } from '../../foundation.js';

import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { ReportControlElementEditor } from './report-control-element-editor.js';
import { BaseElementEditor } from '../base-element-editor.js';

import { ClientLnAssignmentDialog } from './client-ln-assignment-dialog.js';

export class ReportControlEditor extends BaseElementEditor {
  static scopedElements = {
    'oscd-action-list': OscdActionList,
    'data-set-element-editor': DataSetElementEditor,
    'oscd-list': OscdList,
    'oscd-list-item': OscdListItem,
    'oscd-menu': OscdMenu,
    'oscd-menu-item': OscdMenuItem,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-outlined-text-field': OscdOutlinedTextField,
    'oscd-text-button': OscdTextButton,
    'oscd-filled-button': OscdFilledButton,
    'report-control-element-editor': ReportControlElementEditor,
    'oscd-icon-button': OscdIconButton,
    'oscd-icon': OscdIcon,
    'oscd-dialog': OscdDialog,
    'clientln-assignment-dialog': ClientLnAssignmentDialog,
  };

  @state()
  private reportFilter = '';

  @query('.selectionlist') selectionList!: HTMLElement;

  @query('clientln-assignment-dialog')
  clientLnAssignmentDialog!: ClientLnAssignmentDialog;

  @query('.change.scl.element') selectReportControlButton!: OscdOutlinedButton;

  @query('report-control-element-editor')
  rpControlElementEditor!: ReportControlElementEditor;

  @query('data-set-element-editor')
  dataSetElementEditor!: DataSetElementEditor;

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

  private async openClientLnAssignmentDialog(
    reportControl: Element,
  ): Promise<void> {
    this.clientLnAssignmentDialog.open(reportControl);
  }

  private showReportActionsMenu(event: Event): void {
    event.stopPropagation();

    const button = event.currentTarget as OscdIconButton;
    const menu = button.nextElementSibling as OscdMenu;
    menu.anchorElement = button;
    menu.show();
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
        ${Array.from(this.doc.querySelectorAll(':root > IED')).map((ied) => {
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
      <clientln-assignment-dialog
        .doc=${this.doc}
      ></clientln-assignment-dialog>
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

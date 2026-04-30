import { LitElement, TemplateResult, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import type { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';

import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import {
  createDataSet,
  findControlBlockSubscription,
  identity,
} from '@openscd/scl-lib';

export class BaseElementEditor extends ScopedElementsMixin(LitElement) {
  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ attribute: false })
  docVersion?: unknown;

  @state()
  selectCtrlBlock?: Element;

  @state()
  selectedDataSet?: Element | null;

  @query('.dialog.select') selectDataSetDialog!: OscdDialog;

  @query('.new.dataset') newDataSet!: OscdIconButton;

  @query('.change.dataset') changeDataSet!: OscdIconButton;

  protected selectDataSet(dataSet: Element): void {
    const name = dataSet.getAttribute('name');
    if (!name || !this.selectCtrlBlock) {return;}

    this.dispatchEvent(
      newEditEventV2(
        {
          element: this.selectCtrlBlock,
          attributes: { datSet: name },
        },
        { title: `Change Data Set of ${identity(this.selectCtrlBlock)}` },
      ),
    );
    this.selectedDataSet = dataSet;

    this.selectDataSetDialog.close();
  }

  private addNewDataSet(control: Element): void {
    const parent = control.parentElement;
    if (!parent) {return;}

    const insert = createDataSet(parent);
    if (!insert) {return;}

    const newName = (insert.node as Element).getAttribute('name');
    if (!newName) {return;}

    const update = { element: control, attributes: { datSet: newName } };

    this.dispatchEvent(
      newEditEventV2([insert, update], { title: 'Add New Data Set' }),
    );

    this.selectedDataSet = this.selectCtrlBlock?.parentElement?.querySelector(
      `:scope > DataSet[name="${this.selectCtrlBlock.getAttribute('datSet')}"]`,
    );
  }

  private showSelectDataSetDialog(): void {
    this.selectDataSetDialog.show();
  }

  protected renderSelectDataSetDialog(): TemplateResult {
    const items = Array.from(
      this.selectCtrlBlock?.parentElement?.querySelectorAll(
        ':scope > DataSet',
      ) ?? [],
    ).map(dataSet => ({
      headline: `${dataSet.getAttribute('name')}`,
      supportingText: `${identity(dataSet)}`,
      primaryAction: () => {
        this.selectDataSet(dataSet);
      },
    }));

    return html`<oscd-dialog class="dialog select">
      <oscd-action-list
        slot="content"
        .items=${items}
        filterable
      ></oscd-action-list>
    </oscd-dialog>`;
  }

  protected renderDataSetElementContainer(): TemplateResult {
    return html`
      <div class="content dataSet">
        ${this.renderSelectDataSetDialog()}
        <data-set-element-editor
          .element=${this.selectedDataSet!}
          .showHeader=${false}
          .docVersion=${this.docVersion}
        >
          <oscd-icon-button
            class="change dataset"
            slot="change"
            ?disabled=${!!findControlBlockSubscription(this.selectCtrlBlock!)
              .length}
            @click=${this.showSelectDataSetDialog}
            ><oscd-icon>swap_vert</oscd-icon></oscd-icon-button
          >
          <oscd-icon-button
            class="new dataset"
            slot="new"
            ?disabled=${!!this.selectCtrlBlock!.getAttribute('datSet')}
            @click="${() => {
              this.addNewDataSet(this.selectCtrlBlock!);
            }}"
            ><oscd-icon>playlist_add</oscd-icon></oscd-icon-button
          ></data-set-element-editor
        >
      </div>
    `;
  }
}

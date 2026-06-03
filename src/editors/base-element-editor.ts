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
  protected selectedControlBlock?: Element;

  @state()
  protected selectedDataSet?: Element | null;

  @query('.dialog.select') selectDataSetDialog!: OscdDialog;

  @query('.new.dataset') newDataSet!: OscdIconButton;

  @query('.change.dataset') changeDataSet!: OscdIconButton;

  protected update(props: Map<string | number | symbol, unknown>): void {
    if (props.has('doc')) {
      this.clearSelectedControlBlock();
    }

    super.update(props);
  }

  protected selectControlBlock(controlBlock: Element): void {
    this.selectedControlBlock = controlBlock;
    this.selectedDataSet =
      controlBlock.parentElement?.querySelector(
        `:scope > DataSet[name="${controlBlock.getAttribute('datSet')}"]`,
      ) ?? null;
  }

  protected clearSelectedControlBlock(): void {
    this.selectedControlBlock = undefined;
    this.selectedDataSet = undefined;
  }

  protected selectDataSet(dataSet: Element): void {
    const name = dataSet.getAttribute('name');
    if (!name || !this.selectedControlBlock) {
      return;
    }

    this.dispatchEvent(
      newEditEventV2(
        {
          element: this.selectedControlBlock,
          attributes: { datSet: name },
        },
        {
          title: `Change Data Set of ${identity(this.selectedControlBlock)}`,
        },
      ),
    );
    this.selectedDataSet = dataSet;

    this.selectDataSetDialog.close();
  }

  private addNewDataSet(control: Element): void {
    const parent = control.parentElement;
    if (!parent) {
      return;
    }

    const insert = createDataSet(parent);
    if (!insert) {
      return;
    }

    const newName = (insert.node as Element).getAttribute('name');
    if (!newName) {
      return;
    }

    const update = { element: control, attributes: { datSet: newName } };

    this.dispatchEvent(
      newEditEventV2([insert, update], { title: 'Add New Data Set' }),
    );

    this.selectedDataSet =
      this.selectedControlBlock?.parentElement?.querySelector(
        `:scope > DataSet[name="${this.selectedControlBlock.getAttribute(
          'datSet',
        )}"]`,
      );
  }

  private showSelectDataSetDialog(): void {
    this.selectDataSetDialog.show();
  }

  protected renderSelectDataSetDialog(): TemplateResult {
    const items = Array.from(
      this.selectedControlBlock?.parentElement?.querySelectorAll(
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
            ?disabled=${!!findControlBlockSubscription(
              this.selectedControlBlock!,
            ).length}
            @click=${this.showSelectDataSetDialog}
            ><oscd-icon>swap_vert</oscd-icon></oscd-icon-button
          >
          <oscd-icon-button
            class="new dataset"
            slot="new"
            ?disabled=${!!this.selectedControlBlock!.getAttribute('datSet')}
            @click="${() => {
              this.addNewDataSet(this.selectedControlBlock!);
            }}"
            ><oscd-icon>playlist_add</oscd-icon></oscd-icon-button
          ></data-set-element-editor
        >
      </div>
    `;
  }
}

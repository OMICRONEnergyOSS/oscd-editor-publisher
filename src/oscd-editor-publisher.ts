import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { DataSetEditor } from './editors/dataset/data-set-editor.js';
import { GseControlEditor } from './editors/gsecontrol/gse-control-editor.js';
import { ReportControlEditor } from './editors/report/report-control-editor.js';
import { SampledValueControlEditor } from './editors/sampledvalue/sampled-value-control-editor.js';
import { OscdOutlinedSegmentedButton } from '@omicronenergy/oscd-ui/labs/segmentedbutton/OscdOutlinedSegmentedButton.js';
import { OscdOutlinedSegmentedButtonSet } from '@omicronenergy/oscd-ui/labs/segmentedbuttonset/OscdOutlinedSegmentedButtonSet.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';

export const PUBLISHER_TYPE_LOCAL_STORAGE_KEY =
  'oscd-editor-publisher__publisher-type';

type PublisherType = 'Report' | 'GOOSE' | 'SampledValue' | 'DataSet';

const DEFAULT_PUBLISHER_TYPE: PublisherType = 'GOOSE';

const publisherTypes: PublisherType[] = [
  'Report',
  'GOOSE',
  'SampledValue',
  'DataSet',
];

function isPublisherType(value: string | null): value is PublisherType {
  return publisherTypes.includes(value as PublisherType);
}

function storedPublisherType(): PublisherType {
  const value = localStorage.getItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY);

  return isPublisherType(value) ? value : DEFAULT_PUBLISHER_TYPE;
}

/** An editor [[`plugin`]] to configure `Report`, `GOOSE`, `SampledValue` control blocks and its `DataSet` */
export default class PublisherPlugin extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-outlined-segmented-button': OscdOutlinedSegmentedButton,
    'oscd-outlined-segmented-button-set': OscdOutlinedSegmentedButtonSet,
    'oscd-icon': OscdIcon,
    'report-control-editor': ReportControlEditor,
    'gse-control-editor': GseControlEditor,
    'sampled-value-control-editor': SampledValueControlEditor,
    'data-set-editor': DataSetEditor,
  };

  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ attribute: false })
  doc!: XMLDocument;

  /** SCL change indicator */
  @property({ attribute: false })
  docVersion?: unknown;

  @state()
  private publisherType: PublisherType = storedPublisherType();

  private selectPublisherType(publisherType: PublisherType): void {
    this.publisherType = publisherType;
    localStorage.setItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY, publisherType);
  }

  render() {
    return html`<form class="publishertypeselector">
        <oscd-outlined-segmented-button-set class="control-switch">
          <oscd-outlined-segmented-button
            label="GOOSE"
            no-checkmark
            ?selected=${this.publisherType === 'GOOSE'}
            @click=${() => this.selectPublisherType('GOOSE')}
          >
            <oscd-icon slot="icon">gooseIcon</oscd-icon>
          </oscd-outlined-segmented-button>
          <oscd-outlined-segmented-button
            label="SampledValue"
            no-checkmark
            ?selected=${this.publisherType === 'SampledValue'}
            @click=${() => this.selectPublisherType('SampledValue')}
          >
            <oscd-icon slot="icon">smvIcon</oscd-icon>
          </oscd-outlined-segmented-button>
          <oscd-outlined-segmented-button
            label="Report"
            no-checkmark
            ?selected=${this.publisherType === 'Report'}
            @click=${() => this.selectPublisherType('Report')}
          >
            <oscd-icon slot="icon">reportIcon</oscd-icon>
          </oscd-outlined-segmented-button>

          <oscd-outlined-segmented-button
            label="DataSet"
            no-checkmark
            ?selected=${this.publisherType === 'DataSet'}
            @click=${() => this.selectPublisherType('DataSet')}
          >
            <oscd-icon slot="icon">dataSetIcon</oscd-icon>
          </oscd-outlined-segmented-button>
        </oscd-outlined-segmented-button-set>
      </form>
      <report-control-editor
        .doc=${this.doc}
        .docVersion=${this.docVersion}
        class="${classMap({
          hidden: this.publisherType !== 'Report',
        })}"
      ></report-control-editor
      ><gse-control-editor
        .doc=${this.doc}
        .docVersion=${this.docVersion}
        class="${classMap({
          hidden: this.publisherType !== 'GOOSE',
        })}"
      ></gse-control-editor
      ><sampled-value-control-editor
        .doc=${this.doc}
        .docVersion=${this.docVersion}
        class="${classMap({
          hidden: this.publisherType !== 'SampledValue',
        })}"
      ></sampled-value-control-editor
      ><data-set-editor
        .doc=${this.doc}
        .docVersion=${this.docVersion}
        class="${classMap({
          hidden: this.publisherType !== 'DataSet',
        })}"
      ></data-set-editor>`;
  }

  static styles = css`
    * {
      --oscd-primary: var(--oscd-theme-primary, #0b335b);
      --oscd-secondary: var(--oscd-theme-secondary, #2485e5);
      --oscd-base00: var(--oscd-theme-base00, #46505d);
      --oscd-base01: var(--oscd-theme-base01, #3d4651);
      --oscd-base2: var(--oscd-theme-base2, #f3f5f6);
      --oscd-base3: var(--oscd-theme-base3, #FFF);
      --oscd-text-font: var(--oscd-theme-text-font, 'Roboto');
      --oscd-text-font-mono: var(--oscd-theme-text-font-mono, 'Roboto Mono');
      --oscd-icon-font: var(--oscd-theme-icon-font, 'Material Symbols Outlined');

      --md-sys-color-primary: var(--oscd-primary);
      --md-sys-color-secondary: var(--oscd-secondary);
      /* --md-outlined-text-field-input-text-color: var(--oscd-base01); */
      --md-sys-color-surface: var(--oscd-base3);
      --md-sys-color-on-surface: var(--oscd-base00);
      --md-sys-color-on-primary: var(--oscd-base3);
      --md-sys-color-on-surface-variant: var(--oscd-base00);
      --md-menu-container-color: var(--oscd-base3);
      --md-sys-color-surface-container-highest: var(--oscd-base3);
      --oscd-dialog-container-color: var(--oscd-base3);
      font-family: var(--oscd-text-font);

      --md-list-item-activated-background: rgb(
        from var(--oscd-primary) r g b / 0.38
      );
    }

    .hidden {
      display: none;
    }

    .publishertypeselector {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 8px 12px;
      flex-wrap: wrap;
      background-color: var(--oscd-base2);
    }

    oscd-outlined-segmented-button-set {
      flex-shrink: 0;
      align-self: flex-start;
      inline-size: min(100%, 42rem);
      --md-outlined-segmented-button-selected-container-color: var(
        --md-sys-color-primary,
        #005ac1
      );
      --md-outlined-segmented-button-selected-label-text-color: var(
        --oscd-base2,
        #ffffff
      );
      --md-outlined-segmented-button-selected-icon-color: var(
        --oscd-base2,
        #ffffff
      );
      --md-outlined-segmented-button-selected-hover-label-text-color: var(
        --oscd-base3,
        #ffffff
      );
      --md-outlined-segmented-button-selected-hover-icon-color: var(
        --oscd-base3,
        #ffffff
      );
      --md-outlined-segmented-button-selected-focus-label-text-color: var(
        --oscd-base3,
        #ffffff
      );
      --md-outlined-segmented-button-selected-focus-icon-color: var(
        --oscd-base3,
        #ffffff
      );
      --md-outlined-segmented-button-selected-pressed-label-text-color: var(
        --oscd-base2,
        #ffffff
      );
      --md-outlined-segmented-button-selected-pressed-icon-color: var(
        --oscd-base2,
        #ffffff
      );
      --md-outlined-segmented-button-selected-hover-state-layer-color: var(
        --oscd-base2,
        #ffffff
      );
      --md-outlined-segmented-button-selected-pressed-state-layer-color: var(
        --oscd-base3,
        #ffffff
      );
    }

    .control-switch oscd-outlined-segmented-button {
      min-inline-size: 0;
    }
  `;
}

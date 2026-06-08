import { LitElement } from 'lit';
import { DataSetEditor } from './editors/dataset/data-set-editor.js';
import { GseControlEditor } from './editors/gsecontrol/gse-control-editor.js';
import { ReportControlEditor } from './editors/report/report-control-editor.js';
import { SampledValueControlEditor } from './editors/sampledvalue/sampled-value-control-editor.js';
import { OscdOutlinedSegmentedButton } from '@omicronenergy/oscd-ui/labs/segmentedbutton/OscdOutlinedSegmentedButton.js';
import { OscdOutlinedSegmentedButtonSet } from '@omicronenergy/oscd-ui/labs/segmentedbuttonset/OscdOutlinedSegmentedButtonSet.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
export declare const PUBLISHER_TYPE_LOCAL_STORAGE_KEY = "oscd-editor-publisher__publisher-type";
declare const PublisherPlugin_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** An editor [[`plugin`]] to configure `Report`, `GOOSE`, `SampledValue` control blocks and its `DataSet` */
export default class PublisherPlugin extends PublisherPlugin_base {
    static scopedElements: {
        'oscd-outlined-segmented-button': typeof OscdOutlinedSegmentedButton;
        'oscd-outlined-segmented-button-set': typeof OscdOutlinedSegmentedButtonSet;
        'oscd-icon': typeof OscdIcon;
        'report-control-editor': typeof ReportControlEditor;
        'gse-control-editor': typeof GseControlEditor;
        'sampled-value-control-editor': typeof SampledValueControlEditor;
        'data-set-editor': typeof DataSetEditor;
    };
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    /** SCL change indicator */
    docVersion?: unknown;
    private publisherType;
    private selectPublisherType;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};

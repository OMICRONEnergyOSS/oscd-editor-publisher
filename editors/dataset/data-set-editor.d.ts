import { LitElement, TemplateResult } from 'lit';
import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { DataSetElementEditor } from './data-set-element-editor.js';
declare const DataSetEditor_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class DataSetEditor extends DataSetEditor_base {
    static scopedElements: {
        'oscd-action-list': typeof OscdActionList;
        'data-set-element-editor': typeof DataSetElementEditor;
        'oscd-outlined-button': typeof OscdOutlinedButton;
    };
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    /** SCL change indicator */
    docVersion?: unknown;
    selectedDataSet?: Element;
    selectionList: OscdActionList;
    selectDataSetButton: OscdOutlinedButton;
    dataSetElementEditor: DataSetElementEditor;
    private renderElementEditorContainer;
    private renderSelectionList;
    private renderToggleButton;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};

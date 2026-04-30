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
    /** Resets selected DataSet, if not existing in new doc
    update(props: Map<string | number | symbol, unknown>): void {
      if (props.has('doc') && this.selectedDataSet) {
        const newDataSet = updateElementReference(this.doc, this.selectedDataSet);
  
        this.selectedDataSet = newDataSet ?? undefined;
  
        /* TODO(Jakob Vogelsang): fix when action-list is activable
        if (!newDataSet && this.selectionList && this.selectionList.selected)
          (this.selectionList.selected as ListItem).selected = false;
      }
  
      super.update(props);
    } */
    private renderElementEditorContainer;
    private renderSelectionList;
    private renderToggleButton;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};

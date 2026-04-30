import { TemplateResult } from 'lit';
import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { GseControlElementEditor } from './gse-control-element-editor.js';
import { BaseElementEditor } from '../base-element-editor.js';
export declare class GseControlEditor extends BaseElementEditor {
    static scopedElements: {
        'oscd-action-list': typeof OscdActionList;
        'data-set-element-editor': typeof DataSetElementEditor;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'gse-control-element-editor': typeof GseControlElementEditor;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-icon': typeof OscdIcon;
        'oscd-dialog': typeof OscdDialog;
    };
    selectionList: OscdActionList;
    selectGSEControlButton: OscdOutlinedButton;
    gseControlElementEditor: GseControlElementEditor;
    dataSetElementEditor: DataSetElementEditor;
    /** Resets selected GOOSE and its DataSet, if not existing in new doc
    update(props: Map<string | number | symbol, unknown>): void {
      super.update(props);
  
      if (props.has('doc') && this.selectCtrlBlock) {
        const newGseControl = updateElementReference(
          this.doc,
          this.selectCtrlBlock
        );
  
        this.selectCtrlBlock = newGseControl ?? undefined;
        this.selectedDataSet = this.selectCtrlBlock
          ? updateElementReference(this.doc, this.selectedDataSet!)
          : undefined;
  
        /* TODO(Jakob Vogelsang): comment when action-list is activeable
        if (!newGseControl && this.selectionList && this.selectionList.selected)
          (this.selectionList.selected as ListItem).selected = false;
      }
    } */
    protected renderElementEditorContainer(): TemplateResult;
    private renderSelectionList;
    private renderToggleButton;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}

import { TemplateResult } from 'lit';
import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { ReportControlElementEditor } from './report-control-element-editor.js';
import { BaseElementEditor } from '../base-element-editor.js';
export declare class ReportControlEditor extends BaseElementEditor {
    static scopedElements: {
        'oscd-action-list': typeof OscdActionList;
        'data-set-element-editor': typeof DataSetElementEditor;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'report-control-element-editor': typeof ReportControlElementEditor;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-icon': typeof OscdIcon;
        'oscd-dialog': typeof OscdDialog;
    };
    selectionList: OscdActionList;
    selectReportControlButton: OscdOutlinedButton;
    rpControlElementEditor: ReportControlElementEditor;
    dataSetElementEditor: DataSetElementEditor;
    /** Resets selected Report and its DataSet, if not existing in new doc
    update(props: Map<string | number | symbol, unknown>): void {
      super.update(props);
  
      if (props.has('doc') && this.selectCtrlBlock) {
        const newReportControl = updateElementReference(
          this.doc,
          this.selectCtrlBlock
        );
  
        this.selectCtrlBlock = newReportControl ?? undefined;
        this.selectedDataSet = this.selectCtrlBlock
          ? updateElementReference(this.doc, this.selectedDataSet!)
          : undefined;
  
        /* TODO(Jakob Vogelsang): fix when action-list is activable
        if (
          !newReportControl &&
          this.selectionList &&
          this.selectionList.selected
        )
          (this.selectionList.selected as ListItem).selected = false;
      }
    } */
    private renderElementEditorContainer;
    private renderSelectionList;
    private renderToggleButton;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}

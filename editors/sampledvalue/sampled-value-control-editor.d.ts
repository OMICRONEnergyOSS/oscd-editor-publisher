import { TemplateResult } from 'lit';
import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { BaseElementEditor } from '../base-element-editor.js';
import { DataSetElementEditor } from '../dataset/data-set-element-editor.js';
import { SampledValueControlElementEditor } from './sampled-value-control-element-editor.js';
export declare class SampledValueControlEditor extends BaseElementEditor {
    static scopedElements: {
        'oscd-action-list': typeof OscdActionList;
        'data-set-element-editor': typeof DataSetElementEditor;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'sampled-value-control-element-editor': typeof SampledValueControlElementEditor;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-icon': typeof OscdIcon;
        'oscd-dialog': typeof OscdDialog;
    };
    selectionList: OscdActionList;
    selectSampledValueControlButton: OscdOutlinedButton;
    elementContainer?: SampledValueControlElementEditor;
    dataSetElementEditor: DataSetElementEditor;
    /** Resets selected SMV and its DataSet, if not existing in new doc
    update(props: Map<string | number | symbol, unknown>): void {
      super.update(props);
  
      if (props.has('doc') && this.selectCtrlBlock) {
        const newSampledValueControl = updateElementReference(
          this.doc,
          this.selectCtrlBlock
        );
  
        this.selectCtrlBlock = newSampledValueControl ?? undefined;
        this.selectedDataSet = this.selectCtrlBlock
          ? updateElementReference(this.doc, this.selectedDataSet!)
          : undefined;
  
        // TODO(JakobVogelsang): add activeable to ActionList
        /* if (
          !newSampledValueControl &&
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

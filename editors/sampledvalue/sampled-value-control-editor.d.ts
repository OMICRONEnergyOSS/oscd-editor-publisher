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
    private renderElementEditorContainer;
    private renderSelectionList;
    private renderToggleButton;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}

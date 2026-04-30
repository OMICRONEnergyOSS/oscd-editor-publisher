import { LitElement, TemplateResult } from 'lit';
import { OscdActionList } from '@omicronenergy/oscd-ui/action-list/OscdActionList.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { OscdTreeGrid } from '@omicronenergy/oscd-ui/tree-grid/OscdTreeGrid.js';
declare const DataSetElementEditor_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class DataSetElementEditor extends DataSetElementEditor_base {
    static scopedElements: {
        'oscd-action-list': typeof OscdActionList;
        'oscd-text-button': typeof OscdTextButton;
        'oscd-dialog': typeof OscdDialog;
        'oscd-icon': typeof OscdIcon;
        'oscd-tree-grid': typeof OscdTreeGrid;
        'oscd-scl-text-field': typeof OscdSclTextField;
    };
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    /** The element being edited */
    element: Element | null;
    /** SCL change indicator */
    docVersion?: unknown;
    private get name();
    private get desc();
    private get fcdaCount();
    private someDiffOnInputs;
    inputs: OscdSclTextField[];
    saveButton: OscdTextButton;
    fcdaList: OscdActionList;
    daPickerButton: OscdTextButton;
    daPickerDialog: OscdDialog;
    daPicker: OscdTreeGrid;
    daPickerSaveButton: OscdTextButton;
    doPickerButton: OscdTextButton;
    doPickerDialog: OscdDialog;
    doPicker: OscdTreeGrid;
    doPickerSaveButton: OscdTextButton;
    resetInputs(): void;
    onInputChange(): void;
    private saveChanges;
    private saveDataObjects;
    private saveDataAttributes;
    private onMoveFCDAUp;
    private onMoveFCDADown;
    private renderFCDAList;
    private renderDataObjectPicker;
    private renderDataAttributePicker;
    private renderDataPickers;
    private renderLimits;
    private renderDataSetAttributes;
    private renderHeader;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};

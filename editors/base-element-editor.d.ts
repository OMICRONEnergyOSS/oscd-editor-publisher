import { LitElement, TemplateResult } from 'lit';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import type { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
declare const BaseElementEditor_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class BaseElementEditor extends BaseElementEditor_base {
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    /** SCL change indicator */
    docVersion?: unknown;
    protected selectedControlBlock?: Element;
    protected selectedDataSet?: Element | null;
    selectDataSetDialog: OscdDialog;
    newDataSet: OscdIconButton;
    changeDataSet: OscdIconButton;
    protected update(props: Map<string | number | symbol, unknown>): void;
    protected selectControlBlock(controlBlock: Element): void;
    protected clearSelectedControlBlock(): void;
    protected selectDataSet(dataSet: Element): void;
    private addNewDataSet;
    private showSelectDataSetDialog;
    protected renderSelectDataSetDialog(): TemplateResult;
    protected renderDataSetElementContainer(): TemplateResult;
}
export {};

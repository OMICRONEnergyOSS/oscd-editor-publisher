import { LitElement, TemplateResult } from 'lit';
import { OscdCheckbox } from '@omicronenergy/oscd-ui/checkbox/OscdCheckbox.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
declare const ReportControlElementEditor_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class ReportControlElementEditor extends ReportControlElementEditor_base {
    static scopedElements: {
        'oscd-scl-text-field': typeof OscdSclTextField;
        'oscd-scl-select': typeof OscdSclSelect;
        'oscd-scl-checkbox': typeof OscdSclCheckbox;
        'oscd-text-button': typeof OscdTextButton;
        'oscd-icon': typeof OscdIcon;
        'oscd-checkbox': typeof OscdCheckbox;
    };
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
    element: Element | null;
    /** SCL change indicator */
    docVersion?: unknown;
    private optFieldsDiff;
    private trgOpsDiff;
    private reportControlDiff;
    optFieldsInputs: OscdSclCheckbox[];
    optFieldsSave: OscdTextButton;
    trgOpsInputs: OscdSclCheckbox[];
    trgOpsSave: OscdTextButton;
    reportControlInputs: (OscdSclTextField | OscdSclSelect | OscdSclCheckbox)[];
    reportControlSave: OscdTextButton;
    rptEnabledInput: OscdSclTextField;
    resetInputs(): void;
    private onOptFieldsInputChange;
    private saveOptFieldChanges;
    private onTrgOpsInputChange;
    private saveTrgOpsChanges;
    private onReportControlInputChange;
    private saveReportControlChanges;
    private renderOptFieldsContent;
    private renderTrgOpsContent;
    private renderChildElements;
    private renderReportControlContent;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};

import { LitElement, TemplateResult } from 'lit';
import { OscdCheckbox } from '@omicronenergy/oscd-ui/checkbox/OscdCheckbox.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
declare const SampledValueControlElementEditor_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class SampledValueControlElementEditor extends SampledValueControlElementEditor_base {
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
    get sMV(): Element | null;
    private sMVdiff;
    private smvOptsDiff;
    private sampledValueControlDiff;
    sampledValueControlInputs: (OscdSclTextField | OscdSclSelect | OscdSclCheckbox)[];
    smvControlSave: OscdTextButton;
    sMVInputs: OscdSclTextField[];
    smvSave: OscdTextButton;
    smvOptsInputs: OscdSclCheckbox[];
    smvOptsSave: OscdTextButton;
    instType?: OscdCheckbox;
    resetInputs(type?: 'SampledValueControl' | 'SMV'): void;
    private onSampledValueControlInputChange;
    private saveSampledValueControlChanges;
    private onSMVInputChange;
    private saveSMVChanges;
    private onSmvOptsInputChange;
    private saveSmvOptsChanges;
    private renderSmvContent;
    private renderSmvOptsContent;
    private renderOtherElements;
    private renderSmvControlContent;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};

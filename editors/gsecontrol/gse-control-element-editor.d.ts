import { LitElement, TemplateResult } from 'lit';
import { OscdCheckbox } from '@omicronenergy/oscd-ui/checkbox/OscdCheckbox.js';
import { OscdTextButton } from '@omicronenergy/oscd-ui/button/OscdTextButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
declare const GseControlElementEditor_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class GseControlElementEditor extends GseControlElementEditor_base {
    static scopedElements: {
        'oscd-scl-text-field': typeof OscdSclTextField;
        'oscd-scl-select': typeof OscdSclSelect;
        'oscd-scl-checkbox': typeof OscdSclCheckbox;
        'oscd-text-button': typeof OscdTextButton;
        'oscd-icon': typeof OscdIcon;
        'oscd-checkbox': typeof OscdCheckbox;
    };
    /** The element being edited as provided to plugins by [[`OpenSCD`]]. */
    element: Element | null;
    /** SCL change indicator */
    docVersion?: unknown;
    get gSE(): Element | null;
    private gSEdiff;
    private gSEControlDiff;
    gSEInputs: OscdSclTextField[];
    gseSave: OscdTextButton;
    gSEControlInputs: (OscdSclTextField | OscdSclSelect | OscdSclCheckbox)[];
    gseControlSave: OscdTextButton;
    instType?: OscdCheckbox;
    resetInputs(type?: 'GSEControl' | 'GSE'): void;
    private onGSEControlInputChange;
    saveGSEControlChanges(): void;
    private onGSEInputChange;
    private saveGSEChanges;
    private renderGseContent;
    private renderGseControlContent;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};

import { expect, fixture, html } from '@open-wc/testing';

import { setViewport } from '@web/test-runner-commands';

import { SinonSpy, spy } from 'sinon';

import {
  isInsert,
  isRemove,
  isSetAttributes,
} from '@openscd/oscd-api/utils.js';

import { reportControlDoc } from './reportControl.testfiles.js';

import { ReportControlEditor } from './report-control-editor.js';

window.customElements.define('report-control-editor', ReportControlEditor);

type ReportControlEditorWithClientLnAssignment = {
  clientLnAssignmentReport?: Element;
  initialClientLnIds: string[];
  selectedClientLnIds: string[];
  updateSelectedClientLns: () => void;
};

type ReportControlEditorWithDataSetSelection = {
  selectDataSet: (dataSet: Element) => void;
};

async function selectReport(editor: ReportControlEditor, name: string) {
  const reportListItem = Array.from(
    editor.shadowRoot!.querySelectorAll('oscd-list-item.report-list-item'),
  ).find(
    item =>
      item.querySelector('[slot="headline"]')?.textContent?.trim() === name,
  ) as HTMLElement;

  reportListItem.click();
  await editor.updateComplete;
}

describe('ReportControl editor component', () => {
  let editor: ReportControlEditor;
  let editEvent: SinonSpy;

  beforeEach(async () => {
    const doc = new DOMParser().parseFromString(
      reportControlDoc,
      'application/xml',
    );

    editor = await fixture(
      html`<report-control-editor .doc="${doc}"></report-control-editor>`,
    );

    editEvent = spy();
    window.addEventListener('oscd-edit-v2', editEvent);
  });

  it('allows to insert new ReportControl element', async () => {
    const createButton = editor.shadowRoot!.querySelector(
      'oscd-icon-button.create-report-control',
    ) as HTMLElement;
    createButton.click();

    expect(editEvent).to.have.been.calledOnce;

    expect(isInsert(editEvent.args[0][0].detail.edit)).to.be.true;
    expect(editEvent.args[0][0].detail.edit.parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail.edit.node.tagName).to.equal(
      'ReportControl',
    );
  });

  it('allows to remove and existing ReportControl element', async () => {
    const deleteMenuItem = Array.from(
      editor.shadowRoot!.querySelectorAll('oscd-menu-item'),
    ).find(
      item =>
        item.querySelector('[slot="headline"]')?.textContent?.trim() ===
        'Delete',
    ) as HTMLElement;
    deleteMenuItem.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(isRemove(editEvent.args[0][0].detail.edit[0])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal(
      'ReportControl',
    );
  });

  it('allows to insert new DataSet and link with existing ReportControl', async () => {
    await selectReport(editor, 'rp1');
    editor.newDataSet.click();

    expect(editEvent).to.have.been.calledOnce;
    expect(isInsert(editEvent.args[0][0].detail.edit[0])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[0].parent.tagName).to.equal('LN0');
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal(
      'DataSet',
    );
  });

  it('allows to change an existing DataSet', async () => {
    await setViewport({ width: 800, height: 800 });
    await selectReport(editor, 'rp2');
    (
      editor as unknown as ReportControlEditorWithDataSetSelection
    ).selectDataSet(editor.doc.querySelector('DataSet[name="datSet2"]')!);

    expect(editEvent).to.have.been.calledOnce;
    expect(isSetAttributes(editEvent.args[0][0].detail.edit)).to.be.true;
    expect(editEvent.args[0][0].detail.edit.element.tagName).to.equal(
      'ReportControl',
    );
    expect(editEvent.args[0][0].detail.edit.attributes.datSet).to.equal(
      'datSet2',
    );
  });

  it('clears selected ReportControl details when the document changes', async () => {
    await selectReport(editor, 'rp2');

    expect(editor.shadowRoot!.querySelector('report-control-element-editor')).to
      .exist;

    editor.doc = new DOMParser().parseFromString(
      '<SCL></SCL>',
      'application/xml',
    );
    await editor.updateComplete;

    expect(editor.shadowRoot!.querySelector('report-control-element-editor')).to
      .not.exist;
  });

  it('shows report context menu actions', () => {
    const actionButton = editor.shadowRoot!.querySelector(
      'oscd-icon-button.report-actions-button',
    );
    const menuItems = Array.from(
      editor.shadowRoot!.querySelectorAll('oscd-menu-item'),
    );
    const labels = menuItems.map(item =>
      item.querySelector('[slot="headline"]')?.textContent?.trim(),
    );

    expect(actionButton?.textContent?.trim()).to.equal('more_vert');
    expect(labels).to.include('Edit Clients');
    expect(labels).to.include('Delete');
  });

  it('assigns a ReportControl without RptEnabled to a ClientLN', () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp1"]',
    )!;
    const logicalNode = editor.doc.querySelector(
      'IED[name="IED2"] LN[lnClass="MMXU"]',
    )!;
    const assignmentEditor =
      editor as unknown as ReportControlEditorWithClientLnAssignment;

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = ['IED2|AP1|ldInst1|prefix|MMXU|1'];
    assignmentEditor.updateSelectedClientLns();

    expect(editEvent).to.have.been.calledOnce;
    const edits = editEvent.args[0][0].detail.edit;

    expect(edits).to.have.length(2);
    expect(isInsert(edits[0])).to.be.true;
    expect(edits[0].parent).to.equal(reportControl);
    expect(edits[0].node.tagName).to.equal('RptEnabled');
    expect(edits[0].node.getAttribute('max')).to.equal('1');

    expect(isInsert(edits[1])).to.be.true;
    expect(edits[1].parent).to.equal(edits[0].node);
    expect(edits[1].node.tagName).to.equal('ClientLN');
    expect(edits[1].node.getAttribute('iedName')).to.equal('IED2');
    expect(edits[1].node.getAttribute('apRef')).to.equal('AP1');
    expect(edits[1].node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(edits[1].node.getAttribute('prefix')).to.equal(
      logicalNode.getAttribute('prefix'),
    );
    expect(edits[1].node.getAttribute('lnClass')).to.equal('MMXU');
    expect(edits[1].node.getAttribute('lnInst')).to.equal('1');
  });

  it('assigns a ReportControl with RptEnabled to a ClientLN', () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    const rptEnabled = reportControl.querySelector('RptEnabled')!;
    const assignmentEditor =
      editor as unknown as ReportControlEditorWithClientLnAssignment;

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = ['IED2|AP1|ldInst1|prefix|MMXU|1'];
    assignmentEditor.updateSelectedClientLns();

    expect(editEvent).to.have.been.calledOnce;
    const edits = editEvent.args[0][0].detail.edit;

    expect(edits).to.have.length(1);
    expect(isInsert(edits[0])).to.be.true;
    expect(edits[0].parent).to.equal(rptEnabled);
    expect(edits[0].node.tagName).to.equal('ClientLN');
    expect(edits[0].node.getAttribute('iedName')).to.equal('IED2');
    expect(edits[0].node.getAttribute('apRef')).to.equal('AP1');
    expect(edits[0].node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(edits[0].node.getAttribute('prefix')).to.equal('prefix');
    expect(edits[0].node.getAttribute('lnClass')).to.equal('MMXU');
    expect(edits[0].node.getAttribute('lnInst')).to.equal('1');
  });

  it('removes unchecked existing ClientLNs', () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    const rptEnabled = reportControl.querySelector('RptEnabled')!;
    const clientLn = editor.doc.createElement('ClientLN');
    const assignmentEditor =
      editor as unknown as ReportControlEditorWithClientLnAssignment;

    clientLn.setAttribute('iedName', 'IED2');
    clientLn.setAttribute('apRef', 'AP1');
    clientLn.setAttribute('ldInst', 'ldInst1');
    clientLn.setAttribute('prefix', 'prefix');
    clientLn.setAttribute('lnClass', 'MMXU');
    clientLn.setAttribute('lnInst', '1');
    rptEnabled.appendChild(clientLn);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = ['IED2|AP1|ldInst1|prefix|MMXU|1'];
    assignmentEditor.selectedClientLnIds = [];
    assignmentEditor.updateSelectedClientLns();

    expect(editEvent).to.have.been.calledOnce;
    const edits = editEvent.args[0][0].detail.edit;

    expect(edits).to.have.length(1);
    expect(isRemove(edits[0])).to.be.true;
    expect(edits[0].node).to.equal(clientLn);
  });

  it('shows already assigned ClientLNs as selected and editable', async () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    const rptEnabled = reportControl.querySelector('RptEnabled')!;
    const clientLn = editor.doc.createElement('ClientLN');
    const assignmentEditor =
      editor as unknown as ReportControlEditorWithClientLnAssignment;

    clientLn.setAttribute('iedName', 'IED2');
    clientLn.setAttribute('apRef', 'AP1');
    clientLn.setAttribute('ldInst', 'ldInst1');
    clientLn.setAttribute('prefix', 'prefix');
    clientLn.setAttribute('lnClass', 'MMXU');
    clientLn.setAttribute('lnInst', '1');
    rptEnabled.appendChild(clientLn);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = ['IED2|AP1|ldInst1|prefix|MMXU|1'];
    assignmentEditor.selectedClientLnIds = ['IED2|AP1|ldInst1|prefix|MMXU|1'];
    await editor.updateComplete;

    const assignedCheckboxes = Array.from(
      editor.shadowRoot!.querySelectorAll('oscd-checkbox'),
    ).filter(checkbox => checkbox.checked && !checkbox.disabled);

    expect(assignedCheckboxes).to.have.length(1);
  });

  it('shows ClientLN selection count and disables unselected options at max', async () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    reportControl.querySelector('RptEnabled')!.setAttribute('max', '4');
    const assignmentEditor =
      editor as unknown as ReportControlEditorWithClientLnAssignment;

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = [
      'IED|AP1|ldInst1||LLN0|',
      'IED|AP1|ldInst1|prefix|MMXU|1',
      'IED2|AP1|ldInst1||LLN0|',
      'IED2|AP1|ldInst1|prefix|MMXU|1',
    ];
    await editor.updateComplete;

    const count = editor.shadowRoot!.querySelector('.client-ln-count');
    const uncheckedDisabledCheckboxes = Array.from(
      editor.shadowRoot!.querySelectorAll('oscd-checkbox'),
    ).filter(checkbox => !checkbox.checked && checkbox.disabled);

    expect(count?.textContent?.trim()).to.equal('4/4 clients');
    expect(uncheckedDisabledCheckboxes).to.have.length(0);
  });

  it('disables unselected ClientLNs when the max client count is reached', async () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    reportControl.querySelector('RptEnabled')!.setAttribute('max', '2');
    const assignmentEditor =
      editor as unknown as ReportControlEditorWithClientLnAssignment;

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = [
      'IED|AP1|ldInst1||LLN0|',
      'IED|AP1|ldInst1|prefix|MMXU|1',
    ];
    await editor.updateComplete;

    const uncheckedDisabledCheckboxes = Array.from(
      editor.shadowRoot!.querySelectorAll('oscd-checkbox'),
    ).filter(checkbox => !checkbox.checked && checkbox.disabled);

    expect(uncheckedDisabledCheckboxes.length).to.be.greaterThan(0);
  });
});

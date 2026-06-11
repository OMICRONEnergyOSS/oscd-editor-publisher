import { expect, fixture, html } from '@open-wc/testing';

import { setViewport } from '@web/test-runner-commands';

import { SinonSpy, spy } from 'sinon';

import {
  isInsert,
  isRemove,
  isSetAttributes,
} from '@openscd/oscd-api/utils.js';
import type { OscdTreeGrid } from '@omicronenergy/oscd-ui/tree-grid/OscdTreeGrid.js';

import { reportControlDoc } from './reportControl.testfiles.js';

import { ReportControlEditor } from './report-control-editor.js';

window.customElements.define('report-control-editor', ReportControlEditor);

type ClientLnAssignmentDialogForTesting = HTMLElement & {
  clientLnAssignmentReport?: Element;
  clientLogicalNodesForReport: (reportControl: Element) => Element[];
  clientLnTreePathForId: (id: string) => string[] | null;
  clientLnTreePaths: string[][];
  handleClientLnTreeClick: () => void;
  initialClientLnIds: string[];
  selectedClientLnIds: string[];
  updateComplete: Promise<unknown>;
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

function appendClientAccessPointLn(doc: XMLDocument): Element {
  const logicalNode = doc.createElement('LN');
  logicalNode.setAttribute('prefix', 'IHMI');
  logicalNode.setAttribute('lnClass', 'IHMI');
  logicalNode.setAttribute('inst', '1');
  doc
    .querySelector('IED[name="IED2"] AccessPoint[name="AP1"]')!
    .appendChild(logicalNode);

  return logicalNode;
}

function clientLnDialog(
  editor: ReportControlEditor,
): ClientLnAssignmentDialogForTesting {
  return editor.shadowRoot!.querySelector(
    'clientln-assignment-dialog',
  ) as ClientLnAssignmentDialogForTesting;
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

  it('does not render ClientLN candidates before opening the dialog', () => {
    expect(editor.shadowRoot!.querySelector('.client-ln-count')).to.not.exist;
    expect(editor.shadowRoot!.querySelector('oscd-tree-grid')).to.not.exist;
  });

  it('builds legacy-style ClientLN candidates from all IEDs', async () => {
    const doc = new DOMParser().parseFromString(
      `<SCL>
        <Communication>
          <SubNetwork name="A">
            <ConnectedAP iedName="Publisher" apName="AP1" />
            <ConnectedAP iedName="ClientA" apName="AP1" />
          </SubNetwork>
          <SubNetwork name="B">
            <ConnectedAP iedName="ClientB" apName="AP1" />
          </SubNetwork>
        </Communication>
        <IED name="Publisher">
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD0">
                <LN0 lnClass="LLN0" inst="">
                  <ReportControl name="rp" />
                </LN0>
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
        <IED name="ClientA">
          <AccessPoint name="AP1">
            <LN prefix="IHMI" lnClass="IHMI" inst="1" />
            <Server>
              <LDevice inst="LD0">
                <LN0 lnClass="LLN0" inst="" />
                <LN lnClass="GGIO" inst="1" />
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
        <IED name="ClientB">
          <AccessPoint name="AP1">
            <LN prefix="IHMI" lnClass="IHMI" inst="1" />
            <Server>
              <LDevice inst="LD0">
                <LN0 lnClass="LLN0" inst="" />
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
      </SCL>`,
      'application/xml',
    );
    const reportControl = doc.querySelector('ReportControl')!;

    editor.doc = doc;
    await editor.updateComplete;
    const assignmentEditor = clientLnDialog(editor);

    const candidateIds = assignmentEditor
      .clientLogicalNodesForReport(reportControl)
      .map(logicalNode => [
        logicalNode.closest('IED')?.getAttribute('name'),
        logicalNode.tagName,
        logicalNode.closest('LDevice')?.getAttribute('inst') ?? 'LD0',
      ]);

    expect(candidateIds).to.deep.include(['Publisher', 'LN0', 'LD0']);
    expect(candidateIds).to.deep.include(['ClientA', 'LN', 'LD0']);
    expect(candidateIds).to.deep.include(['ClientA', 'LN0', 'LD0']);
    expect(candidateIds).to.deep.include(['ClientB', 'LN', 'LD0']);
  });

  it('keeps sibling ClientLNs under the same LD in the tree', async () => {
    const doc = new DOMParser().parseFromString(
      `<SCL>
        <IED name="PUB_A">
          <AccessPoint name="AP1">
            <Server>
              <LDevice inst="LD_A">
                <LN0 lnClass="LLN0" inst="">
                  <ReportControl name="RCB_A" />
                </LN0>
                <LN lnClass="TCTR" inst="1" />
                <LN lnClass="XCBR" inst="1" />
              </LDevice>
            </Server>
          </AccessPoint>
        </IED>
      </SCL>`,
      'application/xml',
    );
    const reportControl = doc.querySelector('ReportControl')!;

    editor.doc = doc;
    await editor.updateComplete;
    const assignmentEditor = clientLnDialog(editor);
    assignmentEditor.clientLnAssignmentReport = reportControl;
    await assignmentEditor.updateComplete;

    const tree = assignmentEditor.shadowRoot!.querySelector(
      'oscd-tree-grid',
    ) as OscdTreeGrid;
    const logicalNodes = Object.keys(
      tree.tree['IED:PUB_A']?.children?.['AP:AP1']?.children?.[
        'LD:LD_A'
      ]?.children ?? {},
    );

    expect(logicalNodes).to.include('LN:PUB_A|AP1|LD_A||TCTR|1');
    expect(logicalNodes).to.include('LN:PUB_A|AP1|LD_A||XCBR|1');
  });

  it('assigns a ReportControl without RptEnabled to a ClientLN', () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp1"]',
    )!;
    const logicalNode = editor.doc.querySelector(
      'IED[name="IED2"] AccessPoint[name="AP1"] > LN[lnClass="IHMI"]',
    ) ?? appendClientAccessPointLn(editor.doc);
    const assignmentEditor = clientLnDialog(editor);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = ['IED2|AP1|LD0|IHMI|IHMI|1'];
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
    expect(edits[1].node.getAttribute('ldInst')).to.equal('LD0');
    expect(edits[1].node.getAttribute('prefix')).to.equal(
      logicalNode.getAttribute('prefix'),
    );
    expect(edits[1].node.getAttribute('lnClass')).to.equal('IHMI');
    expect(edits[1].node.getAttribute('lnInst')).to.equal('1');
  });

  it('assigns a ReportControl with RptEnabled to a ClientLN', () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    const rptEnabled = reportControl.querySelector('RptEnabled')!;
    appendClientAccessPointLn(editor.doc);
    const assignmentEditor = clientLnDialog(editor);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = ['IED2|AP1|LD0|IHMI|IHMI|1'];
    assignmentEditor.updateSelectedClientLns();

    expect(editEvent).to.have.been.calledOnce;
    const edits = editEvent.args[0][0].detail.edit;

    expect(edits).to.have.length(1);
    expect(isInsert(edits[0])).to.be.true;
    expect(edits[0].parent).to.equal(rptEnabled);
    expect(edits[0].node.tagName).to.equal('ClientLN');
    expect(edits[0].node.getAttribute('iedName')).to.equal('IED2');
    expect(edits[0].node.getAttribute('apRef')).to.equal('AP1');
    expect(edits[0].node.getAttribute('ldInst')).to.equal('LD0');
    expect(edits[0].node.getAttribute('prefix')).to.equal('IHMI');
    expect(edits[0].node.getAttribute('lnClass')).to.equal('IHMI');
    expect(edits[0].node.getAttribute('lnInst')).to.equal('1');
  });

  it('removes unchecked existing ClientLNs', () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    const rptEnabled = reportControl.querySelector('RptEnabled')!;
    const clientLn = editor.doc.createElement('ClientLN');
    const assignmentEditor = clientLnDialog(editor);

    clientLn.setAttribute('iedName', 'IED2');
    clientLn.setAttribute('apRef', 'AP1');
    clientLn.setAttribute('ldInst', 'LD0');
    clientLn.setAttribute('prefix', 'IHMI');
    clientLn.setAttribute('lnClass', 'IHMI');
    clientLn.setAttribute('lnInst', '1');
    rptEnabled.appendChild(clientLn);
    appendClientAccessPointLn(editor.doc);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = ['IED2|AP1|LD0|IHMI|IHMI|1'];
    assignmentEditor.selectedClientLnIds = [];
    assignmentEditor.updateSelectedClientLns();

    expect(editEvent).to.have.been.calledOnce;
    const edits = editEvent.args[0][0].detail.edit;

    expect(edits).to.have.length(1);
    expect(isRemove(edits[0])).to.be.true;
    expect(edits[0].node).to.equal(clientLn);
  });

  it('shows already assigned ClientLNs in the tree selection', async () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    const rptEnabled = reportControl.querySelector('RptEnabled')!;
    const clientLn = editor.doc.createElement('ClientLN');
    const assignmentEditor = clientLnDialog(editor);

    clientLn.setAttribute('iedName', 'IED2');
    clientLn.setAttribute('apRef', 'AP1');
    clientLn.setAttribute('ldInst', 'LD0');
    clientLn.setAttribute('prefix', 'IHMI');
    clientLn.setAttribute('lnClass', 'IHMI');
    clientLn.setAttribute('lnInst', '1');
    rptEnabled.appendChild(clientLn);
    appendClientAccessPointLn(editor.doc);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = ['IED2|AP1|LD0|IHMI|IHMI|1'];
    assignmentEditor.selectedClientLnIds = ['IED2|AP1|LD0|IHMI|IHMI|1'];
    assignmentEditor.clientLnTreePaths = [
      assignmentEditor.clientLnTreePathForId('IED2|AP1|LD0|IHMI|IHMI|1')!,
    ];
    await assignmentEditor.updateComplete;

    const tree = assignmentEditor.shadowRoot!.querySelector(
      'oscd-tree-grid',
    ) as OscdTreeGrid;

    expect(tree.paths).to.deep.equal([
      ['IED:IED2', 'AP:AP1', 'LN:IED2|AP1|LD0|IHMI|IHMI|1'],
    ]);
  });

  it('shows ClientLN selection count at max', async () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    reportControl.querySelector('RptEnabled')!.setAttribute('max', '4');
    const assignmentEditor = clientLnDialog(editor);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = [
      'IED|AP1|LD0|IHMI|IHMI|1',
      'IED|AP1|LD0|IHMI|IHMI|2',
      'IED2|AP1|LD0|IHMI|IHMI|1',
      'IED2|AP1|LD0|IHMI|IHMI|2',
    ];
    appendClientAccessPointLn(editor.doc);
    await assignmentEditor.updateComplete;

    const count =
      assignmentEditor.shadowRoot!.querySelector('.client-ln-count');

    expect(count?.textContent?.trim()).to.equal('4/4 clients');
  });

  it('keeps ClientLN tree selection within the max client count', async () => {
    const reportControl = editor.doc.querySelector(
      'ReportControl[name="rp2"]',
    )!;
    reportControl.querySelector('RptEnabled')!.setAttribute('max', '2');
    const assignmentEditor = clientLnDialog(editor);

    assignmentEditor.clientLnAssignmentReport = reportControl;
    assignmentEditor.initialClientLnIds = [];
    assignmentEditor.selectedClientLnIds = [
      'IED|AP1|LD0|IHMI|IHMI|1',
      'IED|AP1|LD0|IHMI|IHMI|2',
    ];
    const newLogicalNode = appendClientAccessPointLn(editor.doc);
    assignmentEditor.clientLnTreePaths = [
      ['IED:IED', 'AP:AP1', 'LN:IED|AP1|LD0|IHMI|IHMI|1'],
      ['IED:IED', 'AP:AP1', 'LN:IED|AP1|LD0|IHMI|IHMI|2'],
      assignmentEditor.clientLnTreePathForId(
        'IED2|AP1|LD0|IHMI|IHMI|1',
      ) ?? [
        'IED:IED2',
        'AP:AP1',
        `LN:${[
          newLogicalNode.closest('IED')?.getAttribute('name') ?? '',
          newLogicalNode.closest('AccessPoint')?.getAttribute('name') ?? '',
          'LD0',
          newLogicalNode.getAttribute('prefix') ?? '',
          newLogicalNode.getAttribute('lnClass') ?? '',
          newLogicalNode.getAttribute('inst') ?? '',
        ].join('|')}`,
      ],
    ];
    await assignmentEditor.updateComplete;

    assignmentEditor.handleClientLnTreeClick();
    await new Promise((resolve) => {
      setTimeout(resolve);
    });

    expect(assignmentEditor.selectedClientLnIds).to.deep.equal([
      'IED|AP1|LD0|IHMI|IHMI|1',
      'IED|AP1|LD0|IHMI|IHMI|2',
    ]);
  });
});

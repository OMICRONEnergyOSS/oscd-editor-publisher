import { expect, fixture, html } from '@open-wc/testing';

import { SinonSpy, spy } from 'sinon';

import { isInsert, isRemove } from '@openscd/oscd-api/utils.js';

import { dataSetDoc } from './data-set-editor.testfiles.js';

import { DataSetElementEditor } from './data-set-element-editor.js';

window.customElements.define('data-set-element-editor', DataSetElementEditor);

const doc = new DOMParser().parseFromString(dataSetDoc, 'application/xml');
const dataSet = doc.querySelector('LDevice[inst="ldInst1"] DataSet')!;

function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

/** Returns the action-list's shadow root for querying internal lists */
function getActionListShadow(editor: DataSetElementEditor): ShadowRoot {
  return editor.shadowRoot!.querySelector('oscd-action-list')!.shadowRoot!;
}

/** Clicks the delete button (first action) for the FCDA at the given index */
function clickDeleteButton(editor: DataSetElementEditor, index: number): void {
  const shadow = getActionListShadow(editor);
  const firstActionList = shadow.querySelectorAll('oscd-list')[1];
  const deleteButtons = firstActionList.querySelectorAll('oscd-list-item');
  (deleteButtons[index] as HTMLElement).click();
}

/** Clicks a menu item (move up/down) from the more_vert menu at the given index
 * within the "other actions" list. Note: only items with >2 actions render
 * a more_vert menu, so moreVertIndex 0 corresponds to the first such item. */
async function clickMoreVertMenuItem(
  editor: DataSetElementEditor,
  moreVertIndex: number,
  menuItemIndex: number,
): Promise<void> {
  const shadow = getActionListShadow(editor);
  const otherActionList = shadow.querySelectorAll('oscd-list')[2];
  const moreVertButtons = otherActionList.querySelectorAll(
    'oscd-list-item[id="more-vert-anchor"]',
  );
  (moreVertButtons[moreVertIndex] as HTMLElement).click();
  await timeout(100);
  const menus = otherActionList.querySelectorAll('oscd-menu');
  const menuItems = menus[moreVertIndex].querySelectorAll('oscd-menu-item');
  (menuItems[menuItemIndex] as HTMLElement).click();
}

describe('DataSet element editor', () => {
  let editor: DataSetElementEditor;

  let editEvent: SinonSpy;

  beforeEach(async () => {
    editor = await fixture(
      html`<data-set-element-editor
        .element="${dataSet}"
      ></data-set-element-editor>`,
    );

    editEvent = spy();
    window.addEventListener('oscd-edit-v2', editEvent);
  });

  it('allows to change DataSets name attribute', async () => {
    editor.inputs[0].value = 'SomeDataSetName';
    editor.onInputChange();
    await timeout(50);

    editor.saveButton.click();

    expect(editEvent).to.have.be.calledOnce;

    expect(editEvent.args[0][0].detail.edit[0].attributes.name).to.equal(
      'SomeDataSetName',
    );
  });

  it('allows to change DataSets desc attribute', async () => {
    editor.inputs[1].nullSwitch?.click();
    editor.inputs[1].value = 'SomeNewDesc';
    editor.onInputChange();
    await timeout(50);

    editor.saveButton.click();

    expect(editEvent).to.have.be.calledOnce;
    const item = editEvent.args[0][0].detail.edit[0];
    const itemDesc = item.attributes.desc;
    expect(itemDesc).to.equal('SomeNewDesc');
  });

  it('allows to remove DataSets child data', async () => {
    clickDeleteButton(editor, 1);

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(1);
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal('FCDA');
  });

  it('allows to move FCDA child one step up', async () => {
    await clickMoreVertMenuItem(editor, 0, 0); // first more_vert menu (2nd FCDA), first menu item (move up)

    const toBeMovedFCDA = dataSet.querySelectorAll(':scope > FCDA')[1];
    const reference = toBeMovedFCDA.previousElementSibling;

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);
    expect(isRemove(editEvent.args[0][0].detail.edit[0])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[0].node === toBeMovedFCDA).to.be
      .true;
    expect(isInsert(editEvent.args[0][0].detail.edit[1])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[1].parent === dataSet).to.be.true;
    expect(editEvent.args[0][0].detail.edit[1].node === toBeMovedFCDA).to.be
      .true;
    expect(editEvent.args[0][0].detail.edit[1].reference === reference).to.be
      .true;
  });

  it('allows to move FCDA child one step down', async () => {
    await clickMoreVertMenuItem(editor, 0, 1); // first more_vert menu (2nd FCDA), second menu item (move down)

    const toBeMovedFCDA = dataSet.querySelectorAll(':scope > FCDA')[1];
    const reference = toBeMovedFCDA.nextElementSibling?.nextElementSibling;

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);
    expect(isRemove(editEvent.args[0][0].detail.edit[0])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[0].node === toBeMovedFCDA).to.be
      .true;
    expect(isInsert(editEvent.args[0][0].detail.edit[1])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[1].parent === dataSet).to.be.true;
    expect(editEvent.args[0][0].detail.edit[1].node === toBeMovedFCDA).to.be
      .true;
    expect(editEvent.args[0][0].detail.edit[1].reference === reference).to.be
      .true;
  });

  it('allows adds new data attribute to DataSet', () => {
    editor.daPicker.paths = [
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phsA',
        'DA: #CMV>cVal',
        'BDA: #Vector>mag',
        'BDA: #AnalogueValue>f',
      ],
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phRes',
        'SDO: #CustomWYE>phsA',
        'DA: #CMV>cVal',
        'BDA: #Vector>mag',
        'BDA: #AnalogueValue>f',
      ],
    ];

    editor.daPickerSaveButton.click();

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);

    const insert1 = editEvent.args[0][0].detail.edit[0];
    expect(isInsert(insert1)).to.be.true;
    expect(insert1.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert1.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert1.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert1.node.getAttribute('lnInst')).to.equal('1');
    expect(insert1.node.getAttribute('doName')).to.equal('PhV.phsA');
    expect(insert1.node.getAttribute('daName')).to.equal('cVal.mag.f');
    expect(insert1.node.getAttribute('fc')).to.equal('MX');

    const insert2 = editEvent.args[0][0].detail.edit[1];
    expect(isInsert(insert2)).to.be.true;
    expect(insert2.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert2.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert2.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert2.node.getAttribute('lnInst')).to.equal('1');
    expect(insert2.node.getAttribute('doName')).to.equal('PhV.phRes.phsA');
    expect(insert2.node.getAttribute('daName')).to.equal('cVal.mag.f');
    expect(insert2.node.getAttribute('fc')).to.equal('MX');
  });

  it('allows adds new data object to DataSet', () => {
    editor.doPicker.paths = [
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phsA',
        'FC: MX',
      ],
      [
        'LDevice: IED>>ldInst1',
        'LN: IED>>ldInst1>prefix MMXU 1',
        'DO: #MMXU>PhV',
        'SDO: #WYE>phRes',
        'SDO: #CustomWYE>phsA',
        'FC: MX',
      ],
    ];

    editor.doPickerSaveButton.click();

    expect(editEvent).to.have.be.calledOnce;
    expect(editEvent.args[0][0].detail.edit.length).to.equal(2);

    const insert1 = editEvent.args[0][0].detail.edit[0];
    expect(isInsert(insert1)).to.be.true;
    expect(insert1.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert1.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert1.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert1.node.getAttribute('lnInst')).to.equal('1');
    expect(insert1.node.getAttribute('doName')).to.equal('PhV.phsA');
    expect(insert1.node.getAttribute('daName')).to.be.null;
    expect(insert1.node.getAttribute('fc')).to.equal('MX');

    const insert2 = editEvent.args[0][0].detail.edit[1];
    expect(isInsert(insert2)).to.be.true;
    expect(insert2.node.getAttribute('ldInst')).to.equal('ldInst1');
    expect(insert2.node.getAttribute('prefix')).to.equal('prefix');
    expect(insert2.node.getAttribute('lnClass')).to.equal('MMXU');
    expect(insert2.node.getAttribute('lnInst')).to.equal('1');
    expect(insert2.node.getAttribute('doName')).to.equal('PhV.phRes.phsA');
    expect(insert2.node.getAttribute('daName')).to.be.null;
    expect(insert2.node.getAttribute('fc')).to.equal('MX');
  });
});

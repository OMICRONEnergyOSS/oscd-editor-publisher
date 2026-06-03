import { expect, fixture, html } from '@open-wc/testing';

import { sendMouse } from '@web/test-runner-commands';

import { SinonSpy, spy } from 'sinon';

import { isInsert, isRemove } from '@openscd/oscd-api/utils.js';

import { dataSetDoc } from './data-set-editor.testfiles.js';

import { DataSetEditor } from './data-set-editor.js';

window.customElements.define('data-set-editor', DataSetEditor);

const doc = new DOMParser().parseFromString(dataSetDoc, 'application/xml');

type DataSetEditorWithSelection = DataSetEditor & {
  selectedDataSet?: Element;
};

describe('DataSet editor component', () => {
  let editor: DataSetEditor;
  let editEvent: SinonSpy;

  beforeEach(async () => {
    editor = await fixture(
      html`<data-set-editor .doc="${doc}"></data-set-editor>`,
    );

    editEvent = spy();
    window.addEventListener('oscd-edit-v2', editEvent);
  });

  it('allows to add a new empty DataSet element', async () => {
    await sendMouse({ type: 'click', position: [760, 100] });

    expect(editEvent).to.have.been.calledOnce;

    const insert = editEvent.args[0][0].detail.edit;

    expect(isInsert(insert)).to.be.true;
    expect(insert.parent.tagName).to.equal('LN0');
    expect(insert.node.tagName).to.equal('DataSet');
    expect(insert.node.getAttribute('name')).to.equal('newDataSet_001');
    expect(insert.node.children.length).to.equal(0);
  });

  it('allows to remove an existing DataSet element', async () => {
    await sendMouse({ type: 'click', position: [760, 200] });

    expect(editEvent).to.have.been.calledOnce;
    expect(isRemove(editEvent.args[0][0].detail.edit[0])).to.be.true;
    expect(editEvent.args[0][0].detail.edit[0].node.tagName).to.equal(
      'DataSet',
    );
  });

  it('clears selected DataSet details when the document changes', async () => {
    (editor as DataSetEditorWithSelection).selectedDataSet =
      editor.doc.querySelector('DataSet')!;
    await editor.updateComplete;

    expect(editor.shadowRoot!.querySelector('data-set-element-editor')).to
      .exist;

    editor.doc = new DOMParser().parseFromString(
      '<SCL></SCL>',
      'application/xml',
    );
    await editor.updateComplete;

    expect(editor.shadowRoot!.querySelector('data-set-element-editor')).to.not
      .exist;
  });
});

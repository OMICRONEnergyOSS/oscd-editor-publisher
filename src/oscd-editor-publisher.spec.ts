import { expect, fixture, html } from '@open-wc/testing';

import PublisherPlugin, {
  PUBLISHER_TYPE_LOCAL_STORAGE_KEY,
} from './oscd-editor-publisher.js';

if (!window.customElements.get('oscd-editor-publisher')) {
  window.customElements.define('oscd-editor-publisher', PublisherPlugin);
}

function publisherFixture(): Promise<PublisherPlugin> {
  return fixture(
    html`<oscd-editor-publisher
      .doc=${new DOMParser().parseFromString('<SCL></SCL>', 'application/xml')}
    ></oscd-editor-publisher>`,
  );
}

describe('Publisher plugin', () => {
  beforeEach(() => {
    localStorage.removeItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY);
  });

  it('selects GOOSE by default', async () => {
    const plugin = await publisherFixture();
    const gooseRadio = plugin.shadowRoot!.querySelector(
      '#goose-radio',
    ) as HTMLInputElement;

    expect(gooseRadio.checked).to.be.true;
  });

  it('restores the last selected publisher type from localStorage', async () => {
    localStorage.setItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY, 'Report');

    const plugin = await publisherFixture();
    const reportRadio = plugin.shadowRoot!.querySelector(
      '#report-radio',
    ) as HTMLInputElement;

    expect(reportRadio.checked).to.be.true;
  });

  it('falls back to GOOSE for invalid localStorage values', async () => {
    localStorage.setItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY, 'Invalid');

    const plugin = await publisherFixture();
    const gooseRadio = plugin.shadowRoot!.querySelector(
      '#goose-radio',
    ) as HTMLInputElement;

    expect(gooseRadio.checked).to.be.true;
  });

  it('stores the selected publisher type in localStorage', async () => {
    const plugin = await publisherFixture();
    const dataSetRadio = plugin.shadowRoot!.querySelector(
      '#ds-radio',
    ) as HTMLInputElement;

    dataSetRadio.dispatchEvent(new Event('change'));

    expect(localStorage.getItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY)).to.equal(
      'DataSet',
    );
  });
});

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

type SegmentedButton = HTMLElement & {
  noCheckmark: boolean;
  selected: boolean;
};

function publisherTypeButton(
  plugin: PublisherPlugin,
  label: string,
): SegmentedButton {
  return plugin.shadowRoot!.querySelector(
    `oscd-outlined-segmented-button[label="${label}"]`,
  ) as SegmentedButton;
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
    const gooseButton = publisherTypeButton(plugin, 'GOOSE');

    expect(gooseButton.selected).to.be.true;
  });

  it('restores the last selected publisher type from localStorage', async () => {
    localStorage.setItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY, 'Report');

    const plugin = await publisherFixture();
    const reportButton = publisherTypeButton(plugin, 'Report');

    expect(reportButton.selected).to.be.true;
  });

  it('falls back to GOOSE for invalid localStorage values', async () => {
    localStorage.setItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY, 'Invalid');

    const plugin = await publisherFixture();
    const gooseButton = publisherTypeButton(plugin, 'GOOSE');

    expect(gooseButton.selected).to.be.true;
  });

  it('stores the selected publisher type in localStorage', async () => {
    const plugin = await publisherFixture();
    const dataSetButton = publisherTypeButton(plugin, 'DataSet');

    dataSetButton.click();

    expect(localStorage.getItem(PUBLISHER_TYPE_LOCAL_STORAGE_KEY)).to.equal(
      'DataSet',
    );
  });

  it('keeps selected segmented button icons instead of checkmarks', async () => {
    const plugin = await publisherFixture();
    const buttons = plugin.shadowRoot!.querySelectorAll<SegmentedButton>(
      'oscd-outlined-segmented-button',
    );
    const gooseButton = publisherTypeButton(plugin, 'GOOSE');
    const materialButton = gooseButton.shadowRoot!.querySelector('button');

    buttons.forEach((button) => {
      expect(button.noCheckmark).to.be.true;
    });
    expect(
      materialButton!.classList.contains(
        'md3-segmented-button--without-checkmark',
      ),
    ).to.be.true;
  });
});

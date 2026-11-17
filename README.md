# chrome-plugin-publiq

A small Chrome plugin to easily switch between offers on UiT, UDB and JSON.

On every page of `*.uitdatabank.be` or `*.uitinvlaanderen.be` that shows an event, place or organizer, a bar appears in the bottom right corner with links to the same offer in:

- **JSON**: `io(-env).uitdatabank.be/{type}/{id}`
- **UiTdatabank**: `{env}.uitdatabank.be/{type}/{id}`
- **UiTinVlaanderen**: `{env}.uitinvlaanderen.be/agenda/{e|l|o}/slug/{id}`

The bar shows the current environment (test, acc or prod) and always links within that same environment. Click the `›` button to collapse the bar.

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/cultuurnet/chrome-plugin-publiq.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the cloned `chrome-plugin-publiq` folder.
5. Open an event, place or organizer on UiTdatabank, UiTinVlaanderen or the JSON API. The bar appears in the bottom right corner.

## Updating

1. Pull the latest changes:
   ```sh
   git pull
   ```
2. Open `chrome://extensions` and click the reload icon on the **UDB Switcher** card.
3. Reload any open UiTdatabank or UiTinVlaanderen tabs.

## Configuration

The hostnames per environment are defined in the `HOSTS` object at the top of `content.js`. The type codes UiTinVlaanderen uses in its URLs (`e`, `l`, `o`) are defined in `UIV_CODE`.

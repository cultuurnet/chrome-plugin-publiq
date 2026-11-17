(() => {
  const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

  // UiTinVlaanderen uses one-letter type codes in its agenda URLs.
  const UIV_CODE = { events: 'e', places: 'l', organizers: 'o' };
  const UIV_TYPE = { e: 'events', l: 'places', o: 'organizers' };

  const HOSTS = {
    prod: {
      json: 'io.uitdatabank.be',
      udb: 'www.uitdatabank.be',
      uiv: 'www.uitinvlaanderen.be',
    },
    acc: {
      json: 'io-acc.uitdatabank.be',
      udb: 'acc.uitdatabank.be',
      uiv: 'acc.uitinvlaanderen.be',
    },
    test: {
      json: 'io-test.uitdatabank.be',
      udb: 'test.uitdatabank.be',
      uiv: 'test.uitinvlaanderen.be',
    },
  };

  function detectEnvironment(host) {
    for (const [env, hosts] of Object.entries(HOSTS)) {
      for (const [site, h] of Object.entries(hosts)) {
        if (h === host) return { env, site };
      }
    }
    // Bare domains (without www) redirect to prod, so treat them as prod.
    if (host === 'uitdatabank.be') return { env: 'prod', site: 'udb' };
    if (host === 'uitinvlaanderen.be') return { env: 'prod', site: 'uiv' };
    return null;
  }

  function detectResource(path) {
    const uiv = path.match(new RegExp(`/agenda/([elo])/[^/]+/(${UUID})`, 'i'));
    if (uiv) return { type: UIV_TYPE[uiv[1].toLowerCase()], id: uiv[2].toLowerCase() };

    // Singular forms are matched too because some UDB frontend routes use them.
    const udb = path.match(new RegExp(`/(event|place|organizer)s?/(${UUID})`, 'i'));
    if (udb) return { type: `${udb[1].toLowerCase()}s`, id: udb[2].toLowerCase() };

    return null;
  }

  function buildLinks(env, { type, id }) {
    const hosts = HOSTS[env];
    return {
      json: `https://${hosts.json}/${type}/${id}`,
      udb: `https://${hosts.udb}/${type}/${id}`,
      // UiV ignores the slug and resolves on the id, so a placeholder is enough.
      uiv: `https://${hosts.uiv}/agenda/${UIV_CODE[type]}/slug/${id}`,
    };
  }

  const LABELS = { json: 'JSON', udb: 'UiTdatabank', uiv: 'UiTinVlaanderen' };
  const STORAGE_KEY = 'udb-switcher-collapsed';

  let host;
  let lastHref;

  function isCollapsed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function setCollapsed(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {}
  }

  function render() {
    if (location.href === lastHref) return;
    lastHref = location.href;

    const environment = detectEnvironment(location.hostname);
    const resource = detectResource(location.pathname);

    if (!environment || !resource) {
      host?.remove();
      host = null;
      return;
    }

    if (!host) {
      host = document.createElement('udb-switcher');
      host.attachShadow({ mode: 'open' });
      document.documentElement.appendChild(host);
    }

    const links = buildLinks(environment.env, resource);
    const collapsed = isCollapsed();

    host.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }
        .bar {
          position: fixed; bottom: 12px; right: 12px; z-index: 2147483647;
          display: flex; align-items: center; gap: 4px;
          padding: 4px; border-radius: 8px;
          background: #1f2933; color: #fff;
          font: 13px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          box-shadow: 0 4px 16px rgba(0, 0, 0, .3);
        }
        .env {
          padding: 4px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase;
          background: ${environment.env === 'prod' ? '#c0392b' : environment.env === 'acc' ? '#d68910' : '#2874a6'};
        }
        a {
          padding: 6px 10px; border-radius: 4px; color: #fff; text-decoration: none;
        }
        a:hover { background: #3e4c59; }
        a.current { background: #fff; color: #1f2933; font-weight: 600; pointer-events: none; }
        button {
          all: unset; cursor: pointer; padding: 4px 8px; border-radius: 4px; color: #9aa5b1;
        }
        button:hover { background: #3e4c59; color: #fff; }
        .collapsed a { display: none; }
      </style>
      <div class="bar ${collapsed ? 'collapsed' : ''}">
        <span class="env" title="${resource.type} ${resource.id}">${environment.env}</span>
        ${Object.entries(links)
          .map(([site, url]) => `<a href="${url}" class="${site === environment.site ? 'current' : ''}">${LABELS[site]}</a>`)
          .join('')}
        <button title="${collapsed ? 'Uitklappen' : 'Inklappen'}">${collapsed ? '‹' : '›'}</button>
      </div>
    `;

    host.shadowRoot.querySelector('button').addEventListener('click', () => {
      setCollapsed(!collapsed);
      lastHref = null;
      render();
    });
  }

  render();
  // UiTdatabank is a SPA, so route changes don't reload the content script.
  setInterval(render, 500);
})();

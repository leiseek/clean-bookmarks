const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const catalogs = JSON.parse(fs.readFileSync(path.join(root, '_locales/en/messages.json'), 'utf8'));
function getMessage(key, values = []) {
  if (!catalogs[key]) throw new Error(`Missing translation: ${key}`);
  if (!Array.isArray(values)) values = [values];
  return catalogs[key].message.replace(/\$(\w+)\$/g, (_, name) => {
    const index = Number(catalogs[key].placeholders?.[name]?.content.slice(1)) - 1;
    return String(values[index] ?? '');
  });
}
function event() {
  const listeners = [];
  return { addListener: fn => listeners.push(fn), emit: (...args) => listeners.forEach(fn => fn(...args)) };
}
const fixture = () => [{ id: '0', title: '', children: [{ id: '1', title: 'Bookmarks bar', children: [
  { id: '10', title: 'Missing', url: 'https://example.test/missing' },
  { id: '11', title: 'Other', url: 'https://example.test/other' }
] }] }];
const invalid = (id = '10', url = 'https://example.test/missing') => ({
  id, title: 'Missing', url, folderPath: 'Bookmarks bar', status: 'invalid', httpStatus: 404, isValid: false
});
const flush = async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); };

function createWorker(options = {}) {
  const state = options.state || {};
  const tree = options.tree || fixture();
  const calls = { requests: [], removed: [], messages: [], downloads: [], tree: 0 };
  const downloads = new Map();
  const changed = event();
  const erased = event();
  const chrome = {
    i18n: { getMessage },
    runtime: {
      onMessage: event(),
      sendMessage: async message => {
        calls.messages.push(structuredClone(message));
        if (options.onMessage) await options.onMessage(message);
      }
    },
    storage: { local: {
      async get(keys) {
        if (typeof keys === 'string') keys = [keys];
        return structuredClone(Object.fromEntries(keys.filter(key => key in state).map(key => [key, state[key]])));
      },
      async set(values) { Object.assign(state, structuredClone(values)); }
    } },
    bookmarks: {
      async getTree() { calls.tree++; if (options.treeError) throw new Error('getTree failed'); return structuredClone(tree); },
      async get(id) {
        const find = nodes => nodes.flatMap(node => [node, ...find(node.children || [])]);
        const bookmark = find(tree).find(node => node.id === id);
        if (!bookmark) throw new Error('Bookmark missing');
        return [structuredClone(bookmark)];
      },
      async remove(id) {
        if (options.removeError === id) throw new Error('Deletion denied');
        calls.removed.push(id);
        const remove = nodes => { for (const node of nodes) if (node.children) {
          node.children = node.children.filter(child => child.id !== id); remove(node.children);
        } };
        remove(tree);
      }
    },
    downloads: {
      onChanged: changed, onErased: erased,
      async download(values) {
        if (options.downloadError) throw new Error('Download denied');
        calls.downloads.push(values);
        const id = calls.downloads.length;
        downloads.set(id, { id, state: options.instantDownload ? 'complete' : 'in_progress', exists: true });
        if (options.instantDownload) changed.emit({ id, state: { current: 'complete' } });
        return id;
      },
      async search({ id }) { return downloads.has(id) ? [structuredClone(downloads.get(id))] : []; }
    }
  };
  if (options.downloads) for (const download of options.downloads) downloads.set(download.id, download);
  const context = vm.createContext({
    chrome, URL, AbortController, console: { error() {} },
    fetch: async (url, init) => {
      calls.requests.push({ url, ...init });
      return (options.fetch || (async () => new Response(null, { status: 200 })))(url, init);
    },
    setTimeout: (fn, ms) => setTimeout(fn, ms === 300 ? 0 : options.shortTimeout && ms === 10000 ? 5 : ms),
    clearTimeout, btoa: text => Buffer.from(text, 'binary').toString('base64'), unescape, encodeURIComponent
  });
  vm.runInContext(fs.readFileSync(path.join(root, 'background.js'), 'utf8'), context);
  const evaluate = source => vm.runInContext(source, context);
  return {
    context, state, tree, chrome, calls, downloads,
    ready: evaluate('workerReady'),
    scanDone: () => evaluate('scanTask'),
    async idle() { await evaluate('workerReady'); await flush(); await evaluate('backupQueue'); await flush(); },
    async changeDownload(id, update) {
      Object.assign(downloads.get(id), update);
      changed.emit({ id, state: { current: downloads.get(id).state } });
      await this.idle();
    }
  };
}

function createPage(name, initialState, search = '') {
  let state = initialState;
  const messages = [];
  const runtimeEvents = event();
  const storageEvents = event();
  const elements = new Map();
  class Element {
    constructor() { this.style = {}; this.events = {}; this.children = []; this.className = ''; }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    setAttribute() {}
    async trigger(name) { await Promise.all((this.events[name] || []).map(fn => fn({ target: this }))); }
  }
  const html = fs.readFileSync(path.join(root, `${name}.html`), 'utf8');
  for (const match of html.matchAll(/id="([^"]+)"/g)) elements.set(match[1], new Element());
  let ready;
  const document = {
    addEventListener(name, fn) { ready = fn; },
    getElementById(id) {
      if (!elements.has(id)) throw new Error(`Missing element ${id}`);
      return elements.get(id);
    },
    createElement: () => new Element(),
    querySelectorAll(selector) {
      const all = new Set();
      const visit = el => { if (all.has(el)) return; all.add(el); el.children.forEach(visit); };
      elements.forEach(visit);
      const classes = selector.split('.').filter(Boolean);
      return [...all].filter(el => classes.every(value => el.className.split(' ').includes(value)));
    }
  };
  const chrome = {
    i18n: { getMessage },
    runtime: {
      onMessage: runtimeEvents,
      async sendMessage(message) {
        if (message.type === 'getScanState') return structuredClone(state);
        messages.push(message);
        if (message.type === 'backupAndClean' || message.type === 'backupBookmarks') {
          state = { ...state, backupJob: { kind: message.type === 'backupAndClean' ? 'clean' : 'backup' } };
        }
        return { started: true };
      }
    },
    storage: { onChanged: storageEvents }, tabs: { create() {} }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, `${name}.js`), 'utf8'), {
    chrome, document, URLSearchParams, window: { location: { search } }
  });
  ready();
  return {
    elements, messages, runtimeEvents, storageEvents, document,
    async update(next) { state = next; storageEvents.emit({ backupJob: {} }, 'local'); await flush(); }
  };
}

module.exports = { createWorker, createPage, fixture, invalid, flush, root };

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewProvider = void 0;
const vscode = __importStar(require("vscode"));
class WebviewProvider {
    constructor(extensionUri, docs, favorites, history, onFavoritesChanged, onHistoryChanged) {
        this.extensionUri = extensionUri;
        this.docs = docs;
        this.favorites = favorites;
        this.history = history;
        this.onFavoritesChanged = onFavoritesChanged;
        this.onHistoryChanged = onHistoryChanged;
        this.panels = new Map();
    }
    async open(entryId) {
        const entry = this.docs.getEntry(entryId);
        if (!entry) {
            vscode.window.showErrorMessage(`Code Atlas: entry "${entryId}" not found.`);
            return;
        }
        await this.history.push(entryId);
        this.onHistoryChanged();
        const existing = this.panels.get(entryId);
        if (existing) {
            existing.reveal();
            return;
        }
        const config = vscode.workspace.getConfiguration('codeAtlas');
        const column = config.get('openDocPanel') === 'active'
            ? vscode.ViewColumn.Active
            : vscode.ViewColumn.Beside;
        const panel = vscode.window.createWebviewPanel('codeAtlasDoc', entry.name, column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'assets')],
        });
        this.panels.set(entryId, panel);
        panel.onDidDispose(() => {
            this.panels.delete(entryId);
        });
        panel.webview.onDidReceiveMessage(async (msg) => {
            switch (msg.command) {
                case 'insert':
                    await this.insertCode(msg.code);
                    break;
                case 'copy':
                    await vscode.env.clipboard.writeText(msg.code);
                    vscode.window.showInformationMessage('Copied to clipboard!');
                    break;
                case 'openDocs':
                    await vscode.env.openExternal(vscode.Uri.parse(msg.url));
                    break;
                case 'navigate':
                    await this.open(msg.id);
                    break;
                case 'toggleFavorite':
                    const isFav = await this.favorites.toggle(entryId);
                    this.onFavoritesChanged();
                    panel.webview.postMessage({ command: 'favoriteChanged', isFavorite: isFav });
                    break;
            }
        });
        this.render(panel, entry);
    }
    async insertCode(code) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active text editor. Open a file first.');
            return;
        }
        await editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.active, code);
        });
    }
    render(panel, entry) {
        const isFav = this.favorites.isFavorite(entry.id);
        const related = this.docs.resolveRelated(entry.related);
        panel.webview.html = this.buildHtml(panel.webview, entry, isFav, related);
    }
    escapeHtml(s) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    buildHtml(_webview, entry, isFavorite, related) {
        const nonce = getNonce();
        const csp = `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';`;
        const examplesHtml = entry.examples
            .map((ex, i) => `
      <div class="example">
        ${ex.title ? `<h4 class="example-title">${this.escapeHtml(ex.title)}</h4>` : ''}
        ${ex.description ? `<p class="example-desc">${this.escapeHtml(ex.description)}</p>` : ''}
        <div class="code-block-wrapper">
          <pre class="code-block"><code>${this.escapeHtml(ex.code)}</code></pre>
          <div class="code-actions">
            <button class="btn-small" onclick="insertCode(${i})">Insert</button>
            <button class="btn-small" onclick="copyCode(${i})">Copy</button>
          </div>
        </div>
      </div>`)
            .join('');
        const paramsHtml = entry.parameters.length > 0
            ? `<div class="section">
          <h3>Parameters</h3>
          <table class="params-table">
            <thead><tr><th>Name</th><th>Type</th><th>Description</th><th>Optional</th></tr></thead>
            <tbody>
              ${entry.parameters
                .map((p) => `<tr>
                  <td><code>${this.escapeHtml(p.name)}</code></td>
                  <td><code class="type">${this.escapeHtml(p.type)}</code></td>
                  <td>${this.escapeHtml(p.description)}</td>
                  <td>${p.optional ? '✓' : ''}</td>
                </tr>`)
                .join('')}
            </tbody>
          </table>
        </div>`
            : '';
        const relatedHtml = related.length > 0
            ? `<div class="section">
        <h3>Related APIs</h3>
        <div class="related-grid">
          ${related
                .map((r) => `<button class="related-chip" onclick="navigate('${this.escapeHtml(r.id)}')">
              <span class="chip-lang">${this.escapeHtml(r.language)}</span>
              ${this.escapeHtml(r.name)}
            </button>`)
                .join('')}
        </div>
      </div>`
            : '';
        const useCasesHtml = entry.useCases && entry.useCases.length > 0
            ? `<div class="section">
        <h3>Common Use Cases</h3>
        <ul>${entry.useCases.map((u) => `<li>${this.escapeHtml(u)}</li>`).join('')}</ul>
      </div>`
            : '';
        const mistakesHtml = entry.commonMistakes && entry.commonMistakes.length > 0
            ? `<div class="section">
        <h3>Common Mistakes</h3>
        <ul class="mistakes">${entry.commonMistakes.map((m) => `<li>${this.escapeHtml(m)}</li>`).join('')}</ul>
      </div>`
            : '';
        const bestPracticesHtml = entry.bestPractices && entry.bestPractices.length > 0
            ? `<div class="section">
        <h3>Best Practices</h3>
        <ul class="best-practices">${entry.bestPractices.map((b) => `<li>${this.escapeHtml(b)}</li>`).join('')}</ul>
      </div>`
            : '';
        const examplesJson = JSON.stringify(entry.examples.map((e) => e.code));
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(entry.name)}</title>
  <style nonce="${nonce}">
    *,*::before,*::after{box-sizing:border-box}
    body{
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      padding: 0 20px 40px;
      margin: 0;
      line-height: 1.6;
    }
    a{color:var(--vscode-textLink-foreground)}
    h1{font-size:1.6em;margin:0 0 4px}
    h2{font-size:1.1em;margin:0 0 16px;color:var(--vscode-descriptionForeground)}
    h3{font-size:.95em;font-weight:600;margin:0 0 10px;text-transform:uppercase;letter-spacing:.05em;color:var(--vscode-descriptionForeground)}
    h4.example-title{font-size:.9em;margin:0 0 4px;font-weight:600}
    .header{
      position:sticky;top:0;
      background:var(--vscode-editor-background);
      border-bottom:1px solid var(--vscode-panel-border);
      padding:16px 0 12px;
      margin-bottom:20px;
      z-index:10;
    }
    .breadcrumb{font-size:.8em;color:var(--vscode-descriptionForeground);margin-bottom:8px}
    .title-row{display:flex;align-items:center;gap:12px}
    .badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
    .badge{
      font-size:.72em;padding:2px 8px;border-radius:4px;font-weight:600;
    }
    .badge-lang{background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}
    .badge-deprecated{background:#b00;color:#fff}
    .badge-complexity{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}
    .header-actions{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
    .btn{
      display:inline-flex;align-items:center;gap:6px;
      padding:6px 14px;border-radius:4px;
      font-size:.85em;cursor:pointer;border:none;
      background:var(--vscode-button-background);
      color:var(--vscode-button-foreground);
    }
    .btn:hover{background:var(--vscode-button-hoverBackground)}
    .btn-secondary{
      background:var(--vscode-button-secondaryBackground);
      color:var(--vscode-button-secondaryForeground);
    }
    .btn-secondary:hover{background:var(--vscode-button-secondaryHoverBackground)}
    .btn-fav{background:transparent;border:1px solid var(--vscode-panel-border);color:var(--vscode-editor-foreground)}
    .btn-fav.active{color:#f5c542}
    .btn-small{
      font-size:.78em;padding:3px 8px;border-radius:3px;border:none;cursor:pointer;
      background:var(--vscode-button-secondaryBackground);
      color:var(--vscode-button-secondaryForeground);
    }
    .btn-small:hover{background:var(--vscode-button-background);color:var(--vscode-button-foreground)}
    .section{margin-bottom:24px}
    .syntax-block{
      font-family:var(--vscode-editor-font-family,monospace);
      font-size:.9em;
      background:var(--vscode-textCodeBlock-background);
      border:1px solid var(--vscode-panel-border);
      border-radius:6px;padding:12px 16px;
      white-space:pre-wrap;word-break:break-all;
    }
    .code-block-wrapper{position:relative}
    .code-block{
      font-family:var(--vscode-editor-font-family,monospace);
      font-size:.88em;
      background:var(--vscode-textCodeBlock-background);
      border:1px solid var(--vscode-panel-border);
      border-radius:6px;padding:12px 16px;
      margin:0;white-space:pre-wrap;word-break:break-all;overflow:auto;
    }
    .code-actions{display:flex;gap:6px;margin-top:6px}
    .example{margin-bottom:20px}
    .example-desc{margin:0 0 8px;font-size:.9em;color:var(--vscode-descriptionForeground)}
    code{
      font-family:var(--vscode-editor-font-family,monospace);
      font-size:.9em;
      background:var(--vscode-textCodeBlock-background);
      padding:1px 5px;border-radius:3px;
    }
    code.type{color:var(--vscode-symbolIcon-typeParameterForeground,#4ec9b0)}
    .params-table{width:100%;border-collapse:collapse;font-size:.88em}
    .params-table th{
      text-align:left;padding:6px 10px;
      background:var(--vscode-textCodeBlock-background);
      border-bottom:1px solid var(--vscode-panel-border);
      font-weight:600;
    }
    .params-table td{padding:6px 10px;border-bottom:1px solid var(--vscode-panel-border,#3333)}
    .related-grid{display:flex;flex-wrap:wrap;gap:8px}
    .related-chip{
      padding:5px 12px;border-radius:20px;border:1px solid var(--vscode-panel-border);
      background:transparent;color:var(--vscode-editor-foreground);
      cursor:pointer;font-size:.85em;display:flex;align-items:center;gap:6px;
    }
    .related-chip:hover{background:var(--vscode-list-hoverBackground)}
    .chip-lang{font-size:.75em;color:var(--vscode-descriptionForeground)}
    .mistakes li::marker{content:"⚠ ";color:#e07};
    .best-practices li::marker{content:"✓ ";color:#4caf50}
    ul{padding-left:20px}
    ul li{margin-bottom:4px;font-size:.9em}
    .returns-row{display:flex;align-items:center;gap:8px;font-size:.9em}
    .perf-note{
      background:var(--vscode-textCodeBlock-background);
      border-left:3px solid var(--vscode-focusBorder);
      padding:8px 12px;border-radius:0 4px 4px 0;font-size:.88em;
    }
    .support-note{font-size:.88em;color:var(--vscode-descriptionForeground)}
    .divider{border:none;border-top:1px solid var(--vscode-panel-border);margin:20px 0}
  </style>
</head>
<body>
  <div class="header">
    <div class="breadcrumb">${this.escapeHtml(entry.language)} › ${this.escapeHtml(entry.category)}</div>
    <div class="title-row">
      <h1>${this.escapeHtml(entry.name)}</h1>
    </div>
    <div class="badges">
      <span class="badge badge-lang">${this.escapeHtml(entry.language)}</span>
      ${entry.deprecated ? '<span class="badge badge-deprecated">Deprecated</span>' : ''}
      ${entry.complexity ? `<span class="badge badge-complexity">${this.escapeHtml(entry.complexity)}</span>` : ''}
      ${entry.version ? `<span class="badge badge-complexity">ES${this.escapeHtml(entry.version)}+</span>` : ''}
    </div>
    <div class="header-actions">
      <button class="btn" onclick="insertFirstExample()">↓ Insert Example</button>
      <button class="btn btn-secondary" onclick="copyFirstExample()">⎘ Copy Example</button>
      <button class="btn btn-secondary" onclick="openDocs()">↗ Open Docs</button>
      <button class="btn btn-fav ${isFavorite ? 'active' : ''}" id="favBtn" onclick="toggleFavorite()">
        ${isFavorite ? '★ Favorited' : '☆ Add to Favorites'}
      </button>
    </div>
  </div>

  <div class="section">
    <h3>Description</h3>
    <p>${this.escapeHtml(entry.description)}</p>
  </div>

  <div class="section">
    <h3>Syntax</h3>
    <div class="syntax-block">${this.escapeHtml(entry.syntax)}</div>
  </div>

  ${paramsHtml}

  <div class="section">
    <h3>Returns</h3>
    <div class="returns-row"><code class="type">${this.escapeHtml(entry.returns)}</code></div>
  </div>

  ${entry.browserSupport ? `<div class="section"><h3>Browser / Runtime Support</h3><p class="support-note">${this.escapeHtml(entry.browserSupport)}</p></div>` : ''}

  ${useCasesHtml}

  ${entry.examples.length > 0 ? `<div class="section"><h3>Examples</h3>${examplesHtml}</div>` : ''}

  ${entry.performanceNotes ? `<div class="section"><h3>Performance</h3><div class="perf-note">${this.escapeHtml(entry.performanceNotes)}</div></div>` : ''}

  ${mistakesHtml}
  ${bestPracticesHtml}
  ${relatedHtml}

  <hr class="divider">
  <p><a href="#" onclick="openDocs();return false">View on official documentation ↗</a></p>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const examples = ${examplesJson};
    const docsUrl = ${JSON.stringify(entry.docs)};
    let isFavorite = ${isFavorite};

    function insertCode(i) {
      vscode.postMessage({ command: 'insert', code: examples[i] });
    }
    function copyCode(i) {
      vscode.postMessage({ command: 'copy', code: examples[i] });
    }
    function insertFirstExample() {
      if (examples.length > 0) insertCode(0);
    }
    function copyFirstExample() {
      if (examples.length > 0) copyCode(0);
    }
    function openDocs() {
      vscode.postMessage({ command: 'openDocs', url: docsUrl });
    }
    function navigate(id) {
      vscode.postMessage({ command: 'navigate', id });
    }
    function toggleFavorite() {
      vscode.postMessage({ command: 'toggleFavorite' });
    }
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command === 'favoriteChanged') {
        isFavorite = msg.isFavorite;
        const btn = document.getElementById('favBtn');
        if (btn) {
          btn.textContent = isFavorite ? '★ Favorited' : '☆ Add to Favorites';
          btn.classList.toggle('active', isFavorite);
        }
      }
    });
  </script>
</body>
</html>`;
    }
}
exports.WebviewProvider = WebviewProvider;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=WebviewProvider.js.map
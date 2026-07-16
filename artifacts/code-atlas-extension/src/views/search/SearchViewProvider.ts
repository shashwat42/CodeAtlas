import * as vscode from 'vscode';
import type { SearchService } from '../../services/SearchService';

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class SearchViewProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly search: SearchService,
    private readonly openEntry: (id: string) => Promise<void>
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.buildHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.command === 'search') {
        const results = this.search.search(msg.query);
        webviewView.webview.postMessage({ command: 'results', results });
      } else if (msg.command === 'open') {
        await this.openEntry(msg.id);
      }
    });
  }

  private buildHtml(): string {
    const nonce = getNonce();
    const csp = `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style nonce="${nonce}">
    *,*::before,*::after{box-sizing:border-box}
    body{
      font-family:var(--vscode-font-family);
      font-size:var(--vscode-font-size);
      color:var(--vscode-editor-foreground);
      background:var(--vscode-sideBar-background);
      margin:0;padding:8px;
    }
    .search-wrap{position:relative;margin-bottom:8px}
    input{
      width:100%;padding:6px 28px 6px 10px;
      background:var(--vscode-input-background);
      color:var(--vscode-input-foreground);
      border:1px solid var(--vscode-input-border,transparent);
      border-radius:4px;font-size:.9em;outline:none;
    }
    input:focus{border-color:var(--vscode-focusBorder)}
    .clear-btn{
      position:absolute;right:6px;top:50%;transform:translateY(-50%);
      background:none;border:none;color:var(--vscode-descriptionForeground);
      cursor:pointer;font-size:1em;padding:0;display:none;
    }
    .hint{font-size:.8em;color:var(--vscode-descriptionForeground);margin-bottom:8px}
    .result{
      padding:8px 10px;cursor:pointer;border-radius:4px;margin-bottom:2px;
      border-left:2px solid transparent;
    }
    .result:hover{
      background:var(--vscode-list-hoverBackground);
      border-left-color:var(--vscode-focusBorder);
    }
    .result-name{font-size:.9em;font-weight:600}
    .result-meta{font-size:.75em;color:var(--vscode-descriptionForeground);margin-top:2px}
    .result-desc{font-size:.78em;color:var(--vscode-descriptionForeground);
      margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .empty{font-size:.85em;color:var(--vscode-descriptionForeground);padding:12px 0}
  </style>
</head>
<body>
  <div class="search-wrap">
    <input id="q" type="text" placeholder="Search APIs… (e.g. map, hash, file)" autofocus>
    <button class="clear-btn" id="clearBtn" onclick="clearSearch()">✕</button>
  </div>
  <div class="hint" id="hint">Browse the tree below, or search any API by name or keyword.</div>
  <div id="results"></div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const input = document.getElementById('q');
    const resultsEl = document.getElementById('results');
    const hint = document.getElementById('hint');
    const clearBtn = document.getElementById('clearBtn');
    let debounce;

    input.addEventListener('input', () => {
      clearTimeout(debounce);
      const q = input.value.trim();
      clearBtn.style.display = q ? 'block' : 'none';
      if (!q) { resultsEl.innerHTML = ''; hint.style.display = ''; return; }
      hint.style.display = 'none';
      debounce = setTimeout(() => {
        vscode.postMessage({ command: 'search', query: q });
      }, 150);
    });

    function clearSearch() {
      input.value = '';
      clearBtn.style.display = 'none';
      resultsEl.innerHTML = '';
      hint.style.display = '';
      input.focus();
    }

    function open(id) {
      vscode.postMessage({ command: 'open', id });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.command !== 'results') return;
      const results = msg.results;
      if (!results.length) {
        resultsEl.innerHTML = '<div class="empty">No results found.</div>';
        return;
      }
      resultsEl.innerHTML = results.slice(0, 40).map(r => {
        const e = r.entry;
        return \`<div class="result" onclick="open('\${e.id.replace(/'/g,"\\\\'")}')">
          <div class="result-name">\${e.name}</div>
          <div class="result-meta">\${e.language} › \${e.category}</div>
          <div class="result-desc">\${e.description.slice(0,80)}\${e.description.length>80?'…':''}</div>
        </div>\`;
      }).join('');
    });
  </script>
</body>
</html>`;
  }
}

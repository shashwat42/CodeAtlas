# Code Atlas 📚

> A Minecraft Recipe Book for programming languages — browse, discover, and insert code for JavaScript, TypeScript, and Node.js APIs.

Code Atlas turns your VS Code sidebar into an interactive encyclopedia of language features. Instead of Googling function names you half-remember, you browse categories, click an entry, and instantly see usage examples, parameters, related APIs, and a one-click insert button.

---

## Features

| Feature | Description |
|---|---|
| **Sidebar Tree** | Browse Language → Category → API hierarchically |
| **Search** | Fuzzy search across all APIs by name, keyword, or description |
| **Documentation Panel** | Rich webview with syntax, parameters, examples, and links |
| **Insert Example** | Insert example code at your cursor position |
| **Copy Example** | Copy code to clipboard |
| **Favorites** | Star APIs and access them from the ⭐ Favorites panel |
| **Recently Viewed** | 🕒 History of the last 20 APIs you opened |
| **Related APIs** | Wikipedia-style navigation between related entries |
| **Official Docs Link** | One click to the source documentation |
| **Offline-first** | All data is bundled — no internet required |

---

## Supported Languages

| Language | Categories |
|---|---|
| **JavaScript** | Array, String, Objects, Promise, Math, JSON, Map, Set, RegExp, Error, Date |
| **TypeScript** | Utility Types, Interfaces, Generics, Enums, Decorators, Modules |
| **Node.js** | fs, path, crypto, stream, buffer, process, http, events, child_process, timers |

---

## Installation

### From VSIX (local install)

```bash
# Build the extension
npm install
npm run compile
npx vsce package

# Install in VS Code
code --install-extension code-atlas-0.1.0.vsix
```

### From VS Code Marketplace

> Coming soon.

---

## Usage

1. Click the **📚 Code Atlas** icon in the Activity Bar on the left
2. **Browse** the tree: expand a language → category → click any API
3. **Search** using the search box at the top of the panel
4. **Insert** code into your editor with the "Insert Example" button
5. **Star** APIs you use often — they appear in the ⭐ Favorites panel
6. **Navigate** related APIs from the documentation panel

---

## Architecture

```
code-atlas-extension/
├── src/
│   ├── extension.ts              # Entry point — wires everything together
│   ├── models/
│   │   └── types.ts              # Core data model (ApiEntry, Parameter, etc.)
│   ├── storage/
│   │   └── StorageService.ts     # VS Code globalState wrapper
│   ├── services/
│   │   ├── DocumentationService.ts # Loads and indexes JSON data
│   │   ├── SearchService.ts        # Fuzzy search engine
│   │   ├── FavoritesService.ts     # Starred API persistence
│   │   └── HistoryService.ts       # Recently viewed history
│   ├── views/
│   │   ├── tree/
│   │   │   ├── CodeAtlasTreeItem.ts    # LanguageNode, CategoryNode, EntryNode
│   │   │   └── CodeAtlasTreeProvider.ts # Tree, Favorites, History providers
│   │   ├── webview/
│   │   │   └── WebviewProvider.ts      # Documentation panel HTML
│   │   └── search/
│   │       └── SearchViewProvider.ts   # Search sidebar webview
│   └── commands/
│       └── index.ts              # Command registrations
├── docs/
│   └── data/
│       ├── javascript.json       # JavaScript API dataset
│       ├── typescript.json       # TypeScript API dataset
│       └── nodejs.json           # Node.js API dataset
└── assets/
    └── icon.svg                  # Activity Bar icon
```

### Key Principles

- **Offline-first**: All data is JSON bundled with the extension. No network requests.
- **Extensible**: Add a new language by dropping a new JSON file in `docs/data/`. No code changes required.
- **Service-oriented**: UI, data, storage, and commands are fully separated.
- **Type-safe**: Strict TypeScript throughout.

---

## Data Model

Each API entry follows this schema:

```json
{
  "id": "array.map",
  "name": "map()",
  "category": "Array",
  "language": "JavaScript",
  "description": "...",
  "syntax": "array.map(callbackFn)",
  "parameters": [
    { "name": "callbackFn", "type": "Function", "description": "...", "optional": false }
  ],
  "returns": "Array",
  "examples": [
    { "title": "Double each number", "code": "const doubled = numbers.map(n => n * 2);" }
  ],
  "related": ["array.filter", "array.reduce"],
  "complexity": "O(n)",
  "docs": "https://developer.mozilla.org/...",
  "keywords": ["transform", "iterate", "functional"],
  "useCases": ["Transforming arrays", "Converting DTOs"],
  "commonMistakes": ["..."],
  "bestPractices": ["..."],
  "deprecated": false,
  "version": "5",
  "browserSupport": "All modern browsers"
}
```

---

## Adding a New Language

1. Create `docs/data/<language>.json` following the schema above
2. Set `"language"` to a consistent name (e.g., `"Python"`)
3. Run `npm run compile` — the extension picks up the new file automatically

No code changes needed. The `DocumentationService` discovers all JSON files in `docs/data/` at startup.

---

## Configuration

| Setting | Default | Description |
|---|---|---|
| `codeAtlas.historySize` | `20` | Number of recently viewed items to keep |
| `codeAtlas.openDocPanel` | `"beside"` | Where to open documentation: `"beside"` or `"active"` |

---

## Building & Packaging

```bash
# Install dependencies
npm install

# Type-check
npx tsc --noEmit

# Compile
npm run compile

# Package as VSIX
npx vsce package

# Lint
npm run lint

# Format
npm run format
```

---

## Roadmap

- [ ] Python standard library
- [ ] React / Next.js API reference
- [ ] Go stdlib
- [ ] Rust std
- [ ] Docker / Kubernetes commands
- [ ] Git commands
- [ ] Difficulty levels and API popularity indicators
- [ ] Breadcrumb navigation
- [ ] Copy Markdown documentation
- [ ] Keyboard navigation
- [ ] Tag-based filtering
- [ ] Deprecation badges and version compatibility

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/python-support`
3. Add your data file in `docs/data/`
4. Run `npm run compile && npm run lint`
5. Open a Pull Request

---

## License

MIT

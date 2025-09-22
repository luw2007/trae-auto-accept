# Repository Guidelines

## Project Structure & Module Organization
- `extension.js`: activation, commands, clipboard helpers; keep side effects within registered disposables.
- `trae-browser-script.js`: editable automation source. Regenerate `trae-browser-script-min.js` via Make targets.
- `minify-script.js`: minification pipeline; update when bundling changes.
- `docs/`: README screenshots—preserve names. Ignore `trae-auto-accept.vsix`; rebuild when needed.
- `Makefile`: single source for tasks; mirror new workflows here before documenting commands.

## Build, Test, and Development Commands
- `make install-deps`: installs npm dependencies and ensures `@vscode/vsce` exists.
- `make minify`: refreshes the compressed browser script for clipboard use.
- `make build`: runs checks, minifies, and packages `trae-auto-accept.vsix`.
- `make test`: confirms source/minified scripts exist and reports sizes for a quick smoke test.
- `make clean`: removes generated bundles and cache directories.
- `make release`: reuses the build and prints the suggested `gh release create` invocation.

## Coding Style & Naming Conventions
- Use 4-space indentation, `const`/`let`, explicit semicolons, and CommonJS modules.
- File names stay kebab-case; functions and variables stay camelCase.
- Keep user-facing text in Simplified Chinese with emoji prefixes to match existing UI output.

## Testing Guidelines
- Extend `make test` alongside new build steps—assert generated files, lint results, or checksums.
- Manually validate in VS Code: run `Trae 自动操作`, confirm clipboard content, and exercise the script in TraeCN.
- Add guard clauses (e.g., selector misses) when expanding the browser script and describe manual checks in PRs.

## Commit & Pull Request Guidelines
- Use prefixes from history (`feat:`, `fix:`, `temp:`, `Release:`) followed by concise summaries; add bilingual detail when useful.
- Reference issues, call out UI or automation changes, and attach fresh screenshots when visuals shift.
- Document build/test commands run and any TraeCN manual verification; flag remaining risks for reviewers.

## Release & Configuration Tips
- Bump `package.json` before packaging; `make build` reads it when naming the VSIX and echoing release metadata.
- Ship bundles without debug logging or secrets, and push environment tweaks to VS Code settings recommendations instead of hard-coding.

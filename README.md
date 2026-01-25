# Diff to Commit

Generate a Conventional Commit message from `git diff` and fill the Source Control message box.

## Commands
- `Diff to Commit: Fill Message (Staged)`
- `Diff to Commit: Fill Message (Working Tree)`
- `Diff to Commit: Set API Key`

## Settings
- `diffToCommit.ai.baseUrl` (default: `https://api.openai.com/v1`)
- `diffToCommit.ai.model` (default: `gpt-4o-mini`)
- `diffToCommit.behavior.allowOverwrite` (default: `false`)
- `diffToCommit.diff.maxChars` (default: `20000`)
- `diffToCommit.output.language` (default: `english`)

## Security
Diffs are redacted before any AI call. The extension masks common secrets such as bearer tokens, API keys, private key blocks, and AWS credentials. Always review generated messages before committing.

## Testing
```bash
npm run compile
npm run test:unit
npm run test:integration
```

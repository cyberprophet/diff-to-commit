# Diff to Commit

[![Publish Extension](https://github.com/cyberprophet/diff-to-commit/actions/workflows/publish.yml/badge.svg)](https://github.com/cyberprophet/diff-to-commit/actions/workflows/publish.yml)

Generate a Conventional Commit message from `git diff` and fill the Source Control message box.

## Commands
- `Diff to Commit: Fill Message (Staged)`
- `Diff to Commit: Fill Message (Working Tree)`
- `Diff to Commit: Set API Key`
- `Diff to Commit: Clear API Key`
- `Diff to Commit: Sign In (Account)` - Sign in with GitHub (requires Copilot subscription)
- `Diff to Commit: Sign Out (Account)`

## Settings
- `diffToCommit.backend` (default: `auto`)
- `diffToCommit.ai.baseUrl` (default: `https://api.openai.com/v1`)
- `diffToCommit.ai.model` (default: `gpt-5-nano`)
- `diffToCommit.behavior.allowOverwrite` (default: `false`)
- `diffToCommit.diff.maxChars` (default: `20000`)
- `diffToCommit.output.language` (default: `english`)

## Backend selection
`diffToCommit.backend` controls how commit messages are generated:
- `auto`: Use GitHub Copilot if signed in and subscription active; otherwise fall back to API key.
- `account`: Require GitHub sign-in with Copilot (no API key fallback).
- `apikey`: Use OpenAI-compatible API key only.

## Authentication

### GitHub Copilot (Account mode)
1. Run `Diff to Commit: Sign In (Account)`
2. Authorize with your GitHub account
3. Requires an active GitHub Copilot subscription

### API Key mode
1. Run `Diff to Commit: Set API Key`
2. Enter your OpenAI-compatible API key
3. Works with OpenAI, Azure OpenAI, or any compatible endpoint

## Security
Diffs are redacted before any AI call. The extension masks common secrets such as bearer tokens, API keys, private key blocks, and AWS credentials. Always review generated messages before committing.

## Changelog
- [CHANGELOG](CHANGELOG.md)

## Testing
```bash
npm run compile
npm run test:unit
npm run test:integration
```

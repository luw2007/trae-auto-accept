# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a specialized VS Code extension designed for TraeCN that provides automated clicking functionality for the "Accept All" button. The extension monitors TraeCN's interface and automatically clicks accept buttons at regular intervals.

## Architecture

### Extension Structure
- **Single-file extension** (`extension.js`) - Contains all TraeCN-specific logic
- **VS Code API based** - Uses official VS Code extension APIs
- **Command-based interface** - Provides 1 TraeCN-specific command
- **State management** - Tracks running state with 2-second interval timers
- **Output logging** - Dedicated output channel for operation tracking

### Key Components

#### Core Files
- `extension.js` - Main extension logic with clipboard integration
- `trae-browser-script.js` - Browser automation script with real DOM clicking
- `package.json` - Extension manifest with TraeCN branding and commands
- `build.sh` - Build script for packaging TraeCN extension
- `trae-auto-accept.vsix` - Pre-built TraeCN extension package

#### TraeCN Commands
- `trae-auto-accept.start` - Copies browser script to clipboard and opens dev tools

## Development Commands

### Build & Package
```bash
# Package TraeCN extension into .vsix file
./build.sh

# Manual packaging
npm install -g @vscode/vsce
vsce package --out trae-auto-accept.vsix
```

### Installation
```bash
# Install TraeCN extension from VSIX
code --install-extension trae-auto-accept.vsix

# Or via VS Code GUI
# Ctrl+Shift+P → Extensions: Install from VSIX...
```

### TraeCN Testing Commands
```bash
# Test TraeCN extension commands
# Open VS Code command palette:
# - 启动 Trae 自动接受
```

## Extension Lifecycle

### Activation
- Triggered on VS Code startup (`onStartupFinished`)
- Registers 1 TraeCN-specific command via `vscode.commands.registerCommand`
- Sets up cleanup handlers and output channel

### Runtime
- Uses `setInterval` for periodic TraeCN button checking (2-second intervals)
- Maintains `isRunning` state flag
- Provides visual feedback via `vscode.window.showInformationMessage`
- Logs all operations to dedicated output channel

### Deactivation
- Clears all intervals
- Resets running state
- Disposes output channel and commands

## TraeCN Button Detection

### Supported Selectors
The extension attempts to find TraeCN's "Accept All" button using:
- `button[data-testid="accept-all"]`
- `button[title="接受全部"]`
- `button[aria-label="接受全部"]`
- `.accept-all-button`
- `.trae-accept-all`

### Detection Strategy
- Uses VS Code's command system to simulate button interaction
- Provides fallback detection patterns for TraeCN variations
- Logs detection attempts and results

## VS Code Extension Patterns

### API Usage
- `vscode.commands.registerCommand` - Command registration
- `vscode.window.showInformationMessage` - User notifications
- `vscode.window.createOutputChannel` - Operation logging
- `context.subscriptions.push` - Resource cleanup

### Extension Manifest
- TraeCN-specific branding and naming
- No external dependencies
- Minimal activation events
- Chinese-language command titles

## File Structure

```
trae-auto-accept/
├── extension.js              # Main TraeCN extension code
├── trae-browser-script.js    # Browser automation script
├── package.json              # TraeCN extension manifest
├── build.sh                 # TraeCN build script
├── trae-auto-accept.vsix    # Built TraeCN extension package
├── README.md                # TraeCN user documentation
├── LICENSE                  # MIT license
├── RELEASE.md               # GitHub release instructions
├── CLAUDE.md                # Development guidance
├── .vscodeignore            # Package ignore rules
└── .gitignore               # Git ignore rules
```

## Development Notes

- **TraeCN-focused** - Designed specifically for TraeCN interface
- **No build step required** - Pure JavaScript extension
- **No dependencies** - Uses only VS Code built-in APIs
- **Cross-platform** - Works on Windows, macOS, Linux
- **VS Code 1.74.0+ required** - Uses modern extension APIs
- **Chinese UI** - Commands and messages in Chinese for TraeCN users
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a specialized VS Code extension designed for TraeCN that provides automated clicking functionality for the "Accept All" button. The extension monitors TraeCN's interface and automatically clicks accept buttons at regular intervals.

## Architecture

### Extension Architecture
- **Dual-component system**: VS Code extension + browser automation script
- **Clipboard integration**: Automatically copies browser script to clipboard
- **Auto-devtools**: Opens/closes browser developer tools automatically
- **State management**: Tracks running state with proper cleanup
- **Error handling**: Comprehensive error handling and user feedback

### Key Components

#### Core Files
- `extension.js` - Main extension logic with clipboard integration
- `trae-browser-script.js` - Browser automation script with real DOM clicking
- `package.json` - Extension manifest with TraeCN branding and commands
- `build.sh` - Build script for packaging TraeCN extension
- `trae-auto-accept.vsix` - Pre-built TraeCN extension package

#### TraeCN Commands
- `trae-auto-accept.start` - Copies browser script to clipboard and opens dev tools
- `trae-auto-accept.stop` - Stops the auto-accept functionality and cleans up resources

## Development Commands

### Build & Package
```bash
# Package TraeCN extension into .vsix file (recommended)
./build.sh

# Manual packaging with vsce
npm install -g @vscode/vsce
vsce package --out trae-auto-accept.vsix

# Install extension locally for testing
code --install-extension trae-auto-accept.vsix

# Alternative installation script
./install.sh
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
# - 关闭 Trae 自动接受

# Browser script testing:
# 1. Start extension to copy script to clipboard
# 2. Open browser dev tools console
# 3. Paste and execute script
# 4. Test control panel functionality
```

### Development Workflow
```bash
# Make changes to trae-browser-script.js
# Test in browser console directly
# Rebuild extension: ./build.sh
# Reinstall and test in VS Code
```

## Extension Lifecycle

### Activation
- Triggered on VS Code startup (`onStartupFinished`)
- Registers 2 TraeCN-specific commands via `vscode.commands.registerCommand`
- Sets up cleanup handlers and output channel

### Runtime
- Uses `setInterval` for periodic operation monitoring (2-second intervals)
- Maintains `isRunning` state flag to prevent multiple instances
- Provides visual feedback via `vscode.window.showInformationMessage`
- Logs all operations to dedicated output channel with timestamps
- Automatic clipboard integration and developer tools management

### Deactivation
- Clears all intervals
- Resets running state
- Disposes output channel and commands

## Browser Script Integration

### Script Flow
1. **VS Code Extension**: Copies browser script to clipboard and opens dev tools
2. **Browser Script**: IIFE-wrapped automation script with UI controls
3. **Auto-accept Logic**: Monitors for "全部接受" buttons with text validation
4. **User Interface**: Draggable control panel with theme switching

### Button Detection Strategy
The browser script uses multiple CSS selectors to find TraeCN buttons:
- Primary: `div.chat-todolist-bar button.icd-btn-primary`
- Validation: Checks button text equals "全部接受"
- Visibility: Ensures button is visible and clickable
- Real clicking: Uses native MouseEvent simulation

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
├── install.sh               # Installation script
├── trae-auto-accept.vsix    # Built TraeCN extension package
├── README.md                # TraeCN user documentation
├── LICENSE                  # MIT license
├── RELEASE.md               # GitHub release instructions
├── CLAUDE.md                # Development guidance
├── .vscodeignore            # Package ignore rules
├── .gitignore               # Git ignore rules
└── docs/                    # Documentation screenshots
```

## Important Implementation Details

### Browser Script Architecture
- **IIFE encapsulation**: Avoids global namespace pollution
- **Theme support**: Dark/light mode switching with CSS-in-JS
- **Draggable UI**: Control panel can be moved around the page with boundary limits
- **Auto-minimize**: Panel minimizes after 3 seconds of operation with user override detection
- **Log buffering**: Maintains last 50 log entries to prevent memory leaks
- **State management**: Proper cleanup on exit with event listener removal
- **Delete button support**: Optional delete functionality with safety confirmation
- **Red warning system**: Red text for delete-related UI elements and log messages

### Key Technical Patterns
- **CSS-in-JS styling**: Dynamic theme application using JavaScript string templates
- **Event delegation**: Centralized event handling for UI elements
- **State synchronization**: Consistent state across minimized/maximized views
- **Boundary detection**: Prevents panel from being dragged outside viewport
- **Animation system**: CSS keyframes for click count animations with theme-aware colors
- **Memory management**: Automatic cleanup of intervals, event listeners, and DOM elements

### Extension Packaging
- **build.sh**: Automated build script with dependency checking
- **.vsix format**: Standard VS Code extension package
- **No external dependencies**: Pure JavaScript using VS Code APIs
- **Cross-platform**: Works on Windows, macOS, Linux
- **VS Code 1.74.0+**: Uses modern extension APIs and activation events

### User Experience
- **Chinese localization**: All UI elements and messages in Chinese
- **Auto-devtools management**: Opens and closes browser console automatically
- **Clipboard integration**: Seamless script copying with user feedback
- **Error handling**: Comprehensive error reporting and recovery

## Development Guidelines

### Code Style Conventions
- **Inline variables**: Use simple inline variable definitions for better readability
- **Minimize comments**: Remove unnecessary comments while maintaining clarity
- **Function naming**: Use descriptive function names that indicate purpose
- **State management**: Keep state variables minimal and well-documented
- **Error handling**: Wrap operations in try-catch blocks with user-friendly messages

### Browser Script Development
- **Test in console**: Always test script changes directly in browser console first
- **Theme consistency**: Ensure all UI elements work in both light and dark themes
- **Memory safety**: Clean up event listeners and intervals to prevent memory leaks
- **Boundary handling**: Implement viewport boundaries for draggable elements
- **Animation timing**: Use CSS animations for smooth visual feedback
- **Safety first**: Dangerous operations like delete require explicit user confirmation
- **Visual warnings**: Use red text and clear warnings for dangerous operations

### Extension Development
- **API compatibility**: Target VS Code 1.74.0+ for modern extension features
- **Activation events**: Use minimal activation events for better performance
- **Resource cleanup**: Properly dispose of all resources in deactivation
- **User feedback**: Provide clear visual and textual feedback for all operations
- **Clipboard handling**: Handle clipboard operations with error recovery

### Common Issues and Solutions
- **Extension not activating**: Check activation events and VS Code version compatibility
- **Script not copying**: Verify file paths and clipboard permissions
- **UI not displaying**: Check CSS selector specificity and theme application
- **Animations not working**: Verify CSS keyframe definitions and timing
- **Memory leaks**: Ensure proper cleanup of intervals and event listeners
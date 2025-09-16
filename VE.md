# VeCode Context: Trae Auto Accept Extension

## Project Overview

**Trae Auto Accept** is a specialized VS Code extension designed specifically for TraeCN (a Chinese AI development platform). It provides automated clicking functionality for "Accept All" and "Continue" buttons, streamlining the development workflow by eliminating manual interaction with confirmation dialogs.

### Key Features
- **TraeCN Integration**: Deeply optimized for TraeCN's interface
- **Automated Clicking**: Smart monitoring and clicking of accept/continue buttons
- **Interactive UI**: Draggable control panel with dark/light theme support
- **Browser Automation**: Real DOM interaction with visual feedback
- **Safety First**: Local-only operation with no network requests

## Architecture

### Dual-Component System
1. **VS Code Extension** (`extension.js`)
   - Clipboard integration for browser script
   - Automatic developer tools management
   - State tracking and cleanup

2. **Browser Script** (`trae-browser-script.js`)
   - IIFE-wrapped automation logic
   - Draggable UI with theme switching
   - Real DOM clicking with validation

### File Structure
```
trae-auto-accept/
├── extension.js              # VS Code extension main logic
├── trae-browser-script.js    # Browser automation script
├── package.json              # Extension manifest
├── build.sh                 # Build script for packaging
├── install.sh               # Installation helper
├── trae-auto-accept.vsix    # Pre-built extension package
├── README.md                # Comprehensive user documentation
├── CLAUDE.md                # Development guidelines
├── LICENSE                  # MIT license
├── RELEASE.md               # Release instructions
├── .gitignore               # Git ignore rules
├── .vscodeignore            # VS Code packaging ignore rules
└── docs/                    # Documentation screenshots
```

## Building and Running

### Prerequisites
- Node.js 14+ 
- VS Code 1.74.0+
- @vscode/vsce (VS Code Extension CLI)

### Build Commands
```bash
# Install dependencies and build extension
./build.sh

# Manual packaging
npm install -g @vscode/vsce
vsce package --out trae-auto-accept.vsix

# Install for testing
code --install-extension trae-auto-accept.vsix
```

### Development Workflow
```bash
# Make changes to browser script
# Test directly in browser console
# Rebuild extension
./build.sh
# Reinstall and test in VS Code
```

## Usage

### Installation
1. Download `trae-auto-accept.vsix` from GitHub releases
2. Install via VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Restart VS Code

### Daily Usage
1. **Start Extension**: `Ctrl+Shift+P` → "启动 Trae 自动操作"
2. **Browser Setup**: Extension copies script to clipboard and opens dev tools
3. **Run Script**: Paste script in browser console and execute
4. **Control**: Use draggable panel to start/stop automation

### Extension Commands
- `trae-auto-accept.start` - Copies browser script and opens dev tools
- `trae-auto-accept.stop` - Stops automation and cleans up

## Development Conventions

### Code Style
- **Inline Variables**: Simple, readable variable definitions
- **Minimal Comments**: Self-documenting code with strategic comments
- **Function Naming**: Descriptive names indicating purpose
- **Error Handling**: Comprehensive try-catch with user feedback

### Browser Script Patterns
- **IIFE Encapsulation**: Avoids global namespace pollution
- **CSS-in-JS**: Dynamic styling for theme switching
- **Memory Safety**: Proper cleanup of intervals and event listeners
- **Boundary Detection**: Prevents UI elements from going off-screen

### Extension Development
- **API Compatibility**: Targets VS Code 1.74.0+ features
- **Resource Cleanup**: Proper disposal in deactivation
- **User Feedback**: Clear visual and textual feedback
- **Clipboard Handling**: Robust clipboard operations with error recovery

### Key Technical Details
- **Button Detection**: Uses CSS selectors with text validation
- **Real Clicking**: Native MouseEvent simulation
- **Theme Support**: Dark/light mode with CSS keyframe animations
- **State Management**: Consistent state across UI states
- **Log Buffering**: Maintains last 50 log entries

## Testing

### Browser Testing
1. Open TraeCN in browser
2. Run extension to copy script
3. Execute script in browser console
4. Test control panel functionality

### Extension Testing
1. Install built `.vsix` file
2. Test command registration
3. Verify clipboard integration
4. Check state management

## Security & Privacy
- **Local Only**: No network requests or data transmission
- **Open Source**: Full transparency with MIT license
- **Minimal Permissions**: Only DOM manipulation, no external access
- **No Tracking**: Zero user data collection

## Troubleshooting

### Common Issues
- **Extension Not Activating**: Check VS Code version compatibility
- **Script Not Copying**: Verify file paths and clipboard permissions
- **UI Not Displaying**: Check CSS selector specificity
- **Memory Leaks**: Ensure proper cleanup of intervals and listeners

### Debug Commands
```bash
# Check extension logs
# View → Output → Trae Auto Accept

# Test browser script directly
# Open browser console and run script manually
```

## Release Process
1. Update version in `package.json`
2. Update `README.md` with new features
3. Run `./build.sh` to create new `.vsix`
4. Create GitHub release with changelog
5. Upload `.vsix` to VS Code Marketplace
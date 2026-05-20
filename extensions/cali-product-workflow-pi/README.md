# cali-product-workflow-pi

Pi extension stub for [cali-product-workflow](https://github.com/cali/pi-product-workflow).

## Overview

This is a lightweight stub package that allows `cali-product-workflow` to be installed as a pi extension. The actual extension implementation lives in the main [`@renatocaliari/pi-product-workflow`](https://www.npmjs.com/package/@renatocaliari/pi-product-workflow) package.

## Installation

```bash
pi install npm:cali-product-workflow-pi
```

Or via the main package:

```bash
pi install npm:@renatocaliari/pi-product-workflow
```

## Dual-Install Pattern

This package follows the dual-install pattern (same as [context-mode](https://github.com/mksglu/context-mode)):

| Install Method | Target | Purpose |
|---------------|--------|---------|
| `npm install -g @renatocaliari/pi-product-workflow` | CLI + Skills | CLI tools and 16 product skills |
| `pi install npm:cali-product-workflow-pi` | Extension | Pi extension hooks and UI |

## Usage

Once installed, the extension automatically:

- Registers `/product-workflow-start` and `/pw:start` commands
- Tracks workflow phases in `.product-workflow/tracking.json`
- Shows workflow progress in the UI footer
- Notifies on phase transitions

## Requirements

- Node.js >= 20.0.0
- pi.dev

## See Also

- [Main Package](https://github.com/cali/pi-product-workflow) - Full documentation
- [DUAL-INSTALL-PATTERN.md](https://github.com/cali/pi-product-workflow/blob/main/docs/DUAL-INSTALL-PATTERN.md) - Pattern reference
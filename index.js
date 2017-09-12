#!/usr/bin/env node

const devToolsApply = require('./src/dev-tools-apply');

const moduleName = process.argv[2];

process.env['DEV_TOOL_APPLY_PATH'] = __dirname;

devToolsApply.run(moduleName);


#!/usr/bin/env node

const devToolsApply = require('./src/dev-tools-apply');

var moduleName = process.argv[2];

devToolsApply.run(moduleName);


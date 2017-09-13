#!/usr/bin/env node
"use strict";

const devToolsApply = require('./src/dev-tools-apply');

const moduleName = process.argv[2];

process.env.DEV_TOOL_APPLY_PATH = __dirname;
process.env.DEV_TOOL_APPLY_BIN = __dirname + "/node_modules/.bin/";
process.env.DEV_TOOL_APPLY_MODULES = __dirname + "/src/modules/";

devToolsApply.run(moduleName);

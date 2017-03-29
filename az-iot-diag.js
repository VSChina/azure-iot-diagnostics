"use strict";
let program = require('commander');
let packageJson = require('./package.json');

program
  .version(packageJson.version)
  .usage('<command> <command-options>')
  .command('set', 'configure diagnostics setting')
  .parse(process.argv);

'use strict';
var program = require('commander');
require('colors');

program
  .description('Create a temporary session on your IoT hub')
  .option('-l, --login <connectionString>', 'use the connection string provided as argument to use to authenticate with your IoT hub')
  .option('-e, --enable <enable>', 'whether to enable diagnostics')
  .option('-s, --sample_rate <sample_rate>', 'set diagnostics sample rate', parseInt)
  .parse(process.argv);

console.log(program.login);
console.log(program.enable);
console.log(program.sample_rate);
console.log(program.args);

if (!program.login) {
  console.log('You must provide a connection string using the --login argument.'.red);
  process.exit(1);
}

if (!program.enable && !program.sample_rate) {
  console.log('You must provide diagnostics settings using the --enable or --sample_rate argument.'.red);
  process.exit(1);
}

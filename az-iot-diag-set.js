'use strict';
let program = require('commander');
let IotHubJobClient = require('./job-client').IotHubJobClient;
let Utility = require('./utility');

function list(val) {
  return val.split(',');
}

program
  .description('Create a temporary session on your IoT hub')
  .option('-l, --login <connectionString>', 'use the connection string provided as argument to use to authenticate with your IoT hub')
  .option('-e, --enable <enable>', 'whether to enable diagnostics')
  .option('-s, --sample_rate <sample_rate>', 'set diagnostics sample rate', parseInt)
  .option('-d, --devices <devices>', 'A device list', list)
  .parse(process.argv);

if (!program.login) {
  Utility.printError('You must provide a connection string using the --login argument.');
}

if (!program.enable && !program.sample_rate) {
  Utility.printError('You must provide diagnostics settings using the --enable or --sample_rate argument.');
}

if (program.enable && ['true', 'false'].indexOf(program.enable.toLowerCase()) === -1) {
  Utility.printError('Only "true" or "false" are valid for --enable option');
}

if (program.sample_rate && !(program.sample_rate >= 0 && program.sample_rate <= 100)) {
  Utility.printError('Sample rate must be between 0 and 100');
}

let iotHubJobClient = new IotHubJobClient(program.login, program.devices, program.enable, program.sample_rate);
iotHubJobClient.start();
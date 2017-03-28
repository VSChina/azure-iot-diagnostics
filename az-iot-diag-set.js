'use strict';
var program = require('commander');
var IotHubJobClient = require('./job-client').IotHubJobClient;
require('colors');

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

console.log(program.login);
console.log(program.enable);
console.log(program.sample_rate);
console.log(program.devices);
console.log(program.args);

if (!program.login) {
  console.log('You must provide a connection string using the --login argument.'.red);
  process.exit(1);
}

if (!program.enable && !program.sample_rate) {
  console.log('You must provide diagnostics settings using the --enable or --sample_rate argument.'.red);
  process.exit(1);
}

var iotHubJobClient = new IotHubJobClient('HostName=iot-hub-hendry.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=FE98m4TB4e5J/RzCpgtMV8+WXiXuZeRnBN8WzlaZTJQ=', program.devices);
iotHubJobClient.start();
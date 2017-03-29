'use strict';
let uuid = require('uuid');
let JobClient = require('azure-iothub').JobClient;
let Registry = require('azure-iothub').Registry;
let Utility = require('./utility');

class IotHubJobClient {
    constructor(connectionString, devices, diag_enable, diag_sample_rate) {
        this.connectionString = connectionString;
        this.devices = devices;
        this.jobClient = JobClient.fromConnectionString(connectionString);
        this.jobId = uuid.v4();
        this.twinPatch = {
            etag: '*',
            properties: {
                desired: {}
            }
        };
        if (diag_enable) {
            this.twinPatch.properties.desired.diag_enable = diag_enable;
        }
        if (diag_sample_rate) {
            this.twinPatch.properties.desired.diag_sample_rate = diag_sample_rate;
        }
        this.startTime = new Date();
        this.maxExecutionTimeInSeconds = 3600;
    }


    start() {
        this.getQueryCondition(this.connectionString, this.devices)
            .then((queryCondition) => {
                console.log(`Start updating diagnostics settings for ${this.devices.length} device(s)...`);
                this.jobClient.scheduleTwinUpdate(this.jobId,
                    queryCondition,
                    this.twinPatch,
                    this.startTime,
                    this.maxExecutionTimeInSeconds,
                    this.jobCallback.bind(this));
            }).catch((err) => {
                Utility.printError("Error when querying devices info: " + err);
            });
    }

    jobCallback(err) {
        if (err) {
            console.log('Could not schedule device method job: ' + err);
        } else {
            this.monitorJob(this.jobId, (err, result) => {
                if (err) {
                    Utility.printError('Could not monitor device method job: ' + err.message);
                } else {
                    console.log(JSON.stringify(result, null, 2).cyan);
                }
            });
        }
    }

    monitorJob(jobId, callback) {
        let jobMonitorInterval = setInterval(() => {
            this.jobClient.getJob(jobId, (err, result) => {
                if (err) {
                    Utility.printError('Could not get job status: ' + err.message);
                } else {
                    console.log(`Job: ${jobId} - status: ${result.status}`);
                    if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
                        clearInterval(jobMonitorInterval);
                        callback(null, result);
                    }
                }
            });
        }, 1500);
    }

    getQueryCondition() {
        return new Promise(
            (resolve, reject) => {
                if (this.devices) {
                    resolve(`deviceId IN ['${this.devices.join("','")}']`);
                } else {
                    this.devices = [];
                    let registry = Registry.fromConnectionString(this.connectionString);
                    console.log('Start querying devices...');
                    registry.list((err, deviceList) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log(`${deviceList.length} device(s) found.`);
                            deviceList.forEach((device) => {
                                this.devices.push(device.deviceId);
                            });
                            resolve(`deviceId IN ['${this.devices.join("','")}']`);
                        }
                    });
                }
            }
        );
    }
}

module.exports = {
    IotHubJobClient: IotHubJobClient
};
'use strict';

var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;
var Registry = require('azure-iothub').Registry;

var IotHubJobClient = function (connectionString, devices, diag_enable, diag_sample_rate) {
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

    this.start = () => {
        this.queryCondition = this.getQueryCondition(connectionString, devices);
        this.jobClient.scheduleTwinUpdate(this.jobId,
            this.queryCondition,
            this.twinPatch,
            this.startTime,
            this.maxExecutionTimeInSeconds,
            this.jobCallback);
    };

    this.jobCallback = (err) => {
        if (err) {
            console.log('Could not schedule device method job: ' + err);
        } else {
            this.monitorJob(this.jobId, (err, result) => {
                if (err) {
                    console.error('Could not monitor device method job: ' + err.message);
                } else {
                    console.log(JSON.stringify(result, null, 2));
                }
            });
        }
    };

    this.monitorJob = (jobId, callback) => {
        var jobMonitorInterval = setInterval(() => {
            this.jobClient.getJob(jobId, (err, result) => {
                if (err) {
                    console.error('Could not get job status: ' + err.message);
                } else {
                    console.log('Job: ' + jobId + ' - status: ' + result.status);
                    if (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled') {
                        clearInterval(jobMonitorInterval);
                        callback(null, result);
                    }
                }
            });
        }, 1000);
    };

    this.getQueryCondition = (connectionString, devices) => {
        if (!devices) {
            devices = [];
            var registry = Registry.fromConnectionString(connectionString);
            registry.list((err, deviceList) => {
                deviceList.forEach((device) => {
                    devices.push(device.deviceId);
                });
                return `deviceId IN ['${devices.join("','")}']`;
            });
        }
        return `deviceId IN ['${devices.join("','")}']`;
    };
};

module.exports = {
    IotHubJobClient: IotHubJobClient
};
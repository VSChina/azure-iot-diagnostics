'use strict';

var uuid = require('uuid');
var JobClient = require('azure-iothub').JobClient;

var IotHubJobClient = function (connectionString, devices) {
    this.jobClient = JobClient.fromConnectionString(connectionString);
    this.devices = devices;
    this.jobId = uuid.v4();
    this.queryCondition = `deviceId IN ['${this.devices.join("','")}']`;
    this.twinPatch = {
        etag: '*',
        properties: {
            desired: {
                building: '99',
                floor: 3
            }
        }
    };
    this.startTime = new Date();
    this.maxExecutionTimeInSeconds = 3600;

    this.start = () => {
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
        }, 3000);
    };
};

module.exports = {
    IotHubJobClient: IotHubJobClient
};
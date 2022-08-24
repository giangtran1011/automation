import common from '../../support/utils/common.js';
import jobRequest from '../../support/requests/jobRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import jobData from '../../fixtures/job-data/jobData.json'


/* 200 OK
 * 401 Unauthorization
 * 400 Bad Request
 * Create job successfully with special jobCode
 * Create a job with empty jobCode
 * Create a job with null jobCode
 * Create a job with non-exist properties
 * Create a job with overmax length properties
 * Create a job with invalid utc/uuid format 
 */

/* 403 Permission Denied 
 * Create a job without consent permission 403
 * Create a job without api permission 403
 */

// const schemaRequest = {
//     "type": "object",
//     "properties": {
//         "clientId": { "type": "string" },
//         "jobCode": { "type": "string" },
//         "jobName": { "type": "string" },
//         "deadlineutc": { "type": "string" },
//         "properties": "object"
//     },
//     "require": ["clientId", "jobCode", "jobName"]
// };


describe('POST - Create job API', () => {
    let accessToken = '';
    let jobCodeRandom = common.random('jobCode');
    let jobNameRandom = common.random('jobName');
    let url = `${Settings.BASE_URL}/jobs`;
    let uri = `${Settings.INVALID_URL}/jobs12313212`;

    beforeEach(() => {
        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        })
    });

    jobData.forEach(({
        title,
        jobCode,
        jobName,
        deadlineutc,
        properties,
        code,
        message,
    }) => {
        it(title, () => {
            switch (code) {
                case 200:
                    {
                        let objectKeys = [`jobId`];
                        if (jobCode == '' && jobName == '') {
                            jobRequest.createJobAPI(url, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                common.assertSQL(Settings.CREATE_JOB_STUDIO_CLIENT, jobCodeRandom, apiRes.body.jobId, jobNameRandom, deadlineutc);
                            });
                        } else {
                            jobRequest.createJobAPI(url, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                common.assertSQL(Settings.CREATE_JOB_STUDIO_CLIENT, jobCode, apiRes.body.jobId, jobName, deadlineutc);
                            });
                        }
                    }
                    break;
                case 401:
                    {
                        jobRequest.createJobAPI(url, Settings.POST_METHOD, code, Settings.CREATE_JOB_STUDIO_CLIENT, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;
                case 400:
                    {
                        if (jobCode == '' && jobName == '') {
                            jobRequest.createJobAPI(uri, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, jobCodeRandom, jobName, deadlineutc, properties).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, '');
                            });
                        } else {
                            jobRequest.createJobAPI(url, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, '');
                            });
                        }

                    }
                    break;
                case 403:
                    {
                        if (jobCode == "") {
                            common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                                jobRequest.createJobAPI(url, Settings.POST_METHOD, response.body.access_token, Settings.CREATE_JOB_STUDIO_CLIENT, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
                                    common.assertResponse(apiRes, code, message, "");
                                });
                            })
                        } else {
                            jobRequest.createJobAPI(url, Settings.POST_METHOD, accessToken, "", jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, "");
                            });
                        }
                    }
                    break;
                case 415:
                    {
                        jobRequest.checkContentType(url, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;
                case 405:
                    {
                        jobRequest.createJobAPI(url, Settings.PATCH_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;
                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    });
})
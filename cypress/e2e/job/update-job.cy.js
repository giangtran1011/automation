import common from '../../support/utils/common.js';
import jobRequest from '../../support/requests/jobRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import updateJobData from '../../fixtures/job-data/updateJobData.json'

/* 200 OK - Update job successful
 * 200 OK - Update job with special characters of jobCode
 * 401 Unauthorization
 * 400 Bad Request
 * Update job with empty jobCode
 * Update job with null jobCode
 * Update job with non-exist properties
 * Update job with overmax length properties
 * Update job with invalid utc/uuid
 */

/* 403 Permission Denied 
 * Update job without consent permission 403
 * Update job without api permission 403
 */

describe('PUT - Update job API', () => {

    let accessToken = '';
    let jobCodeRandom = 'jobCode_' + parseInt(Math.random().toString(9).substring(2, 9));
    let jobNameRandom = 'jobName_' + parseInt(Math.random().toString(9).substring(2, 9));
    let jobId = '';
    let url = '';

    before(() => {

        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {

            accessToken = response.body.access_token;

            //List job to get a random jobId
            let testClient = updateJobData[0].clientStudio;
            let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=3`;
            let index = Math.floor(Math.random() * 3);


            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((response2) => {
                jobId = response2.body.pageData[index].jobId;
                url = `${Settings.BASE_URL}/jobs/${jobId}`
            });
        });
    });

    updateJobData.forEach(({
        clientStudio,
        jobCode,
        jobName,
        deadlineutc,
        properties,
        code,
        message,
        title
    }) => {
        it(title, () => {
            switch (code) {
                case 200:
                    {
                        jobRequest.updateJobAPI(url, Settings.PUT_METHOD, accessToken, clientStudio, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
                            common.assertResAPI(apiRes, ['success']);
                            common.assertSQL(clientStudio, jobCodeRandom, jobId, jobNameRandom, deadlineutc);
                        })
                    }
                    break;

                case 400:
                    {
                        jobRequest.updateJobAPI(url, Settings.PUT_METHOD, accessToken, clientStudio, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;

                case 401:
                    {
                        jobRequest.updateJobAPI(url, Settings.PUT_METHOD, code, clientStudio, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;

                case 403:
                    {
                        if (message == "") {
                            common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                                jobRequest.updateJobAPI(url, Settings.PUT_METHOD, response.body.access_token, clientStudio, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                                    common.assertResponse(apiRes, code, message, "");
                                });
                            })

                        } else {
                            jobRequest.updateJobAPI(url, Settings.PUT_METHOD, accessToken, clientStudio, jobCode, jobName, deadlineutc, properties).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, "");
                            });
                        }
                    }
                    break;
                case 405:
                    {
                        jobRequest.updateJobAPI(url, Settings.GET_METHOD, accessToken, code, clientStudio, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;
                case 415:
                    {
                        jobRequest.checkContentUpdateJob(url, Settings.PUT_METHOD, accessToken, code, clientStudio, jobCodeRandom, jobNameRandom, deadlineutc, properties).then((apiRes) => {
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
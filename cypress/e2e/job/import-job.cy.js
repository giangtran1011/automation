import common from '../../support/utils/common.js';
import jobRequest from '../../support/requests/jobRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import dataImport from '../../fixtures/job-data/importJobData.json';
import updateJobData from '../../fixtures/job-data/updateJobData.json'

/* 200 OK - Import job successful
 * 200 OK - Import job with only productCode

 * 400 Bad Request - Import job without productCode
 * 400 Bad Request - Import job with null productCode
 * 400 Bad Request - Import job with non-exist properties 
 * 400 Bad Request - Import job with invalid  properties value 
 * 400 Bad Request - Import job with over maxlength product properties
 * 400 Bad Request - Import job with over maxlength sample properties 

 * 401 Unauthorized - Import job with invalid access token

 * 403 Forbidden - Import job without API permission
 * 403 Forbidden - Get job with no consent permission with client
 */


describe('POST - Import job', () => {
    let url, jobId, testClient, accessToken;
    let statusUrl = `${Settings.BASE_URL}/jobs/get-import-async-status?`
    for (let i = 0; i < 2; i++) {
        dataImport[i].data.products[0].productCode = 'productCode_TestImport_' + parseInt(Math.random().toString(9).substring(2, 9));
    }

    before(() => {

        cy.title("Check authentication");
        testClient = updateJobData[0].clientStudio;
        let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=20`;
        let index = Math.floor(Math.random() * 20);


        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            //List job to get a random jobId
            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((response2) => {
                jobId = response2.body.pageData[index].jobId;
                url = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`
            });
        });
    });


    dataImport.forEach(({
        title,
        data,
        code,
        message,
    }) => {
        it(title, () => {
            switch (code) {
                case 200:
                    {
                        //import job
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            jobRequest.assertSQLGetProduct(data.products[0].productCode, testClient, data.products[0].productName, jobId)

                            //get import job status
                            let getImportId = apiRes.body.importId;
                            let getJobId = apiRes.body.jobId;
                            let urlImportStatus = `${statusUrl}importId=${getImportId}&jobId=${getJobId}`;

                            jobRequest.getImportJobStatusAPI(urlImportStatus, Settings.GET_METHOD, accessToken, getImportId, getJobId).then((getStatus) => {
                                common.assertResAPI(getStatus, ['jobId', 'importId', 'finished', 'success', 'errors'])
                                jobRequest.assertImportStatus(getStatus, getJobId, getImportId);

                            });
                        });
                    }
                    break;
                case 401:
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, data).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, "");
                        });
                    }
                    break;
                case 400:
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;
                case 403:
                    {
                        if (message == "") {
                            common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                                jobRequest.importJobAPI(url, Settings.POST_METHOD, response.body.access_token, data).then((apiRes) => {
                                    common.assertResponse(apiRes, code, message, "");
                                });
                            })
                        } else {
                            common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.VIEW_CLIENT_ID, Settings.VIEW_CLIENT_SECRET).then((response) => {
                                jobRequest.importJobAPI(url, Settings.POST_METHOD, response.body.access_token, data).then((apiRes) => {
                                    common.assertResponse(apiRes, code, message, "");
                                });
                            })
                        }
                    }
                    break;
                case 405:
                    {
                        jobRequest.importJobAPI(url, Settings.PUT_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;
                case 415:
                    {
                        jobRequest.checkContentImportJob(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
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

});
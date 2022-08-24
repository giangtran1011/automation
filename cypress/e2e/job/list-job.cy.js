import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import jobRequest from '../../support/requests/jobRequest.js';
import listJobData from '../../fixtures/job-data/listJobData.json'

/* 200 OK - Get job with many results
 * 200 OK - Get job with no result
 * 200 OK - Get job with all params
 * 200 OK - Get job with deleted job
 * 401 Unauthorization
 * 400 Bad Request - Get job with invalid clientId
 */
/* 403 Permission Denied 
 * Get job without consent permission 403
 * Get job without api permission 403
 */

//Prepare data: 
// - Tạo một client (Test Client for get Job (don't change)) chỉ có 2 jobId với jobCode là: "have data" và "no data"
// - Tạo một jobId với jobCode là "deleted jobCode" rồi xóa
describe('GET - List job API', () => {

    let accessToken = '';

    before(() => {
        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        })
    });

    listJobData.forEach(({
        title,
        clientIdTest,
        jobCode,
        code,
        message,
    }) => {
        it(title, () => {
            let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${Settings.GET_JOB_STUDIO_CLIENT}`;

            switch (code) {
                case 200:
                    {
                        let objectKeys = ['pageInfo', 'pageData'];
                        if (title == "200 OK - Get job with many results") {

                            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                jobRequest.assertSQLGetJob(Settings.GET_JOB_STUDIO_CLIENT, "", 1, apiRes.body);

                            })

                        } else if (title == "200 OK - Get job with no result") {
                            urlListJob = `${Settings.BASE_URL}/jobs?clientId=${Settings.NO_DATA_STUDIO_CLIENT}`;

                            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                expect(apiRes.body.pageData).to.empty;

                            })

                        } else if (title == "200 OK - Get job with all params") {
                            let url = `${urlListJob}&jobCode=${jobCode}&pageNumber=1&pageSize=5`;

                            jobRequest.listJobsAPI(url, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                jobRequest.assertSQLGetJob(Settings.GET_JOB_STUDIO_CLIENT, `and JobCode = '${jobCode}'`, 0, apiRes.body)

                            })

                        } else if (title == "200 OK - Get job with deleted job") {
                            let urlListJob = `${Settings.BASE_URL}/jobs?jobCode=${jobCode}`;

                            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                expect(apiRes.body.pageData).to.empty;

                            })
                        }
                    }
                    break;
                case 401:
                    {
                        jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, "");
                        });
                    }
                    break;
                case 400:
                    {
                        urlListJob = `${Settings.BASE_URL}/jobs?clientId=${clientIdTest}`;

                        jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, "");
                        });
                    }
                    break;
                case 403:
                    {
                        if (message == "") {

                            common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                                jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, response.body.access_token).then((apiRes) => {
                                    common.assertResponse(apiRes, code, message, "");
                                });
                            })
                        } else {
                            urlListJob = `${Settings.BASE_URL}/jobs?clientId=${clientIdTest}`;

                            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, "");
                            });
                        }
                    }
                    break;
                case 405:
                    {
                        jobRequest.listJobsAPI(urlListJob, Settings.PUT_METHOD).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, "");
                        });
                    }
                    break;
                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    })
});
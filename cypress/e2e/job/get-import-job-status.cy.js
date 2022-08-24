import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productRequest.js';
import jobRequest from '../../support/requests/jobRequest.js';
import dataImport from '../../fixtures/product-data/productDataTest.json';
import getImportJobStatusData from '../../fixtures/product-data/getImportJobStatus.json'

describe('GET - Get Product Status', () => {

    let urlImport, jobId, importId, testClient, accessToken, productCodeTest, urlGetImportStatus;

    before(() => {
        cy.title("Check authentication");
        testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
        dataImport.products[0].productCode = "productCodeTest6570_" + parseInt(Math.random().toString(9).substring(2, 9));
        productCodeTest = dataImport.products[0].productCode;

        let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=20`;
        let index = Math.floor(Math.random() * 20);


        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((responseJob) => {
                jobId = responseJob.body.pageData[index].jobId;
                urlImport = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`;

                cy.title("Import a new product");
                jobRequest.importJobAPI(urlImport, Settings.POST_METHOD, accessToken, dataImport).then((apiImportRes) => {
                    cy.wait(5000)
                    common.assertResAPI(apiImportRes, ['jobId', 'importId']);
                    importId = apiImportRes.body.importId;
                    urlGetImportStatus = `${Settings.BASE_URL}/jobs/get-import-async-status?importId=${importId}&jobId=${jobId}`;
                })
            });
        })
    });

    getImportJobStatusData.forEach(({
        title,
        importIdInput,
        jobIdInput,
        message,
        code
    }) => {

        it(title, () => {
            switch (code) {
                case 200:
                    productRequest.getImportJobStatusAPI(urlGetImportStatus, accessToken, Settings.GET_METHOD).then((apiRepsonse) => {
                        verifyResponse(apiRepsonse, jobId, importId)
                    })
                    break;

                case 400:
                    urlGetImportStatus = `${Settings.BASE_URL}/jobs/get-import-async-status?importId=${importIdInput}&jobId=${jobIdInput}`;
                    productRequest.getImportJobStatusAPI(urlGetImportStatus, accessToken, Settings.GET_METHOD).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(code);
                        expect(apiRepsonse.body.errors[0].message).to.eq(message);
                    })
                    break;

                case 403: //bug return 400
                    urlGetImportStatus = `${Settings.BASE_URL}/jobs/get-import-async-status?importId=${importIdInput}&jobId=${jobIdInput}`;
                    productRequest.getImportJobStatusAPI(urlGetImportStatus, accessToken, Settings.GET_METHOD).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(code);
                        expect(apiRepsonse.body.errors[0].message).to.eq(message);
                    })
                    break;

                default:
                    cy.title("Exception");
                    break;
            }
        })
    })
});

function verifyResponse(response, jobId, importId) {
    expect(response.status).to.eq(200);
    expect(response.body.jobId).to.eq(jobId);
    expect(response.body.importId).to.eq(importId);
    expect(response.body.finished).to.eq(true);
    expect(response.body.success).to.eq(true);
    return true;
};
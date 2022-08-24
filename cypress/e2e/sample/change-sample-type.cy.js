import common from '../../support/utils/common.js';
import sampleRequest from '../../support/requests/sampleRequest';
import jobRequest from '../../support/requests/jobRequest.js';
import productRequest from '../../support/requests/productRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import changeSampleTypeData from '../../fixtures/sample-data/changeSampleType.json';
import dataImport from '../../fixtures/sample-data/createProductAndSample.json';


describe('PUT - Update job API', () => {

    let urlImport, urlChangeType, jobId, accessToken, sampleId;

    before(() => {

        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            //List job to get a random jobId
            let testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
            let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=3`;
            let index = Math.floor(Math.random() * 3);
            urlChangeType = `${Settings.BASE_URL}/samples/change-type`;

            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((response2) => {
                jobId = response2.body.pageData[index].jobId;
                urlImport = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`;

                //Import a new product
                dataImport.products[0].productCode = "productCodeTestCSl_" + parseInt(Math.random().toString(9).substring(2, 9));
                dataImport.products[0].samples[0].sampleCode = "sampleCodeTestCSl_" + parseInt(Math.random().toString(9).substring(2, 9));
                jobRequest.importJobAPI(urlImport, Settings.POST_METHOD, accessToken, dataImport).then((apiRes) => {
                    cy.wait(7000);
                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                    productRequest.assertSQLCreateProduct(dataImport.products[0].productCode, jobId, dataImport);

                    // Compare sample properties and get sampleId
                    let key = Object.keys(dataImport.products[0].samples[0].properties)[0];
                    sampleRequest.compareSQLSampleProperties(dataImport.products[0].samples[0].sampleCode, jobId, dataImport.products[0].samples[0], key)
                    sampleRequest.returnSQLProductSampleId(dataImport.products[0].samples[0].sampleCode).then((returnSampleId) => {
                        sampleId = returnSampleId;
                    })
                });
            });
        });
    });

    changeSampleTypeData.forEach(({
        title,
        type,
        data,
        message,
        code,
    }) => {
        it(title, () => {
            switch (type) {

                case 'Successful':
                    {
                        data.sampleId = sampleId;
                        sampleRequest.changeSampleTypeAPI(urlChangeType, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            expect(apiRes.status).to.eq(code);
                            expect(apiRes.body.success).to.equal(true);
                            cy.wait(2000);

                            sampleRequest.compareSampleType(dataImport.products[0].samples[0].sampleCode, jobId, data)
                        })
                    }
                    break;

                case 'Unsuccessful':
                    if (data.sampleId == "") data.sampleId = sampleId;
                    sampleRequest.changeSampleTypeAPI(urlChangeType, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                        expect(apiRes.status).to.eq(code);
                        expect(apiRes.body.success).to.equal(false);
                        expect(apiRes.body.message).to.equal(message);
                    })
                    break;

                case '400':
                    data.sampleId = sampleId;
                    sampleRequest.changeSampleTypeAPI(urlChangeType, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                        expect(apiRes.status).to.eq(code);
                        expect(apiRes.body.errors.targetType[0]).to.eq(message);
                    })
                    break;

                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    });
})
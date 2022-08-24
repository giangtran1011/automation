import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productRequest.js';
import jobRequest from '../../support/requests/jobRequest.js';
import dataImport from '../../fixtures/product-data/productDataTest.json';
import updateProductStateData from '../../fixtures/product-data/updateProductStateData.json'

//Bug https://creativeforce-io.atlassian.net/browse/LH-13719

describe('GET - Get Product Status', () => {

    let urlImport, jobId, productId, testClient, accessToken, productCodeTest, urlUpdateState;

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
                    cy.wait(7000);
                    common.assertResAPI(apiImportRes, ['jobId', 'importId']);
                    returnStateAndProductId(productCodeTest, jobId).then((sqlQuery) => {
                        productId = sqlQuery[0]
                        urlUpdateState = `${Settings.BASE_URL}/products/${productId}/update-state`
                    })
                })
            });
        })
    });

    updateProductStateData.forEach(({
        title,
        productIdInput,
        data,
        message,
    }) => {

        it(title, () => {
            switch (message) {
                case true:
                    productRequest.updateProductStateAPI(urlUpdateState, accessToken, data, Settings.PUT_METHOD).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(200);
                        returnStateAndProductId(productCodeTest, jobId).then((sqlQuery) => {
                            expect(sqlQuery[1]).to.eq(data.productStateId);
                        })
                    })
                    break;

                case 'ProductStateId invalid':
                    productRequest.updateProductStateAPI(urlUpdateState, accessToken, data, Settings.PUT_METHOD).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(400);
                        expect(apiRepsonse.body.errors.productStateId[0]).to.eq(message);
                    })
                    break;

                case false:
                    if (productIdInput != "") {
                        urlUpdateState = `${Settings.BASE_URL}/products/${productIdInput}/update-state`
                    } else urlUpdateState = `${Settings.BASE_URL}/products/${productId}/update-state`
                    productRequest.updateProductStateAPI(urlUpdateState, accessToken, data, Settings.PUT_METHOD).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(200);
                        expect(apiRepsonse.body.success).to.eq(message);
                        returnStateAndProductId(productCodeTest, jobId).then((sqlQuery) => {
                            expect(sqlQuery[1]).to.eq(data.productStateId);
                        })
                    })
                    break;

                default:
                    cy.title("Exception");
                    break;
            }
        })
    })
});

function returnStateAndProductId(productCode, jobId) {
    return cy.sqlServer(
        `SELECT ProductId, ProductStateId FROM Product WHERE ProductCode = '${productCode}' and jobId = '${jobId}'`
    )
};
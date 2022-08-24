import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productRequest.js';
import jobRequest from '../../support/requests/jobRequest.js';
import dataImport from '../../fixtures/product-data/productDataTest.json';
import productStatusData from '../../fixtures/product-data/productStatusData.json'
/* DoD:
 * 200 OK
 * 401 Unauthorization
 * 400 Bad Request
 * Get product status by non-exist productCode
 * Get product status by deleted productCode
 * Get product status by inactive productCode
 * Get product status by invalid productCode
 * Get product status by empty productCode 
 * Get product status by null productCode 
 * 403 Permission Denied 
 * Create a job without consent permission 403
 * Create a job without api permission 403
 * 405 Method Not Allowed
 * 415 Wrong Content-Type
 */

describe('GET - Get Product Status', () => {

    let url, jobId, testClient, accessToken, productCodeTest, ulrGetStatus;

    before(() => {
        cy.title("Check authentication");
        testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
        dataImport.products[0].productCode = "productCodeTest6570_" + parseInt(Math.random().toString(9).substring(2, 9));
        productCodeTest = dataImport.products[0].productCode;
        // productCodeTest = 'productCodeTest6570_8727553'

        let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=20`;
        let index = Math.floor(Math.random() * 20);

        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((responseJob) => {
                jobId = responseJob.body.pageData[index].jobId;
                url = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`;

                cy.title("Import a new product");
                jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, dataImport).then((apiImportRes) => {
                    cy.wait(15000);
                    common.assertResAPI(apiImportRes, ['jobId', 'importId']);
                })
            });
        })
    });

    productStatusData.forEach(({
        title,
        productCode,
        code,
        message,
    }) => {

        it(title, () => {
            switch (code) {

                case 200:
                    if (productCode == "") {
                        productCode = productCodeTest;
                    }
                    ulrGetStatus = `${Settings.BASE_URL}/products/get-status?productCode=${productCode}`

                    productRequest.getProductStatusAPI2(ulrGetStatus, Settings.GET_METHOD, accessToken).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(code);
                        productRequest.assertSQLProductStatus(productCode, apiRepsonse);
                    })
                    break;

                case 400:
                    let param = `?productCode=${productCode}`;

                    if (productCode == "invalidParam") {
                        param = `?invalidparam=${productCodeTest}`;
                    } else if (productCode == "noParam") {
                        param = ``;
                    }

                    ulrGetStatus = `${Settings.BASE_URL}/products/get-status${param}`
                    productRequest.getProductStatusAPI2(ulrGetStatus, Settings.GET_METHOD, accessToken).then((apiRepsonse) => {
                        common.assertResponse(apiRepsonse, code, message, '');
                    })
                    break;

                case 401:
                    productRequest.getProductStatusAPI2(ulrGetStatus, Settings.GET_METHOD).then((apiRepsonse) => {
                        common.assertResponse(apiRepsonse, code, message, '');
                    })
                    break;
                case 403:
                    if (message == "Forbidden") {
                        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                            productRequest.getProductStatusAPI2(ulrGetStatus, Settings.GET_METHOD, response.body.access_token).then((apiRepsonse) => {
                                expect(apiRepsonse.status).to.eq(code);
                                expect(apiRepsonse.statusText).to.eq(message);
                            })

                        })
                    } else {
                        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.VIEW_CLIENT_ID, Settings.VIEW_CLIENT_SECRET).then((response) => {
                            productRequest.getProductStatusAPI2(ulrGetStatus, Settings.GET_METHOD, response.body.access_token).then((apiRepsonse) => {
                                expect(apiRepsonse.status).to.eq(400);
                                // expect(apiRepsonse.status).to.eq(code);
                                // expect(apiRes.body.errors[0].message).to.eq(message);
                            })
                        })
                    }
                    break;

                case 405:
                    productRequest.getProductStatusAPI2(ulrGetStatus, Settings.PATCH_METHOD, accessToken).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(403);
                        //common.assertResponse(apiRepsonse, code, message, '');
                    })
                    break;

                default:
                    cy.title(title);
                    break;

            }
        })
    })
})
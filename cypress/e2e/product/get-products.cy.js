import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productRequest.js';
import jobRequest from '../../support/requests/jobRequest.js';
import dataImport from '../../fixtures/product-data/productDataTest.json';
import jobData from '../../fixtures/job-data/jobData.json'
import productData from '../../fixtures/product-data/getProductData.json'

/* 200 OK - Get product with only jobId
 * 200 OK - Get product with only productCode
 * 200 OK - Get product with all params
 * 200 OK - Get product with non-exist jobId
 * 200 OK - Get product with invalid productCode
 * 
 * 401 Unauthorization
 
 * 400 Bad Request - Get product with invalid jobId
 * 400 Bad Request - Get product with invalid paramaters

 * 403 Forbidden - Get job with no permission with API
 * 403 Forbidden - Get job with no consent permission with client
 */

describe("GET - List products API", () => {
    let jobIdTest, accessToken, productId;
    dataImport.products[0].productCode = common.random('productCode');
    let productCodeTest = dataImport.products[0].productCode;
    let urlJob = `${Settings.BASE_URL}/jobs`;
    jobData[0].jobCode = common.random('jobCode');
    let createJobData = jobData[0];

    before(() => {

        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            cy.title("Init data: Create a job + Import a job");
            jobRequest.createJobAPI(urlJob, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, createJobData.jobCode, "productName", createJobData.deadlineutc, createJobData.properties).then((apiRes) => {
                jobIdTest = apiRes.body.jobId;
                let urlListJob = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobIdTest}`;

                jobRequest.importJobAPI(urlListJob, Settings.POST_METHOD, accessToken, dataImport).then((apiRes2) => {
                    cy.wait(15000);
                    common.assertResAPI(apiRes2, ['jobId', 'importId']);
                })
            });
        })

    });

    productData.forEach(({
        title,
        indexUrl,
        jobId,
        productCode,
        code,
        message,
    }) => {
        it(title, () => {
            let objectKeys = ['pageInfo', 'pageData'];
            let endpoint = productRequest.setUrl(indexUrl, jobIdTest, jobId, productCodeTest, productCode);
            let urlListProduct = `${Settings.BASE_URL}/products?${endpoint}`;

            switch (code) {

                case 200:
                    {
                        if (message == 'empty') {
                            jobRequest.listJobsAPI(urlListProduct, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, objectKeys);
                                expect(apiRes.body.pageData).to.empty;
                            })
                        } else {
                            productRequest.getProductAPI(urlListProduct, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                productId = apiRes.body.pageData[0].productId;
                                common.assertResponse(apiRes, code, message, objectKeys);
                                productRequest.assertSQLGetProduct(productId, apiRes.body.pageData[0]);
                            })
                        }
                    }
                    break;

                case 401:
                    {
                        productRequest.getProductAPI(urlListProduct, Settings.GET_METHOD).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');

                        })
                    }
                    break;

                case 400:
                    {
                        productRequest.setUrl(indexUrl);
                        productRequest.getProductAPI(urlListProduct, Settings.GET_METHOD, accessToken).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');

                        })
                        break;
                    }
                case 403:
                    {
                        if (message == "") {
                            common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                                jobRequest.listJobsAPI(urlListProduct, Settings.GET_METHOD, response.body.access_token).then((apiRes) => {
                                    common.assertResponse(apiRes, code, message, '');
                                })
                            })
                        } else {
                            jobRequest.listJobsAPI(urlListProduct, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResponse(apiRes, code, message, '');
                            })
                        }
                    }
                    break;

                case 405:
                    {
                        productRequest.getProductAPI(urlListProduct, Settings.PUT_METHOD, accessToken).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        })
                    }
                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    })
});
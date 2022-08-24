import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productRequest.js';
import jobRequest from '../../support/requests/jobRequest.js';
import dataImport from '../../fixtures/product-data/productDataTest.json';
import addSampleData from '../../fixtures/product-data/addSampleToProductData.json'

describe('GET - Get Product Status', () => {

    let urlImport, jobId, testClient, accessToken, ulrAddsample, productId;

    before(() => {
        cy.title("Check authentication");
        testClient = Settings.CREATE_JOB_STUDIO_CLIENT;

        for (let i = 0; i < addSampleData.length; i++) {
            if (i !== 1 && i != 2) {
                addSampleData[i].data[0].sampleCode = 'add_sampleCode1_' + parseInt(Math.random().toString(9).substring(2, 9));
            }
        }

        let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=10`;
        let index = Math.floor(Math.random() * 10);

        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((responseJob) => {
                jobId = responseJob.body.pageData[index].jobId;
                urlImport = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`;
            });
        })
    });

    addSampleData.forEach(({
        title,
        type,
        data,
        message,
        code,
    }) => {
        it(title, () => {
            switch (code) {
                case 200:
                    dataImport.products[0].productCode = "productCodeTest6570_" + parseInt(Math.random().toString(9).substring(2, 9));
                    jobRequest.importJobAPI(urlImport, Settings.POST_METHOD, accessToken, dataImport).then((apiImportRes) => {
                        cy.wait(6000);
                        common.assertResAPI(apiImportRes, ['jobId', 'importId']);
                        returnStateAndProductId(dataImport.products[0].productCode, jobId).then((sqlQuery) => {
                            productId = sqlQuery[0]
                            ulrAddsample = `${Settings.BASE_URL}/products/${productId}/samples`

                            addSampleData[0].data[1].sampleCode = 'add_sampleCode2_' + parseInt(Math.random().toString(9).substring(2, 9));
                            productRequest.addSampleToProductAPI(ulrAddsample, data, accessToken, Settings.POST_METHOD).then((apiRepsonse) => {
                                expect(apiRepsonse.status).to.eq(code);
                                expect(apiRepsonse.body.success).to.eq(message);
                                assertAddedSample(dataImport.products[0].productCode, jobId, data, 2, type);
                            })
                        })
                    })
                    break;

                case 400:
                    dataImport.products[0].productCode = "productCodeTest6570_" + parseInt(Math.random().toString(9).substring(2, 9));
                    jobRequest.importJobAPI(urlImport, Settings.POST_METHOD, accessToken, dataImport).then((apiImportRes) => {
                        cy.wait(6000);
                        common.assertResAPI(apiImportRes, ['jobId', 'importId']);
                        returnStateAndProductId(dataImport.products[0].productCode, jobId).then((sqlQuery) => {
                            productId = sqlQuery[0]
                            ulrAddsample = `${Settings.BASE_URL}/products/${productId}/samples`

                            addSampleData[0].data[1].sampleCode = 'add_sampleCode2_' + parseInt(Math.random().toString(9).substring(2, 9));
                            productRequest.addSampleToProductAPI(ulrAddsample, data, accessToken, Settings.POST_METHOD).then((apiRepsonse) => {
                                common.assertResponse(apiRepsonse, code, message, '');
                            })
                        })
                    })
                    break;

                default:
                    cy.title(title);
                    break;

            }
        })
    })
})

function returnStateAndProductId(productCode, jobId) {
    return cy.sqlServer(
        `SELECT ProductId, ProductStateId FROM Product WHERE ProductCode = '${productCode}' and jobId = '${jobId}'`
    )
};

function assertAddedSample(productCode, jobId, request, size, type) {
    cy.sqlServer(
        `SELECT s.ProductSampleId, p.PropertyId, p.Value FROM PropertyValue p 
        JOIN ProductSample s ON s.ProductSampleId = p.ObjectId 
        JOIN Product u ON u.ProductSamplePoolId = s.ProductSamplePoolId 
        WHERE u.ProductCode = '${productCode}' 
        AND s.JobId = '${jobId}' 
        ORDER BY s.ProductSampleCode ASC, p.Value ASC`
    ).then((sqlQuery) => {
        if (type == "Valid") {
            let key1 = Object.keys(request[0].properties)[0];
            expect(parseInt(sqlQuery[0][2])).to.eq(request[0].sampleReturnDatetimeUtc);
            expect(sqlQuery[1][2]).to.eq(request[0].sampleCode);
            expect(sqlQuery[2][2]).to.eq(request[0].sampleProductImages[0]);
            expect(sqlQuery[3][2]).to.eq(request[0].size);
            expect(sqlQuery[4][2]).to.eq(request[0].sampleName);
            expect(sqlQuery[5][2]).to.eq(request[0].properties[key1]);
            if (size = 2) {
                let key2 = Object.keys(request[1].properties)[0];
                expect(parseInt(sqlQuery[6][2])).to.eq(request[1].sampleReturnDatetimeUtc);
                expect(sqlQuery[7][2]).to.eq(request[1].sampleCode);
                expect(sqlQuery[8][2]).to.eq(request[1].sampleProductImages[0]);
                expect(sqlQuery[9][2]).to.eq(request[1].size);
                expect(sqlQuery[10][2]).to.eq(request[1].sampleName);
                expect(sqlQuery[11][2]).to.eq(request[1].properties[key2]);
            }
        }
        if (type == "Empty") {
            let key1 = Object.keys(request[0].properties)[0];
            expect(parseInt(sqlQuery[1][2])).to.eq(request[0].sampleReturnDatetimeUtc);
            expect(sqlQuery[2][2]).to.eq(request[0].sampleProductImages[0]);
            expect(sqlQuery[3][2]).to.eq(request[0].size);
            expect(sqlQuery[4][2]).to.eq(request[0].sampleName);
            expect(sqlQuery[5][2]).to.eq(request[0].properties[key1]);
        }

    })
    return true;
};
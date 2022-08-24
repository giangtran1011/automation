import common from '../../support/utils/common.js';
import sampleRequest from '../../support/requests/sampleRequest';
import jobRequest from '../../support/requests/jobRequest.js';
import productRequest from '../../support/requests/productRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import getSampleData from '../../fixtures/sample-data/getSampleBySamplePoolId.json';
import dataImport from '../../fixtures/sample-data/createProductAndSample.json';


describe('GET - Get sample by samplePoolId API', () => {

    let urlImport1, urlImport2, urlGetSample, jobId1, jobId2, accessToken, samplePoolId;

    before(() => {

        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            //List job to get a random jobId
            let testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
            let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=10`;
            let index = Math.floor(Math.random() * 9);
            urlGetSample = `${Settings.BASE_URL}/samples/change-type`;

            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((response2) => {
                jobId1 = response2.body.pageData[index].jobId;
                jobId2 = response2.body.pageData[index + 1].jobId;
                urlImport1 = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId1}`;
                urlImport2 = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId2}`;

                //Import a new product
                dataImport.products[0].productCode = "productCodeTestGSB_" + parseInt(Math.random().toString(9).substring(2, 9));
                dataImport.products[0].samples[0].sampleCode = "sampleCodeTestGSB1_" + parseInt(Math.random().toString(9).substring(2, 9));
                jobRequest.importJobAPI(urlImport1, Settings.POST_METHOD, accessToken, dataImport).then((apiRes) => {
                    cy.wait(7000);
                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                    productRequest.assertSQLCreateProduct(dataImport.products[0].productCode, jobId1, dataImport);

                    returnSamplePoolId(dataImport.products[0].productCode).then((returnSamplePoolId) => {
                        samplePoolId = returnSamplePoolId;
                        urlGetSample = `${Settings.BASE_URL}/samples?samplePoolId=${samplePoolId}`;
                    })
                });
            });
        });
    });

    getSampleData.forEach(({
        title,
        type,
        samplePoolIdRequest,
        message,
        code,
    }) => {
        it(title, () => {
            switch (type) {

                case 'Successful-1 data':
                    {
                        let key = Object.keys(dataImport.products[0].samples[0].properties)[0];
                        urlGetSample = `${Settings.BASE_URL}/samples?samplePoolId=${samplePoolId}`;
                        sampleRequest.getSampleBySamplePoolIdAPI(urlGetSample, Settings.GET_METHOD, accessToken).then((apiRes) => {
                            common.assertResAPI(apiRes, ['pageInfo', 'pageData']);
                            cy.wait(2000);

                            assertSampleOfSamplePool(samplePoolId, apiRes.body, key, 1);
                        })
                    }
                    break;
                case 'Successful-2 data':
                    {
                        dataImport.products[0].samples[0].sampleCode = "sampleCodeTestGSB2_" + parseInt(Math.random().toString(9).substring(2, 9));
                        jobRequest.importJobAPI(urlImport2, Settings.POST_METHOD, accessToken, dataImport).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(dataImport.products[0].productCode, jobId2, dataImport);

                            let key = Object.keys(dataImport.products[0].samples[0].properties)[0];
                            urlGetSample = `${Settings.BASE_URL}/samples?samplePoolId=${samplePoolId}`;
                            sampleRequest.getSampleBySamplePoolIdAPI(urlGetSample, Settings.GET_METHOD, accessToken).then((apiRes) => {
                                common.assertResAPI(apiRes, ['pageInfo', 'pageData']);
                                cy.wait(2000);

                                assertSampleOfSamplePool(samplePoolId, apiRes.body, key, 2);
                            })
                        })
                    }
                    break;

                case 'Empty-data':
                    {
                        urlGetSample = `${Settings.BASE_URL}/samples?samplePoolId=${samplePoolIdRequest}`;
                        sampleRequest.getSampleBySamplePoolIdAPI(urlGetSample, Settings.GET_METHOD, accessToken).then((apiRes) => {
                            common.assertResAPI(apiRes, ['pageInfo', 'pageData']);
                            expect(apiRes.body.pageData).to.empty;
                        })
                    }
                    break;

                case '404':
                    {
                        urlGetSample = `${Settings.BASE_URL}/samples`;
                        sampleRequest.getSampleBySamplePoolIdAPI(urlGetSample, Settings.GET_METHOD, accessToken).then((apiRes) => {
                            expect(apiRes.status).to.eq(code);
                        })
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

function returnSamplePoolId(productCode) {
    return cy.sqlServer(
        `SELECT ProductSamplePoolId FROM Product WHERE ProductCode = '${productCode}'`
    )
};

function assertSampleOfSamplePool(samplePoolId, response, key, size) {
    cy.sqlServer(
        `Select distinct s.ProductSampleId, s.ProductSamplePoolId, s.ProductSampleCode, v.Value, 
        b.CfBarcodeData, p.ProductCode, s.SampleCheckinStatusId, s.ProductTypeId, s.OwnerClientId from ProductSample s
        JOIN PropertyValue v ON v.ObjectId = s.ProductSampleId
        JOIN Barcode b ON b.ObjectId = s.ProductSampleId
        JOIN Product p ON p.ProductSamplePoolId = s.ProductSamplePoolId
        where s.ProductSamplePoolId = '${samplePoolId}'
        order by s.ProductSampleCode desc, v.Value`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][0]).to.eq(response.pageData[0].sampleId.toUpperCase());
        expect(sqlQuery[0][1]).to.eq(response.pageData[0].samplePoolId.toUpperCase());
        expect(sqlQuery[0][2]).to.eq(response.pageData[0].sampleCode);
        expect(sqlQuery[0][4]).to.eq(response.pageData[0].sampleCfBarcode);
        expect(sqlQuery[0][5]).to.eq(response.pageData[0].productCode);
        expect(sqlQuery[0][6]).to.eq(response.pageData[0].checkInStatusId);
        expect(sqlQuery[0][7]).to.eq(response.pageData[0].productTypeId);
        expect(sqlQuery[0][8]).to.eq(response.pageData[0].ownerClientId.toUpperCase());
        expect(parseInt(sqlQuery[1][3])).to.eq(response.pageData[0].sampleReturnDatetimeUtc);
        expect(sqlQuery[2][3]).to.eq(response.pageData[0].sampleCode);
        expect(sqlQuery[3][3]).to.eq(response.pageData[0].properties[key]);
        expect(sqlQuery[4][3]).to.eq(response.pageData[0].sampleName);
        expect(sqlQuery[5][3]).to.eq(response.pageData[0].size);

        if (size == 2) {
            expect(sqlQuery[6][0]).to.eq(response.pageData[1].sampleId.toUpperCase());
            expect(sqlQuery[6][1]).to.eq(response.pageData[1].samplePoolId.toUpperCase());
            expect(sqlQuery[6][2]).to.eq(response.pageData[1].sampleCode);
            expect(sqlQuery[6][4]).to.eq(response.pageData[1].sampleCfBarcode);
            expect(sqlQuery[6][5]).to.eq(response.pageData[1].productCode);
            expect(sqlQuery[6][6]).to.eq(response.pageData[1].checkInStatusId);
            expect(sqlQuery[6][7]).to.eq(response.pageData[1].productTypeId);
            expect(sqlQuery[6][8]).to.eq(response.pageData[1].ownerClientId.toUpperCase());
            expect(parseInt(sqlQuery[7][3])).to.eq(response.pageData[1].sampleReturnDatetimeUtc);
            expect(sqlQuery[8][3]).to.eq(response.pageData[1].sampleCode);
            expect(sqlQuery[9][3]).to.eq(response.pageData[1].properties[key]);
            expect(sqlQuery[10][3]).to.eq(response.pageData[1].sampleName);
            expect(sqlQuery[11][3]).to.eq(response.pageData[1].size);
        }
    })
    return true;
};
import common from '../../support/utils/common.js';
import sampleRequest from '../../support/requests/sampleRequest';
import jobRequest from '../../support/requests/jobRequest.js';
import productRequest from '../../support/requests/productRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import updateSampleData from '../../fixtures/sample-data/updateSampleData.json';
import dataImport from '../../fixtures/sample-data/createProductAndSample.json';


describe('PUT - Update job API', () => {

    let urlImport, urlSample, jobId, accessToken, sampleId;

    before(() => {

        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            //List job to get a random jobId
            let testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
            let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=3`;
            let index = Math.floor(Math.random() * 3);

            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((response2) => {
                jobId = response2.body.pageData[index].jobId;
                urlImport = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`;

                //Import a new product
                dataImport.products[0].productCode = "productCodeTestUSl_" + parseInt(Math.random().toString(9).substring(2, 9));
                dataImport.products[0].samples[0].sampleCode = "sampleCodeTestUSl_" + parseInt(Math.random().toString(9).substring(2, 9));
                jobRequest.importJobAPI(urlImport, Settings.POST_METHOD, accessToken, dataImport).then((apiRes) => {
                    cy.wait(7000);
                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                    productRequest.assertSQLCreateProduct(dataImport.products[0].productCode, jobId, dataImport);

                    // Compare sample properties and get sampleId
                    let key = Object.keys(dataImport.products[0].samples[0].properties)[0];
                    sampleRequest.compareSQLSampleProperties(dataImport.products[0].samples[0].sampleCode, jobId, dataImport.products[0].samples[0], key)
                    sampleRequest.returnSQLProductSampleId(dataImport.products[0].samples[0].sampleCode).then((returnSampleId) => {
                        sampleId = returnSampleId;
                        urlSample = `${Settings.BASE_URL}/samples/${sampleId}`;
                    })
                });
            });
        });
    });

    updateSampleData.forEach(({
        title,
        type,
        data,
        sampleIdRequest,
        dateUtc,
        message,
        code,
    }) => {
        it(title, () => {
            switch (type) {

                case 'Empty properties':
                    {
                        sampleRequest.updateSampleAPI(urlSample, Settings.PUT_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResAPI(apiRes, ['success']);
                            expect(apiRes.body.success).to.equal(true);
                            cy.wait(2000);

                            returnCFBarCode(sampleId).then((returnCfBarcode) => {
                                let cfBarcode = returnCfBarcode;
                                compareSQLEmptySampleProperties(cfBarcode, jobId)
                            });
                        })
                    }
                    break;

                case 'Any properties':
                    {
                        let key = Object.keys(data.properties)[0];
                        updateBodyData(data, key);

                        sampleRequest.updateSampleAPI(urlSample, Settings.PUT_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResAPI(apiRes, ['success']);
                            expect(apiRes.body.success).to.equal(true);
                            cy.wait(2000);

                            sampleRequest.compareSQLSampleProperties(data.sampleCode, jobId, data, key)
                        })
                    }
                    break;

                case 'Date properties':
                    {
                        data.sampleCode = common.random("sampleCodeUpdate_5");
                        sampleRequest.updateSampleAPI(urlSample, Settings.PUT_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResAPI(apiRes, ['success']);
                            expect(apiRes.body.success).to.equal(true);
                            cy.wait(2000);

                            compareSQLSampleDateProperties(data.sampleCode, jobId, data, dateUtc)
                        })
                    }
                    break;

                case 'Validate':
                    {
                        if (sampleIdRequest != "") {
                            urlSample = `${Settings.BASE_URL}/samples/${sampleIdRequest}`;
                        } else urlSample = `${Settings.BASE_URL}/samples/${sampleId}`;
                        data.sampleCode = common.random("sampleCodeValidateUpdate_");
                        sampleRequest.updateSampleAPI(urlSample, Settings.PUT_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
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

function updateBodyData(data, key) {
    data.sampleCode = common.random("sampleCodeUpdate_");
    data.sampleName = common.random("sampleNameUpdate_");
    data.size = common.random("sizeUpdate_");
    data.properties[key] = common.random("sampleCommentUpdate_");
};

function compareSQLEmptySampleProperties(sampleCode, jobId) {
    cy.sqlServer(
        `SELECT p.value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId = '${jobId}'  AND p.IsDeleted = 0
        ORDER BY p.Value ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][0]).to.equal("");
        expect(parseInt(sqlQuery[1][0])).to.equal(1595246400000);
        expect(sqlQuery[2][0]).to.equal(sampleCode)
    });
    return true;
};

function returnCFBarCode(objectId) {
    return cy.sqlServer(
        `Select CfBarcodeData from Barcode where objectId = '${objectId}'`
    )
};

function compareSQLSampleDateProperties(sampleCode, jobId, data, dateUtc) {
    cy.sqlServer(
        `SELECT p.PropertyId,  p.value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId = '${jobId}'  AND p.IsDeleted = 0
        ORDER BY p.Value ASC`
    ).then((returnDate) => {
        let count = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 1; j < 9; j++) {
                if (returnDate[j][0].toLowerCase() == Object.keys(data.properties)[i]) {
                    count += 1;
                    expect(returnDate[j][1]).to.equal(dateUtc);
                }
            }
        }
        expect(count).to.equal(8);
    });
    return true;
};
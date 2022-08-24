import common from '../../support/utils/common.js';
import jobRequest from '../../support/requests/jobRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import dataImport from '../../fixtures/product-data/createProductData.json';
import productRequest from '../../support/requests/productRequest.js';
import wardropeRequest from '../../support/requests/wardropeRequest.js';
import jobData from '../../fixtures/job-data/jobData.json'
import dataImportStyling from '../../fixtures/wardrobe/importStylingItems.json';

describe('POST - Import job', () => {
    let url, urlSameClient, urlOther, urlShareOff, urlStyling;
    let jobId, jobIdSameClient, jobIdOther, jobIdShareOff, testClient, otherTestClient, shareOffClient, accessToken;

    let urlJob = `${Settings.BASE_URL}/jobs`;
    jobData[0].jobCode = common.random('jobCode');
    let createJobData = jobData[0];

    for (let i = 0; i < dataImport.length; i++) {
        if (i !== 10 && i != 12 && i != 29 && i != 30 && i != 32 && i != 33 && i != 48 && i != 49 && i != 50) {
            dataImport[i].data.products[0].productCode = 'productCode_TestImport_' + parseInt(Math.random().toString(9).substring(2, 9));
        }
    }
    dataImport[1].data.products[1].productCode = 'productCode_TestImport_' + parseInt(Math.random().toString(9).substring(2, 9));
    dataImport[2].data.products[0].category = 'category_lowercase' + parseInt(Math.random().toString(9).substring(2, 9));
    let duplicateCategory = dataImport[2].data.products[0].category;
    dataImport[3].data.products[0].category = 'CATEGORY_UPPERCASE' + parseInt(Math.random().toString(9).substring(2, 9));


    before(() => {

        cy.title("Check authentication");
        testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
        otherTestClient = Settings.CREATE_JOB_OTHER_STUDIO_CLIENT;
        shareOffClient = Settings.SHAREPOOL_OFF_STUDIO_CLIENT;
        //let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=20`;
        // let urlListOtherJob = `${Settings.BASE_URL}/jobs?clientId=${otherTestClient}&pageSize=20`;
        // let index = Math.floor(Math.random() * 20);

        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
            //List job to get a random jobId
            // jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((responseJob) => {
            //     jobId = responseJob.body.pageData[index].jobId;
            //     url = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`
            // });
            jobRequest.createJobAPI(urlJob, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, createJobData.jobCode, "productName", createJobData.deadlineutc, createJobData.properties).then((apiRes) => {
                jobId = apiRes.body.jobId;
                url = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`
            });

            jobRequest.createJobAPI(urlJob, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_STUDIO_CLIENT, createJobData.jobCode, "productName", createJobData.deadlineutc, createJobData.properties).then((apiRes) => {
                jobIdSameClient = apiRes.body.jobId;
                urlSameClient = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobIdSameClient}`
            });


            // jobRequest.listJobsAPI(urlListOtherJob, Settings.GET_METHOD, accessToken).then((responseOtherJob) => {
            //     jobIdOther = responseOtherJob.body.pageData[index].jobId;
            //     urlOther = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobIdOther}`
            // });

            jobRequest.createJobAPI(urlJob, Settings.POST_METHOD, accessToken, Settings.CREATE_JOB_OTHER_STUDIO_CLIENT, createJobData.jobCode, "productName", createJobData.deadlineutc, createJobData.properties).then((apiRes) => {
                jobIdOther = apiRes.body.jobId;
                urlOther = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobIdOther}`
            });

            jobRequest.createJobAPI(urlJob, Settings.POST_METHOD, accessToken, Settings.SHAREPOOL_OFF_STUDIO_CLIENT, createJobData.jobCode, "productName", createJobData.deadlineutc, createJobData.properties).then((apiRes) => {
                jobIdShareOff = apiRes.body.jobId;
                urlShareOff = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobIdShareOff}`
            });
        });
    });


    dataImport.forEach(({
        title,
        data,
        samplePool,
        code,
        message
    }) => {
        it(title, () => {
            switch (title) {
                case 'GW_Import_01 - Import products with only productCode':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLEmptyProduct(data.products[0].productCode, jobId, data);
                        });
                    }
                    break;

                case 'GW_Import_02 - Import multiple products successful':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            for (let i = 0; i < data.products.length; i++) {
                                jobRequest.assertSQLGetProduct(data.products[i].productCode, testClient, data.products[i].productName, jobId);
                            }

                        });
                    }
                    break;

                case 'GW_Import_03+04 - Import products with non-exist Category + Import products with duplicate Category (Uppercase) ':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLProductCategory(data.products[0].productCode, jobId, data.products[0].category, 'normal')

                            data.products[0].category = data.products[0].category.toUpperCase();
                            jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiResDuplicate) => {
                                cy.wait(7000);
                                common.assertResAPI(apiResDuplicate, ['jobId', 'importId']);
                                productRequest.assertSQLProductCategory(data.products[0].productCode, jobId, data.products[0].category, 'lowerCase')

                            });
                        });

                    }
                    break;

                case 'GW_Import_04b - Import products with duplicate Category (Lowercase) ':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLProductCategory(data.products[0].productCode, jobId, data.products[0].category, 'normal')


                            data.products[0].category = data.products[0].category.toLowerCase();
                            jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiResDuplicate) => {
                                cy.wait(7000);
                                common.assertResAPI(apiResDuplicate, ['jobId', 'importId']);
                                productRequest.assertSQLProductCategory(data.products[0].productCode, jobId, data.products[0].category, 'upperCase')

                            });
                        });
                    }
                    break;

                case 'GW_Import_05 - Import products with exist Category of other client ':
                    {
                        data.products[0].category = duplicateCategory;

                        jobRequest.importJobAPI(urlOther, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdOther, data)

                        });
                    }
                    break;

                case 'GW_Import_06 - Import products with styleGuide not in client ':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.compareSQLStyleGuide(data.products[0].productCode, jobId, Settings.DEFAULT_STYLE_GUIDE);
                        });
                    }
                    break;

                case 'GW_Import_07 - Import products with non-exist styleGuide':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.compareSQLStyleGuide(data.products[0].productCode, jobId, Settings.DEFAULT_STYLE_GUIDE);
                        });
                    }
                    break;

                case 'GW_Import_08 - Import products with disable styleGuide':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.compareSQLStyleGuide(data.products[0].productCode, jobId, Settings.DEFAULT_STYLE_GUIDE);
                        });
                    }
                    break;
                case 'GW_Import_09 - Import products with all disable prod types styleGuide':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                            productRequest.compareSQLStyleGuide(data.products[0].productCode, jobId, data.products[0].styleGuide);

                            let getStatusUrl = `${Settings.BASE_URL}/products/get-status?jobId=${jobId}&productCode=${data.products[0].productCode}`;
                            productRequest.getProductStatusAPI(getStatusUrl, Settings.GET_METHOD, accessToken, jobId, data.products[0].productCode).then((response) => {
                                expect(response.body[0].productStatusId).to.equal(9000);
                            })
                        });
                    }
                    break;

                case 'GW_Import_10 - Import products with a disable prod type styleGuide':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                            productRequest.compareSQLStyleGuide(data.products[0].productCode, jobId, data.products[0].styleGuide);

                            let getStatusUrl = `${Settings.BASE_URL}/products/get-status?jobId=${jobId}&productCode=${data.products[0].productCode}`;
                            productRequest.getProductStatusAPI(getStatusUrl, Settings.GET_METHOD, accessToken, jobId, data.products[0].productCode).then((response) => {
                                expect(response.body[0].productStatusId).to.equal(2000);
                            })
                        });
                    }
                    break;

                case 'GW_Import_12 - Import products with duplicate project code in ED':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                        });
                    }
                    break;

                case 'GW_Import_13 - Import products with duplicate project name in ED':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                        });
                    }
                    break;

                case 'GW_Import_14 - Import products with duplicate deliveriable code in ED':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                        });
                    }
                    break;

                case 'GW_Import_15 - Import products with duplicate deliveriable name in ED':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                        });
                    }
                    break;


                case 'GW_Import_16 - Import products with duplicate productCode of 1 styling item (same client) ':
                    {
                        urlStyling = `${Settings.BASE_URL}/styling/import-styling?clientId=${testClient}`
                        dataImportStyling[5].data.stylingItems[0].productCode = 'stylingItem_And_Product16_' + parseInt(Math.random().toString(9).substring(2, 9));

                        wardropeRequest.importStylingAPI(urlStyling, Settings.POST_METHOD, accessToken, dataImportStyling[5].data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(dataImportStyling[5].data.stylingItems[0].productCode, dataImportStyling[5].data, testClient);

                            data.products[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;
                            jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                                cy.wait(7000);
                                common.assertResAPI(apiRes, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                productRequest.compareSQLProSamplePool(data.products[0].productCode, jobId, Settings.CREATE_JOB_STUDIO_CLIENT, 'same')
                            });
                        })
                    }
                    break;

                case 'GW_Import_17 - Import products with duplicate productCode of 2 styling items (same client and newer+other+shareOn) ':
                    {
                        let urlStyling1 = `${Settings.BASE_URL}/styling/import-styling?clientId=${testClient}`
                        let urlStyling2 = `${Settings.BASE_URL}/styling/import-styling?clientId=${otherTestClient}`
                        dataImportStyling[5].data.stylingItems[0].productCode = 'stylingItem_And_Product17_' + parseInt(Math.random().toString(9).substring(2, 9));
                        dataImportStyling[6].data.stylingItems[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;

                        wardropeRequest.importStylingAPI(urlStyling1, Settings.POST_METHOD, accessToken, dataImportStyling[5].data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(dataImportStyling[5].data.stylingItems[0].productCode, dataImportStyling[5].data, testClient);

                            wardropeRequest.importStylingAPI(urlStyling2, Settings.POST_METHOD, accessToken, dataImportStyling[6].data).then((apiRes) => {
                                cy.wait(7000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(dataImportStyling[6].data.stylingItems[0].productCode, dataImportStyling[6].data, otherTestClient);

                                data.products[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;
                                jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(7000);
                                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                                    productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                    productRequest.compareSQLProSamplePool(data.products[0].productCode, jobId, testClient, 'same');
                                    productRequest.compareSQLProSamplePool(data.products[0].productCode, jobId, otherTestClient, 'same')
                                });
                            })
                        });
                    }
                    break;

                case 'GW_Import_18 - Import products with duplicate productCode of 2 styling items (same client and newer+other+shareoff) ':
                    {
                        let urlStyling1 = `${Settings.BASE_URL}/styling/import-styling?clientId=${testClient}`
                        let urlStyling2 = `${Settings.BASE_URL}/styling/import-styling?clientId=${shareOffClient}`
                        dataImportStyling[5].data.stylingItems[0].productCode = 'stylingItem_And_Product18_' + parseInt(Math.random().toString(9).substring(2, 9));
                        dataImportStyling[6].data.stylingItems[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;

                        wardropeRequest.importStylingAPI(urlStyling1, Settings.POST_METHOD, accessToken, dataImportStyling[5].data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(dataImportStyling[5].data.stylingItems[0].productCode, dataImportStyling[5].data, testClient);

                            wardropeRequest.importStylingAPI(urlStyling2, Settings.POST_METHOD, accessToken, dataImportStyling[6].data).then((apiRes) => {
                                cy.wait(7000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(dataImportStyling[6].data.stylingItems[0].productCode, dataImportStyling[6].data, shareOffClient);

                                data.products[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;
                                jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(7000);
                                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                                    productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                    productRequest.compareSQLProSamplePool(data.products[0].productCode, jobId, testClient, 'same');
                                    productRequest.compareSQLProSamplePool(data.products[0].productCode, jobId, shareOffClient, 'different');
                                });
                            })
                        });
                    }
                    break;

                case 'GW_Import_19 - Import products with duplicate productCode of 1 styling items (other client and shareoff) ':
                    {
                        let urlStyling = `${Settings.BASE_URL}/styling/import-styling?clientId=${shareOffClient}`
                        dataImportStyling[5].data.stylingItems[0].productCode = 'stylingItem_And_Product19_' + parseInt(Math.random().toString(9).substring(2, 9));

                        wardropeRequest.importStylingAPI(urlStyling, Settings.POST_METHOD, accessToken, dataImportStyling[5].data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);

                            wardropeRequest.assertSQLCreateStyling(dataImportStyling[5].data.stylingItems[0].productCode, dataImportStyling[5].data, shareOffClient);
                            data.products[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;
                            jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(7000);
                                common.assertResAPI(apiRes, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                productRequest.compareSQLProSamplePool(data.products[0].productCode, jobId, shareOffClient, 'different');
                            });
                        })
                    }
                    break;

                case 'GW_Import_16b - Import products with duplicate productCode of 1 styling items (same client and shareoff) ':
                    {
                        urlStyling = `${Settings.BASE_URL}/styling/import-styling?clientId=${shareOffClient}`
                        dataImportStyling[5].data.stylingItems[0].productCode = 'stylingItem_And_Product16b_' + parseInt(Math.random().toString(9).substring(2, 9));

                        wardropeRequest.importStylingAPI(urlStyling, Settings.POST_METHOD, accessToken, dataImportStyling[5].data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(dataImportStyling[5].data.stylingItems[0].productCode, dataImportStyling[5].data, shareOffClient);

                            data.products[0].productCode = dataImportStyling[5].data.stylingItems[0].productCode;

                            jobRequest.importJobAPI(urlShareOff, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(7000);
                                common.assertResAPI(apiRes, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdShareOff, data);
                                productRequest.compareSQLProSamplePool(data.products[0].productCode, jobIdShareOff, shareOffClient, 'different')
                            });
                        })
                    }
                    break;

                case 'GW_Import_20 - Import products with duplicate productCode of other product (same client, same jobId) ':
                    {

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            let samplePool;
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            let key = Object.keys(data.products[0].properties)[0]

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                            productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobId).then((sqlQuery) => {
                                samplePool = sqlQuery[0][2];
                                console.log(data.products[0].properties[key])
                                expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);

                                data.products[0].properties[key] = common.random('xxx_property');
                                data.products[0].samples[0].sampleCode = common.random('sampleCode_test1');

                                jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(7000);
                                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                                    productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                    productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobId).then((sqlQuery) => {
                                        expect(sqlQuery[0][2]).to.equal(samplePool);
                                        expect(sqlQuery[9][1]).to.not.equal(data.products[0].properties[key]);

                                    });
                                    productRequest.compareAddSampleCode(data.products[0].productCode, jobId, data).then((sqlQuery) => {
                                        expect(sqlQuery[0][1]).to.equal(data.products[0].samples[0].sampleCode);
                                    });

                                });
                            });
                        });
                    }
                    break;

                case 'GW_Import_20b - Import products with duplicate productCode of other product (same client, other jobId) ':
                    {

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            let samplePool;
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            let key = Object.keys(data.products[0].properties)[0]

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                            productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobId).then((sqlQuery) => {
                                samplePool = sqlQuery[0][2];
                                console.log(data.products[0].properties[key])
                                expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);

                                data.products[0].properties[key] = common.random('xxx_property');
                                data.products[0].samples[0].sampleCode = common.random('sampleCode_test1');

                                jobRequest.importJobAPI(urlSameClient, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(7000);
                                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                                    productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdSameClient, data);
                                    productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobIdSameClient).then((sqlQuery) => {
                                        expect(sqlQuery[0][2]).to.equal(samplePool);
                                        expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);
                                    });
                                    productRequest.compareAddSampleCode(data.products[0].productCode, jobIdSameClient).then((sqlQuery) => {
                                        expect(sqlQuery[0][1]).to.equal(data.products[0].samples[0].sampleCode);
                                    });

                                    productRequest.compareAddSampleCode(data.products[0].productCode, jobId).then((sqlQuery) => {
                                        expect(sqlQuery[0][1]).to.equal(data.products[0].samples[0].sampleCode);
                                    });
                                });
                            });
                        });
                    }
                    break;

                case 'GW_Import_21 - Import products with duplicate productCode of other product (other client and shareOff) ':
                    {

                        jobRequest.importJobAPI(urlShareOff, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            let samplePool;
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            let key = Object.keys(data.products[0].properties)[0]

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdShareOff, data);
                            productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobIdShareOff).then((sqlQuery) => {
                                samplePool = sqlQuery[0][2];
                                console.log(data.products[0].properties[key])
                                expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);

                                data.products[0].properties[key] = common.random('xxx_property');
                                data.products[0].samples[0].sampleCode = common.random('sampleCode_test1');

                                jobRequest.importJobAPI(urlSameClient, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(7000);
                                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                                    productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdSameClient, data);
                                    productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobIdSameClient).then((sqlQuery) => {
                                        expect(sqlQuery[0][2]).to.not.equal(samplePool);
                                        expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);

                                    });
                                    productRequest.compareAddSampleCode(data.products[0].productCode, jobIdSameClient).then((sqlQuery) => {
                                        expect(sqlQuery[1]).to.equal(data.products[0].samples[0].sampleCode);
                                    });
                                });
                            });
                        });
                    }
                    break;



                case 'GW_Import_22 - Import products with duplicate productCode of other product (other client and shareOn) ':
                    {
                        jobRequest.importJobAPI(urlOther, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            let samplePool;
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            let key = Object.keys(data.products[0].properties)[0]

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdOther, data);
                            productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobIdOther).then((sqlQuery) => {
                                samplePool = sqlQuery[0][2];
                                console.log(data.products[0].properties[key])
                                expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);

                                data.products[0].properties[key] = common.random('xxx_property');
                                data.products[0].samples[0].sampleCode = common.random('sampleCode_test1');

                                jobRequest.importJobAPI(urlSameClient, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(7000);
                                    common.assertResAPI(apiRes, ['jobId', 'importId']);
                                    productRequest.assertSQLCreateProduct(data.products[0].productCode, jobIdSameClient, data);
                                    productRequest.compareSamplePoolAndProperty(data.products[0].productCode, jobIdSameClient).then((sqlQuery) => {
                                        expect(sqlQuery[0][2]).to.equal(samplePool);
                                        expect(sqlQuery[9][1]).to.equal(data.products[0].properties[key]);

                                    });
                                    productRequest.compareAddSampleCode(data.products[0].productCode, jobIdSameClient, data).then((sqlQuery) => {
                                        expect(sqlQuery[0][1]).to.equal(data.products[0].samples[0].sampleCode);
                                    });
                                });
                            });
                        });
                    }
                    break;

                case 'GW_Import_23 - Import products with all product properties 1':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                let property = data.products[0].properties;
                                let arrayProperties = Object.values(property);

                                expect(sqlQuery[4][1]).to.equal(arrayProperties[2]);
                                expect(sqlQuery[8][1]).to.equal(arrayProperties[0]);
                                expect(sqlQuery[10][1]).to.equal(arrayProperties[1]);
                            })
                        });
                    }
                    break;

                case 'GW_Import_24 - Import products with all product properties 2':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                expect(sqlQuery[4][1]).to.equal('');
                                expect(sqlQuery[8][1]).to.equal('');
                                expect(sqlQuery[10][1]).to.equal('S1');
                                expect(sqlQuery[11][1]).to.equal('')
                            })
                        });
                    }
                    break;

                case 'GW_Import_25 - Import products with all dateTime product properties':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                cy.log(sqlQuery);
                                expect(sqlQuery[4][1]).to.equal('1641988800000');
                                expect(sqlQuery[5][1]).to.equal('1641989542000');
                            })
                        });
                    }
                    break;

                case 'GW_Import_26 - Import products with all sample properties 1':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_a')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                let arraySampleProperties = Object.values(data.products[0].samples[0].properties);
                                expect(sqlQuery[3][1]).to.equal(arraySampleProperties[2]);
                                expect(sqlQuery[6][1]).to.equal(arraySampleProperties[0]);
                                expect(sqlQuery[7][1]).to.equal(arraySampleProperties[1]);
                            })
                        });
                    }
                    break;

                case 'GW_Import_27 - Import products with all sample properties 2':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_a')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                expect(sqlQuery[0][1]).to.equal('');
                                expect(sqlQuery[1][1]).to.equal('');
                                expect(sqlQuery[2][1]).to.equal('');
                                expect(sqlQuery[8][1]).to.equal('Se2');
                            })
                        });
                    }
                    break;

                case 'GW_Import_28 - Import products with dateTime sample properties':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_a')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                expect(sqlQuery[1][1]).to.equal('1641988800000');
                                expect(sqlQuery[2][1]).to.equal('1641989542000');
                            })
                        });
                    }
                    break;

                case 'GW_Import_29 - Import products with duplicate productCode and sampleCode':
                    {
                        data[0].products[0].productCode = common.random('productCode_TestImport');
                        data[1].products[0].productCode = data[0].products[0].productCode;

                        data[0].products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_b');
                        data[1].products[0].samples[0].sampleCode = data[0].products[0].samples[0].sampleCode;

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data[0]).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data[1]).then((apiRes) => {
                                cy.wait(10000);
                                common.assertResAPI(apiRes, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data[0].products[0].productCode, jobId, data[0]);
                                productRequest.getSQLSampleCode(data[0].products[0].productCode, jobId).then((sampleCodeQuery) => {
                                    expect(sampleCodeQuery).to.equal(data[0].products[0].samples[0].sampleCode)
                                });
                            });
                        });
                    }
                    break;

                case 'GW_Import_30 - Import products with duplicate productCode and other sampleCode':
                    {
                        data[0].products[0].productCode = common.random('productCode_TestImport');
                        data[1].products[0].productCode = data[0].products[0].productCode;

                        data[0].products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_c1');
                        data[1].products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_c2');

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data[0]).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data[1]).then((apiRes) => {
                                cy.wait(10000);
                                common.assertResAPI(apiRes, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data[0].products[0].productCode, jobId, data[0]);

                                productRequest.getSQLProductProperties(data[0].products[0].productCode, jobId).then((sqlQuery) => {
                                    let arrayProperties = Object.values(data[0].products[0].properties);
                                    expect(arrayProperties[0]).to.equal(sqlQuery[9][1]);
                                })

                                productRequest.getSQLSampleCode(data[0].products[0].productCode, jobId).then((sampleCodeQuery) => {
                                    expect(sampleCodeQuery[0][0]).to.equal(data[0].products[0].samples[0].sampleCode);
                                    expect(sampleCodeQuery[1][0]).to.equal(data[1].products[0].samples[0].sampleCode);
                                });
                            });
                        });
                    }
                    break;

                case 'GW_Import_31 - Import 1 product with duplicate productCode and other sampleCode':
                    //Bug https://creativeforce-io.atlassian.net/browse/LH-12885 => đã fix
                    {
                        data.products[0].productCode = common.random('productCode_TestImport');
                        data.products[1].productCode = data.products[0].productCode;

                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_d1');
                        data.products[1].samples[0].sampleCode = common.random('sampleCode_TestImport_d2');

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.assertSQLCreateProductIndex(data.products[0].productCode, jobId, data, 1);

                            productRequest.getSQLSampleCode(data.products[0].productCode, jobId).then((sampleCodeQuery) => {
                                expect(sampleCodeQuery[0][0]).to.equal(data.products[0].samples[0].sampleCode);
                                expect(sampleCodeQuery[1][0]).to.equal(data.products[1].samples[0].sampleCode);
                            });
                        });
                    }
                    break;

                case 'GW_Import_32 - Import with only sample':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(3000);
                            expect(apiRes.status).to.eq(400);
                            expect(apiRes.body.errors[0].message).to.eq(message);
                        });
                    }
                    break;

                case 'GW_Import_33 - Import with only outfit':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(3000);
                            expect(apiRes.status).to.eq(400);
                            expect(apiRes.body.errors[0].message).to.eq(message);
                        });
                    }
                    break;

                case 'GW_Import_34 - Import with all date properties format 1':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                for (let i = 9; i <= 15; i++) {
                                    if (i != 11) expect(sqlQuery[i][1]).to.equal('1651492800000');
                                    else expect(sqlQuery[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_35 - Import with all date properties  format 2':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                for (let i = 9; i <= 15; i++) {
                                    expect(sqlQuery[i][1]).to.equal('1644926400000')
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_36 - Import with all date properties  format 3':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                for (let i = 9; i <= 15; i++) {
                                    if (i != 11) expect(sqlQuery[i][1]).to.equal('1651492800000');
                                    else expect(sqlQuery[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_37 - Import with all date properties  format 4':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.getSQLProductProperties(data.products[0].productCode, jobId).then((sqlQuery) => {
                                for (let i = 9; i <= 15; i++) {
                                    expect(sqlQuery[i][1]).to.equal('1644926400000')
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_38 - Import with all date sample properties format 1':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_f1')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLDateSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    if (i != 8) expect(sqlQuery[i][1]).to.equal('1651492800000');
                                    else expect(sqlQuery[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_39 - Import with all date sample properties format 2':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_f2')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLDateSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    expect(sqlQuery[i][1]).to.equal('1644926400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_40 - Import with all date sample properties format 3':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_f3')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLDateSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    if (i != 8) expect(sqlQuery[i][1]).to.equal('1651492800000');
                                    else expect(sqlQuery[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_41 - Import with all date sample properties format 4':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_f2')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.getSQLDateSampleProperties(data.products[0].samples[0].sampleCode, jobId).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    expect(sqlQuery[i][1]).to.equal('1644926400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_Import_42 - Import ProductCode with category has ,':
                    {
                        data.products[0].category = common.random('special,Category_')
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.returnSQLProductCategory(data.products[0].productCode, jobId).then((sqlQuerylQ) => {
                                expect(sqlQuerylQ).to.equal(data.products[0].category);
                            })

                        });
                    }
                    break;

                case 'GW_Import_43 - Import ProductCode with category has ;':
                    {
                        data.products[0].category = common.random('special;Category_')
                        let category = data.products[0].category;
                        let cutCategory = category.substring(0, 7) + category.substring(8);
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(10000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.returnSQLProductCategory(data.products[0].productCode, jobId).then((sqlQuerylQ) => {
                                expect(sqlQuerylQ).to.equal(cutCategory);
                            })

                        });
                    }
                    break;



                case 'GW_Import_46 - Import with duplicate sampleCode (existingSampleActionId =2)':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_same12');
                        data.products[0].samples[1].sampleCode = data.products[0].samples[0].sampleCode;

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.getSQLSampleCode(data.products[0].productCode, jobId).then((sampleCodeQuery) => {
                                cy.log(sampleCodeQuery)
                                expect(sampleCodeQuery).to.equal(data.products[0].samples[0].sampleCode);
                            });
                        });
                    }
                    break;

                case 'GW_Import_47 - Import with duplicate sampleCode (existingSampleActionId =1)':
                    {
                        data.products[0].samples[0].sampleCode = common.random('sampleCode_TestImport_same12');
                        data.products[0].samples[1].sampleCode = data.products[0].samples[0].sampleCode;

                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.getSQLSampleCode(data.products[0].productCode, jobId).then((sampleCodeQuery) => {
                                cy.log(sampleCodeQuery[0][1])
                                expect(sampleCodeQuery[0][0]).to.equal(data.products[0].samples[0].sampleCode);
                                expect(sampleCodeQuery[1][0]).to.equal(data.products[0].samples[1].sampleCode);

                            });
                        });
                    }
                    break;

                case 'GW_Import_48 - Import without sample (same job, no default Sample)':
                    {
                        let urlNoDefaultSample = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}&noDefaultSample=1`

                        jobRequest.importJobAPI(urlNoDefaultSample, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.returnSQLProductImportStatusId(data.products[0].productCode, jobId).then((apiRes) => {
                                cy.log(apiRes)
                                expect(apiRes).to.equal(10);
                            })

                            let object = {};
                            object["sampleCode"] = common.random("sampleCode48");
                            object["sampleName"] = common.random("sampleName48");

                            let samples = [];
                            samples.push(object);
                            data.products[0]["samples"] = samples;
                            cy.log(data)

                            jobRequest.importJobAPI(urlNoDefaultSample, Settings.POST_METHOD, accessToken, data).then((apiRes2) => {
                                cy.wait(7000);
                                common.assertResAPI(apiRes2, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                productRequest.returnSQLProductImportStatusId(data.products[0].productCode, jobId).then((apiRes) => {
                                    cy.log(apiRes2)
                                    expect(apiRes).to.equal(0);
                                })
                            });
                        });
                    }
                    break;

                case 'GW_Import_49 - Import without sample (other job, no default Sample)':
                    {
                        let urlNoDefaultSample = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}&noDefaultSample=1`

                        jobRequest.importJobAPI(urlNoDefaultSample, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);

                            productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);

                            productRequest.returnSQLProductImportStatusId(data.products[0].productCode, jobId).then((apiRes) => {
                                cy.log(apiRes)
                                expect(apiRes).to.equal(10);
                            })

                            let object = {};
                            object["sampleCode"] = common.random("sampleCode48");
                            object["sampleName"] = common.random("sampleName48");

                            let samples = [];
                            samples.push(object);
                            data.products[0]["samples"] = samples;
                            cy.log(data)

                            jobRequest.importJobAPI(urlOther, Settings.POST_METHOD, accessToken, data).then((apiRes2) => {
                                cy.wait(7000);
                                common.assertResAPI(apiRes2, ['jobId', 'importId']);
                                productRequest.assertSQLCreateProduct(data.products[0].productCode, jobId, data);
                                productRequest.returnSQLProductImportStatusId(data.products[0].productCode, jobId).then((apiRes) => {
                                    cy.log(apiRes2)
                                    expect(apiRes).to.equal(0);
                                })
                            });
                        });
                    }
                    break;

                case 'Validate - Import Async with invalid jobId':
                    {
                        let url1 = `${Settings.BASE_URL}/jobs/import-async?jobId=10425cbc-37a0-4131-8598-d3cb8db12b93`;
                        jobRequest.importJobAPI(url1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        })
                    }
                    break;

                case 'Validate - Import Async with invalid format utc/uuid':
                    {
                        jobRequest.importJobAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            expect(apiRes.status).to.eq(code);
                            expect(apiRes.body.title).to.equal(message);
                        })
                    }
                    break;

                case 'Validate - Import Async with invalid content-Type':
                    {
                        jobRequest.checkContentImportJob(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            expect(apiRes.status).to.eq(code);
                            expect(apiRes.body.title).to.equal(message);
                        })
                    }
                    break;

                    // default: {
                    //     cy.title(title);
                    // }

                default:
                    {
                        switch (code) {
                            case 400:
                                {
                                    cy.title(title);
                                    let url1 = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`;
                                    jobRequest.importJobAPI(url1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                        common.assertResponse(apiRes, code, message, '');
                                    })
                                }
                                break;

                            case 401:
                                {
                                    cy.title(title);
                                    jobRequest.importJobAPI(url, Settings.POST_METHOD, code, data).then((apiRes) => {
                                        common.assertResponse(apiRes, code, message, '');
                                    })
                                }
                                break;

                            case 403:
                                {
                                    cy.title(title);
                                    common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.NO_PERMISSION_CLIENT_ID, Settings.NO_PERMISSION_CLIENT_SECRET).then((response) => {
                                        jobRequest.importJobAPI(url, Settings.POST_METHOD, response.body.access_token, data).then((apiRes) => {
                                            // common.assertResponse(apiRes, code, message, '');
                                            expect(apiRes.status).to.eq(code);
                                        })
                                    })
                                }
                                break;

                        }
                    }
            }
        });
    });
});
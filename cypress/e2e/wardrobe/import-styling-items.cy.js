import common from '../../support/utils/common.js';
import jobRequest from '../../support/requests/jobRequest.js';
import * as Settings from '../../support/utils/globalContants.js';
import dataImport from '../../fixtures/wardrobe/importStylingItems.json';
import productRequest from '../../support/requests/productRequest.js';
import wardropeRequest from '../../support/requests/wardropeRequest.js';
import productData from '../../fixtures/wardrobe/productData.json'

//Prepare data:
//Thay đổi projectCode và projectName ở các case GW_ImportSI_6, 7, 8, 9

describe('POST - Import job', () => {
    let url, urlOther1, urlOther2, urlProd, jobId, jobIdOther, testClient, otherTestClient1, otherTestClient2, accessToken;
    let index = Math.floor(Math.random() * 20);

    for (let i = 0; i < dataImport.length; i++) {
        if (i != 5 && i != 6 && i != 7 && i != 8 && i != 24) {
            dataImport[i].data.stylingItems[0].productCode = 'stylingItem_TestImport_' + parseInt(Math.random().toString(9).substring(2, 9));
        }
    }

    dataImport[2].data.stylingItems[0].category = common.random('st_category_lowercase');
    let duplicateCategory = dataImport[2].data.stylingItems[0].category;
    dataImport[3].data.stylingItems[0].category = common.random('ST_CATEGORY_UPPERCASE');

    before(() => {

        cy.title("Check authentication");
        testClient = Settings.CREATE_JOB_STUDIO_CLIENT;
        otherTestClient1 = Settings.CREATE_JOB_OTHER_STUDIO_CLIENT
        otherTestClient2 = Settings.SHAREPOOL_OFF_STUDIO_CLIENT
        url = `${Settings.BASE_URL}/styling/import-styling?clientId=${testClient}`
        urlOther1 = `${Settings.BASE_URL}/styling/import-styling?clientId=${otherTestClient1}`
        urlOther2 = `${Settings.BASE_URL}/styling/import-styling?clientId=${otherTestClient2}`

        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            //List job to get a random jobId
            let urlListJob = `${Settings.BASE_URL}/jobs?clientId=${testClient}&pageSize=20`;
            jobRequest.listJobsAPI(urlListJob, Settings.GET_METHOD, accessToken).then((responseJob) => {
                jobId = responseJob.body.pageData[index].jobId;
                urlProd = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobId}`
            });
        });
    });


    dataImport.forEach(({
        title,
        testCase,
        data,
        code,
        message
    }) => {
        it(title, () => {
            switch (testCase) {

                case 'GW_ImportSI_01':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000)
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLEmptyStyling(data.stylingItems[0].productCode, testClient, data);
                        })

                    }
                    break;

                case 'GW_ImportSI_02':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'stylingItem_Sample_' + parseInt(Math.random().toString(9).substring(2, 9));

                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000)
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLEmptyStyling(data.stylingItems[0].productCode, testClient, data);
                            wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sqlQuery) => {
                                expect(sqlQuery[0]).to.equal(data.stylingItems[0].samples[0].sampleCode);
                            })
                        })
                    }
                    break;

                case 'GW_ImportSI_03+04':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLStylingCategory(data.stylingItems[0].productCode, data.stylingItems[0].category, 'normal')

                            data.stylingItems[0].category = data.stylingItems[0].category.toUpperCase();
                            wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiResDuplicate) => {
                                cy.wait(7000);
                                common.assertResAPI(apiResDuplicate, ['clientId', 'importId']);
                                wardropeRequest.assertSQLStylingCategory(data.stylingItems[0].productCode, data.stylingItems[0].category, 'lowerCase')

                            });
                        });

                    }
                    break;

                case 'GW_ImportSI_4b':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLStylingCategory(data.stylingItems[0].productCode, data.stylingItems[0].category, 'normal')


                            data.stylingItems[0].category = data.stylingItems[0].category.toLowerCase();
                            wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiResDuplicate) => {
                                cy.wait(7000);
                                common.assertResAPI(apiResDuplicate, ['clientId', 'importId']);
                                wardropeRequest.assertSQLStylingCategory(data.stylingItems[0].productCode, data.stylingItems[0].category, 'upperCase')

                            });
                        });
                    }
                    break;

                case 'GW_ImportSI_5':
                    {
                        data.stylingItems[0].category = duplicateCategory;

                        wardropeRequest.importStylingAPI(urlOther1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient1);

                            wardropeRequest.importStylingAPI(urlOther2, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient2);

                            });
                        });
                    }
                    break;

                case 'GW_ImportSI_6_7_8_9':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);
                        });
                    }
                    break;

                case 'GW_ImportSI_10':
                    {
                        let key = Object.keys(data.stylingItems[0].properties)[0]
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_TestImport9_' + parseInt(Math.random().toString(9).substring(2, 7));

                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);

                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties1) => {
                                expect(sqlProperties1[9][1]).to.equal(data.stylingItems[0].properties[key]);

                                data.stylingItems[0].properties[key] = "change Season";
                                data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change9_' + parseInt(Math.random().toString(9).substring(2, 7));
                                wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(5000);
                                    common.assertResAPI(apiRes, ['clientId', 'importId']);

                                    wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties2) => {
                                        expect(sqlProperties2[9][1]).to.not.equal(data.stylingItems[0].properties[key]);
                                        expect(sqlProperties2[10]).to.not.exist
                                    });
                                    wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sampleSql) => {
                                        expect(sampleSql[0][0]).to.equal(data.stylingItems[0].samples[0].sampleCode)
                                    })
                                });
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_11':
                    {
                        let samplePoolId1;

                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);
                            wardropeRequest.returnSamplePool(data.stylingItems[0].productCode, testClient).then((sqlSamplePool1) => {
                                samplePoolId1 = sqlSamplePool1;
                            })

                            wardropeRequest.importStylingAPI(urlOther2, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient2);

                                wardropeRequest.returnSamplePool(data.stylingItems[0].productCode, otherTestClient2).then((sqlSamplePool2) => {
                                    expect(sqlSamplePool2).to.not.equal(samplePoolId1);
                                })
                            });
                        })
                    }
                    break;

                case 'GW_ImportSI_12':
                    {
                        let key = Object.keys(data.stylingItems[0].samples[0].properties)[0];
                        let samplePropBefore = data.stylingItems[0].samples[0].properties[key];
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_TestImport12_' + parseInt(Math.random().toString(9).substring(2, 7));

                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);

                            wardropeRequest.returnSQLSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode, testClient).then((sqlSamplePro) => {
                                expect(sqlSamplePro[5][1]).to.equal(data.stylingItems[0].samples[0].properties[key]);

                                data.stylingItems[0].samples[0].properties[key] = "zzzxx change comment12b";
                                wardropeRequest.importStylingAPI(urlOther1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                    cy.wait(5000);
                                    common.assertResAPI(apiRes, ['clientId', 'importId']);

                                    wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient1);

                                    wardropeRequest.returnSQLSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode, testClient).then((sqlSamplePro) => {
                                        expect(sqlSamplePro[5][1]).to.equal(samplePropBefore);
                                        expect(sqlSamplePro[5][1]).to.not.equal(data.stylingItems[0].samples[0].properties[key]);

                                        wardropeRequest.returnSamplePool(data.stylingItems[0].productCode, otherTestClient1).then((sqlSamplePool) => {
                                            expect(sqlSamplePool[0]).to.not.exist;
                                        });

                                        wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sqlSampleCode) => {
                                            expect(sqlSampleCode[0]).to.equal(data.stylingItems[0].samples[0].sampleCode);
                                            expect(sqlSampleCode[2]).to.not.exist;
                                        })
                                    });

                                });
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_13':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_TestImport13_' + parseInt(Math.random().toString(9).substring(2, 7));
                        let sampleCodeFirst = data.stylingItems[0].samples[0].sampleCode;
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);

                            data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change13_' + parseInt(Math.random().toString(9).substring(2, 7));
                            wardropeRequest.importStylingAPI(urlOther1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);

                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient1);

                                wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sqlSampleCode) => {
                                    expect(sqlSampleCode[0][0]).to.equal(data.stylingItems[0].samples[0].sampleCode);
                                    expect(sqlSampleCode[1][0]).to.equal(sampleCodeFirst);
                                })
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_14':
                    {

                        productData.products[0].productCode = 'ProdutcCode_GW_ImportSI_14_' + parseInt(Math.random().toString(9).substring(2, 7));
                        productData.products[0].samples[0].sampleCode = 'SampleCode_Product14_' + parseInt(Math.random().toString(9).substring(2, 7));

                        jobRequest.importJobAPI(urlProd, Settings.POST_METHOD, accessToken, productData).then((apiRes) => {

                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(productData.products[0].productCode, jobId, productData);

                            data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change14_' + parseInt(Math.random().toString(9).substring(2, 7));
                            data.stylingItems[0].productCode = productData.products[0].productCode
                            wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);

                                wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sqlSampleCode) => {
                                    expect(sqlSampleCode[0][0]).to.equal(data.stylingItems[0].samples[0].sampleCode);
                                    expect(sqlSampleCode[1][0]).to.equal(productData.products[0].samples[0].sampleCode);
                                })
                            });

                        });
                    }
                    break;

                case 'GW_ImportSI_15':
                    {
                        let samplePoolId1;
                        productData.products[0].productCode = 'ProdutcCode_GW_ImportSI_15_' + parseInt(Math.random().toString(9).substring(2, 7));
                        productData.products[0].samples[0].sampleCode = 'SampleCode_Product15_' + parseInt(Math.random().toString(9).substring(2, 7));

                        jobRequest.importJobAPI(urlProd, Settings.POST_METHOD, accessToken, productData).then((apiRes) => {

                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(productData.products[0].productCode, jobId, productData);

                            productRequest.returnSamplePoolProd(productData.products[0].productCode, testClient).then((sqlSamplePool1) => {
                                samplePoolId1 = sqlSamplePool1;
                            })

                            data.stylingItems[0].samples[0].sampleCode = productData.products[0].samples[0].sampleCode
                            data.stylingItems[0].productCode = productData.products[0].productCode
                            wardropeRequest.importStylingAPI(urlOther2, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient2);

                                wardropeRequest.returnSamplePool(data.stylingItems[0].productCode, otherTestClient2).then((sqlSamplePool2) => {
                                    expect(sqlSamplePool2).to.not.equal(samplePoolId1);
                                })

                                wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sampleSql) => {
                                    expect(sampleSql[0][0]).to.equal(data.stylingItems[0].samples[0].sampleCode);
                                    expect(sampleSql[1][0]).to.equal(productData.products[0].samples[0].sampleCode)
                                })
                            });

                        });
                    }
                    break;

                case 'GW_ImportSI_16':
                    {

                        productData.products[0].productCode = 'ProdutcCode_GW_ImportSI_16_' + parseInt(Math.random().toString(9).substring(2, 7));
                        productData.products[0].samples[0].sampleCode = 'SampleCode_Product16_' + parseInt(Math.random().toString(9).substring(2, 7));

                        jobRequest.importJobAPI(urlProd, Settings.POST_METHOD, accessToken, productData).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(productData.products[0].productCode, jobId, productData);

                            wardropeRequest.returnSQLSample(productData.products[0].productCode).then((sqlSampleCode) => {
                                expect(sqlSampleCode[0]).to.equal(productData.products[0].samples[0].sampleCode);
                            })

                            data.stylingItems[0].samples[0].sampleCode = productData.products[0].samples[0].sampleCode
                            data.stylingItems[0].productCode = productData.products[0].productCode
                            wardropeRequest.importStylingAPI(urlOther1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient1);

                                wardropeRequest.returnSamplePool(data.stylingItems[0].productCode, otherTestClient1).then((sqlSamplePool) => {
                                    expect(sqlSamplePool[0]).to.not.exist;
                                });

                                wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sqlSampleCode) => {
                                    expect(sqlSampleCode[0]).to.equal(productData.products[0].samples[0].sampleCode);
                                    expect(sqlSampleCode[2]).to.not.exist;
                                })

                            });
                        });
                    }
                    break;

                case 'GW_ImportSI_17':
                    {

                        productData.products[0].productCode = 'ProdutcCode_GW_ImportSI_17_' + parseInt(Math.random().toString(9).substring(2, 7));
                        productData.products[0].samples[0].sampleCode = 'SampleCode_Product17_' + parseInt(Math.random().toString(9).substring(2, 7));

                        jobRequest.importJobAPI(urlProd, Settings.POST_METHOD, accessToken, productData).then((apiRes) => {
                            cy.wait(5000);
                            common.assertResAPI(apiRes, ['jobId', 'importId']);
                            productRequest.assertSQLCreateProduct(productData.products[0].productCode, jobId, productData);

                            wardropeRequest.returnSQLSample(productData.products[0].productCode).then((sqlSampleCode) => {
                                expect(sqlSampleCode[0]).to.equal(productData.products[0].samples[0].sampleCode);
                            })

                            data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change17_' + parseInt(Math.random().toString(9).substring(2, 7));
                            data.stylingItems[0].productCode = productData.products[0].productCode
                            wardropeRequest.importStylingAPI(urlOther1, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                                cy.wait(5000);
                                common.assertResAPI(apiRes, ['clientId', 'importId']);
                                wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, otherTestClient1);

                                wardropeRequest.returnSQLSample(data.stylingItems[0].productCode).then((sqlSampleCode) => {
                                    expect(sqlSampleCode[0][0]).to.equal(data.stylingItems[0].samples[0].sampleCode);
                                    expect(sqlSampleCode[1][0]).to.equal(productData.products[0].samples[0].sampleCode);
                                })
                            });
                        });
                    }
                    break;

                case 'GW_ImportSI_18':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                let property = data.stylingItems[0].properties;
                                let arrayProperties = Object.values(property);

                                expect(sqlProperties[4][1]).to.equal(arrayProperties[0]);
                                expect(sqlProperties[5][1]).to.equal(arrayProperties[1]);
                                expect(sqlProperties[10][1]).to.equal(arrayProperties[2]);
                                expect(sqlProperties[12][1]).to.equal(arrayProperties[3]);
                            })

                        });
                    }
                    break;

                case 'GW_ImportSI_19':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                let property = data.stylingItems[0].properties;
                                let arrayProperties = Object.values(property);

                                expect(sqlProperties[4][1]).to.equal(arrayProperties[0]);
                                expect(sqlProperties[9][1]).to.equal("S1");
                                expect(sqlProperties[10][1]).to.equal(arrayProperties[2]);
                                expect(sqlProperties[12][1]).to.equal(arrayProperties[3]);
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_20':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                expect(sqlProperties[4][1]).to.equal("1641124800000");
                                expect(sqlProperties[5][1]).to.equal("1641150615000");
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_21':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change21_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode, testClient).then((sqlProperties) => {
                                let property = data.stylingItems[0].samples[0].properties;
                                let arrayProperties = Object.values(property);

                                expect(sqlProperties[2][1]).to.equal("1636356434000");
                                expect(sqlProperties[3][1]).to.equal("1636356434000");
                                expect(sqlProperties[7][1]).to.equal(arrayProperties[2]);
                                expect(sqlProperties[5][1]).to.equal(arrayProperties[3]);
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_22':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change22_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode, testClient).then((sqlSampleProp) => {
                                let property = data.stylingItems[0].samples[0].properties;
                                let arrayProperties = Object.values(property);

                                expect(sqlSampleProp[1][1]).to.equal(arrayProperties[0]);
                                expect(sqlSampleProp[8][1]).to.equal("Se2");
                                expect(sqlSampleProp[0][1]).to.equal(arrayProperties[2]);
                                expect(sqlSampleProp[2][1]).to.equal(arrayProperties[3]);
                            })
                        });
                    }
                    break;


                case 'GW_ImportSI_23':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change23_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode, testClient).then((sqlSampleProp) => {
                                expect(sqlSampleProp[2][1]).to.equal("1641124800000");
                                expect(sqlSampleProp[3][1]).to.equal("1641150615000");
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_24':
                    //Bug: https://creativeforce-io.atlassian.net/browse/LH-13312
                    {
                        data.stylingItems[0].productCode = 'stylingItem_TestImport_' + parseInt(Math.random().toString(9).substring(2, 9));
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Styling24_' + parseInt(Math.random().toString(9).substring(2, 7));
                        data.stylingItems[1].productCode = data.stylingItems[0].productCode;
                        data.stylingItems[1].samples[0].sampleCode = data.stylingItems[0].samples[0].sampleCode;
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {

                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.assertSQLCreateStyling(data.stylingItems[0].productCode, data, testClient);
                        });
                    }
                    break;

                case 'GW_ImportSI_26':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Change26_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, '');
                        });
                    }
                    break;

                case 'GW_ImportSI_27':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                for (let i = 9; i <= 15; i++) {
                                    if (i != 11) expect(sqlProperties[i][1]).to.equal('1651492800000');
                                    else expect(sqlProperties[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_28':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                for (let i = 9; i <= 15; i++) {
                                    expect(sqlProperties[i][1]).to.equal('1644926400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_29':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                for (let i = 9; i <= 15; i++) {
                                    if (i != 11) expect(sqlProperties[i][1]).to.equal('1651492800000');
                                    else expect(sqlProperties[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_30':
                    {
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLStylingProperties(data.stylingItems[0].productCode, testClient).then((sqlProperties) => {
                                for (let i = 9; i <= 15; i++) {
                                    expect(sqlProperties[i][1]).to.equal('1644926400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_31':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Styling31_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.getSQLDateSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    if (i != 8) expect(sqlQuery[i][1]).to.equal('1651492800000');
                                    else expect(sqlQuery[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_32':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Styling32_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.getSQLDateSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    expect(sqlQuery[i][1]).to.equal('1644926400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_33':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Styling33_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.getSQLDateSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    if (i != 8) expect(sqlQuery[i][1]).to.equal('1651492800000');
                                    else expect(sqlQuery[i][1]).to.equal('1644062400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_34':
                    {
                        data.stylingItems[0].samples[0].sampleCode = 'SampleCode_Styling34_' + parseInt(Math.random().toString(9).substring(2, 7));
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.getSQLDateSamplePropertiesSt(data.stylingItems[0].samples[0].sampleCode).then((sqlQuery) => {
                                for (let i = 6; i <= 12; i++) {
                                    expect(sqlQuery[i][1]).to.equal('1644926400000');
                                }
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_35':
                    {
                        data.stylingItems[0].category = common.random('special,Category_')
                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLProductCategorySt(data.stylingItems[0].productCode).then((sqlQuery) => {
                                expect(sqlQuery).to.equal(data.stylingItems[0].category);
                            })
                        });
                    }
                    break;

                case 'GW_ImportSI_36':
                    {
                        data.stylingItems[0].category = common.random('special;Category_');
                        let category = data.stylingItems[0].category;
                        let cutCategory = category.substring(0, 7) + category.substring(8);

                        wardropeRequest.importStylingAPI(url, Settings.POST_METHOD, accessToken, data).then((apiRes) => {
                            cy.wait(7000);
                            common.assertResAPI(apiRes, ['clientId', 'importId']);
                            wardropeRequest.returnSQLProductCategorySt(data.stylingItems[0].productCode).then((sqlQuery) => {
                                expect(sqlQuery).to.equal(cutCategory);
                            })
                        });
                    }
                    break;

                default:
                    {
                        cy.title("Exception");
                    }
                    break;

            }
        });
    });
});
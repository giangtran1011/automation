import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productRequest.js';
import jobRequest from '../../support/requests/jobRequest.js';
import updateProductByIdData from '../../fixtures/product-data/apiUpdateProductById/updateProductById.json';
import prepareData from '../../fixtures/product-data/apiUpdateProductById/prepareData/prepare.json';
/**
 * Step1 :tạo mới prepare data với productCode được tạo random
 * Step2 : tạo mới job theo với job code, name đc random
 * Step3: gán productcode của prepare data vào requestBody từ case số 2 -> case số 5 ( case 200)
 * để compare việc update của từng field và không thay đổi product code
 */
describe('API - Update Product By Id', () => {
    let accessToken, jobIdTest;
    let urlJob = `${Settings.BASE_URL}/jobs`;
    let urlUpdateProduct = `${Settings.BASE_URL}/products/{productId}`;
    prepareData.job.jobCode = common.random('jobCode');
    prepareData.job.jobName = common.random('jobName');
    let listProduct = [];
    //random productCode data
    for(var i = 0 ; i < prepareData.importProduct.products.length - 1 ; i++) {
        prepareData.importProduct.products[i].productCode = common.random('productCodeInit');
        if(i > 0) {
            updateProductByIdData[i].body.productCode = prepareData.importProduct.products[i].productCode;
        }
    }
    console.log("PrepareData: ", prepareData);
    console.log("Request Body: ", updateProductByIdData);
    before(() => {
        cy.title('Check Authencation');
        console.log("PrepareData", prepareData);
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            cy.title("Init data: Create a job + Import a job");

            jobRequest.createJobAPI(urlJob, Settings.POST_METHOD, accessToken, 
            Settings.CREATE_JOB_STUDIO_CLIENT, 
            prepareData.job.jobCode, prepareData.job.jobName, 
            prepareData.job.deadlineutc, prepareData.job.properties).then((apiRes) => {

                jobIdTest = apiRes.body.jobId;
                let urlListJob = `${Settings.BASE_URL}/jobs/import-async?jobId=${jobIdTest}`;

                console.log("PRODUCTS Test ", prepareData.importProduct);
                jobRequest.importJobAPI(urlListJob, Settings.POST_METHOD, accessToken, prepareData.importProduct).then((apiRes2) => {
                    cy.wait(7000);
                    common.assertResAPI(apiRes2, ['jobId', 'importId']);
                })

                //get productId
                cy.title('INIT Data : Get all product by jobId and productCode');
                for(var i = 0 ; i < prepareData.importProduct.products.length ; i++) {
                    let urlGetTask = `${Settings.BASE_URL}/products?` + productRequest.setUrl(3, jobIdTest, null, prepareData.importProduct.products[i].productCode);
                    productRequest.getProductAPI(urlGetTask, Settings.GET_METHOD, accessToken)
                    .then(res => {
                       listProduct.push(res.body.pageData);
                       // urlUpdateProduct = urlUpdateProduct.replace('{productId}', res.body.pageData[0].productId);
                    });
                }
                cy.log("List product by jobId", listProduct);
               
            });
            
        });
    });
    

    updateProductByIdData.forEach((object, index) => {
        it(object.title, () => {
            if(object.code === 200) {
                object.productId = listProduct[index][0].productId;
            }

            switch(object.code) {
                case 200:
                    productRequest.updateProductAPI(urlUpdateProduct.replace('{productId}', object.productId), accessToken, object.body, Settings.PUT_METHOD).then(response => {
                        expect(response.status).to.eq(object.code);
                        expect(JSON.stringify(response.body)).to.eq(JSON.stringify(object.responseBody));
                        // verify database
                        productRequest.verifyDataUpdateProductById(object.productId, prepareData.importProduct.products[index], updateProductByIdData[index], jobIdTest);
                    });
                    break;
                case 400:
                    //400 - Fail when productId not exist
                    if(object.testCaseKey.includes("400_1")) {
                        productRequest.updateProductAPI(urlUpdateProduct.replace('{productId}', "398a7639-db38-4076-a863-dd0a7"), accessToken, object.body, Settings.PUT_METHOD).then(response => {
                            expect(response.status).to.eq(object.code);
                            expect(JSON.stringify(response.body.errors)).to.eq(JSON.stringify(object.responseBody.errors));
                        });
                    }

                    //400 - Fail when update product not have product code
                    if(object.testCaseKey.includes("400_2")) {
                        productRequest.updateProductAPI(urlUpdateProduct.replace('{productId}', listProduct[5][0].productId), accessToken, object.body, Settings.PUT_METHOD).then(response => {
                            expect(response.status).to.eq(object.code);
                            expect(JSON.stringify(response.body.errors)).to.eq(JSON.stringify(object.responseBody.errors));
                        });
                    }

                    //400 - Fail when update properties not exist
                    if(object.testCaseKey.includes("400_3")) {
                        productRequest.updateProductAPI(urlUpdateProduct.replace('{productId}', listProduct[5][0].productId), accessToken, object.body, Settings.PUT_METHOD).then(response => {
                            expect(response.status).to.eq(object.code);
                            expect(JSON.stringify(response.body.errors)).to.eq(JSON.stringify(object.responseBody.errors));
                        });
                    }

                    //400 - Fail when update properties format invalid
                    if(object.testCaseKey.includes("400_4")) {
                        productRequest.updateProductAPI(urlUpdateProduct.replace('{productId}', listProduct[5][0].productId), accessToken, object.body, Settings.PUT_METHOD).then(response => {
                            expect(response.status).to.eq(object.code);
                            expect(JSON.stringify(response.body.errors)).to.eq(JSON.stringify(object.responseBody.errors));
                        });
                    }
                    
                    break;
                case 405:
                    // productRequest.updateProductAPI(urlUpdateProduct.replace('{productId}',  listProduct[5][0].productId), object.body, Settings.POST_METHOD).then(response => {
                    //     expect(response.status).to.eq(object.code);
                    // });
                    break;
            }
            
        });
    });

});
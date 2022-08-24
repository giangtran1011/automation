import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import prepareAssetData from '../../fixtures/asset/assetPrepareData/inputAssetData.json'
import getAsseData from '../../fixtures/asset/getAssetData.json'
import assetRequest from '../../support/requests/assetRequest.js';

// - Prepare data: Tạo một product product_data_t11 có styleguide gồm 3 positions:
// + Một postion normal
// + Một postion normal (với hero = on)
// + Một postion inclip (GHOST MANNEQUIN)
// - Patse productId vào file json 
// - Before running, please reset products: product_data_t11

describe('Get asset', () => {

    let accessToken = '';
    let taskId, sampleId, urlGetAsset;
    let requestArr = [];
    let urlPostPresignUrl = `${Settings.BASE_URL}/assets/get-presigned-url`;
    let folderPathOutput = 'cypress/fixtures/asset/assetPrepareData/outputData/';
    var ingnoreFieldLst = "assetId,fullResPreviewUrl,smallThumbnailUrl,smallThumbnailX2Url,mediumThumbnailUrl,mediumThumbnailX2Url,previewUrl,previewX2Url,fileId,fileUrl";


    before(() => {
        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${prepareAssetData.product}&ProductionTypeId=1`;

            captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, prepareAssetData.getUrlData).then((returnPresignUrl) => {
                returnPresignUrl.body.files.forEach((file, index) => {
                    let presignUrl = file.presignedUrl;

                    captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, prepareAssetData.picture);
                    if (index != 4) {
                        prepareAssetData.submitTaskData.assets[index].assetId = file.tempAssetId;
                    } else {
                        prepareAssetData.submitTaskData.assets[0].resourceAssets[0].assetId = file.tempAssetId;
                    }
                    //*** */
                    var obj = { "assetId": file.tempAssetId, "fileId": file.tempFileId }
                    requestArr.push(obj);
                    cy.log(requestArr);

                })
                cy.wait(15000);
                captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                    .then((returnTask) => {
                        taskId = returnTask.body.tasks[0].taskId;
                        sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                        let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                        captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                            let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                            let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                            let positionId3 = returnPositions.body.styleGuide.positions[2].positionId;
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            prepareAssetData.submitTaskData.taskId = taskId;
                            prepareAssetData.submitTaskData.sampleId = sampleId;

                            prepareAssetData.submitTaskData.assets[0].positionId = positionId1;
                            prepareAssetData.submitTaskData.assets[1].positionId = positionId2;
                            prepareAssetData.submitTaskData.assets[2].positionId = positionId3;
                            prepareAssetData.submitTaskData.assets[3].positionId = positionId3;

                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, prepareAssetData.submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(1);
                                    expect(response.body.message).to.eq('Success');
                                    expect(response.status).to.eq(200);

                                })
                        })
                    })

            })
        })
    })

    getAsseData.forEach(({
        title,
        endpoint,
        indexAsset,
        code,
        responseBody
    }) => {
        it(title, () => {
            urlGetAsset = `${Settings.BASE_URL}/assets?${endpoint}`;
            switch (code) {

                case 200:
                    let responseArr = [];
                    assetRequest.getAssetList(urlGetAsset, Settings.GET_METHOD, accessToken).then((apiRes) => {
                        expect(apiRes.status).to.eq(code);
                        for (let i = 0; i < apiRes.body.pageData.length; i++) {
                            var obj = { "assetId": apiRes.body.pageData[i].assetId, "fileId": apiRes.body.pageData[i].fileId }
                            responseArr.push(obj);
                        }

                        cy.log(responseArr);
                        cy.readFile(folderPathOutput + responseBody).then(jsonFileData => {
                            common.compareObject(jsonFileData, apiRes.body, ingnoreFieldLst);

                            let different = getDifference(requestArr, responseArr);
                            expect(different.length).to.eq(requestArr.length - jsonFileData.pageData.length);
                        })
                        if (indexAsset != "") {
                            expect(requestArr[indexAsset].assetId).to.eq(apiRes.body.pageData[0].assetId);
                        }
                    })
                    break;


                case 400:
                    assetRequest.getAssetList(urlGetAsset, Settings.GET_METHOD, accessToken).then((apiRes) => {
                        cy.readFile(folderPathOutput + responseBody).then(jsonFileData => {
                            expect(apiRes.status).to.eq(code);
                            common.compareObject(jsonFileData, apiRes.body, "requestId");
                        })
                    })
                    break;

                case 404:
                    assetRequest.getAssetList(urlGetAsset, Settings.GET_METHOD, accessToken).then((apiRes) => {
                        expect(apiRes.status).to.eq(code);
                        expect(apiRes.body).to.eq("");

                    })
                    break;

                default:
                    {
                        cy.log("Exception")
                    }
            }

        });
    });
});

function getDifference(array1, array2) {
    return array1.filter(object1 => {
        return !array2.some(object2 => {
            return object1.assetId === object2.assetId;
        });
    });
}
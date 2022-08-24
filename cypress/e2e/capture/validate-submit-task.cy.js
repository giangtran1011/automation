import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import validateData from '../../fixtures/capture-data/validate-submit-task-data.json'

//Before running, please reset 4 products: 

describe('Capture task', () => {

    let accessToken = '';
    let taskId, sampleId, positionId;
    let urlPostPresignUrl = `${Settings.BASE_URL}/assets/get-presigned-url`;

    before(() => {
        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        })
    });
    validateData.forEach(({
        title,
        type,
        product,
        picture,
        getUrlData,
        submitTaskData,
        code
    }) => {
        it(title, () => {
            switch (type) {
                case 'Unsuccess - fields':
                    {
                        cy.title(title);
                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;

                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                        .then((response) => {
                            expect(response.body.statusCode).to.eq(code);
                            expect(response.status).to.eq(400);
                        })
                    }
                    break;

                case 'Unsuccess - 400':
                    {
                        cy.title(title);
                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;

                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                        .then((response) => {
                            expect(response.body.status).to.eq(code);
                            expect(response.status).to.eq(400);
                        })
                    }
                    break;


                case 'Unsuccess - mismatch1':
                    {
                        cy.title(title);
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(10000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(code);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Unsuccess - mismatch2':
                    {
                        cy.title(title);
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(10000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(code);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Success - DB':
                    {

                        cy.title(title);
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(10000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(1);
                                                expect(response.body.message).to.eq('Success');
                                                expect(response.status).to.eq(200);

                                                captureRequest.checkSQLAssetsProps(taskId, returnPositions.body.selectionTypeId).then((returnRating) => {
                                                    const assetDatas = JSON.parse(returnRating);
                                                    const assetsCount = assetDatas.Assets.length;
                                                    expect(assetsCount).to.eq(submitTaskData.assets.length);

                                                    for (let assetIndex in assetDatas.Assets) {
                                                        const currentAsset = assetDatas.Assets[assetIndex];
                                                        const currentAssetIndex = currentAsset.Index;
                                                        const assetInput = submitTaskData.assets[currentAssetIndex];

                                                        expect(currentAsset.Rating).to.eq(assetInput.rating);
                                                        expect(currentAsset.PositionId).to.eq(assetInput.positionId);
                                                        expect(currentAsset.Attr).to.eq(assetInput.attr);
                                                    }
                                                })
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Success - No DB':
                    {
                        cy.title(title);
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(10000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(1);
                                                expect(response.body.message).to.eq('Success');
                                                expect(response.status).to.eq(200);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Unsuccess - fullStep':
                    {
                        cy.title(title);
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(10000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(code);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }


                case 'Success - rate':
                    {
                        cy.title(title);
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(5000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(code);
                                                expect(response.body.message).to.eq('Success');
                                                expect(response.status).to.eq(200);
                                            })
                                        captureRequest.checkSQLAssetsProps(taskId, returnPositions.body.selectionTypeId).then((returnRating) => {
                                            const assetDatas = JSON.parse(returnRating);
                                            expect(assetDatas.Assets[0].Rating).to.eq(0);
                                        })
                                    })
                                })
                        });
                    }
                    break;

                case 'Unsuccess - validate':
                    {
                        cy.title(title);
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(10000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;
                                    submitTaskData.taskId = taskId;
                                    submitTaskData.sampleId = sampleId;
                                    let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;

                                    captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                        .then((response) => {
                                            expect(response.body.statusCode).to.eq(code);
                                            expect(response.status).to.eq(400);
                                        })
                                })
                        });
                    }
                    break;

                default:
                    {
                        cy.log(title)
                    }

            }
        });


    });
});
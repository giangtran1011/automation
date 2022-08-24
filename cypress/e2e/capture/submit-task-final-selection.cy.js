import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import finalSelectionData from '../../fixtures/capture-data/finalSelectionData.json'
import colorRefAssetData from '../../fixtures/capture-data/manyColorRef.json'

//Prepare data:
//Trước khi run, vào client Capture API-> vào tất cả các job -> reset lại product (trừ các case disable và done)

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
    finalSelectionData.forEach(({
        title,
        product,
        picture,
        getUrlData,
        submitTaskData
    }) => {
        it(title, () => {
            switch (title) {

                case 'Case 29: Submit task with 1 inclip asset':
                    {
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
                                                //expect(response.body.statusCode).to.eq(105);
                                                expect(response.body.statusCode).to.eq(104);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 30: Submit task with 1 normal asset':
                    {
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

                case 'Case 31: Submit task with 2 normal asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(12000);

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
                                                expect(response.body.statusCode).to.eq(104);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 32: Submit task with normal + alternative asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(12000);

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
                                                expect(response.body.statusCode).to.eq(407);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 33: Submit task with 1 normal and 3 inclip in a position':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(25000);

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
                                                expect(response.body.statusCode).to.eq(403);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 34: Submit task with 2 normal and 1 alternative inclip in position2':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(20000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[1].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(406);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 34b: position 2 can not push inclip picture':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(39000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(412);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 34c: Can not push non-selection picture':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(35000);

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
                                                expect(response.body.statusCode).to.eq(410);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 34d: Attr only receive value in EnumAssetAttribute':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(30000);

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
                                                expect(response.body.statusCode).to.eq(410);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 34e: PositionId = 0':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(20000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;
                                    submitTaskData.taskId = taskId;
                                    submitTaskData.sampleId = sampleId;
                                    let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;

                                    captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                        .then((response) => {
                                            expect(response.body.statusCode).to.eq(411);
                                            expect(response.status).to.eq(400);
                                        })
                                })
                        });
                    }
                    break;


                case 'Case 35a + case 36: submit task and duplicate with same assetId':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(45000);
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

                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;
                                        submitTaskData.assets[5].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(1);
                                                expect(response.body.message).to.eq('Success');
                                                expect(response.status).to.eq(200);
                                            })
                                    })
                                })

                            urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${finalSelectionData[8].product}&ProductionTypeId=1`;
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

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(24);
                                                expect(response.status).to.eq(400);

                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 35b: submit task and duplicate with new assetId':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(55000);
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

                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;
                                        submitTaskData.assets[5].positionId = positionId2;


                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(152);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 37: 404 Error':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(50000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[1].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(404);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 38: 403 Error':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(50000);

                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[1].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;
                                        submitTaskData.assets[5].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(403);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 39: Submit task with resource asset A':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);

                                submitTaskData.assets[index].assetId = file.tempAssetId;

                            })
                            submitTaskData.assets[2].resourceAssets[0].assetId = returnPresignUrl.body.files[0].tempAssetId;

                            cy.wait(50000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;

                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(103);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 40: Submit task with duplicate resource asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                if (index != 5) {
                                    submitTaskData.assets[index].assetId = file.tempAssetId;
                                } else {
                                    submitTaskData.assets[2].resourceAssets[0].assetId = file.tempAssetId;
                                    submitTaskData.assets[3].resourceAssets[0].assetId = file.tempAssetId;
                                }
                            })
                            cy.wait(50000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;

                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(103);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 41: Submit task with position 3':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(60000);

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

                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId3 = returnPositions.body.styleGuide.positions[2].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId3;
                                        submitTaskData.assets[3].positionId = positionId3;
                                        submitTaskData.assets[4].positionId = positionId3;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(402);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 42: submit task with color ref':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(45000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })
                                    })
                                })
                            getUrlData.physicalFileTypeId = 3;
                            captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                                returnPresignUrl.body.files.forEach((file, index) => {
                                    let presignUrl = file.presignedUrl;
                                    captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                    submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                })
                            });
                            cy.wait(12000);

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(122);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 43: Submit task with 20 resource asset of 1 asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                if (index == 0 || index == 1) {
                                    submitTaskData.assets[index].assetId = file.tempAssetId;
                                } else {
                                    for (let i = 0; i <= (index - 2); i++)
                                        submitTaskData.assets[0].resourceAssets[(index - 2)].assetId = file.tempAssetId;
                                }
                            })
                            cy.wait(135000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;

                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
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
                                                    expect(assetsCount).to.eq(22);

                                                    let resourceAssetIds = assetDatas.Assets.reduce((arr, item) => {
                                                        if (item.ResourceAssetIds) {
                                                            arr = arr.concat(item.ResourceAssetIds)
                                                        }
                                                        return arr;
                                                    }, []);

                                                    let mainAssetIndex = 0;
                                                    for (let asset of assetDatas.Assets) {
                                                        if (!resourceAssetIds.some(i => i == asset.AssetId)) {
                                                            const assetInput = submitTaskData.assets[mainAssetIndex];

                                                            expect(asset.Rating).to.eq(assetInput.rating);
                                                            expect(asset.PositionId).to.eq(assetInput.positionId);
                                                            expect(asset.Attr).to.eq(assetInput.attr);
                                                            mainAssetIndex++;
                                                        }

                                                    }
                                                    expect(assetDatas.Assets[0].ResourceAssetIds.length).to.eq(20);

                                                })
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 44: Submit task with 21 resource asset of 1 asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                if (index == 0 || index == 1) {
                                    submitTaskData.assets[index].assetId = file.tempAssetId;
                                } else {
                                    for (let i = 0; i <= (index - 2); i++)
                                        submitTaskData.assets[0].resourceAssets[(index - 2)].assetId = file.tempAssetId;
                                }
                            })
                            cy.wait(135000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;

                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(125);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 45: Submit task with disable productType':
                    {
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(20000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = Settings.TaskId45;
                            submitTaskData.sampleId = Settings.SampleId45;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(320);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 46: Submit task with inactive product':
                    {
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(20000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = Settings.TaskId46;
                            submitTaskData.sampleId = Settings.SampleId46;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(301);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 47: Shooting type is uncheck':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(50000);

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

                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId2 = returnPositions.body.styleGuide.positions[1].positionId;
                                        submitTaskData.assets[0].positionId = positionId1;
                                        submitTaskData.assets[1].positionId = positionId1;
                                        submitTaskData.assets[2].positionId = positionId2;
                                        submitTaskData.assets[3].positionId = positionId2;
                                        submitTaskData.assets[4].positionId = positionId2;

                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(402);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 49: Require color ref = true':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(20000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        });

                                        let colorRefs = [];
                                        let countColorRef = 0;
                                        getUrlData.physicalFileTypeId = 3;
                                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                                            returnPresignUrl.body.files.forEach((file, index) => {
                                                let presignUrl = file.presignedUrl;
                                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                                submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                                colorRefs.push(file.tempFileId);
                                                countColorRef++;
                                            });
                                            cy.wait(12000);

                                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
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
                                                    });

                                                    captureRequest.checkSqlColorRef(colorRefs).then((count) => {
                                                        expect(count).to.eq(countColorRef);
                                                    });
                                                })
                                        });

                                    })
                                })

                        });
                    }
                    break;

                case 'Case 50: Missing color ref':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(20000);

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
                                                expect(response.body.statusCode).to.eq(121);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 51: Unsuccessful - 11 color reference fields':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(20000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })
                                    })
                                })


                            captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, colorRefAssetData[1]).then((returnPresignUrl) => {
                                returnPresignUrl.body.files.forEach((file, index) => {
                                    let presignUrl = file.presignedUrl;
                                    captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                    submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                })
                            });
                            cy.wait(80000);


                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(126);
                                    expect(response.status).to.eq(400);
                                })

                        });
                    }
                    break;

                case 'Case 51a: Successful - 10 color reference fields':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(25000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        });

                                        let colorRefs = [];
                                        let countColorRef = 0;
                                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, colorRefAssetData[0]).then((returnPresignUrl) => {
                                            returnPresignUrl.body.files.forEach((file, index) => {
                                                let presignUrl = file.presignedUrl;
                                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                                submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                                colorRefs.push(file.tempFileId);
                                                countColorRef++;
                                            });
                                            cy.wait(100000);
                                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
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
                                                    });

                                                    captureRequest.checkSqlColorRef(colorRefs).then((count) => {
                                                        expect(count).to.eq(countColorRef);
                                                    });
                                                })
                                        });

                                    })
                                })
                        });
                    }
                    break;

                case 'Case 52: Imported color ref before':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(20000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        let colorRefs = [];
                                        let countColorRef = 0;
                                        getUrlData.physicalFileTypeId = 3;
                                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                                            returnPresignUrl.body.files.forEach((file, index) => {
                                                let presignUrl = file.presignedUrl;
                                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                                submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                                colorRefs.push(file.tempFileId);
                                                countColorRef++;
                                            });

                                            cy.wait(20000);
                                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
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
                                                    });

                                                    captureRequest.checkSqlColorRef(colorRefs).then((count) => {
                                                        expect(count).to.eq(countColorRef);
                                                    });
                                                })
                                        });

                                    })
                                })
                        });
                    }
                    break;

                case 'Case 53: Require ALT = false, 1 normal':
                    {
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
                                                expect(response.body.statusCode).to.eq(403);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 54: Require ALT = false, 2 normal':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(20000);

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

                case 'Case 55: Missing assetId':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                        .then((returnTask) => {
                            taskId = returnTask.body.tasks[0].taskId;
                            sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = taskId;
                            submitTaskData.sampleId = sampleId;

                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(105);
                                    expect(response.status).to.eq(400);
                                })
                        })
                    }
                    break;

                case 'Case 56: 2 normal + 1 alternative':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(30000);

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
                                                expect(response.body.statusCode).to.eq(405);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 57: 3 normal for first productionType':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(45000);

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

                case 'Case 58: On model - 1 normal asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(15000);

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

                case 'Case 58b: On model - 1 normal asset, 1 color ref':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(15000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })
                                    })
                                })
                            getUrlData.physicalFileTypeId = 3;
                            captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                                returnPresignUrl.body.files.forEach((file, index) => {
                                    let presignUrl = file.presignedUrl;
                                    captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                    submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                })
                            });
                            cy.wait(10000);

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(122);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 59: Mannequin - 1 normal asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=2`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(15000);

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
                                                expect(response.body.statusCode).to.eq(121);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 60: Mannequin - Require color ref = true':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=2`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(15000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })

                                        getUrlData.physicalFileTypeId = 3;
                                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                                            returnPresignUrl.body.files.forEach((file, index) => {
                                                let presignUrl = file.presignedUrl;
                                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                                submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                            })
                                        });
                                        cy.wait(10000);

                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
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

                case 'Case 61: Successful - no color ref':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(15000);

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

                case 'Case 62: Error 122 - have 1 color ref':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(15000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        positionId = returnPositions.body.styleGuide.positions[0].positionId;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })
                                    })
                                })
                            getUrlData.physicalFileTypeId = 3;
                            captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                                returnPresignUrl.body.files.forEach((file, index) => {
                                    let presignUrl = file.presignedUrl;
                                    captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                    submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                })
                            });
                            cy.wait(15000);

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(122);
                                    expect(response.status).to.eq(400);
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
import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import postPresignUrl from '../../fixtures/capture-data/postPresignUrl.json'
import colorRefAssetData from '../../fixtures/capture-data/manyColorRef.json'


//Before running, please reset all products (except case 12, 14)

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
    postPresignUrl.forEach(({
        title,
        product,
        picture,
        getUrlData,
        submitTaskData
    }) => {
        it(title, () => {
            switch (title) {

                case 'Case 1: Submit task with 3 normal asset':
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

                case 'Case 2: Submit task with 1 inclip asset':
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
                                                expect(response.body.statusCode).to.eq(406);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 3: Submit task with inclip +alternative + Non-selected':
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
                                                expect(response.body.statusCode).to.eq(105);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;


                case 'Case 4a + case 5: submit task successfully and duplicate':
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

                            urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${postPresignUrl[5].product}&ProductionTypeId=1`;
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
                                                expect(response.body.statusCode).to.eq(24);
                                                expect(response.status).to.eq(400);

                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 4b: submit task with used assetId':
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
                                                expect(response.body.statusCode).to.eq(154);
                                                expect(response.body.message).to.eq("");
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 6: Submit task with normal + alternative asset':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(14000);
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
                                                expect(response.body.statusCode).to.eq(105);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 7: Submit task with normal asset and color reference':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(14000);
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
                            cy.wait(25000);

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(122);
                                    expect(response.status).to.eq(400);
                                })

                        });
                    }
                    break;

                case 'Case 8: Submit task with duplicate resource asset':
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
                            cy.wait(40000);
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

                case 'Case 9: Submit task with invalid condition of position 3':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(40000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;

                                    let urlGetTaskDetail = `${Settings.BASE_URL}/capture/tasks/${taskId}`;
                                    captureRequest.getTaskDetail(urlGetTaskDetail, Settings.GET_METHOD, accessToken).then((returnPositions) => {
                                        let positionId1 = returnPositions.body.styleGuide.positions[0].positionId;
                                        let positionId3 = returnPositions.body.styleGuide.positions[2].positionId;
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;

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


                case 'Case 9b: PositionId = 0':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })
                            cy.wait(14000);
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

                case 'Case 10: Submit task with 20 resource asset of 1 asset':
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

                case 'Case 11: Submit task with 21 resource asset of 1 asset':
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

                case 'Case 12: Submit task with 2 normal if productionType is disable':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(15000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = Settings.TaskId12;
                            submitTaskData.sampleId = Settings.SampleId12;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(320);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 14: Submit task with 2 normal if productionType is inactive':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(15000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = Settings.TaskId14;
                            submitTaskData.sampleId = Settings.SampleId14;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(301);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 15: Successful - Require color reference = True':
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
                                            cy.wait(6000);
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

                case 'Case 16: Require color reference = True - Missing file color reference':
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
                                                expect(response.body.statusCode).to.eq(121);
                                                expect(response.status).to.eq(400);
                                            })
                                    })
                                })
                        });
                    }
                    break;

                case 'Case 17: Unsuccessful - 11 color reference fields':
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


                            captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, colorRefAssetData[1]).then((returnPresignUrl) => {
                                returnPresignUrl.body.files.forEach((file, index) => {
                                    let presignUrl = file.presignedUrl;
                                    captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                    submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                })
                            });
                            cy.wait(65000);


                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(126);
                                    expect(response.status).to.eq(400);
                                })

                        });
                    }
                    break;


                case 'Case 17a: Successful - 10 color reference fields':
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
                                        let colorRefs = [];
                                        let countColorRef = 0;
                                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, colorRefAssetData[0]).then((returnPresignUrl) => {
                                            returnPresignUrl.body.files.forEach((file, index) => {
                                                let presignUrl = file.presignedUrl;
                                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                                submitTaskData.colorReferences[index].fileId = file.tempFileId;
                                                colorRefs.push(file.tempFileId);
                                                countColorRef++;
                                            })

                                            cy.wait(70000);
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

                case 'Case 18: Imported color ref before':
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
                                            cy.wait(15000);
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

                case 'Case 19a + case 20: pre-selection - submit task and duplicate with same assetId':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;
                        let assetsList = [];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                                assetsList.push(file.tempAssetId);
                            })
                            cy.wait(14000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;
                                    let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                    submitTaskData.taskId = taskId;
                                    submitTaskData.sampleId = sampleId;

                                    captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                        .then((response) => {
                                            expect(response.body.statusCode).to.eq(1);
                                            expect(response.body.message).to.eq('Success');
                                            expect(response.status).to.eq(200);

                                            captureRequest.checkSqlRating(assetsList).then((returnRating) => {
                                                for (let i = 0; i < submitTaskData.assets.length; i++) {
                                                    expect(parseInt(returnRating[i])).to.eq(submitTaskData.assets[i].rating);
                                                }
                                            });
                                        })
                                })
                        });
                    }
                    break;

                case 'Case 19b: pre-selection - submit task and duplicate with new assetId':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;
                        let assetsList = [];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                                assetsList.push(file.tempAssetId);
                            })
                            cy.wait(15000);
                            captureRequest.searchTask(urlSearchTask, Settings.GET_METHOD, accessToken)
                                .then((returnTask) => {
                                    taskId = returnTask.body.tasks[0].taskId;
                                    sampleId = returnTask.body.tasks[0].samples[0].sampleId;
                                    let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                    submitTaskData.taskId = taskId;
                                    submitTaskData.sampleId = sampleId;

                                    captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                        .then((response) => {
                                            expect(response.body.statusCode).to.eq(1);
                                            expect(response.body.message).to.eq('Success');
                                            expect(response.status).to.eq(200);

                                            captureRequest.checkSqlRating(assetsList).then((returnRating) => {
                                                for (let i = 0; i < submitTaskData.assets.length; i++) {
                                                    expect(parseInt(returnRating[i])).to.eq(submitTaskData.assets[i].rating);
                                                }
                                            });
                                        })
                                })
                        });
                    }
                    break;

                case 'Case 21: pre-selection - submit task with inclip +alternative + Non-selected':
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

                                    let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                    submitTaskData.taskId = taskId;
                                    submitTaskData.sampleId = sampleId;

                                    captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                        .then((response) => {
                                            expect(response.body.statusCode).to.eq(105);
                                            expect(response.status).to.eq(400);
                                        })
                                })
                        });
                    }
                    break;

                case 'Case 22: pre-selection - submit task with color ref':
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
                            cy.wait(45000);

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(122);
                                    expect(response.status).to.eq(400);
                                })

                        });
                    }
                    break;

                case 'Case 23: pre-selection - submit task with disable prodductType':
                    {
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(10000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = Settings.TaskId23;
                            submitTaskData.sampleId = Settings.SampleId23;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(320);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;


                case 'Case 24: pre-selection - submit task with inactive prodduct':
                    {
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                            })

                            cy.wait(10000);
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            submitTaskData.taskId = Settings.TaskId24;
                            submitTaskData.sampleId = Settings.SampleId24;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(301);
                                    expect(response.status).to.eq(400);
                                })
                        });
                    }
                    break;

                case 'Case 25: pre-selection - successful - submit task with require color reference = True':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;
                        let assetsList = [];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                                assetsList.push(file.tempAssetId);
                            })

                            cy.wait(10000);
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
                                cy.wait(10000);
                                let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                    .then((response) => {
                                        expect(response.body.statusCode).to.eq(1);
                                        expect(response.body.message).to.eq('Success');
                                        expect(response.status).to.eq(200);

                                        captureRequest.checkSqlRating(assetsList).then((returnRating) => {
                                            for (let i = 0; i < submitTaskData.assets.length; i++) {
                                                expect(parseInt(returnRating[i])).to.eq(submitTaskData.assets[i].rating);
                                            }
                                        });

                                        captureRequest.checkSqlColorRef(colorRefs).then((count) => {
                                            expect(count).to.eq(countColorRef);
                                        });
                                    })
                            });
                        });
                    }
                    break;

                case 'Case 26: pre-selection - successful - submit task with missing color reference':
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
                                        submitTaskData.taskId = taskId;
                                        submitTaskData.sampleId = sampleId;
                                        submitTaskData.assets.forEach((asset) => {
                                            asset.positionId = positionId;
                                        })
                                    })
                                })
                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(121);
                                    expect(response.status).to.eq(400);
                                })

                        });
                    }
                    break;

                case 'Case 27a: pre-selection- Successful - 10 color reference fields':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;
                        let assetsList = [];

                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                                assetsList.push(file.tempAssetId);
                            })

                            cy.wait(10000);
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

                                cy.wait(60000);
                                let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                    .then((response) => {
                                        expect(response.body.statusCode).to.eq(1);
                                        expect(response.body.message).to.eq('Success');
                                        expect(response.status).to.eq(200);

                                        captureRequest.checkSqlRating(assetsList).then((returnRating) => {
                                            for (let i = 0; i < submitTaskData.assets.length; i++) {
                                                expect(parseInt(returnRating[i])).to.eq(submitTaskData.assets[i].rating);
                                            }
                                        });

                                        captureRequest.checkSqlColorRef(colorRefs).then((count) => {
                                            expect(count).to.eq(countColorRef);
                                        });
                                    })

                            });

                        });
                    }
                    break;

                case 'Case 27: pre-selection - 11 color reference fields':
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
                                        positionId = returnPositions.body.styleGuide.positions[1].positionId;
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
                            cy.wait(70000);

                            let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                            captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                .then((response) => {
                                    expect(response.body.statusCode).to.eq(126);
                                    expect(response.status).to.eq(400);
                                })

                        });
                    }
                    break;

                case 'Case 28: pre-selection - Imported color ref before':
                    {
                        let urlSearchTask = `${Settings.BASE_URL}/capture/tasks?barcode=${product}&ProductionTypeId=1`;
                        let assetsList = [];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((returnPresignUrl) => {
                            returnPresignUrl.body.files.forEach((file, index) => {
                                let presignUrl = file.presignedUrl;
                                captureRequest.putPresignedUrl(presignUrl, Settings.PUT_METHOD, picture);
                                submitTaskData.assets[index].assetId = file.tempAssetId;
                                assetsList.push(file.tempAssetId);
                            })
                            cy.wait(10000);
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
                                            })
                                        });
                                        cy.wait(10000);
                                        let urlSubmitTask = `${Settings.BASE_URL}/capture/tasks/submit-assets`;
                                        captureRequest.submitTask(urlSubmitTask, Settings.POST_METHOD, accessToken, submitTaskData)
                                            .then((response) => {
                                                expect(response.body.statusCode).to.eq(1);
                                                expect(response.body.message).to.eq('Success');
                                                expect(response.status).to.eq(200);

                                                captureRequest.checkSqlRating(assetsList).then((returnRating) => {
                                                    for (let i = 0; i < submitTaskData.assets.length; i++) {
                                                        expect(parseInt(returnRating[i])).to.eq(submitTaskData.assets[i].rating);
                                                    }
                                                });

                                                captureRequest.checkSqlColorRef(colorRefs).then((count) => {
                                                    expect(count).to.eq(countColorRef);
                                                });
                                            })
                                    })
                                })

                        });
                    }
                    break;


                default:
                    {
                        cy.log("Exception")
                    }

            }
        });


    });
});
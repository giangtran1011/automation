import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import getTaskDetail from '../../fixtures/capture-data/getTaskDetail.json'

describe('Get Task Detail', () => {
    let accessToken = '';
    let url = `${Settings.BASE_URL}/capture/tasks/taskId`;
    url.repla
    before(() => {
        cy.title("Check authencation");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        })
    });

    getTaskDetail.forEach((object) => {
        it(object.title, () => {
            switch (object.code) {
                case 200:
                    cy.title(object.title);
                    captureRequest.getTaskDetail(url.replace('taskId', '0cda618b-56d4-4909-bfbd-21e91f1228e8'), Settings.GET_METHOD, accessToken).then(response => {
                        expect(response.status).to.eq(200);
                        expect(JSON.stringify(response.body)).to.eq(JSON.stringify(object.data))

                    })
                    break;

                case 405:
                    cy.title(object.title);
                    captureRequest.getTaskDetail(url.replace('taskId', '0cda618b-56d4-4909-bfbd-21e91f1228e8'), Settings.POST_METHOD, accessToken).then(response => {
                        expect(response.status).to.eq(405);

                    })
                    break;

                case 404:
                    cy.title(object.title);
                    captureRequest.getTaskDetail(url.replace('taskId', ''), Settings.GET_METHOD, accessToken).then(response => {
                        expect(response.status).to.eq(404);

                    })
                    break;

                case 400:
                    cy.title(object.title);
                    if (object.numberCase.includes('400_1')) {
                        captureRequest.getTaskDetail(url.replace('taskId', '618b-56d4-4909-bfbd-21e91'), Settings.GET_METHOD, accessToken).then(response => {
                            expectBodyCase400(response, object);
                        });

                    }

                    if (object.numberCase.includes('400_2')) {
                        captureRequest.getTaskDetail(url.replace('taskId', '123'), Settings.GET_METHOD, accessToken).then(response => {
                            expectBodyCase400(response, object);
                        });

                    }

                    if (object.numberCase.includes('400_3')) {
                        captureRequest.getTaskDetail(url.replace('taskId', '12.3'), Settings.GET_METHOD, accessToken).then(response => {
                            expect(response.status).to.eq(400);
                            expectBodyCase400(response, object);
                        });
                    }

                    if (object.numberCase.includes('400_4')) {
                        captureRequest.getTaskDetail(url.replace('taskId', 'ttt'), Settings.GET_METHOD, accessToken).then(response => {
                            expect(response.status).to.eq(400);
                            expectBodyCase400(response, object);
                        });
                    }

                    if (object.numberCase.includes('400_5')) {
                        captureRequest.getTaskDetail(url.replace('taskId', '""'), Settings.GET_METHOD, accessToken).then(response => {
                            expect(response.status).to.eq(400);
                            expectBodyCase400(response, object);
                        });
                    }
                    if (object.numberCase.includes('400_6')) {
                        captureRequest.getTaskDetail(url.replace('taskId', '62BC46F7-9AC4-41E4-A1AF-0176B6C60E44'), Settings.GET_METHOD, accessToken).then(response => {
                            expect(response.status).to.eq(400);
                        });
                    }

                    if (object.numberCase.includes('400_7')) {
                        captureRequest.getTaskDetail(url.replace('taskId', '475b5bf8-4b14-450e-ad3c-bf440bd19353'), Settings.GET_METHOD, accessToken).then(response => {
                            expect(response.status).to.eq(400);
                        });
                    }
                    break;
            }
        });
    });

});

function expectBodyCase400(response, object) {
    expect(response.status).to.eq(400);
    if (object.data) {
        let responseJson = (response.body);
        expect(responseJson.errors.taskId[0]).to.eq(object.data.errors['taskId'][0])
        expect(responseJson.type).to.eq(object.data.type)
        expect(responseJson.title).to.eq(object.data.title)
        expect(responseJson.status).to.eq(object.data.status)
    }
};
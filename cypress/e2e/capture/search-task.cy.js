import common from "../../support/utils/common";
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import searchTaskPrepareData from '../../fixtures/capture-data/searchTaskPreData.json'

describe('GET - API Search Task', () => {
    let accessToken = '';
    let url = `${Settings.BASE_URL}/capture/tasks?barcode={param}`;
    url.repla
    before(() => {
        cy.title("Check authencation");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        })
    });

    searchTaskPrepareData.forEach((object) => {
        it(object.title, () => {
            switch (object.code) {
                case 200:
                    captureRequest.searchTask(url.replace('{param}', object.param), Settings.GET_METHOD, accessToken).then(response =>{
                        expect(object.code).to.eq(200);
                        expect(JSON.stringify(object.data)).to.eq(JSON.stringify(response.body));
                    });
                    break;

                case 400:
                        captureRequest.searchTask(url.replace('{param}', object.param), Settings.GET_METHOD, accessToken).then(response =>{
                            expect(object.code).to.eq(400);
                        });
                        break;
                case 405:
                    captureRequest.searchTask(url.replace('{param}', object.param), Settings.POST_METHOD, accessToken).then(response =>{
                        expect(object.code).to.eq(405);
                    });
                    break;
            
                default:
                    break;
            }
        });
    });

});
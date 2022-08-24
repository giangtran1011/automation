import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import prepareData from '../../fixtures/workflow-data/getSettingOptionData.json';
import workflowRequest from '../../support/requests/workFlowRequest.js';

let urlSettingOption = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.GET_SETTING_OPTION;
let ACCESS_TOKEN = '';
let ACCESS_TOKEN_2 = '';
describe('Login with user full permission', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_1, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN);
        })
    });
});

describe('Login with user not full permission', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_2, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_2 = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_2);
        })
    });
});
describe('API - Get list style guide', () => {
    prepareData.forEach(object => {
        it(object.title, () => {
            if(object.token === '{access_token1}') {
                object.token = ACCESS_TOKEN;
            }else if(object.token === '{access_token2}'){
                object.token = ACCESS_TOKEN_2;
            }
            workflowRequest.getSettingOption(urlSettingOption, Settings.GET_METHOD, object.param, object.token).then(res => {
                expect(res.status).to.eq(object.code);
                compareObject(object.responseBody, res.body);

            });
        });
    })
});

function compareObject(responseMockData, responseAPI) {
    expect(responseAPI.metadata.code).to.eq(responseMockData.metadata.code);
    expect(responseAPI.metadata.message).to.eq(responseMockData.metadata.message);
    if (responseMockData.data != 'false' && responseMockData.data) {
        expect(JSON.stringify(responseAPI.data)).to.eq(JSON.stringify(responseMockData.data));
    } else {
        expect(responseAPI.data).to.eq(responseMockData.data);
    }
}
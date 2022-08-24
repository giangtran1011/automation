import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import prepareData from '../../fixtures/workflow-data/getWorkFlowDataById.json';
import workflowRequest from '../../support/requests/workFlowRequest.js';

let urlGetWorkFlowById = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.GET_WORK_FLOW_BY_ID;
let ACCESS_TOKEN = '';
let ACCESS_TOKEN_2= '';
let ACCESS_TOKEN_3= '';
let ACCESS_TOKEN_4= '';
describe('Login', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_1, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN);
        })
    });
});

describe('Login account not full permission', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_2, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_2 = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_2);
        })
    });
});

describe('Login account only view workflow', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_VIEW, Settings.PASS_WORD_NA).then(() => {
            ACCESS_TOKEN_3 = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_3);
        })
    });
});

describe('Login account not permission workflow', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_3, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_4 = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_4);
        })
    });
});



describe('API - Get workflow by id', () => {
    prepareData.forEach(object => {
       
        it(object.title, () => {
            if(object.token === '{access_token1}') {
                object.token = ACCESS_TOKEN;
            }else if(object.token === '{access_token2}'){
                object.token = ACCESS_TOKEN_2;
            }else if(object.token === '{access_token3}') {
                object.token = ACCESS_TOKEN_3;
            }else if(object.token === '{access_token4}') {
                object.token = ACCESS_TOKEN_4;
            }
            workflowRequest.getWorkFlowById(urlGetWorkFlowById.replace('{workflowId}',  object.param), Settings.GET_METHOD, object.token).then(res => {
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
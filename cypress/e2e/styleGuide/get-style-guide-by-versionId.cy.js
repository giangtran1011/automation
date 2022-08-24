import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import styleGuideRequest from '../../support/requests/styleGuideRequest.js';
import prepareData from '../../fixtures/styleguide-data/getStyleGuideByVersionId.json';

let urlGetListByVersionId = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.GET_STYLE_GUIDE_BY_VERSION_ID;
let ACCESS_TOKEN = '';
describe('Login', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_1, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN);
        })
    });
});

describe('API - Get style guide ', () => {
    prepareData.forEach(object => {
        it(object.title, () => {
            styleGuideRequest.getListStyleGuideByVersionId(urlGetListByVersionId.replace("{versionId}", object.param), Settings.GET_METHOD, ACCESS_TOKEN)
            .then(res => {
                expect(res.status).to.eq(object.code);
                compareObject(object.responseBody, res.body);
            });
        });
    });
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
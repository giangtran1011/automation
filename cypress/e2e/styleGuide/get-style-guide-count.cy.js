import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import styleGuideRequest from '../../support/requests/styleGuideRequest.js';
import prepareData from '../../fixtures/styleguide-data/getStyleGuideCount.json';

let urlGetStyleGuideCount = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.GET_STYLE_GUIDE_COUNT;
let ACCESS_TOKEN = '';
describe('Login', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_2, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN);
        });
    });
});

describe('API - Get style guide count', () => {
    prepareData.forEach(object => {
        it(object.title, () => {
            styleGuideRequest.getStyleGuideCount(urlGetStyleGuideCount, Settings.GET_METHOD, object.param, ACCESS_TOKEN)
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
    expect(responseAPI.data).to.eq(responseMockData.data);
}
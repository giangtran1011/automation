import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import getListStyleGuideData from '../../fixtures/styleguide-data/getListStyleGuide.json';
import styleGuideRequest from '../../support/requests/styleGuideRequest.js';

let urlGetListStyleGuide = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.GET_LIST_STYLE_GUIDE_V2;
let ACCESS_TOKEN = '';
describe('Login', () => {
    it('Get token', () => {
        cy.login(Settings.USER_NAME_2, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN);
        })
    });
});
describe('API - Get list style guide', () => {
 
       getListStyleGuideData.forEach(object => {
        it(object.title, () => {
            styleGuideRequest.getListStyleGuide(urlGetListStyleGuide, Settings.GET_METHOD, object.param, ACCESS_TOKEN).then(res => {
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
        expect(responseAPI.data.pageInfo.hasMore).to.eq(responseMockData.data.pageInfo.hasMore);
        expect(responseAPI.data.pageInfo.lastOrderKey).to.eq(responseMockData.data.pageInfo.lastOrderKey);
        expect(responseAPI.data.pageData.size).to.eq(responseMockData.data.pageData.size);
        if (responseMockData.data.pageData.length > 0) {
            for (var i = 0; i < responseMockData.data.pageData.length; i++) {
                expect(responseAPI.data.pageData[i].client).to.eq(responseMockData.data.pageData[i].client);
                expect(responseAPI.data.pageData[i].id).to.eq(responseMockData.data.pageData[i].id);
                expect(responseAPI.data.pageData[i].name).to.eq(responseMockData.data.pageData[i].name);
                expect(responseAPI.data.pageData[i].mdDescription).to.eq(responseMockData.data.pageData[i].mdDescription);
                expect(responseAPI.data.pageData[i].isInvalid).to.eq(responseMockData.data.pageData[i].isInvalid);
                expect(responseAPI.data.pageData[i].isEnabled).to.eq(responseMockData.data.pageData[i].isEnabled);
                expect(responseAPI.data.pageData[i].workflowId).to.eq(responseMockData.data.pageData[i].workflowId);
                expect(responseAPI.data.pageData[i].isWorkflowEnabled).to.eq(responseMockData.data.pageData[i].isWorkflowEnabled);
                expect(responseAPI.data.pageData[i].workflowName).to.eq(responseMockData.data.pageData[i].workflowName);
                expect(responseAPI.data.pageData[i].versionNumber).to.eq(responseMockData.data.pageData[i].versionNumber);
                expect(responseAPI.data.pageData[i].versionId).to.eq(responseMockData.data.pageData[i].versionId);
                if (responseAPI.data.pageData[i].cover) {
                    expect(responseAPI.data.pageData[i].cover.id).to.eq(responseMockData.data.pageData[i].cover.id);
                    expect(responseAPI.data.pageData[i].cover.length).to.eq(responseMockData.data.pageData[i].cover.length);
                    expect(responseAPI.data.pageData[i].cover.fileId).to.eq(responseMockData.data.pageData[i].cover.fileId);
                    expect(responseAPI.data.pageData[i].cover.fileName).to.eq(responseMockData.data.pageData[i].cover.fileName);

                }
            }
        }
    } else {
        expect(responseAPI.data).to.eq(responseMockData.data);
    }
}
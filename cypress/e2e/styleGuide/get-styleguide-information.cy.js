import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import styleGuideRequest from '../../support/requests/styleGuideRequest.js';
import getStyleGuideInfor from '../../fixtures/styleguide-data/get-styleguide-information.json'
let ACCESS_TOKEN_VIEW_PERMISSION = '';
let ACCESS_TOKEN_NONE_PERMISSION = '';
describe('Login', () => {
    it('Get token full permission', () => {
        cy.login(Settings.USER_NAME_VIEW, Settings.PASS_WORD_NA).then(() => {
            ACCESS_TOKEN_VIEW_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_VIEW_PERMISSION);
        })
    });

    it('Get token none permission', () => {
        cy.login(Settings.USER_NAME_NO_PERMISSION, Settings.PASS_WORD_NA).then(() => {
            ACCESS_TOKEN_NONE_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_NONE_PERMISSION);
        })
    });
});
describe('GET - Get styleGuide by styleGuideId API', () => {

    getStyleGuideInfor.forEach(({
        title,
        endpoint,
        compareData,
        code,
        message,
    }) => {
        it(title, () => {
            let url = `${Settings.INTERNAL_URL}/styleguides/getstyleguidesinfo${endpoint}`;
            let objectKeys = ['metadata', 'data'];

            switch (code) {
                case 200:
                    if (compareData != false) {
                        styleGuideRequest.getStyleGuideInformationAPI(url, Settings.GET_METHOD, ACCESS_TOKEN_VIEW_PERMISSION).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, objectKeys);
                            expect(JSON.stringify(apiRes.body.data)).to.equal(JSON.stringify(compareData));
                        })
                    } else {
                        styleGuideRequest.getStyleGuideInformationAPI(url, Settings.GET_METHOD, ACCESS_TOKEN_VIEW_PERMISSION).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, objectKeys);
                            expect(apiRes.body.data).to.equal(compareData);
                            expect(apiRes.body.metadata.message).to.equal(message);
                        })
                    }
                    break;

                case 403:
                    styleGuideRequest.getStyleGuideInformationAPI(url, Settings.GET_METHOD, ACCESS_TOKEN_NONE_PERMISSION).then((apiRes) => {
                        expect(apiRes.status).to.eq(code);
                    })
                    break;

                case 401:
                    styleGuideRequest.getStyleGuideInformationAPI(url, Settings.GET_METHOD, "").then((apiRes) => {
                        common.assertResponse(apiRes, code, message, "");
                    })
                    break;

                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    })
});
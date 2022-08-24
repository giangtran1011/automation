import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import prepareData from '../../fixtures/styleguide-data/export-styleGuide-category-trigger-mapping.json';
import styleGuideRequest from '../../support/requests/styleGuideRequest.js';
import common from '../../support/utils/common.js';

let url = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.GET_EXPORT_STYLE_GUILDE_CATEGORY_TRIGGER_MAPPING;
let ACCESS_TOKEN_FULL_PERMISSION = '';
let ACCESS_TOKEN_LIMIT_PERMISSION = '';

describe('Login', () => {
    it('Get token full permission', () => {
        cy.login(Settings.USER_NAME_1, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_FULL_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_FULL_PERMISSION);
        })
    });

    it('Get token limit permission', () => {
        cy.login(Settings.USER_NAME_2, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_LIMIT_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_LIMIT_PERMISSION);
        })
    });
});

describe('API - Get export category trigger mapping', () => {
    prepareData.forEach(object => {
        it(object.title, () => {
            object.token = checkToken(object.token);
            styleGuideRequest.getExportCategoryTriggerMapping(url, Settings.GET_METHOD, object.param, object.token).then(res => {
                expect(res.status).to.eq(object.code);
                common.compareObject(res.body, object.responseBody, "requestId");
            });
        });
    });
    
});

function checkToken(token) {
   if (token === 'limit-permission') {
        return token = ACCESS_TOKEN_LIMIT_PERMISSION;
    } else {
        return token = ACCESS_TOKEN_FULL_PERMISSION;
    }
}
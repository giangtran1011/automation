import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import styleGuideRequest from '../../support/requests/styleGuideRequest.js';
import getStyleGuideByCategory from '../../fixtures/styleguide-data/getStyleguideByProductCategoryId.json'
let ACCESS_TOKEN_FULL_PERMISSION = '';
let ACCESS_TOKEN_NONE_PERMISSION = '';
describe('Login', () => {
    it('Get token full permission', () => {
        cy.login(Settings.USER_NAME_1, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_FULL_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_FULL_PERMISSION);
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

    getStyleGuideByCategory.forEach(({
        title,
        styleGuideId,
        clientId,
        productCategoryId,
        compareData,
        code,
        message,
    }) => {
        it(title, () => {
            let url;
            let objectKeys = ['metadata', 'data'];

            switch (code) {
                case 200:
                    if (compareData != false) {
                        if (productCategoryId == "") url = `${Settings.INTERNAL_URL}/styleguides/getbyproductcategory?clientId=${clientId}`;
                        else url = `${Settings.INTERNAL_URL}/styleguides/getbyproductcategory?clientId=${clientId}&productCategoryId=${productCategoryId}`;
                        styleGuideRequest.geByProductCategoryIdAPI(url, Settings.GET_METHOD, ACCESS_TOKEN_FULL_PERMISSION).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, objectKeys);
                            expect(JSON.stringify(apiRes.body.data)).to.equal(JSON.stringify(compareData));
                        })
                    } else {
                        url = `${Settings.INTERNAL_URL}/styleguides/getbyproductcategory?productCategoryId=${productCategoryId}`
                        styleGuideRequest.geByProductCategoryIdAPI(url, Settings.GET_METHOD, ACCESS_TOKEN_FULL_PERMISSION).then((apiRes) => {
                            common.assertResponse(apiRes, code, message, objectKeys);
                            expect(JSON.stringify(apiRes.body.data)).to.equal(JSON.stringify(compareData));
                            expect(apiRes.body.metadata.message).to.equal(message);
                        })
                    }

                    break;

                case 403:
                    url = `${Settings.INTERNAL_URL}/styleguides/getbyproductcategory?clientId=${clientId}&productCategoryId=${productCategoryId}`
                    styleGuideRequest.geByProductCategoryIdAPI(url, Settings.GET_METHOD, ACCESS_TOKEN_NONE_PERMISSION).then((apiRes) => {
                        expect(apiRes.status).to.eq(code);
                    })
                    break;

                case 401:
                    url = `${Settings.INTERNAL_URL}/styleguides/getbyproductcategory?clientId=${clientId}&productCategoryId=${productCategoryId}`
                    styleGuideRequest.geByProductCategoryIdAPI(url, Settings.GET_METHOD, "").then((apiRes) => {
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
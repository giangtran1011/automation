import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import outfitRequest from '../../support/requests/outFitRequest.js';
import prepareData from '../../fixtures/outfit/getOutfitByOutfitIdData.json';

let accessToken, urlGetOutfit;
describe('API - Get production type', () => {
    before(() => {
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        });
    });

    prepareData.forEach(({
        title,
        endpoint,
        code,
        responseBody
    }) => {
        it(title, () => {
            urlGetOutfit = `${Settings.BASE_URL}/outfits/${endpoint}`;
            switch (code) {
                case 200:
                    outfitRequest.getProductByOutfitId(urlGetOutfit, Settings.GET_METHOD, accessToken).then(apiRes => {
                        expect(apiRes.status).to.eq(code);
                        common.compareObject(apiRes.body, responseBody, "");
                    });
                case 204:
                    outfitRequest.getProductByOutfitId(urlGetOutfit, Settings.GET_METHOD, accessToken).then(apiRes => {
                        expect(apiRes.status).to.eq(code);
                        expect(apiRes.boy).to.eq(undefined);
                    });
            }

        });
    });
});
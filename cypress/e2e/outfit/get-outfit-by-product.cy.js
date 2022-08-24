import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import outfitRequest from '../../support/requests/outFitRequest.js';
import prepareData from '../../fixtures/outfit/getOutfitByProductData.json';
import * as urlConfig from '../../support/utils/baseUrlApiConts.js'

let url = urlConfig.BASE_URL_GETWAY + urlConfig.GET_OUT_FIT_BY_PRODUCT;
let accessToken;
describe('API - Get production type', () => {
    before(() => {
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        });
    });

   prepareData.forEach(object => {
        it(object.title, () => {
            outfitRequest.getOutfitByProductId(url, Settings.GET_METHOD, object.param,  accessToken).then(res => {
                expect(res.status).to.eq(object.code);
                common.compareObject(res.body, object.responseBody, "traceId");
            });
        });
   });
});

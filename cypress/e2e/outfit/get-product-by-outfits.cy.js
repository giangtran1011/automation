import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import outfitRequest from '../../support/requests/outFitRequest.js';
import prepareData from '../../fixtures/outfit/getProductByOutfitData.json';
import * as urlConfig from '../../support/utils/baseUrlApiConts.js'

let url = urlConfig.BASE_URL_GETWAY + urlConfig.GET_PRODUCT_BY_OUTFIT_ID;
let accessToken;
describe('API - Get production type', () => {
    before(() => {
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        });
    });

   prepareData.forEach(object => {
        it(object.title, () => {
            outfitRequest.getProductByOutfitId(url.replace('{outfitId}', object.param), Settings.GET_METHOD, accessToken).then(res => {
                expect(res.status).to.eq(object.code);
                common.compareObject(res.body, object.responseBody, "traceId");
            });
        });
   });
});

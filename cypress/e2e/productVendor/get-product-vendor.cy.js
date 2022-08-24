import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import productRequest from '../../support/requests/productVendorRequest.js';
import prepareData from '../../fixtures/productVendor/getProductVendorData.json';
import * as urlConfig from '../../support/utils/baseUrlApiConts.js'

let url = urlConfig.BASE_URL_GETWAY + urlConfig.GET_PRODUCT_VENDOR;
let accessToken;
describe('API - Get product vendor', () => {
    before(() => {
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        });
    });

   prepareData.forEach(object => {
        it(object.title, () => {
            productRequest.getProductVendor(url, Settings.GET_METHOD, object.param, accessToken).then(res => {
                common.compareObject(res.body, object.responseBody);
            });
        });
   });
});

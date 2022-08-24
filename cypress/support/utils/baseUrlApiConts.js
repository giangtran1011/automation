//api get style guilde v2
export const URL_LOGIN_SANDBOX = 'https://sandbox-accounts.creativeforce.io/account/login/?returnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dgamma%26response_type%3Dcode%26scope%3Dwebapp_scope%2520offline_access%2520openid%26redirect_uri%3Dhttps%253A%252F%252Fsandbox-app.creativeforce.io%252Foauth2%252Fcf%26code_challenge_method%3DS256%26code_challenge%3DF39vZmhbHcjyUq7GjG_OvsxCEyLE0Z50Wa79ddaX5EY%26state%3Dundefined%26prompted%3Dtrue';
export const BASE_URL_SANDBOX_V2 = 'https://sandbox-api.creativeforce.io';
export const BASE_URL_GETWAY = "https://sandbox-gateway.creativeforce.io";
export const GET_LIST_STYLE_GUIDE_V2 = "/workflow/v2/styleguides";
export const GET_STYLE_GUIDE_BY_VERSION_ID = "/workflow/v2/styleguides/versionsv2/{versionId}";
export const GET_STYLE_GUIDE_COUNT = "/workflow/v2/styleguides/count";
export const GET_EXPORT_STYLE_GUILDE_CATEGORY_TRIGGER_MAPPING = "/workflow/v2/styleguides/getexportstyleguidecategorytriggermapping";

/// WORK FLOW API
export const GET_SETTING_OPTION = "/workflow/v2/workflows/settingoptions";
export const GET_VENDOR_LIST = "/workflow/v2/workflows/getvendorlist";
export const CREATE_WORKFLOW = "/workflow/v2/workflows";
export const GET_WORK_FLOW_BY_ID = "/workflow/v2/workflows/{workflowId}";
export const UPDATE_WORK_FLOW_BY_ID = "/workflow/v2/workflows/{workflowId}";

//master data
export const GET_PRODUCTION_TYPE = "/v1/productiontypes";
export const GET_CUSTOM_PROPERTIES = "/v1/customproperties";

//outfit
export const GET_PRODUCT_BY_OUTFIT_ID = "/v1/outfits/{outfitId}/products";
export const GET_OUT_FIT_BY_PRODUCT = "/v1/outfits"

//get product vendor
export const GET_PRODUCT_VENDOR = "/v1/productvendors";
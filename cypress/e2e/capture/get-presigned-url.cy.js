import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import captureRequest from '../../support/requests/captureRequest.js';
import getPresignUrl from '../../fixtures/capture-data/getPresignUrl.json'


describe('Capture task', () => {

    let accessToken = '';
    let urlPostPresignUrl = `${Settings.BASE_URL}/assets/get-presigned-url`;

    before(() => {
        cy.title("Check authentication");
        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;
        })
    });
    getPresignUrl.forEach(({
        title,
        getUrlData,
        code
    }) => {
        it(title, () => {
            switch (code) {

                case 200:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, code, '', objectKeys);
                            captureRequest.assertSQLPostPresignedUrl(apiRes.body.files[0].tempFileId, apiRes, getUrlData);
                        });
                    }
                    break;

                case 14:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, 200, '', objectKeys);
                            captureRequest.assertResponseAndError(apiRes, code)

                        });
                    }
                    break;

                case 13:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, 200, '', objectKeys);
                            captureRequest.assertResponseAndError(apiRes, code)

                        });
                    }
                    break;
                case 1:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, 200, '', objectKeys);
                            captureRequest.assertResponseAndError(apiRes, code)

                        });
                    }
                    break;
                case 11:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, 200, '', objectKeys);
                            captureRequest.assertResponseAndError(apiRes, code)
                        });
                    }
                    break;

                case 12:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, 200, '', objectKeys);
                            captureRequest.assertResponseAndError(apiRes, code)

                        });
                    }
                    break;

                case 3:
                    {
                        let objectKeys = ['headers', 'files', 'errorFiles'];
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            common.assertResponse(apiRes, 200, '', objectKeys);
                            captureRequest.assertResponseAndError(apiRes, code)

                        });
                    }
                    break;

                case 400:
                    {
                        captureRequest.getPresignedUrl(urlPostPresignUrl, Settings.POST_METHOD, accessToken, getUrlData).then((apiRes) => {
                            expect(apiRes.status).to.eq(400);

                        });
                    }
                    break;

                default:
                    {
                        cy.log("Exception")
                    }
                    break;

            }
        });


    });
});
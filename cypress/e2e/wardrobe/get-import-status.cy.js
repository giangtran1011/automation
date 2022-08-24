import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import dataImport from '../../fixtures/wardrobe/importStylingItems.json';
import wardropeRequest from '../../support/requests/wardropeRequest.js';
import getImportStatusData from '../../fixtures/wardrobe/getImportStatusData.json'

describe('POST - Import job', () => {
    let urlImport, urlGetStatus, testClient, accessToken, importId;
    dataImport[2].data.stylingItems[0].productCode = 'stylingItem_TestImport02_' + parseInt(Math.random().toString(9).substring(2, 9));


    before(() => {

        cy.title("Check authentication");
        testClient = Settings.CREATE_JOB_STUDIO_CLIENT
        urlImport = `${Settings.BASE_URL}/styling/import-styling?clientId=${testClient}`

        common.authenAPI(Settings.URL_AUTHEN, Settings.POST_METHOD, Settings.CLIENT_ID, Settings.CLIENT_SECRET).then((response) => {
            accessToken = response.body.access_token;

            wardropeRequest.importStylingAPI(urlImport, Settings.POST_METHOD, accessToken, dataImport[2].data).then((apiRes) => {
                cy.wait(5000)
                common.assertResAPI(apiRes, ['clientId', 'importId']);
                importId = apiRes.body.importId;
                urlGetStatus = `${Settings.BASE_URL}/styling/get-import-styling-status?clientId=${testClient}&importId=${importId}`
            })
        });
    });


    getImportStatusData.forEach(({
        title,
        importIdInput,
        clientIdInput,
        code,
        message
    }) => {
        it(title, () => {
            switch (code) {

                case 200:
                    wardropeRequest.getImportStylingStatusAPI(urlGetStatus, Settings.GET_METHOD, accessToken).then((apiRepsonse) => {
                        verifyResponse(apiRepsonse, testClient, importId)
                    })
                    break;

                case 400:
                    urlGetStatus = `${Settings.BASE_URL}/styling/get-import-styling-status?clientId=${clientIdInput}&importId=${importIdInput}`;
                    wardropeRequest.getImportStylingStatusAPI(urlGetStatus, Settings.GET_METHOD, accessToken).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(code);
                        expect(apiRepsonse.body.errors[0].message).to.eq(message);
                    })
                    break;

                case 403: //Bug return 400
                    urlGetStatus = `${Settings.BASE_URL}/styling/get-import-styling-status?clientId=${clientIdInput}&importId=${importIdInput}`;
                    wardropeRequest.getImportStylingStatusAPI(urlGetStatus, Settings.GET_METHOD, accessToken).then((apiRepsonse) => {
                        expect(apiRepsonse.status).to.eq(code);
                        expect(apiRepsonse.body.errors[0].message).to.eq(message);
                    })
                    break;
                default:
                    {
                        cy.title("Exception");
                    }
                    break;

            }
        });
    });
});

function verifyResponse(response, clientId, importId) {
    expect(response.status).to.eq(200);
    expect(response.body.clientId).to.eq(clientId);
    expect(response.body.importId).to.eq(importId);
    expect(response.body.finished).to.eq(true);
    expect(response.body.success).to.eq(true);
    return true;
};
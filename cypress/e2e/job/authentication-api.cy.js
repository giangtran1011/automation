import common from '../../support/utils/common.js';
import authenData from '../../fixtures/job-data/authenData.json';
import * as Settings from '../../support/utils/globalContants.js';
import jobRequest from '../../support/requests/jobRequest.js';
/* 200 OK - Authenticate successfully
 * 400 Bad Request
 * Authenticate with non-exist  clientId
 * Authenticate with invalid clientSecret
 * Authenticate with mismatch clientId and clientSecret
 * Authenticate without grant_type
 * Authenticate without clientSecret
 * Authenticate without clientId
 */

function authenAPIWithInvalidBody(url, method, clientId, clientSecret, body) {
    return cy.api({
        method: method,
        url: url,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
        body: body,
        form: true,
        failOnStatusCode: false
    })
};

describe('POST - Authenticate API', () => {
    authenData.forEach(({
        urlAuthen,
        clientId,
        clientSecret,
        code,
        message,
        body,
        title
    }) => {
        it(title, () => {
            switch (code) {
                case 200:
                    {
                        common.authenAPI(urlAuthen, Settings.POST_METHOD, clientId, clientSecret).then((response) => {
                            expect(response.status).to.eq(code);
                            expect(response.body).to.have.key(
                                ["access_token", "expires_in", "token_type", "scope"]
                            );
                            assert.isString(response.body.access_token, '');
                        });
                    }
                    break;

                case 400:
                    {
                        if (body == "") {
                            common.authenAPI(urlAuthen, Settings.POST_METHOD, clientId, clientSecret).then((response) => {
                                expect(response.status).to.eq(code);
                                expect(response.body.error).to.eq(message);
                            });

                        } else {
                            authenAPIWithInvalidBody(urlAuthen, Settings.POST_METHOD, clientId, clientSecret, body).then((response) => {
                                expect(response.status).to.eq(code);
                                expect(response.body.error).to.eq(message);
                            });
                        }
                    }

                    break;

                case 405:
                    {
                        common.authenAPI(urlAuthen, Settings.GET_METHOD, clientId, clientSecret).then((response) => {
                            expect(response.status).to.eq(code);
                            expect(response.body.error).to.eq(message);
                        });
                    }

                case 415:
                    {
                        jobRequest.checkContentTypeAuthen(urlAuthen, Settings.POST_METHOD, clientId, clientSecret).then((response) => {
                            expect(response.status).to.eq(code);
                            expect(response.body.error).to.eq(message);
                        });
                    }
                    break;
                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    });
})
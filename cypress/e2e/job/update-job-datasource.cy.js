const BASE_URL = 'https://sandbox-gateway.creativeforce.io/v1'
const clientId1 = '8d92e5de-b25f-449d-8d7e-60ed8467adb0';
const clientSecret = 'b1a6847a6fa84f3a97466730dc58bb15'

describe('POST - Update Job From Datasource',()=>{

    it('200 OK - Update job successfull with all valid params',()=>{
        cy.api({
            method: 'POST',
            url: 'https://sandbox-accounts.creativeforce.io/connect/token',
            headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
            body: {
                grant_type: 'client_credentials',
                client_id: clientId1,
                client_secret: clientSecret
            },
            form: true
        }).as('getAccessToken');

        cy.get('@getAccessToken').then((response) => {

            const { access_token } = response.body;
            cy.log(JSON.stringify(response.body));
            expect(response.body.access_token).to.not.eq(null);

            //get datasource

            const jobId = '92f403a4-43ba-4f46-ab76-9efee36b3485'
            const importId = '1396d516-7740-42a6-b85e-2cb3568f9cd5'
            const endpoint = `jobs/get-import-async-status?importId=${importId}&jobId=${jobId}`

            cy.api({
                method: 'GET',
                url: `${BASE_URL}/${endpoint}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                },
                body: {
                    'importId' : importId,
                    'jobId': jobId
                },
                failOnStatusCode: false,
            }).as('getImportJobStatus');

            cy.get('@getImportJobStatus').then((apiRes) => {
                expect(apiRes.status).to.eq(200);
                expect(apiRes.body).to.not.equal(null);
                expect(apiRes.body).to.have.keys(
                    'jobId',
                    'importId',
                    'finished',
                    'success',
                    'errors'
                );
                expect(apiRes.body.jobId).to.equal(jobId);
                expect(apiRes.body.importId).to.equal(importId);
                expect(apiRes.body.finished).to.be.true;
                expect(apiRes.body.success).to.be.true;
                expect(apiRes.body.errors).to.have.keys([]);
            });

        });
    })
});
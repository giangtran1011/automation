function updateSampleAPI(url, method, accessToken, body) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: body,
        failOnStatusCode: false,
    })
};

function changeSampleTypeAPI(url, method, accessToken, body) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: body,
        failOnStatusCode: false,
    })
};

function getSampleBySamplePoolIdAPI(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false,
    })
};

function returnSQLProductSampleId(sampleCode) {
    return cy.sqlServer(
        `SELECT ProductSampleId
        FROM ProductSample
        WHERE ProductSampleCode = '${sampleCode}'`
    )
};

function compareSQLSampleProperties(sampleCode, jobId, request, key) {
    cy.sqlServer(
        `SELECT p.value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId = '${jobId}'  AND p.IsDeleted = 0
        ORDER BY p.Value ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][0]).to.equal("");
        expect(parseInt(sqlQuery[1][0])).to.equal(request.sampleReturnDatetimeUtc);
        expect(sqlQuery[2][0]).to.equal(request.sampleCode);
        expect(sqlQuery[3][0]).to.equal(request.properties[key]);
        expect(sqlQuery[4][0]).to.equal(request.sampleName);
        expect(sqlQuery[5][0]).to.equal(request.size);
    });
    return true;
};

function compareSampleType(sampleCode, jobId, request) {
    cy.sqlServer(
        `SELECT ProductTypeId from ProductSample WHERE ProductSampleCode = '${sampleCode}' 
        AND JobId = '${jobId}'  AND IsDeleted = 0`
    ).then((sqlQuery) => {
        expect(sqlQuery).to.equal(request.targetType);
    });
    return true;
};
export default { updateSampleAPI, returnSQLProductSampleId, compareSQLSampleProperties, changeSampleTypeAPI, compareSampleType, getSampleBySamplePoolIdAPI }
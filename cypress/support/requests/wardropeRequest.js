function importStylingAPI(url, method, accessToken, data) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
        failOnStatusCode: false,
    })
};

function getImportStylingStatusAPI(url, method, accessToken, data) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
        failOnStatusCode: false,
    })
};

function assertSQLEmptyStyling(productCode, clientId, request) {
    cy.sqlServer(
        `Select  p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
		JOIN Property p ON p.PropertyId = v.PropertyId
		 WHERE t.ProductCode =  '${productCode}' and t.ClientId = '${clientId}' and t.JobId is NULL
		  ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][1]).to.equal('');
        expect(sqlQuery[1][1]).to.equal('');
        expect(sqlQuery[2][1]).to.equal('');
        expect(sqlQuery[4][1]).to.equal(request.stylingItems[0].productCode);
        expect(sqlQuery[6][1]).to.equal('');
        expect(sqlQuery[7][1]).to.equal('');
        expect(sqlQuery[8][1]).to.equal('');
    });
    return true;
};

function returnSQLSample(productCode) {
    return cy.sqlServer(
        `Select s.ProductSampleCode, s.ProductSamplePoolId from ProductSamplePool p 
        JOIN ProductSample s ON p.ProductSamplePoolId = s.ProductSamplePoolId
        where p.ProductCode = '${productCode}' ORDER BY s.ProductSampleCode ASC`
    )
};

function assertSQLStylingCategory(productCode, category, type) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.JobId is NULL
        ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        switch (type) {
            case 'lowerCase':
                expect(sqlQuery[1][1]).to.equal(category.toLowerCase());
                break;

            case 'upperCase':
                expect(sqlQuery[1][1]).to.equal(category.toUpperCase());
                break;
            case 'normal':
                expect(sqlQuery[1][1]).to.equal(category);
                break;
        }
    });
    return true;
};


function assertSQLCreateStyling(productCode, request, clientId) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.ClientId = '${clientId}' and t.JobId is null
        ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][1]).to.equal(request.stylingItems[0].brand);
        expect(sqlQuery[1][1]).to.equal(request.stylingItems[0].category);
        expect(sqlQuery[2][1]).to.equal(request.stylingItems[0].color);
        expect(sqlQuery[4][1]).to.equal(request.stylingItems[0].productCode);
        expect(sqlQuery[6][1]).to.equal(request.stylingItems[0].productName);
        expect(sqlQuery[7][1]).to.equal(request.stylingItems[0].styleCode);
        expect(sqlQuery[8][1]).to.equal(request.stylingItems[0].vendorMaterialCode);
    });
    return true;
};

function returnSQLStylingProperties(productCode, clientId) {
    return cy.sqlServer(
        `SELECT p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.JobId is null and t.ClientId = '${clientId}'
        ORDER BY PropertyName ASC`
    )
};

function returnSamplePool(productCode, clientId) {
    return cy.sqlServer(
        `select ProductSamplePoolId from ProductSamplePool where ProductCode = '${productCode}' AND IsDeleted = 0 AND OwnerClientId =  '${clientId}' `
    )
};

function returnSQLSamplePropertiesSt(sampleCode, clientId) {
    return cy.sqlServer(
        `SELECT p.PropertyId, p.Value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId is NULL and p.ClientId = '${clientId}'
        ORDER BY p.Value ASC`
    )
}

function getSQLDateSamplePropertiesSt(sampleCode) {
    return cy.sqlServer(
        `SELECT y.PropertyName, p.Value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		JOIN Property y ON y.PropertyId = p.PropertyId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId is NULL
        ORDER BY y.PropertyName ASC`
    )
}

function returnSQLProductCategorySt(productCode) {
    return cy.sqlServer(
        `SELECT v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.JobId is NULL and p.PropertyName = 'Category'
        `
    )
}

export default { importStylingAPI, getImportStylingStatusAPI, assertSQLEmptyStyling, returnSQLSample, assertSQLStylingCategory, assertSQLCreateStyling, returnSQLStylingProperties, returnSamplePool, returnSQLSamplePropertiesSt, getSQLDateSamplePropertiesSt, returnSQLProductCategorySt }
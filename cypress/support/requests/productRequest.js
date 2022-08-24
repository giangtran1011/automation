// list products func
function getProductAPI(url, method, accessToken) {
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

// get products status
function getProductStatusAPI(url, method, accessToken, jobId, jobCode) {
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


function getProductStatusAPI2(url, method, accessToken) {
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

function updateProductAPI(url, accessToken, body, method) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: body,
        failOnStatusCode: false
    });
}

function updateProductStateAPI(url, accessToken, body, method) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: body,
        failOnStatusCode: false
    });
}

function assertSQLGetProduct(productId, response) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value, u.StyleGuideVersionId, s.StyleGuideId, s.StyleGuideModelJson FROM PropertyValue v
        JOIN Property p ON p.PropertyId = v.PropertyId
        JOIN ProductUnit u ON u.ProductId = v.ObjectId
        JOIN Styleguideversion s ON s.StyleGuideVersionId = u.StyleGuideVersionId
        WHERE ObjectId = '${productId}' and ObjectTypeId = 2  
        ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][1]).to.equal(response.brand);
        expect(sqlQuery[1][1]).to.equal(response.category.categoryName);
        expect(sqlQuery[2][1]).to.equal(response.color);
        expect(sqlQuery[4][1]).to.equal(response.productCode);
        expect(parseInt(sqlQuery[5][1])).to.equal(response.productCreatedDateUtc);
        expect(sqlQuery[6][1]).to.equal(response.productName);
        expect(sqlQuery[7][1]).to.equal(response.styleCode);
        expect(sqlQuery[8][1]).to.equal(response.vendorMaterialCode);
        expect(sqlQuery[0][2]).to.equal(response.styleGuide.styleGuideVersionId.toUpperCase());
        expect(sqlQuery[0][3]).to.equal(response.styleGuide.styleGuideId.toUpperCase());
    });
    return true;
}

function setUrl(indexUrl, jobIdTest, jobId, productCodeTest, productCode) {
    let endpoint = '';
    switch (indexUrl) {
        case 1:
            endpoint = `jobId=${jobIdTest}`;
            break;
        case 2:
            endpoint = `productCode=${productCodeTest}`;
            break;
        case 3:
            endpoint = `jobId=${jobIdTest}&productCode=${productCodeTest}&pageSize=5&pageNumber=1`;
            break;
        case 4:
            endpoint = `jobId=${jobId}`;
            break;
        case 5:
            endpoint = `productCode=${productCode}`;
            break;
        case 6:
            endpoint = `products?jobId123=${jobIdTest}`;
            break;
        default:
            {
                cy.log("Exception")
            }
            break;
    }
    return endpoint;
};

function assertSQLCreateProduct(productCode, jobId, request) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value, u.StyleGuideVersionId FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        JOIN ProductUnit u ON u.ProductId = v.ObjectId
        WHERE t.ProductCode =  '${productCode}' and t.JobId = '${jobId}'
        ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][1]).to.equal(request.products[0].brand);
        expect(sqlQuery[1][1]).to.equal(request.products[0].category);
        expect(sqlQuery[2][1]).to.equal(request.products[0].color);
        expect(sqlQuery[4][1]).to.equal(request.products[0].productCode);
        expect(sqlQuery[6][1]).to.equal(request.products[0].productName);
        expect(sqlQuery[7][1]).to.equal(request.products[0].styleCode);
        expect(sqlQuery[8][1]).to.equal(request.products[0].vendorMaterialCode);
    });
    return true;
};

function assertSQLCreateProductIndex(productCode, jobId, request, index) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value, u.StyleGuideVersionId FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        JOIN ProductUnit u ON u.ProductId = v.ObjectId
        WHERE t.ProductCode =  '${productCode}' and t.JobId = '${jobId}'
        ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][1]).to.equal(request.products[index].brand);
        expect(sqlQuery[1][1]).to.equal(request.products[index].category);
        expect(sqlQuery[2][1]).to.equal(request.products[index].color);
        expect(sqlQuery[4][1]).to.equal(request.products[index].productCode);
        expect(sqlQuery[6][1]).to.equal(request.products[index].productName);
        expect(sqlQuery[7][1]).to.equal(request.products[index].styleCode);
        expect(sqlQuery[8][1]).to.equal(request.products[index].vendorMaterialCode);
    });
    return true;
};

function assertSQLEmptyProduct(productCode, jobId, request) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value, u.StyleGuideVersionId FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        JOIN ProductUnit u ON u.ProductId = v.ObjectId
        WHERE t.ProductCode =  '${productCode}' and t.JobId = '${jobId}'
        ORDER BY PropertyName ASC`
    ).then((sqlQuery) => {
        expect(sqlQuery[0][1]).to.equal('');
        expect(sqlQuery[1][1]).to.equal('');
        expect(sqlQuery[2][1]).to.equal('');
        expect(sqlQuery[4][1]).to.equal(request.products[0].productCode);
        expect(sqlQuery[6][1]).to.equal('');
        expect(sqlQuery[7][1]).to.equal('');
        expect(sqlQuery[8][1]).to.equal('');
    });
    return true;
}

function assertSQLProductCategory(productCode, jobId, category, type) {
    cy.sqlServer(
        `SELECT p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.JobId = '${jobId}'
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

function compareSQLStyleGuide(productCode, jobId, compareStyleGuide) {
    cy.sqlServer(
        `SELECT s.StyleGuideName FROM StyleGuide s
        JOIN Styleguideversion v ON v.StyleGuideId = s.StyleGuideId
        JOIN ProductUnit u ON u.StyleGuideVersionId = v.StyleGuideVersionId
        JOIN Product p ON p.ProductId = u.ProductId
        WHERE p.ProductCode =  '${productCode}' and p.JobId = '${jobId}'`
    ).then((sqlQuery) => {
        expect(sqlQuery).to.equal(compareStyleGuide);
    });
    return true;
};

function compareSQLProSamplePool(productCode, jobId, clientId, type) {
    cy.sqlServer(
        `SELECT ProductSamplePoolId FROM Product 
        WHERE (ProductCode = '${productCode}' AND JobId = '${jobId}') 
               OR (ProductCode = '${productCode}' AND JobId IS NULL AND ClientId = '${clientId}')`
    ).then((sqlQuery) => {
        if (type == 'same') {
            expect(sqlQuery[0][0]).to.equal(sqlQuery[1][0]);
        } else if (type == 'different') {
            expect(sqlQuery[0][0]).to.not.equal(sqlQuery[1][0]);
        }
    });
    return true;
};

function compareSamplePoolAndProperty(productCode, jobId) {
    return cy.sqlServer(
            `SELECT t.PropertyName, v.value, p.ProductSamplePoolId  FROM Product p
		JOIN PropertyValue v ON p.ProductId = v.ObjectId
		JOIN Property t ON t.PropertyId = v.PropertyId
		WHERE p.ProductCode =  '${productCode}' AND p.JobId = '${jobId}'
		ORDER BY PropertyName ASC`
        )
        // .then((sqlQuery) => {
        //     if (type == 'same') {
        //         expect(sqlQuery[0][2]).to.equal(samplePool);
        //     } else if (type == 'different') {
        //         expect(sqlQuery[0][2]).to.not.equal(samplePool);
        //     }
        //     expect(sqlQuery[9][1]).to.equal(propertyValue);
        // });
        // return true;
};

function compareAddSampleCode(productCode, jobId) {
    return cy.sqlServer(
            `SELECT p.ProductSamplePoolId, s.ProductSampleCode  FROM Product p
		JOIN ProductSample s ON s.ProductSamplePoolId = p.ProductSamplePoolId
		WHERE p.ProductCode =  '${productCode}' AND p.JobId = '${jobId}'
		ORDER BY ProductSampleCode ASC`
        )
        // .then((sqlQuery) => {
        //     expect(sqlQuery[0][1]).to.equal(request.products[0].samples[0].sampleCode);
        // });
        // return true;
};

function getSQLProductProperties(productCode, jobId) {
    return cy.sqlServer(
        `SELECT p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.JobId = '${jobId}'
        ORDER BY PropertyName ASC`
    )
}

function getSQLSampleProperties(sampleCode, jobId) {
    return cy.sqlServer(
        `SELECT p.PropertyId, p.Value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId = '${jobId}'
        ORDER BY p.Value ASC`
    )

}

function getSQLDateSampleProperties(sampleCode, jobId) {
    return cy.sqlServer(
        `SELECT y.PropertyName, p.Value FROM PropertyValue  p 
		JOIN ProductSample s ON s.ProductSampleId = p.ObjectId
		JOIN Property y ON y.PropertyId = p.PropertyId
		WHERE s.ProductSampleCode = '${sampleCode}' AND s.JobId = '${jobId}'
        ORDER BY y.PropertyName ASC`
    )

}

function getSQLSampleCode(productCode, jobId) {
    return cy.sqlServer(
        `SELECT s.ProductSampleCode  FROM Product p
		JOIN ProductSample s ON s.ProductSamplePoolId = p.ProductSamplePoolId
		WHERE p.ProductCode =  '${productCode}' AND p.JobId = '${jobId}'
        ORDER BY ProductSampleCode ASC`
    )
}

function returnSQLProductCategory(productCode, jobId) {
    return cy.sqlServer(
        `SELECT v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductCode =  '${productCode}' and t.JobId = '${jobId}' and p.PropertyName = 'Category'
        `
    )
}

function returnSQLProductImportStatusId(productCode, jobId) {
    return cy.sqlServer(
        `select ProductImportStatusId from product
        WHERE ProductCode =  '${productCode}' and JobId = '${jobId}'
        `
    )
}

function assertSQLProductStatus(productCode, apiRepsonse) {
    cy.sqlServer(
        `Select u.ProductUnitStatusId, p.ProductImportStatusId, w.WorkUnitId, w.WorkUnitStatusId, w.ShootingTypeId,  w.PhotoProductionTypeId, t.TaskId, t.StepId, t.StepStatusId 
        from Product p 
        JOIN WorkUnit w ON p.ProductId = w.ProductId
        JOIN Task t ON t.WorkUnitId = w.WorkUnitId
        JOIN ProductUnit u ON  p.ProductId = u.ProductId
        WHERE ProductCode =  '${productCode}' AND t.StepId NOT IN (1,2);
        `
    ).then((dataRes) => {
        cy.log(dataRes);
        expect(apiRepsonse.body[0].productStatusId).to.eq(dataRes[0][0]);
        expect(apiRepsonse.body[0].productImportStatusId).to.eq(dataRes[0][1]);
        expect(apiRepsonse.body[0].workUnits[0].workUnitId.toUpperCase()).to.eq(dataRes[0][2]);
        expect(apiRepsonse.body[0].workUnits[0].workUnitStatusId).to.eq(dataRes[0][3]);
        expect(apiRepsonse.body[0].workUnits[0].productionTypeId).to.eq(dataRes[0][4]);
        expect(apiRepsonse.body[0].workUnits[0].sourceTypeId).to.eq(dataRes[0][5]);

        let stepArray = apiRepsonse.body[0].workUnits[0].steps;
        stepArray.forEach((step, index) => {
            expect(stepArray[index].taskId.toUpperCase()).to.eq(dataRes[index][6]);
            expect(stepArray[index].stepId).to.eq(dataRes[index][7]);
            expect(stepArray[index].stepStatusId).to.eq(dataRes[index][8]);
        })
    })
    return true;
}

function verifyDataUpdateProductById(productId, prepareData, requestBody, jobId) {
    let obj;
    cy.sqlServer(
        `SELECT p.PropertyName, v.value FROM PropertyValue v
		JOIN Product t ON t.ProductId = v.ObjectId
        JOIN Property p ON p.PropertyId = v.PropertyId
        WHERE t.ProductId = '${productId}' and  t.JobId = '${jobId}'
        and v.IsDeleted = 'false'
        ORDER BY PropertyName ASC`
    ).then((result) => {
        cy.log("SQL Get Product :", result);
        if (result) {
            obj = Object.fromEntries(result);
            console.log(obj);
            // Brand: "JM"
            // Category: "CATEGORYTest1"
            // Color: "pink"
            // Color Reference Url: "https://www.prettyme.ph/wp-content/uploads/2017/12/clothes_orange.jpg"
            // Product Code: "productCodeInit_79541"
            // Product Name: "Product_Test01"
            // Style Code: "styleCode03"
            // Vendor Material Code: ""
        }
        switch (requestBody.testCaseKey) {
            case "200_1":
                expect(obj['Brand']).to.eq(prepareData.brand);
                expect(obj['Category']).to.eq(prepareData.category);
                expect(obj['Color']).to.eq(prepareData.color);
                expect(obj['Color Reference Url']).to.eq(prepareData.colorReferenceUrls[0]);
                expect(obj['Product Code']).to.not.equal(prepareData.productCode);
                expect(obj['Product Code']).to.eq(requestBody.body.productCode);
                expect(obj['Product Code']).to.eq('Test_Update11_GHX-2608-17');
                expect(obj['Product Name']).to.eq(prepareData.productName);
                expect(obj['Style Code']).to.eq(prepareData.styleCode);
                expect(obj['Vendor Material Code']).is.empty;
                break;
            case "200_2":
                expect(obj['Brand']).to.eq(prepareData.brand);
                expect(obj['Category']).to.eq(prepareData.category);
                expect(obj['Color']).to.eq(prepareData.color);
                expect(obj['Color Reference Url']).to.eql(prepareData.colorReferenceUrls[0]);
                expect(obj['Product Code']).to.eq(prepareData.productCode);
                expect(obj['Product Name']).to.eq(requestBody.body.productName);
                expect(obj['Product Name']).to.not.equal(prepareData.productName);
                expect(obj['Product Name']).to.eq('Test_Update_ProductName01');
                expect(obj['Style Code']).to.eq(prepareData.styleCode);
                expect(obj['Vendor Material Code']).is.empty;
                break;
            case "200_3":
                expect(obj['Brand']).to.eq('brand');
                expect(obj['Category']).to.eq(prepareData.category);
                expect(obj['Color']).to.eq('color');
                expect(obj['season']).to.eq('season');
                expect(obj['dont delete']).to.eq('dont delete');
                expect(obj['Color Reference Url']).to.eql(prepareData.colorReferenceUrls[0]);
                expect(obj['Product Code']).to.eq(prepareData.productCode);
                expect(obj['Product Name']).to.equal(prepareData.productName);
                expect(obj['Style Code']).to.eq(prepareData.styleCode);
                expect(obj['Vendor Material Code']).is.empty;
                break;
            case "200_4":
                expect(obj['Brand']).undefined;
                expect(obj['Category']).to.eq(prepareData.category);
                expect(obj['Color']).undefined;
                expect(obj['season']).to.eq('season');
                expect(obj['dont delete']).to.eq('dont delete');
                expect(obj['Color Reference Url']).to.eql(prepareData.colorReferenceUrls[0]);
                expect(obj['Product Code']).to.eq(prepareData.productCode);
                expect(obj['Product Name']).to.eq(prepareData.productName);
                expect(obj['Style Code']).to.eq(prepareData.styleCode);
                expect(obj['Vendor Material Code']).is.empty;
                break;
            case "200_5":
                expect(obj['Brand']).to.eq('5-2-2022');
                expect(obj['Category']).to.eq(prepareData.category);
                expect(obj['Color']).to.eq('pink5');
                expect(obj['season']).to.eq('season');
                expect(obj['dont delete']).to.eq('dont delete');
                expect(obj['Color Reference Url']).to.eql(prepareData.colorReferenceUrls[0]);
                expect(obj['Product Code']).to.eq(prepareData.productCode);
                expect(obj['Product Name']).to.equal(prepareData.productName);
                expect(obj['Style Code']).to.eq(prepareData.styleCode);
                expect(obj['Vendor Material Code']).is.empty;
                break;
            case "200_6":
                expect(obj['Brand']).to.eq('5-2-2022');
                expect(obj['Category']).to.eq(prepareData.category);
                expect(obj['Color']).to.eq('White');
                expect(obj['season']).to.eq('season');
                expect(obj['dont delete']).to.eq('dont delete');
                expect(obj['Color Reference Url']).to.eql(prepareData.colorReferenceUrls[0]);
                expect(obj['Product Code']).to.eq(prepareData.productCode);
                expect(obj['Product Name']).to.equal('T Shirt');
                expect(obj['Style Code']).to.eq('907');
                expect(obj['Vendor Material Code']).is.empty;
                break;
        }
    });
}

function returnSamplePoolProd(productCode, clientId) {
    return cy.sqlServer(
        `select ProductSamplePoolId from ProductSamplePool where ProductCode = '${productCode}' AND IsDeleted = 0 AND OwnerClientId =  '${clientId}' `
    )
};

function getImportJobStatusAPI(url, accessToken, method) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false
    });
};

function addSampleToProductAPI(url, body, accessToken, method) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: body,
        failOnStatusCode: false
    });
}

export default {
    getProductAPI,
    assertSQLGetProduct,
    setUrl,
    assertSQLCreateProduct,
    assertSQLEmptyProduct,
    assertSQLProductCategory,
    compareSQLStyleGuide,
    getProductStatusAPI,
    compareSQLProSamplePool,
    compareSamplePoolAndProperty,
    compareAddSampleCode,
    getSQLProductProperties,
    getSQLSampleProperties,
    getSQLSampleCode,
    assertSQLCreateProductIndex,
    getSQLDateSampleProperties,
    returnSQLProductCategory,
    returnSQLProductImportStatusId,
    getProductStatusAPI2,
    assertSQLProductStatus,
    updateProductAPI,
    verifyDataUpdateProductById,
    returnSamplePoolProd,
    updateProductStateAPI,
    getImportJobStatusAPI,
    addSampleToProductAPI
}
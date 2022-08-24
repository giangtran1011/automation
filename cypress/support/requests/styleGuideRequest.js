function getByStyleguideIdAPI(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '12'
        },
        failOnStatusCode: false,
    })
}

function getListStyleGuide(url, method, param, accessToken) {
    return cy.api({
        method: method,
        url: param != undefined ? url + `?${param}` : url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false,
    });
}

function geByProductCategoryIdAPI(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '100'
        },
        failOnStatusCode: false,
    })
}

function getListStyleGuideByVersionId(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '12'
        },
        failOnStatusCode: false,
    });
}

function getStyleGuideInformationAPI(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '302'
        },
        failOnStatusCode: false,
    })
}

function getStyleGuideCount(url, method, param, accessToken) {
    return  cy.api({
        method: method,
        url: param != undefined ? url + `?${param}` : url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '12'
        },
        failOnStatusCode: false,
    });
}

function getExportCategoryTriggerMapping(url, method, param, accessToken) {
    return  cy.api({
        method: method,
        url: param != undefined ? url + `?${param}` : url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '12'
        },
        failOnStatusCode: false,
    });
}
export default { getByStyleguideIdAPI, getListStyleGuide, geByProductCategoryIdAPI,
     getListStyleGuideByVersionId, getStyleGuideInformationAPI,getStyleGuideCount, getExportCategoryTriggerMapping }
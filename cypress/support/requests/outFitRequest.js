function getProductByOutfitId(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false,
    });
}


function getOutfitByProductId(url, method, param, accessToken) {
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

function getOutfitByOutfitId(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false,
    });
}

export default { getProductByOutfitId, getOutfitByProductId, getOutfitByOutfitId }
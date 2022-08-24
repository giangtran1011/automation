
function getProductVendor(url, method, param, accessToken) {
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

export default {getProductVendor}
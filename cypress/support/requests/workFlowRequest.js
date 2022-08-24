function getSettingOption(url, method, param, accessToken) {
    return cy.api({
        method: method,
        url: param != undefined ? url + `?${param}` : url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': 11
        },
        failOnStatusCode: false,
    });
}

function getVendorList(url, method, body, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': 100
        },
        body: body,
        failOnStatusCode: false,
    });

}

function createWorkFlow(url, method, param, body, accessToken) {
    return cy.api({
        method: method,
        url: param != undefined ? url + `?${param}` : url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': 11
        },
        body: body,
        failOnStatusCode: false,
    });
}

function getWorkFlowList(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': '11'
        },
        failOnStatusCode: false,
    })
}

function getWorkFlowById(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': 11
        },
        failOnStatusCode: false,
    });

}

function updateWorkflowById(url, method, body, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'x-screen-id': 11
        },
        body: body,
        failOnStatusCode: false,
    });

}
export default { getSettingOption, getVendorList, createWorkFlow, getWorkFlowById, getWorkFlowList, updateWorkflowById }
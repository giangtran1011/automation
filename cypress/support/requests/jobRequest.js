import { DateTime } from 'luxon'
// create job
function createJobAPI(url, method, accessToken, clientStudio, jobCode, jobName, deadlineutc, properties) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            clientId: clientStudio,
            jobCode: jobCode,
            jobName: jobName,
            deadlineutc: deadlineutc,
            properties: properties
        },
        failOnStatusCode: false,
    })
};

// Invalid content-type
function checkContentType(url, method, accessToken, clientStudio, jobCode, jobName, deadlineutc, properties) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': '',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            clientId: clientStudio,
            jobCode: jobCode,
            jobName: jobName,
            deadlineutc: deadlineutc,
            properties: properties
        },
        failOnStatusCode: false,
    })
};

// Invalid content-type for authenticateAPI
function checkContentTypeAuthen(url, method, clientId, clientSecret) {
    return cy.api({
        method: method,
        url: url,
        headers: { 'Content-Type': 'multipart/form-data123' },
        body: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        },
        form: true,
        failOnStatusCode: false
    })
};

// update job
function updateJobAPI(url, method, accessToken, clientStudio, jobCode, jobName, deadlineutc, properties) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            clientId: clientStudio,
            jobCode: jobCode,
            jobName: jobName,
            deadlineutc: deadlineutc,
            properties: properties
        },
        failOnStatusCode: false,
    })
};

// import job func
function importJobAPI(url, method, accessToken, data) {
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

// import job func with invalid content-type
function checkContentImportJob(url, method, accessToken, data) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': '',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
        failOnStatusCode: false,
    })
};

// update job func with invalid content-type
function checkContentUpdateJob(url, method, accessToken, clientStudio, jobCode, jobName, deadlineutc, properties) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': '',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            clientId: clientStudio,
            jobCode: jobCode,
            jobName: jobName,
            deadlineutc: deadlineutc,
            properties: properties
        },
        failOnStatusCode: false,
    })
};

// get job func
function getJobAPI(url, method, accessToken) {
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

// get import job status func
function getImportJobStatusAPI(url, method, accessToken, getImportId, getJobId) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: {
            'importId': getImportId,
            'jobId': getJobId
        },
        failOnStatusCode: false,
    })
};

// list jobs func
function listJobsAPI(url, method, accessToken) {
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

function assertSQLGetJob(clientIdTest, moreCondition, index, response) {
    cy.sqlServer(
        `SELECT JobId,  JobCode, JobName, clientId, DeadlineDatetimeUtc 
        FROM Job 
        WHERE clientId = '${clientIdTest}' ${moreCondition} `
    ).then((sqlQuery) => {
        switch (index) {
            case 1:
                {
                    for (let i = 1; i >= 0; i--) {
                        let sqlDataTest1 = sqlQuery[i];
                        let responseData = response.pageData[Math.abs(i - 1)];
                        expect(sqlDataTest1[0]).to.equal(responseData.jobId.toUpperCase());
                        expect(sqlDataTest1[1]).to.equal(responseData.jobCode);
                        expect(sqlDataTest1[2]).to.equal(responseData.jobName);
                        expect(sqlDataTest1[3]).to.equal(responseData.clientId.toUpperCase());
                        expect(DateTime.fromISO((sqlDataTest1[4])).valueOf()).to.equal(parseInt((responseData.deadlineUtc)));
                    }
                    break;
                }
            case 0:
                {
                    expect(sqlQuery[0]).to.equal(response.pageData[0].jobId.toUpperCase());
                    expect(sqlQuery[1]).to.equal(response.pageData[0].jobCode);
                    expect(sqlQuery[2]).to.equal(response.pageData[0].jobName);
                    expect(sqlQuery[3]).to.equal(response.pageData[0].clientId.toUpperCase());
                    expect(DateTime.fromISO((sqlQuery[4])).valueOf()).to.equal(parseInt((response.pageData[0].deadlineUtc)));
                    break;
                }
        }

    });
    return true;
}

function assertImportStatus(apiRes, jobId, ImportId) {
    expect(apiRes.body.finished).to.be.true;
    expect(apiRes.body.success).to.be.true;
    expect(apiRes.body.errors).to.empty;
    expect(apiRes.body.jobId).to.equal(jobId);
    expect(apiRes.body.importId).to.equal(ImportId);
};

function assertSQLGetProduct(productCode, clientId, productName, jobId) {
    cy.sqlServer(
        `SELECT productCode, clientId, productName, jobId 
        FROM Product
        WHERE jobId = '${jobId}' AND  productCode = '${productCode}'`
    ).then((sqlQuery) => {
        console.log(sqlQuery);
        console.log(productCode);
        expect(sqlQuery[0]).to.equal(productCode);
        expect(sqlQuery[1]).to.equal(clientId.toUpperCase());
        expect(sqlQuery[2]).to.equal(productName);
        expect(sqlQuery[3]).to.equal(jobId.toUpperCase());
    });
    return true;
}

export default { getJobAPI, importJobAPI, getImportJobStatusAPI, createJobAPI, updateJobAPI, listJobsAPI, assertSQLGetJob, checkContentType, assertImportStatus, assertSQLGetProduct, checkContentTypeAuthen, checkContentImportJob, checkContentUpdateJob };
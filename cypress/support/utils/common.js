import { DateTime } from 'luxon'

function random(value) {
    return value + "_" + Math.floor(Math.random() * 10000) + 1;
};

// authentication func
function authenAPI(url, method, clientId, clientSecret) {
    return cy.api({
        method: method,
        url: url,
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
        body: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        },
        form: true,
        failOnStatusCode: false
    })
};

// assert api response func with 200 status
function assertResAPI(apiRes, objectKeys) {
    expect(apiRes.status).to.eq(200);
    expect(apiRes.body).to.not.equal(null);
    expect(apiRes.body).to.have.key(
        objectKeys
    );
};

// verify schema of sending request create job

// assert api response func with all status code in create job
function assertResponse(apiRes, code, message, objectKeys) {
    expect(apiRes.status).to.eq(code);
    switch (code) {
        case 200:
            {
                expect(apiRes.body).to.not.equal(null);
                expect(apiRes.body).to.have.key(
                    objectKeys);
            }
            break;
        case 400:
            expect(apiRes.body.errors[0].message).to.eq(message);
            break;
        case 401:
            expect(apiRes.statusText).to.eq(message);
            break;
        case 403:
            expect(apiRes.body.errors[0].message).to.eq(message);
            break;
        case 405:
            expect(apiRes.body.errors[0].message).to.eq(message);
            break;
        case 415:
            expect(apiRes.body.errors[0].message).to.eq(message);
            break;
        default:
            {
                cy.log("Exception")
            }
    }

    return true;
}

// assert SQL
function assertSQL(clientStudio, jobCode, jobId, jobName, deadlineutc) {
    cy.sqlServer(
        `SELECT clientId, JobId,  JobCode, JobName, DeadlineDatetimeUtc 
        FROM Job 
        WHERE clientId = '${clientStudio}' and JobCode = '${jobCode}' and JobId ='${jobId}'`
    ).then((sqlQuery) => {
        expect(sqlQuery[0]).to.equal((clientStudio).toUpperCase());
        expect(sqlQuery[1]).to.equal((jobId).toUpperCase());
        expect(sqlQuery[2]).to.equal(jobCode);
        expect(sqlQuery[3]).to.equal(jobName);
        if ((deadlineutc == null) || (deadlineutc == "")) {
            expect(sqlQuery[4]).to.equal(null);
        } else {
            expect(DateTime.fromISO((sqlQuery[4])).valueOf()).to.equal(parseInt((deadlineutc)));
        }
    });
    return true;
};

function compareObject(object1, object2, ingnoreFieldLst) {
    if(ingnoreFieldLst) {
        removeKeys(object1, ingnoreFieldLst);
        removeKeys(object2, ingnoreFieldLst);
    }
    expect(JSON.stringify(object1)).to.equal(JSON.stringify(object2));
}

function removeKeys(obj, keys) {
    for (var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
            switch(typeof(obj[prop])) {
                case 'object':
                    if(keys.indexOf(prop) > -1) {
                        delete obj[prop];
                    } else {
                        removeKeys(obj[prop], keys);
                    }
                    break;
              default:
                    if(keys.indexOf(prop) > -1) {
                        delete obj[prop];
                    }
                    break;
            }
        }
    }
}

export default { authenAPI, assertResAPI, assertResponse, assertSQL, random, compareObject, removeKeys};
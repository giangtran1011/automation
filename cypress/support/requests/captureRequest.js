// list products func
function getPresignedUrl(url, method, accessToken, body) {
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

function putPresignedUrl(url, method, picture) {
    return new Promise((resolve, reject) => {
        fetch(picture)
            .then(x => x.blob())
            .then(blob => {
                console.log("PUT to s3");
                fetch(`${url}`, {
                        method: method,
                        headers: new Headers({
                            'Content-Type': 'image/jpeg',
                            'x-amz-server-side-encryption': 'aws:kms',
                            'x-amz-server-side-encryption-aws-kms-key-id': 'arn:aws:kms:ap-southeast-1:092392787187:key/b6bb7777-fe1b-428e-a65b-906d271bd306'
                        }),
                        body: blob
                    })
                    .then(r => {
                        resolve(r);
                    })
            });
    })
};


function searchTask(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false,
    })
};

function getTaskDetail(url, method, accessToken) {
    return cy.api({
        method: method,
        url: url,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        failOnStatusCode: false,
    })
};

function submitTask(url, method, accessToken, body) {
    console.log("Begin submitTask");
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

function checkSqlColorRef(colorRefs) {
    const colorRefsStr = `'${colorRefs.join("','")}'`;
    return cy.sqlServer(
        `select count(*) from Lighthouse_Asset_0001.dbo.PhysicalFile
        where PhysicalFileId in ( ${colorRefsStr}) AND PhysicalFileTypeId = 3
    `
    )
};

function checkSqlRating(assets) {
    const assetsStr = `'${assets.join("','")}'`;
    return cy.sqlServer(
        `select  MetadataValue
		from Lighthouse_Asset_0001.dbo.AssetMetadata 
		where AssetId in (${assetsStr}) and MetadataId = 1;
    `
    )
};


function checkSQLAssetsProps(taskId, finalSelectionMode) {
    let selectionField = 'FinalSelectionJsonValue';
    switch (finalSelectionMode) {
        case 3:
            selectionField = 'PreSelectionByPositionJsonValue';
            break;

        case 1:
            selectionField = 'FinalSelectionJsonValue';
            break;
    }
    return cy.sqlServer(`
        select top 1 ${selectionField} from WorkUnitAssetSelection 
        where WorkUnitId = (Select top 1 workunitid from Task where TaskId = '${taskId}')
    `);
}


function assertSQLPostPresignedUrl(TempFileId, responseData, requestData) {
    cy.sqlServer(
        `select FileKey, ClientId, PhysicalFileTypeId, AssetId, FileLength, FileMd5  
		from Lighthouse_SystemInternal.dbo.tempfile 
		where TempFileId = '${TempFileId}'
        `
    ).then((aaa) => {
        let responseFileKey = responseData.body.files[0].presignedUrl.substring(54, 199);
        expect(aaa[0]).to.eq(responseFileKey);
        expect(aaa[1]).to.eq(requestData.clientId.toUpperCase());
        expect(aaa[2]).to.eq(requestData.physicalFileTypeId);
        expect(aaa[3]).to.eq(responseData.body.files[0].tempAssetId.toUpperCase());
        expect(parseInt(aaa[4])).to.eq(requestData.files[0].fileLength);
        expect(aaa[5]).to.eq(requestData.files[0].fileMd5);
    });
    return true;

}

function assertResponseAndError(apiRes, code, message, objectKeys) {
    switch (code) {
        case 200:
            {
                expect(apiRes.status).to.eq(code);
                expect(apiRes.body).to.have.key(
                    objectKeys);
            }
            break;
        case 14:
            expect(apiRes.status).to.eq(200);
            expect(apiRes.body.errorFiles[0].errorCode).to.eq(code);
            break;
        case 13:
            expect(apiRes.status).to.eq(200);
            expect(apiRes.body.errorFiles[0].errorCode).to.eq(code);
            break;
        case 1:
            expect(apiRes.status).to.eq(200);
            expect(apiRes.body.errorFiles[0].errorCode).to.eq(code);
            break;
        case 11:
            expect(apiRes.status).to.eq(200);
            expect(apiRes.body.errorFiles[0].errorCode).to.eq(code);
            break;
        case 12:
            expect(apiRes.status).to.eq(200);
            expect(apiRes.body.errorFiles[0].errorCode).to.eq(code);
            break;
        case 3:
            expect(apiRes.status).to.eq(200);
            expect(apiRes.body.errorFiles[0].errorCode).to.eq(code);
            break;

            // case 401:
            //     expect(apiRes.statusText).to.eq(message);
            //     break;
            // case 403:
            //     expect(apiRes.body.errors[0].message).to.eq(message);
            //     break;
            // case 405:
            //     expect(apiRes.body.errors[0].message).to.eq(message);
            //     break;
            // case 415:
            //     expect(apiRes.body.errors[0].message).to.eq(message);
            //     break;
        default:
            {
                cy.log("Exception")
            }
    }

    return true;
}

export default { getPresignedUrl, putPresignedUrl, searchTask, getTaskDetail, submitTask, checkSqlColorRef, checkSqlRating, checkSQLAssetsProps, assertSQLPostPresignedUrl, assertResponseAndError }
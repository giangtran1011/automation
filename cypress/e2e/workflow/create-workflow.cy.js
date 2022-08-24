import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import prepareData from '../../fixtures/workflow-data/createWorkFlowPrepare/createWorkFlowData.json';
import workflowRequest from '../../support/requests/workFlowRequest.js';
import common from '../../support/utils/common.js';
/**
 * Hint: Đọc file từ prepareData
 * Phần verify data: ghi kết quả response API vào file 1 lần duy nhất,
 * sửa manual bằng tay kết quả,
 * 
 * Đọc File response so sánh với với kết quả api trả về
 * Phần verify Database tao ra test case riêng lưu vào mảng và so sánh
 * 
 */
let urlCreateWorkflow = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.CREATE_WORKFLOW;
let ACCESS_TOKEN_FULL_PERMISSION = '';
let ACCESS_TOKEN_VIEW_PERMISSION = '';
let ACCESS_TOKEN_LIMIT_PERMISSION = '';
let ACCESS_TOKEN_NONE_PERMISSION = '';
let folderPathPrepareData = 'cypress/fixtures/workflow-data/createWorkFlowPrepare/input/';
let folderPathOutput = 'cypress/fixtures/workflow-data/createWorkFlowPrepare/output/';
let folderPathVerifyDb = "cypress/fixtures/workflow-data/createWorkFlowPrepare/verifyDatabase/verifyDatabase.json";
let listIdInsert = [];
let sqlLst = [];
describe('Login', () => {
    before(() => {
        listIdInsert = [];
    });
    it('Get token full permission', () => {
        cy.login(Settings.USER_NAME_1, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_FULL_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_FULL_PERMISSION);
        })
    });

    it('Get token limit permission', () => {
        cy.login(Settings.USER_NAME_2, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_LIMIT_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_LIMIT_PERMISSION);
        })
    });

    it('Get token none permission', () => {
        cy.login(Settings.USER_NAME_3, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_NONE_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_NONE_PERMISSION);
        })
    });

    it('Get token view permission', () => {
        cy.login(Settings.USER_NAME_VIEW, Settings.PASS_WORD_NA).then(() => {
            ACCESS_TOKEN_VIEW_PERMISSION = JSON.parse(localStorage.getItem('user')).token.access_token;
            cy.log("Token access", ACCESS_TOKEN_VIEW_PERMISSION);
        })
    });
});

describe('API - CreateWorkFlow', () => {
    /// radmom workflowname
    prepareData.forEach((object, index) => {
        it(object.title, () => {
            object.token = checkToken(object.token);
            cy.readFile(folderPathPrepareData + object.requestBody).then(json => {
                if (object.generateName != "No") {
                    json.name = "workflow_" + parseInt(Math.random().toString(9).substring(2, 9));
                }
                if(object.generateName === "special_character") {
                    debugger;
                    json.name = "workflow_@#$%$%%^&&*" + parseInt(Math.random().toString(9).substring(2, 9));
                }

                workflowRequest.createWorkFlow(urlCreateWorkflow, Settings.POST_METHOD, object.param, json, object.token).then(res => {
                    if (res.body != undefined && res.body.data != undefined && res.body.data.id != undefined) {
                        listIdInsert.push(res.body.data.id);
                        console.log(listIdInsert);
                    }
                    expect(res.status).to.eq(object.code);
                    cy.readFile(folderPathOutput + object.responseBody).then(jsonFileData => {
                        if (jsonFileData != "undefined") {
                            common.compareObject(jsonFileData, res.body, "requestId,id");
                        } else {
                            expect(res.body).to.eq(undefined);
                        }
                    });

                });
            });
        });
    });

});

describe('Verify Database', () => {
    //verify Database
    it('Verify Database', () => {
        verifyDatabase();
        cy.readFile(folderPathVerifyDb).then(json => {
            for (var i = 0; i < json.length; i++) {
                common.compareObject(json[i], JSON.parse((sqlLst[i])), "Name");
            }
        })
    });
});

function checkToken(token) {
    if (token === 'view-permission') {
        return token = ACCESS_TOKEN_VIEW_PERMISSION;
    } else if (token === 'none-permission') {
        return token = ACCESS_TOKEN_NONE_PERMISSION;
    } else if (token === 'limit-permission') {
        return token = ACCESS_TOKEN_LIMIT_PERMISSION;
    } else {
        return token = ACCESS_TOKEN_FULL_PERMISSION;
    }
}


function verifyDatabase() {

    for (var i = 0; i < listIdInsert.length; i++) {
        cy.sqlServer(
            `select WV.ViewJsonValue, wf.WorkflowName, wf.ClientId
            from Workflow wf
                     join WorkflowVersion WV on wf.WorkflowId = WV.WorkflowId
            where wf.WorkflowId = '${listIdInsert[i]}'
              and wf.IsDeleted = 'false'`
        ).then((sqlQuery) => {
            sqlLst.push(sqlQuery[0]);
        });
    }
    console.log("List sql list", sqlLst);
    return true;
}
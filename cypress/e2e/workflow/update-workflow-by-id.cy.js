import * as urlConfig from '../../support/utils/baseUrlApiConts.js'
import * as Settings from '../../support/utils/globalContants.js';
import prepareData from '../../fixtures/workflow-data/updateWorkflowPrepare/updateWorkflowData.json';
import workflowRequest from '../../support/requests/workFlowRequest.js';
import common from '../../support/utils/common.js';

let url = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.UPDATE_WORK_FLOW_BY_ID;
let urlCreateWorkflow = urlConfig.BASE_URL_SANDBOX_V2 + urlConfig.CREATE_WORKFLOW;
let ACCESS_TOKEN_FULL_PERMISSION = '';
let ACCESS_TOKEN_LIMIT_PERMISSION = '';
let ACCESS_TOKEN_NONE_PERMISSION = '';
let folderPathRequestBody = 'cypress/fixtures/workflow-data/updateWorkflowPrepare/input/';
let folderPathOutput = 'cypress/fixtures/workflow-data/updateWorkflowPrepare/output/';
let folderPathInsertData = 'cypress/fixtures/workflow-data/updateWorkflowPrepare/defaultWorkFlow/';
let folderPathVerifyDb = "cypress/fixtures/workflow-data/updateWorkflowPrepare/verifyDatabase/verifyDatabase.json";
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
});


describe('API - Update workflow by Id', () => {
    prepareData.forEach(object => {
        it(object.title, () => {
            object.token = checkToken(object.token);
            //insert workflow in db
            // case validate
            if(object.dataInsert === undefined) {
                cy.readFile(folderPathRequestBody+ object.requestBody).then(request => {
                    workflowRequest.updateWorkflowById(url.replace('{workflowId}',  object.paramWorkflowId), Settings.PUT_METHOD, request, object.token).then(responseUpdate => {
                        readFileCompare(responseUpdate.body, object);
                    });
                });
            }else if(object.dataInsert != undefined && object.paramClientId_2 != undefined) {
                cy.readFile(folderPathInsertData+object.dataInsert).then(requestInsert => {
                  let  objectClient1 = requestInsert;
                  objectClient1.name = "workflow_" + parseInt(Math.random().toString(9).substring(2, 9));
                  let objectClient2 = requestInsert;
                  objectClient2.name = "workflow_1" + parseInt(Math.random().toString(9).substring(2, 9));
                  workflowRequest.createWorkFlow(urlCreateWorkflow, Settings.POST_METHOD, object.paramClientId, objectClient1, object.token).then(responseInsert => {
                    workflowRequest.createWorkFlow(urlCreateWorkflow, Settings.POST_METHOD, object.paramClientId_2, objectClient2, object.token).then(responseInsert2 => {
                        listIdInsert.push(responseInsert2.body.data.id);
                        cy.readFile(folderPathRequestBody+object.requestBody).then(requestUpdate => {
                            requestUpdate.name = objectClient1.name;
                            workflowRequest.updateWorkflowById(url.replace('{workflowId}', responseInsert2.body.data.id), Settings.PUT_METHOD, requestUpdate, object.token).then(responseUpdate => {
                                readFileCompare(responseUpdate.body, object);
                            });
                        });
                    });
                  });
                });
            }else {
                cy.readFile(folderPathInsertData+object.dataInsert).then(requestInsert => {
                    //call api insert
                    requestInsert.name = "workflow_" + parseInt(Math.random().toString(9).substring(2, 9));
                    workflowRequest.createWorkFlow(urlCreateWorkflow, Settings.POST_METHOD, object.paramClientId, requestInsert, object.token).then(responseInsert => {
                        object.paramWorkflowId = responseInsert.body.data.id;
                        listIdInsert.push(object.paramWorkflowId);
                        cy.log("List id insert", listIdInsert);
                        //check workflowId exist
                        if(object.paramWorkflowId) {
                            cy.readFile(folderPathRequestBody+object.requestBody).then(requestUpdate => {
                                requestUpdate.name = requestInsert.name;
                                workflowRequest.updateWorkflowById(url.replace('{workflowId}', object.paramWorkflowId), Settings.PUT_METHOD, requestUpdate, object.token).then(responseUpdate => {
                                    readFileCompare(responseUpdate.body, object);
                                });
                            });
                        }
                    });
                });
            }
        });
    });
});

describe('Verify Database', () => {
    //verify Database
    it('Verify Database', () => {
        verifyDatabase();
        cy.readFile(folderPathVerifyDb).then(json => {
            for (var i = 0; i < json.length; i++) {
                common.compareObject(json[i], JSON.parse(sqlLst[i]), "Name");
            }
        })
    });
});

function readFileCompare(responseBody, object) {
    cy.readFile(folderPathOutput+ object.responseBody).then(mockResponse => {
        if (mockResponse != "undefined") {
        common.compareObject(responseBody, mockResponse, "requestId");
        }else {
            expect(responseBody).to.eq(undefined);
        }
    });
}

function checkToken(token) {
   if (token === 'none-permission') {
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
            `select top 1 WV.ViewJsonValue, wf.WorkflowName, wf.ClientId
            from Workflow wf
                     join WorkflowVersion WV on wf.WorkflowId = WV.WorkflowId
            where wf.WorkflowId = '${listIdInsert[i]}'
              and wf.IsDeleted = 'false' order by WV.CreatedDatetimeUtc desc`
        ).then((sqlQuery) => {
            sqlLst.push(sqlQuery[0]);
        });
    }
    console.log("List sql list", sqlLst);
    return true;
}
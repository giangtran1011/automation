//Dùng data đã tạo ở viewPermissionAuto (naptl+viewauto) và getWorkFlow (naptl+workflow)
import common from '../../support/utils/common.js';
import * as Settings from '../../support/utils/globalContants.js';
import workFlowRequest from '../../support/requests/workFlowRequest';
import getWorkFlowList from '../../fixtures/workflow-data/getListWorkFlowData.json'

//Prepare data:
// - Tạo một user riêng naptl+workflow để có list Workflow riêng
// - Tạo một user riêng naptl+viewauto chỉ có quyền view
// - Tạo một client xong xóa: d1814cc3-bce4-4629-aa16-6cd0a9fabcf2 (Deleted Client for WF)

let ACCESS_TOKEN_WF = '';
let ACCESS_TOKEN_VIEW = '';
let ACCESS_TOKEN_NON = '';

describe('Login', () => {
    it('Get token for list workFlow', () => {
        cy.login(Settings.USER_NAME_WF, Settings.PASS_WORD_NA).then(() => {
            ACCESS_TOKEN_WF = JSON.parse(localStorage.getItem('user')).token.access_token;
        })
    });

    it('Get token for only view permission', () => {
        cy.login(Settings.USER_NAME_VIEW, Settings.PASS_WORD_NA).then(() => {
            ACCESS_TOKEN_VIEW = JSON.parse(localStorage.getItem('user')).token.access_token;
        })
    })

    it('Get token for no workFlow permission', () => {
        cy.login(Settings.USER_NAME_3, Settings.PASS_WORD_1).then(() => {
            ACCESS_TOKEN_NON = JSON.parse(localStorage.getItem('user')).token.access_token;
        })
    });
});

describe('GET - Get styleGuide by styleGuideId API', () => {

    getWorkFlowList.forEach(({
        title,
        clientId,
        compareData,
        code,
        message
    }) => {
        it(title, () => {
            let objectKeys = ['metadata', 'data'];
            let url = `${Settings.INTERNAL_URL}/workflows?clientId=${clientId}`;
            if (clientId == "") {
                url = `${Settings.INTERNAL_URL}/workflows`
            } else url = `${Settings.INTERNAL_URL}/workflows?clientId=${clientId}`;
            switch (message) {
                case 'Success':
                    workFlowRequest.getWorkFlowList(url, Settings.GET_METHOD, ACCESS_TOKEN_WF).then((apiRes) => {
                        common.assertResponse(apiRes, code, message, objectKeys);
                        expect(JSON.stringify(apiRes.body.data)).to.equal(JSON.stringify(compareData));
                    })
                    break;

                case 'Success view':
                    workFlowRequest.getWorkFlowList(url, Settings.GET_METHOD, ACCESS_TOKEN_VIEW).then((apiRes) => {
                        common.assertResponse(apiRes, code, message, objectKeys);
                        expect(JSON.stringify(apiRes.body.data)).to.equal(JSON.stringify(compareData));
                    })
                    break;

                case 'UserNotHavePermissionOnClient':
                    if (clientId != "") {
                        workFlowRequest.getWorkFlowList(url, Settings.GET_METHOD, ACCESS_TOKEN_WF).then((apiRes) => {
                            expect(apiRes.body.metadata.message).to.equal(message);
                        })
                    } else workFlowRequest.getWorkFlowList(url, Settings.GET_METHOD, ACCESS_TOKEN_NON).then((apiRes) => {
                        expect(apiRes.body.metadata.message).to.equal(message);
                    })
                    break;


                default:
                    {
                        cy.log("Exception")
                    }
            }
        });
    })
});
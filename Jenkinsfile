pipeline {
    agent any
    tools {nodejs "nodejs"}

    parameters {
        string(name: 'SERVICE_BRANCH', defaultValue: 'master', description: 'Chọn nhánh build')
        choice(name: 'BROWSER', choices: ['chrome', 'edge'], description: 'Chọn trình duyệt')
        string(name: 'SPEC', defaultValue: 'cypress/e2e/**/***', description: 'Chọn file để test')
    }
    options {
        ansiColor('xterm')
    }

    stages {
        stage('Clone') {
            steps {
                echo "Clone source code from git"
                git 'https://github.com/giangtran1011/automation.git'
            }
        }

        stage('Run Testing') {
            steps {
                sh "npm install -g"
                sh "npm install cypress --save-dev"
                sh "apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb"
                sh "chmod 777 /var/jenkins_home/.cache/Cypress/10.6.0/Cypress/Cypress"
                sh "chmod 777 cypress/e2e/asset/get-asset.cy.js"
                sh "npx cypress run  --browser ${BROWSER} --spec ${SPEC}"
            }
        }
    }

    post {
        always { 
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true, reportDir: 'cypress/reports', reportFiles: 'index.html', reportName: 'Report Auto Test', reportTitles: ''])
        }
        success {
            echo 'Run test case successfully'
        }
        failure {
            echo 'Have some error !, Please check service again'
        }
    }
  
}

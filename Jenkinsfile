pipeline {
    agent any
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
                bat "npm i"
                bat "npx cypress run  --browser ${BROWSER} --spec ${SPEC}"
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

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
        stage('Buiding') {
        steps {
            echo "Running build ${env.BUILD_ID} on ${env.JENKINS_URL}"
        }
        }

        stage('Testing') {
            steps {
                bat "npm i"
                bat "npx cypress run  --browser ${BROWSER} --spec ${SPEC}"
            }
        }

         stage('Deploy') {
        steps {
            echo "Deploy application"
        }
         }
    }

    post {
        always { 
            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'cypress/report', reportFiles: 'index.html', reportName: 'HTML Report', reportTitles: 'HTML report'])
            echo 'I will always say Hello again!'
        }
        success {
            echo 'I will say Hello only if job is success'
        }
        failure {
            echo 'I will say Hello only if job is failure'
        }
    }
  
}

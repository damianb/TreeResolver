#!groovy

pipeline {
  options {
    gitLabConnection('gitlab@nebula')
    gitlabBuilds(builds: ['jenkins'])
    timestamps()
  }
  post {
    failure {
      updateGitlabCommitStatus name: 'jenkins', state: 'failed'
    }
    success {
      updateGitlabCommitStatus name: 'jenkins', state: 'success'
    }
  }
  agent {
    docker {
      image 'node:8.11.1-alpine'
    }
  }
  environment {
    CI = 'true'
  }
  stages {
    stage('Prepare') {
      environment {
        YARN_VERSION = '1.6.0'
        NPM_CONFIG_LOGLEVEL = 'warn'
      }
      steps {
        updateGitlabCommitStatus name: 'jenkins', state: 'running'
        sh "npm install -g yarn@${env.YARN_VERSION}"
        // workaround for https://github.com/nodejs/docker-node/issues/661
        sh 'chmod +x /usr/local/lib/node_modules/yarn/bin/yarn.js'
        sh 'yarn --offline'
      }
    }

    stage('QA') {
      parallel {
        stage('Lint') {
          steps {
            sh 'npm run style'
          }
        }
        stage('Test') {
          steps {
            sh 'npm run unit'
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Build Docs') {
          steps {
            sh 'npm run docs'
          }
        }
        stage('Build JS') {
          steps {
            sh 'npm run build'
          }
        }
      }
    }
  }
}

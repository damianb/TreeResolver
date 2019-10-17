#!groovy

pipeline {
  options {
    gitLabConnection('gitlab@cr.imson.co')
    gitlabBuilds(builds: ['sonar'])
    disableConcurrentBuilds()
    timestamps()
  }
  post {
    failure {
      updateGitlabCommitStatus name: 'sonar', state: 'failed'
    }
    unstable {
      updateGitlabCommitStatus name: 'sonar', state: 'failed'
    }
    aborted {
      updateGitlabCommitStatus name: 'sonar', state: 'canceled'
    }
    success {
      updateGitlabCommitStatus name: 'sonar', state: 'success'
    }
    always {
      cleanWs()
    }
  }
  agent {
    docker {
      image 'docker.cr.imson.co/sonar-scanner'
    }
  }
  environment {
    CI = 'true'
    NPM_BIN = './node_modules/.bin'
  }
  stages {
    stage('Prepare') {
      steps {
        updateGitlabCommitStatus name: 'sonar', state: 'running'
        sh 'node --version && npm --version && yarn --version'
        sh 'yarn --offline'
      }
    }

    stage('Generate coverage') {
      steps {
        sh """
          $NPM_BIN/nyc $NPM_BIN/mocha \
            --opts tests/ci.mocha.opts \
            --reporter-options configFile=tests/mocha.json \
            ./tests/*.spec.ts
        """.stripIndent()
      }
    }

    stage('Run scan') {
      steps {
        withCredentials([string(credentialsId: 'ed17af17-cf57-494e-a335-921ac149af1b', variable: 'SONARQUBE_API_TOKEN')]) {
          sh """
          cat << CONF > ./sonar.properties
          sonar.host.url=https://sonar.cr.imson.co/
          sonar.projectKey=katana:treeresolver
          sonar.projectName=TreeResolver
          sonar.login=${SONARQUBE_API_TOKEN}
          sonar.sourceEncoding=UTF-8
          sonar.language=ts
          sonar.sources=src
          sonar.tests=tests
          sonar.typescript.lcov.reportPaths=./coverage/lcov.info

          sonar.exclusions=node_modules/**,tests/**,docs/**,dist/**
          CONF
          """.stripIndent()

          withSonarQubeEnv('sonar.cr.imson.co') {
            sh "sonar-scanner -Dproject.settings=./sonar.properties"
          }
        }
      }
    }

    stage("Quality gate") {
      steps {
        timeout(time: 1, unit: 'HOURS') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
}

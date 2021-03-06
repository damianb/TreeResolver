#!groovy

import java.math.RoundingMode
import groovy.util.XmlParser
def coverageRate = 0
pipeline {
  options {
    buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '3', daysToKeepStr: '', numToKeepStr: '20')
    gitLabConnection('gitlab@cr.imson.co')
    gitlabBuilds(builds: ['jenkins'])
    disableConcurrentBuilds()
    timestamps()
  }
  post {
    failure {
      mattermostSend color: 'danger', message: "Build failed: [${env.JOB_NAME}${env.BUILD_DISPLAY_NAME}](${env.BUILD_URL}) - @channel"
      updateGitlabCommitStatus name: 'jenkins', state: 'failed'
    }
    unstable {
      mattermostSend color: 'warning', message: "Build unstable: [${env.JOB_NAME}${env.BUILD_DISPLAY_NAME}](${env.BUILD_URL}) - @channel"
      updateGitlabCommitStatus name: 'jenkins', state: 'failed'
    }
    aborted {
      updateGitlabCommitStatus name: 'jenkins', state: 'canceled'
    }
    success {
      mattermostSend color: 'good', message: "Build completed: [${env.JOB_NAME}${env.BUILD_DISPLAY_NAME}](${env.BUILD_URL}); coverage at ${coverageRate.toString()}%"
      updateGitlabCommitStatus name: 'jenkins', state: 'success'
    }
    always {
      script {
        coverageRate = getCoverage("${env.WORKSPACE}/coverage/cobertura-coverage.xml")
      }
      cleanWs()
    }
  }
  agent {
    docker {
      image 'node:10-alpine'
    }
  }
  environment {
    CI = 'true'
    NPM_BIN = './node_modules/.bin'
    NODE_ENV = 'test'
  }
  stages {
    stage('Prepare') {
      steps {
        updateGitlabCommitStatus name: 'jenkins', state: 'running'
        sh 'node --version && npm --version && yarn --version'
        sh 'yarn --offline'
      }
    }

    stage('QA') {
      parallel {
        stage('Lint') {
          steps {
            sh "$NPM_BIN/eslint ./src/*.ts"
          }
        }
        stage('Unit tests') {
          steps {
            sh """
              $NPM_BIN/nyc $NPM_BIN/mocha \
                --config tests/.ci.mocharc.json \
                --reporter-options configFile=tests/mocha.json \
                ./tests/*.spec.ts
            """.stripIndent()
          }
          post {
            always {
              junit 'test-results.xml'
              cobertura autoUpdateHealth: false,
                autoUpdateStability: false,
                coberturaReportFile: 'coverage/cobertura-coverage.xml',
                failUnhealthy: false,
                failUnstable: false,
                maxNumberOfBuilds: 0,
                onlyStable: false,
                sourceEncoding: 'ASCII',
                zoomCoverageChart: false
            }
          }
        }
      }
    }

    stage('Build') {
      parallel {
        stage('Build Docs') {
          steps {
            sh "$NPM_BIN/typedoc ./src/"
          }
        }
        stage('Build JS') {
          steps {
            sh "$NPM_BIN/tsc -p ./tsconfig.json"
          }
        }
      }
    }
  }
}

@NonCPS
def getCoverage(String file) {
  def xml = new XmlParser(false, true, true)
  xml.setFeature('http://apache.org/xml/features/disallow-doctype-decl', false)
  xml.setFeature('http://apache.org/xml/features/nonvalidating/load-external-dtd', false)
  def node = xml.parse(file)

  BigDecimal coverage = (node.attribute('branches-covered').toBigDecimal() / node.attribute('branches-valid').toBigDecimal()) * 100
  xml = null
  node = null

  return coverage.setScale(2, RoundingMode.HALF_UP).doubleValue()
}

pipeline {
  agent any

  triggers {
    pollSCM('H/2 * * * *')
  }

  environment {
    JENKINS_URL = 'https://jenkins.cicd.kits.ext.educentre.fr/'
    SONAR_HOST_URL = 'https://sonarqube.cicd.kits.ext.educentre.fr'
    SONAR_PROJECT_KEY = 'liam-tasklist-frontend'
    LOCAL_IMAGE = 'efrei-pro-pipepline-tp4-frontend:latest'
    DOCKERHUB_IMAGE = 'liamor2/efrei-pro-pipepline-tp4-frontend'
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Install dependencies') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'Jenkinsfile'
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'tsconfig.json'
          changeset 'vite.config.ts'
          changeset 'biome.json'
          changeset 'src/**'
          changeset 'public/**'
          changeset 'Dockerfile'
          changeset 'nginx.conf'
          changeset 'docker-compose*.yml'
          changeset 'sonar-project.properties'
        }
      }
      steps {
        sh 'npm ci --cache "$HOME/.npm-cache" --prefer-offline'
      }
    }

    stage('Lint and format check') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'Jenkinsfile'
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'tsconfig.json'
          changeset 'vite.config.ts'
          changeset 'biome.json'
          changeset 'src/**'
          changeset 'public/**'
        }
      }
      steps {
        sh 'npm run check'
      }
    }

    stage('Unit tests') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'tsconfig.json'
          changeset 'vite.config.ts'
          changeset 'src/**'
        }
      }
      steps {
        sh 'npm run test:coverage'
        sh 'mkdir -p reports coverage'
        sh 'cp reports/junit.xml reports/junit-unit.xml'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit-unit.xml'
        }
      }
    }

    stage('Build') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'tsconfig.json'
          changeset 'vite.config.ts'
          changeset 'src/**'
          changeset 'public/**'
        }
      }
      steps {
        sh 'npm run build'
      }
    }

    stage('SonarQube analysis and Quality Gate') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'tsconfig.json'
          changeset 'vite.config.ts'
          changeset 'src/**'
          changeset 'sonar-project.properties'
        }
      }
      steps {
        withCredentials([string(credentialsId: 'liam-sonar-token-frontend', variable: 'SONAR_TOKEN')]) {
          sh '''
            docker compose -f docker-compose.ci.yml run --rm               -e SONAR_HOST_URL="${SONAR_HOST_URL}"               -e SONAR_TOKEN="${SONAR_TOKEN}"               -e SONAR_PROJECT_KEY="${SONAR_PROJECT_KEY}"               sonar-scanner
          '''
        }
      }
    }

    stage('Docker build') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'tsconfig.json'
          changeset 'vite.config.ts'
          changeset 'src/**'
          changeset 'public/**'
          changeset 'Dockerfile'
          changeset 'nginx.conf'
          changeset 'docker-compose.yml'
        }
      }
      steps {
        sh 'npm run docker:build'
      }
    }

    stage('Trivy scan') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'src/**'
          changeset 'public/**'
          changeset 'Dockerfile'
          changeset 'nginx.conf'
          changeset 'docker-compose.yml'
          changeset 'docker-compose.ci.yml'
        }
      }
      steps {
        sh 'npm run trivy:scan'
      }
      post {
        always {
          archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/trivy-vulnerabilities.json'
        }
      }
    }

    stage('Generate SBOM') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'src/**'
          changeset 'public/**'
          changeset 'Dockerfile'
          changeset 'nginx.conf'
          changeset 'docker-compose.yml'
          changeset 'docker-compose.ci.yml'
        }
      }
      steps {
        sh 'npm run trivy:sbom'
      }
      post {
        always {
          archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/sbom.cdx.json'
        }
      }
    }

    stage('Push Docker image') {
      when {
        anyOf {
          expression { currentBuild.number == 1 }
          changeset 'package.json'
          changeset 'package-lock.json'
          changeset 'src/**'
          changeset 'public/**'
          changeset 'Dockerfile'
          changeset 'nginx.conf'
          changeset 'docker-compose.yml'
        }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'liam-dockerhub-password',
          usernameVariable: 'DOCKERHUB_USERNAME',
          passwordVariable: 'DOCKERHUB_PASSWORD'
        )]) {
          sh '''
            echo "${DOCKERHUB_PASSWORD}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
            docker tag "${LOCAL_IMAGE}" "${DOCKERHUB_IMAGE}:${BUILD_NUMBER}"
            docker tag "${LOCAL_IMAGE}" "${DOCKERHUB_IMAGE}:latest"
            docker push "${DOCKERHUB_IMAGE}:${BUILD_NUMBER}"
            docker push "${DOCKERHUB_IMAGE}:latest"
            docker logout
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts allowEmptyArchive: true, artifacts: 'coverage/lcov.info,reports/*.json,reports/*.xml'
      cleanWs()
    }
  }
}

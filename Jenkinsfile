pipeline {
  environment {
     ENV="stg"   
   	 PROJECT = "mobitel_pipeline"
 	   APP_NAME = "sfa-frontend"      //Change the application name , which will also be the deployment name
     CIR = "${ENV}-docker-reg.mobitel.lk"
     CIR_USER = 'natheeshshaan@gmail.com'
     CIR_PW = "Qwerty@12"
     KUB_NAMESPACE = "extweb"               //Change the namespace accordingly
     IMAGE_TAG = "natheeshan/${APP_NAME}:${ENV}.${env.BUILD_NUMBER}"
     EXPOSE_PORT="3000"                  
     HARBOUR_SECRET="harbor-extweb"              //Change the harbour secret name accordingly
     
    }
    agent none 
    stages {  

       
        stage('Run SonarQube analysis') {
            agent any
            steps {
                script {
                    def scannerHome = tool 'sonarscanner'
                    withSonarQubeEnv('sonarserver') {
                         sh """
                        sonar-scanner \
                          -Dsonar.projectKey=${APP_NAME} \
                          -Dsonar.projectName='${APP_NAME}' \
                          -Dsonar.sources=src \
                          -Dsonar.exclusions=**/node_modules/**,**/build/**,**/dist/**,**/.next/**,**/out/** \
                          -Dsonar.sourceEncoding=UTF-8
                    """
                    }
                }
            }
        }
		 
        
	  stage('Building & Deploy Image') {
      	agent any
		    steps{
              sh '''
              
          		docker login -u ${CIR_USER} -p ${CIR_PW} ${CIR}
		     	docker build --tag=${IMAGE_TAG} .
				docker push ${IMAGE_TAG}

         	'''
        	}
     }
      
      
      stage('Trivy-Scan') {
            agent {
                docker {
                    image 'aquasec/trivy:latest'
                    args '--entrypoint="" -v /var/jenkins_home/trivy-reports:/reports -v trivy-cache:/root/.cache/ '
                }
            }
            steps {
                script {
                    sh "trivy image --no-progress  --timeout 15m -f table  ${IMAGE_TAG}"

                }
            }
           }
      
      
        stage ('Remove local Image'){
        agent any
             steps {
               sh '''
                   docker image rm ${IMAGE_TAG}
                   rm -rf dockerImage/
               ''' 
              }

        }
      
    
        stage('Deploy cluster') {
              agent {
                 docker {
                       image 'inovadockerimages/cicdtools:latest' 
                         args '-v /root/.cert:/root/.cert'   
                        }
                    }
             steps {
               
               sh '''
               
               mkdir -p /root/.kube/
               cp /root/.cert/${ENV}/config /root/.kube/
               '''
               script {
               def isDeployed = sh(returnStatus: true, script: 'kubectl -n ${KUB_NAMESPACE} set image deployment/${APP_NAME}  ${APP_NAME}=${IMAGE_TAG}  --record ')
                if (isDeployed != 0) {
                        sh '''
                        kubectl -n ${KUB_NAMESPACE} create deployment ${APP_NAME}  --image=${IMAGE_TAG} 
                        kubectl -n ${KUB_NAMESPACE} expose deployment ${APP_NAME}  --name=${APP_NAME} --port=${EXPOSE_PORT}

                        ## Replace the harbour image policy secret name
			   			kubectl -n ${KUB_NAMESPACE} patch deployment ${APP_NAME} --patch \'{"spec": {"template": {"spec": {"imagePullSecrets": [{"name": "'"${HARBOUR_SECRET}"'" }]}}}}\'
                        
                        '''
                    }
               }              
            }
          }
      
     stage('GIT URL & Committer Email') {
          agent any  
          steps {
              script {
                
                  // Retrieve the GIT URL from the checked-out repository
                    GIT_URL = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim()
                    echo "GIT URL: ${GIT_URL}"
                
                  // Extract the committer's email from the latest commit
                  env.COMMITTER_EMAIL = sh(
                      script: "git log -1 --pretty=format:'%ce'",
                      returnStdout: true
                  ).trim()
                  echo "Committer Email: ${env.COMMITTER_EMAIL}"
              }
          }
      }
      
      
         stage('Set Deployment Description Annotation') {
            agent {
                 docker {
                       image 'inovadockerimages/cicdtools:latest' 
                         args '-v /root/.cert:/root/.cert'   
                        }
                    }
            steps {
                  
                  //set kube config token
                 sh '''
                 mkdir -p /root/.kube/
                 cp /root/.cert/${ENV}/config /root/.kube/
                 '''
              
                script {
                    // Bash script to set the description if it doesn't exist
                    sh '''
                    #!/bin/bash
                 
                    echo "GIT URL: ${GIT_URL} "
                    echo "JENKINS URL: ${BUILD_URL} "
                    DESCRIPTION="Jenkins URL: ${BUILD_URL}  GIT URL: ${GIT_URL}"

                    # Check if the deployment has the field.cattle.io/description annotation
                    CURRENT_DESCRIPTION=\$(kubectl -n ${KUB_NAMESPACE} get deployment ${APP_NAME} -o jsonpath='{.metadata.annotations.field\\.cattle\\.io/description}')

                    if [ -z "\$CURRENT_DESCRIPTION" ]; then
                      echo "No field.cattle.io/description found. Setting the description."
                      # Add the annotation to the deployment
                      kubectl -n ${KUB_NAMESPACE} annotate deployment ${APP_NAME} field.cattle.io/description="\${DESCRIPTION}" --overwrite
                    else
                      echo "field.cattle.io/description already exists: \$CURRENT_DESCRIPTION"
                    fi
                    '''
                }
            }
        }     
      
      
      
      
      
        }
            post {
            success {
              mail to: 'mobiteldev@mobitel.lk',
                         subject: "${env.JOB_NAME} - Build  ${env.BUILD_NUMBER} - Success!",
                       body: """${env.JOB_NAME} - Build  ${env.BUILD_NUMBER} - Success:
                             Check console output at ${env.BUILD_URL} to view the results."""
                    }
            failure {
                   mail to: "jenkins.notification@mobitel.lk",
                   cc: 'mobiteldev@mobitel.lk',
                       subject: "${env.JOB_NAME} - Build  ${env.BUILD_NUMBER} - Failed!",
                        body: """${env.JOB_NAME} - Build  ${env.BUILD_NUMBER} - Failed:
                             Check console output at ${env.BUILD_URL} to view the results."""
                  }
             }
            
}

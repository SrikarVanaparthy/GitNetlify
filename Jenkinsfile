pipeline {
    agent any
 
    tools {
        nodejs "NodeJS_18"
    }
 
    environment {
        NETLIFY_AUTH_TOKEN = credentials('netlify_token')
        NETLIFY_SITE_ID = '5b847326-a880-4b91-ad33-dcc3266cc5bc'
        GITHUB_TOKEN = credentials('github_token') // Store GitHub token in Jenkins credentials
        REPO_URL = "https://github.com/SrikarVanaparthy/GitNetlify.git"
        MAIN_BRANCH = "dev"
        PROD_BRANCH = "prod"
    }
 
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    echo "🔄 Checking out code from GitHub..."
                    sh '''
                        rm -rf Netlify || true
                        git clone -b $MAIN_BRANCH $REPO_URL Netlify || { echo "❌ Git clone failed"; exit 1; }
                        echo "✅ Code checkout complete."
                    '''
                }
            }
        }
 
        stage('Verify Node.js & npm') {
            steps {
                script {
                    echo "🔍 Checking Node.js and npm versions..."
                    sh '''
                        which node || { echo "❌ Node.js not found! Install it on Jenkins."; exit 1; }
                        which npm || { echo "❌ npm not found! Install it on Jenkins."; exit 1; }
                        echo "✅ Node.js Version: $(node -v)"
                        echo "✅ npm Version: $(npm -v)"
                    '''
                }
            }
        }
 
        stage('Clean & Install Dependencies') {
            steps {
                script {
                    sh '''
                        echo "🧹 Cleaning old dependencies..."
                        cd Netlify
                        rm -rf node_modules package-lock.json
                        echo "📦 Installing dependencies..."
                        npm install || { echo "❌ Failed to install dependencies"; exit 1; }
                    '''
                }
            }
        }
 
        stage('Run Tests') {
            steps {
                script {
                    sh '''
                        echo "🧪 Running test cases..."
                        cd Netlify
                        npm test || { echo "❌ Tests failed"; exit 1; }
                        echo "✅ All tests passed!"
                    '''
                }
            }
        }
 
        stage('Create Pull Request for Production Merge') {
            steps {
                script {
                    echo "📌 Creating pull request for merging dev into prod..."
                    sh '''
                        cd Netlify

                        # Set GitHub credentials to authenticate
                        git config --global user.email "svanaparthy@anergroup.com"
                        git config --global user.name "SrikarVanaparthy"

                        # Update the origin URL with the GitHub token
                        git remote set-url origin https://$GITHUB_TOKEN@github.com/SrikarVanaparthy/GitNetlify.git
                        git fetch origin

                        # Create Pull Request and capture response
                        PR_RESPONSE=$(curl -s -o response.json -w "%{http_code}" -X POST \
                            -H "Authorization: token $GITHUB_TOKEN" \
                            -H "Accept: application/vnd.github.v3+json" \
                            https://api.github.com/repos/SrikarVanaparthy/GitNetlify/pulls \
                            -d '{
                                "title": "Merge dev into prod",
                                "head": "dev",
                                "base": "prod",
                                "body": "Auto-generated pull request for merging dev into prod."
                            }'
                        )

                        # Check the HTTP response code for success (201)
                        if [ "$PR_RESPONSE" -eq 201 ]; then
                            echo "✅ Pull request created successfully. Please review and merge manually."
                        else
                            echo "❌ Failed to create pull request."
                            cat response.json  # Show detailed error from GitHub
                            exit 1  # Fail the pipeline
                        fi
                    '''
                }
            }
        }

        stage('Wait for PR Merge') {
            steps {
                script {
                    echo "⏳ Waiting for the PR to be merged manually..."
                    sh '''
                        cd Netlify
                        while true; do
                            # Fetch the latest commits from the remote repository
                            git fetch origin

                            # Get the latest commit hash from the prod branch
                            PROD_COMMIT_HASH=$(git log origin/prod -1 --pretty=format:"%H")

                            # Get the latest commit hash from the dev branch
                            DEV_COMMIT_HASH=$(git log origin/dev -1 --pretty=format:"%H")
                            
                            # Display the latest commit hashes for debugging
                            echo "🔍 Latest Commit on prod: $PROD_COMMIT_HASH"
                            echo "🔍 Latest Commit on dev: $DEV_COMMIT_HASH"
                            
                            # Check if the latest dev commit is merged into prod
                            if [ "$PROD_COMMIT_HASH" = "$DEV_COMMIT_HASH" ]; then
                                echo "✅ The latest commit from dev is merged into prod!"
                                break
                            fi
                            
                            # If not merged yet, wait for 60 seconds and check again
                            echo "⏳ Waiting for PR merge..."
                            sleep 60
                        done
                    '''
                }
            }
        }

        stage('Deploy to Netlify (prod branch)') {
            steps {
                script {
                    sh '''
                        echo "🚀 Deploying to Netlify..."
                        
                        # Ensure you're on the prod branch and have the latest code
                        cd Netlify
                        git checkout prod
                        git pull origin prod
                        
                        # Install Netlify CLI globally
                        npm install -g netlify-cli
                        
                        # Install project dependencies
                        npm install
                        
                        # Build the project to generate the 'dist' folder
                        npm run build
                        
                        # Deploy to Netlify
                        npx netlify deploy --dir=dist --prod --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID || { echo "❌ Netlify deployment failed"; exit 1; }
                        
                        echo "✅ Deployment successful!"
                    '''
                }
            }
        }
    }
 
    post {
        success {
            echo "🎉 ✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed! Check logs for details."
        }
    }
}

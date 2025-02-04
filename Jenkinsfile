pipeline {
    agent any
 
    tools {
        nodejs "NodeJS_18"
    }
 
    environment {
        NETLIFY_AUTH_TOKEN = credentials('netlify_token')
        NETLIFY_SITE_ID = 'd8f2c4af-86d6-49c2-a961-9da6ef14856a'
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
                    echo "📌 Creating pull request for merging main into prod..."
                    sh '''
                        cd Netlify
                        git checkout -b temp-merge-branch
                        # Set GitHub credentials to authenticate
                        git config --global user.email "ngogula@anergroup.com"
                        git config --global user.name "Navateja-gogula"
                        # Update the origin URL with the GitHub token
                        git remote set-url origin https://$GITHUB_TOKEN@github.com/SrikarVanaparthy/GitNetlify.git
                        git push origin temp-merge-branch
 
                        PR_RESPONSE=$(curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
                            -H "Accept: application/vnd.github.v3+json" \
https://api.github.com/repos/SrikarVanaparthy/GitNetlify/pulls \
                            -d '{
                                "title": "Merge main into prod",
                                "head": "temp-merge-branch",
                                "base": "prod",
                                "body": "Auto-generated pull request for merging main into prod."
                            }')
 
                        echo "✅ Pull request created. Please review and merge manually."
                    '''
                }
            }
        }
 
        stage('Wait for PR Merge') {
            steps {
                script {
                    echo "⏳ Waiting for the PR to be merged manually..."
                    sh '''
                        while true; do
                            # Fetch the latest commit hashes
                            git fetch origin
                            # Get the latest commit hash on prod branch
                            LATEST_COMMIT_HASH=$(git log origin/prod -1 --pretty=format:"%H")
                            # Get the latest commit hash on temp-merge-branch
                            MERGED_COMMIT_HASH=$(git log origin/temp-merge-branch -1 --pretty=format:"%H")
                            # Compare the commit hashes
                            if [ "$LATEST_COMMIT_HASH" == "$MERGED_COMMIT_HASH" ]; then
                                echo "✅ Commit from temp-merge-branch is merged into prod!"
                                break
                            fi
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
                        git checkout prod
                        git pull origin prod
                        npm install -g netlify-cli
                        cd Netlify
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
pipeline {
    agent any

    tools {
        nodejs "NodeJS_18" // Ensure Node.js 18 is installed via Jenkins Global Tool Configuration
    }

    environment {
        NETLIFY_AUTH_TOKEN = credentials('netlify_token1')
        NETLIFY_TEST_SITE_ID = credentials('netlify-test-site-id') // Your Netlify Test Site ID
        NETLIFY_PROD_SITE_ID = credentials('netlify-prod-site-id') // Your Netlify Prod Site ID
        HOMEPAGE_URL = credentials('homepage-url')
        PROD_HOMEPAGE_URL = credentials('prod-homepage-url')
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    echo "🔄 Checking out code from GitHub..."
                    checkout scm
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

        stage('Install Dependencies') {
            steps {
                script {
                    echo "📦 Installing dependencies..."
                    sh 'npm ci'
                }
            }
        }

        stage('Run Tests (dev branch only)') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    echo "🧪 Running tests for dev branch..."
                    sh 'npm test'
                }
            }
        }

        stage('Build React App') {
            steps {
                script {
                    echo "⚙️ Building the React application..."
                    sh 'npm run build --verbose'

                    // Verify if dist directory exists after build
                    sh '''
                        if [ ! -d "dist" ]; then
                          echo "❌ Build completed but 'dist' directory is missing. Check build configuration."
                          exit 1
                        fi
                        echo "✅ Build successful and 'dist' directory exists."
                    '''
                }
            }
        }

        stage('Deploy to Netlify (dev)') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    echo "🚀 Deploying to Netlify (Test)..."
                    sh '''
                        npm install -g netlify-cli || { echo "❌ Failed to install Netlify CLI"; exit 1; }
                        npx netlify deploy --dir=dist --prod --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_TEST_SITE_ID --homepage_url=$HOMEPAGE_URL || { echo "❌ Netlify deployment failed"; exit 1; }
                    '''
                }
            }
        }

        stage('Pull Request Merge to Prod') {
            when {
                expression { return env.CHANGE_ID != null }
            }
            steps {
                script {
                    echo "🔀 Merging pull request to Prod branch..."
                    sh '''
                        git fetch origin
                        git checkout prod
                        git merge --no-ff --no-edit
                        git push origin prod
                    '''
                }
            }
        }

        stage('Deploy to Netlify (Prod)') {
            when {
                branch 'prod'
            }
            steps {
                script {
                    echo "🚀 Deploying to Netlify (Prod)..."
                    sh '''
                        npm install -g netlify-cli || { echo "❌ Failed to install Netlify CLI"; exit 1; }
                        npx netlify deploy --dir=dist --prod --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_PROD_SITE_ID --homepage_url=$PROD_HOMEPAGE_URL || { echo "❌ Netlify deployment failed"; exit 1; }
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

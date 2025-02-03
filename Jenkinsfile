pipeline {
    agent any
 
    tools {
        nodejs "NodeJS_18" // Ensure Node.js 18 is installed via Jenkins Global Tool Configuration
    }
 
    environment {
        NETLIFY_AUTH_TOKEN = credentials('netlify_token')
        NETLIFY_SITE_ID = 'f9daabf7-0eff-4d0d-ab08-10176b22621a' // Your Netlify Site ID
    }
 
    stages {
        stage('Checkout Code') {
            steps {
                script {
                    echo "🔄 Checking out code from GitHub..."
                    sh '''
                        rm -rf Netlify || true
                        git clone -b main https://github.com/Navateja-gogula/Netlify.git Netlify || { echo "❌ Git clone failed"; exit 1; }
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
                        echo "Current PATH: $PATH"
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
 
        stage('Build React App') {
            steps {
                script {
                    sh '''
                        echo "⚙️ Building the React application..."
                        cd Netlify
                        npm run build || { echo "❌ Build failed"; exit 1; }
                    '''
                }
            }
        }
 
        stage('Deploy to Netlify') {
            steps {
                script {
                    sh '''
                        echo "🚀 Deploying to Netlify..."
                        npm install -g netlify-cli || { echo "❌ Failed to install Netlify CLI"; exit 1; }
                        cd Netlify
                        npx netlify deploy --dir=dist --prod --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID || { echo "❌ Netlify deployment failed"; exit 1; }
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
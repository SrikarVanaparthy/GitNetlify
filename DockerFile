FROM node:18
 
# Set working directory
WORKDIR /usr/src/app
 
# Copy package.json and package-lock.json
COPY package*.json ./
 
# Install dependencies
RUN npm install
 
# Copy the rest of the app
COPY . .
 
# Expose port 3000
EXPOSE 3000
 
# Start the React development server
CMD ["npm", "start"]
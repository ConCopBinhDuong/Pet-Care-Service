# use an official node.js reuntime as a parent image
FROM node:22-alpine

#set the working directory in the container 
WORKDIR /app 

# copy the package.json and the package-lock.json to the containter 
COPY package*.json .

# Install the dependencies 
RUN npm install 

# Copy the rest of the application code 
COPY . .

#Expose the port that the app runs on 
EXPOSE 5003 

# Define the command to run your application 
CMD ["node", "./src/server.js"] 




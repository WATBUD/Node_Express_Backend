# Getting Started with Docker Using Node:
1. Create Dockerfile in command prompt
echo. > Dockerfile

- Place the above Dockerfile in your project's root directory and execute the following command in the terminal to build the Docker image:

docker build -t node_express_backend .

- After the build completes, you can run the following command to start the container:
ß
normal 
docker run -p 9421:9421 --name NodeServer node_express_backend --legacy-watch

bash 
docker run -p 9421:9421 -v $PWD:/app --name NodeServer node_express_backend 

normal 
docker run -p 9421:9421 --name NodeServer node_express_backend --legacy-watch

bash 
docker run -p 9421:9421 -v $PWD:/app --name NodeServer node_express_backend 

windows cmd 
docker run -p 9421:9421 -v %CD%:/app --name NodeServer node_express_backend npm start -- --legacy-watch

docker run -d --name mysql-container -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 mysql:latest


- Start the specified images
docker run -it --rm node:20.11.1-slim /bin/bash

docker run -it --rm node:20.11.1-slim Node.js 的交互式终端



#!/bin/bash

# Build Docker images for React and Node.js applications
docker build -t wordtopdf-frontend ./wordtopdf
docker build -t wordtopdf-backend ./server

# Run the Docker containers
docker run -d --name frontend -p 3000:3000 wordtopdf-frontend
docker run -d --name backend -p 5000:5000 wordtopdf-backend

echo "Containers are up and running!"

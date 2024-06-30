#!/bin/bash

sudo apt-get update
sudo apt-get install -y git

sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo touch /etc/nginx/sites-available/blog_project.conf
sudo chmod +777 /etc/nginx/sites-available/blog_project.conf

sudo mkdir -p /app
GITHUB_ACCESS_TOKEN=""
GITHUB_USERNAME=""

# sudo git clone https://github.com/krishna2808/Blog-API--V2.git /app/blog_project
sudo git clone https://${GITHUB_USERNAME}:${GITHUB_ACCESS_TOKEN=}@github.com/krishna2808/Blog-API--V2.git /app/blog_project
sudo cat /app/blog_project/nginx/nginx.conf > /etc/nginx/sites-available/blog_project.conf
sudo ln -s /etc/nginx/sites-available/blog_project.conf  /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# project setup in docker container on aws ec2 instance 
sudo apt-get install -y docker
sudo apt install -y docker.io
sudo apt-get install -y docker-compose
# docker-compose install 
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

cd /app/blog_project/
sudo docker-compose up -d	


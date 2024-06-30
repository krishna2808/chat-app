#!/bin/bash
cd /app/blog_project/
sudo git config --global --add safe.directory /app/blog_project 
sudo git pull origin main  
source venv/bin/activate
cd /app/blog_project/blog/ 
python manage.py makemigrations 
python manage.py migrate
FROM python:3.10
#FROM python:3.10-slim
#install nano text editor in docker container
RUN apt-get update -y && apt-get install nano -y && apt-get install nginx -y &&  apt-get install -y gunicorn systemd && apt-get install net-tools &&  apt-get install libmariadb-dev-compat libmariadb-dev


# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


# Create directory and sub-directory for project

RUN mkdir -p /app/project-blog/ 

# set work directory
WORKDIR /app/project-blog/


# install dependencies
RUN pip install --upgrade pip && pip install virtualenv
# Create a virtual environment
RUN virtualenv /app/project-blog/venv

# Set the Python interpreter to the venv's interpreter
ENV PATH="/app/project-blog/venv/bin:$PATH"


ADD . /app/project-blog/


# set work directory
WORKDIR /app/project-blog/blog/

RUN pip install -r requirements.txt 


# Create service for gunicorn server. it is possible to start server without create service but we will start, restart and stop gunicorn server using system service. 
# RUN cp /app/project-blog/blog/docker/gunicorn/gunicorn.service /etc/systemd/ && cp /app/project-blog/blog/docker/gunicorn/gunicorn.socket /etc/systemd/   
#RUN systemctl start gunicorn.socket && systemctl enable gunicorn.socket

RUN chmod +x /app/project-blog/blog/docker/backend/entry-point/server-entrypoint.sh


EXPOSE 8000
 
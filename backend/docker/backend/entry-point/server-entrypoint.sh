#!/bin/sh

until cd /app/project-blog/blog/
do
    echo "Waiting for server volume..."
done


# until python manage.py migrate
# do
#     echo "Waiting for db to be ready..."
#     sleep 2
# done

python manage.py collectstatic --noinput

# we are using production environment. it is not restart everytime
#gunicorn bicycle.wsgi:application --bind 0.0.0.0:8000

# we are using development environment. it is restart everytime
# gunicorn blog.wsgi:application --bind 0.0.0.0:8000 --reload

#python manage.py runserver 0.0.0.0:8000


# Note : I have read some articals they have give me direct run gunicorn command. it is not required to setup gunicorn service and socket file 


# gunicorn blog.wsgi:application --bind 0.0.0.0:8000 --reload
# ---------- OR ------------------- we will use configruration file with worker 
gunicorn -c gunicorn.conf.py blog.wsgi


	

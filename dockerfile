FROM ubuntu:latest
WORKDIR /var/www/html
COPY . .
RUN apt update && apt install apache2 python3 python3-pip -y
RUN apt install apache2 apache2-utils ssl-cert libapache2-mod-wsgi-py3 python3-beaker uwsgi uwsgi-plugins-all -y
CMD ["uwsgi", "--http-socket", "0.0.0.0:80", "--plugin", "python3", "--module", "index:app", "--processes", "4", "--threads", "2"]
EXPOSE 80

FROM python:3

WORKDIR /app

RUN pip3 install flask
RUN pip3 install rpi-ws281x

COPY . .

CMD [ "python", "./server.py" ]
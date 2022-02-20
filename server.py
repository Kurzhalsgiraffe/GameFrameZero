import led
import socket
from flask import Flask, request, redirect, url_for, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/apply", methods=["POST"]) #POST Requests only
def apply():
    color = request.json
    led.updateFrame(color)
    return {}

if __name__ == "__main__":
    led.init()
    app.run(host=socket.gethostname())
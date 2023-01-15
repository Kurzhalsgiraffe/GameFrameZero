# GameFrameZero

This project is a DIY LED frame that displays 16x16 pixel art.
It's my attempt to make a comparable DIY device to all the other pixelframes that are available on the market.
It is a Raspberry Pi Zero WH running a web server for creating, storing and animating the pixel art.

Depending on whether you have small electronic components such as switches and DC sockets lying around, the project can be replicated for around 50 euros


<img src="images/gameframe.png" width = 640>
<img src="images/mainpage.png" width = 400>
<img src="images/animationpage.png" width = 400>
<img src="images/animationeditor.PNG" width = 400>

## Installation

Clone Repository
````
git clone https://github.com/Kurzhalsgiraffe/GameFrameZero
````

Make sure to install it with sudo, if you want to run the Server as root
````
sudo apt install python3-pip
sudo pip3 install flask
sudo pip3 install rpi-ws281x
sudo pip3 install waitress
````

## Setup the Autostart

Create service file
````
cd /etc/systemd/system
sudo nano gameframezero.service
````
Paste
````
[Unit]
Description=GameFrameZero Autostart

[Service]
User=root
WorkingDirectory=/home/pi/GameFrameZero/
ExecStart=python3 -O server.py
Restart=always

[Install]
WantedBy=multi-user.target
````
Start the service
````
sudo systemctl start gameframezero.service
sudo systemctl enable gameframezero.service
````

## Setup the GPIO-Shutdown

If you want to shutdown the Raspberry-Pi by pressing a button, you need to enable gpio-shutdown
````
sudo nano /boot/config.txt
````
Paste
````
dtoverlay=gpio-shutdown, gpio_pin=3, active_low=1, gpio_pull=up
````

### Material i used

- Raspberry Pi Zero WH
- 16x16 256 Pixel 5V LED Matrix, WS2812B (Individually Addressable)
- Shadow Box Frame (20cm x 20cm) as the frame case
- DC 5V 3A Power Adapter (Current heavily depends on the brightness of your LED Matrix)
- DC Socket
- Button for Shutting down the PI via GPIO
- Powerswitch
- PCB for soldering
- PCB terminal block
- PCB socket strips
- 3D printed case and grid

<img src="images/backside.png" width = 400>
<img src="images/backside_open.png" width = 400>

## Assembly

Solder all the components together, using PCB terminal blocks to screw in the cables is a good practice.
Since the LED Matrix and the Raspberry both run on 5V, you can use the same powerline for both.
The shutdown button is optional.
GPIO 18 Pin goes to the data pin of the LED Matrix.
I soldered some PCB socket strips to the PCB, to plug the Raspberry Pi directly onto the PCB.

The grid fits perfectly to my Shadow Box Frame. If yours does not fit, can adjust the inventor file.


<img src="images/schematic.png" width = 600>

### Disclaimer

Please note that this is just a hobby project. Code or hardware may not reflect best practice.
Feel free to send me some pull requests! :)

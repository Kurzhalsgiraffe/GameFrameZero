#!/usr/bin/env python3
import time
from rpi_ws281x import PixelStrip, Color

# LED strip configuration:
LED_COUNT = 256        # Number of LED pixels.
LED_PIN = 18          # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10          # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 40   # Set to 0 for darkest and 255 for brightest
LED_INVERT = False    # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

# Set all Pixels to same Color
def setAllPixels(color):
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.show()

# Update current Frame by (index,Color()) tuples
def updateFrame(binaryColors):
    for index in range(LED_COUNT):
        r = binaryColors[index*3]
        g = binaryColors[index*3+1]
        b = binaryColors[index*3+2]
        colorvalue = Color(r,g,b)
        strip.setPixelColor(index, colorvalue)
    strip.show()

def updateBrightness(brightness):
    strip.setBrightness(brightness)
    strip.show()

def init():
    global strip
    strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL) # Create NeoPixel object with appropriate configuration.
    strip.begin() # Intialize the library (must be called once before other functions).
    setAllPixels(Color(0,255,0))
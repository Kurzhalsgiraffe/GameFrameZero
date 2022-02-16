#!/usr/bin/env python3

import time
from rpi_ws281x import PixelStrip, Color

# LED strip configuration:
LED_COUNT = 300        # Number of LED pixels.
LED_PIN = 18          # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10          # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 255  # Set to 0 for darkest and 255 for brightest
LED_INVERT = False    # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

#Color((R,G,B))
#strip.setPixelColor(pixelIndex, ColorClassObject)
#strip.show() will render the set Pixel Colors


# Set all Pixels to same Color
def setAllPixels(color):
    for i in range(strip.numPixels()):
        strip.setPixelColor(i, color)
    strip.show()

# Update current Frame by (index,Color()) tuples
def updateFrame(color):
    for index, c in enumerate(color):
        colorvalue = stringToRGBColor(c)
        strip.setPixelColor(index, colorvalue)
    strip.show()

def stringToRGBColor(color):
    r = int(color[1:3], 16)
    g = int(color[3:5], 16)
    b = int(color[5:7], 16)
    return Color(r,g,b)

def init():
    global strip
    strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA, LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL) # Create NeoPixel object with appropriate configuration.
    strip.begin() # Intialize the library (must be called once before other functions).
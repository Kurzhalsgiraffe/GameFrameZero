#!/usr/bin/env python3

"""WS2812 LED Matrix"""
if not __debug__:
    from rpi_ws281x import PixelStrip, Color

# LED strip configuration:
LED_COUNT = 256       # Number of LED pixels.
LED_PIN = 18          # GPIO pin connected to the pixels (18 uses PWM!).
LED_FREQ_HZ = 800000  # LED signal frequency in hertz (usually 800khz)
LED_DMA = 10          # DMA channel to use for generating signal (try 10)
LED_BRIGHTNESS = 1    # Set to 0 for darkest and 255 for brightest
LED_INVERT = False    # True to invert the signal (when using NPN transistor level shift)
LED_CHANNEL = 0       # set to '1' for GPIOs 13, 19, 41, 45 or 53

# Set all Pixels to same Color
def set_all_pixels(color):
    """Set all pixels to one color"""
    if not __debug__:
        for i in range(strip.numPixels()):
            strip.setPixelColor(i, color)
        strip.show()

# Update current Frame by (index,Color()) tuples
def update_frame(binary_colors):
    """Set Pixel values to binary colors"""
    if not __debug__:
        for index in range(LED_COUNT):
            red = binary_colors[index*3]
            green = binary_colors[index*3+1]
            blue = binary_colors[index*3+2]
            colorvalue = Color(red,green,blue)
            strip.setPixelColor(index, colorvalue)
        strip.show()

def update_brightness(brightness):
    """Set brightmess value"""
    if not __debug__:
        strip.setBrightness(brightness)
        strip.show()

def init():
    """Initialize LED Matrix"""
    if not __debug__:
        global strip
        strip = PixelStrip(LED_COUNT, LED_PIN, LED_FREQ_HZ, LED_DMA,
                            LED_INVERT, LED_BRIGHTNESS, LED_CHANNEL)
        strip.begin()
        set_all_pixels(Color(0,255,0))

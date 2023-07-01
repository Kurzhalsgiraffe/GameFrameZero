"""WS2812 LED Matrix"""

if not __debug__:
    from rpi_ws281x import PixelStrip, Color

class LEDMatrix:
    """ This Class provides all the needed Methods to interact with the LED Matrix """
    def __init__(self, brightness: int):
        self.led_count = 256           # Number of LED pixels.
        self.led_pin = 18              # GPIO pin connected to the pixels (18 uses PWM!).
        self.led_freq_hz = 800000      # LED signal frequency in hertz (usually 800khz)
        self.led_dma = 10              # DMA channel to use for generating signal (try 10)
        self.led_invert = False        # True to invert the signal (NPN transistor level shift)
        self.led_channel = 0           # set to '1' for GPIOs 13, 19, 41, 45 or 53
        self.led_brightness = brightness

        if not __debug__:
            self.strip = PixelStrip(self.led_count, self.led_pin, self.led_freq_hz, self.led_dma, self.led_invert, self.led_brightness, self.led_channel)
            self.strip.begin()

    def set_all_pixels(self, color):
        """ set all pixels to one color """
        if not __debug__:
            for index in range(self.led_count):
                self.strip.setPixelColor(index, color)
            self.strip.show()

    def update_frame(self, binary_colors):
        """ set each pixel index to the color specified in binary_colors """
        if not __debug__:
            for index in range(self.led_count):
                red = binary_colors[index*3]
                green = binary_colors[index*3+1]
                blue = binary_colors[index*3+2]
                colorvalue = Color(red,green,blue)
                self.strip.setPixelColor(index, colorvalue)
            self.strip.show()

    def update_brightness(self,brightness):
        """ set led brightness value """
        self.led_brightness = brightness

        if not __debug__:
            self.strip.setBrightness(brightness)
            self.strip.show()
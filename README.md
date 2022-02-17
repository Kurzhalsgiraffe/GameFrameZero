# LED-Matrix

Für dieses Projekt baute ich mir einen 16x16 DIY Game-Frame aus einem 5 Meter WS2812B (Neopixel) LED-Streifen.
Die Inspiration für dieses Projekt kam von https://www.youtube.com/watch?v=jkg7T7jlIzU.

## Hardware

- Raspberry Pi Zero W
- WS2812B Neopixel 5 Meter (60 LEDs/Meter)
- Pegelwandler (3.3V -> 5V)

## Software

--- Work in Progress ---

Die Idee war es, eine einfache WebApp für das Zeichnen der Pixelbilder zu bauen, und die Pixelwerte an einen
Flask Server zu übermitteln, der auf dem RPI0 läuft. Später sollen Animationen und Live-Zeichnungen möglich sein.

## Installation



````
git clone https://github.com/Kurzhalsgiraffe/LED-Matrix
````
````
cd LED-Matrix
````
````
docker build -t neopixel .
````
````
docker run -d --privileged neopixel
````

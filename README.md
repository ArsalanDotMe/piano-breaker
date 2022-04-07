# piano-breaker
This is an attempt to create a program that can play [piano tiles](https://play.google.com/store/apps/details?id=com.kury.pianotiles2&gl=US) automatically and hopefully beat the global high-score.

# How it works
You need to connect an android phone with a USB cable to your computer before you run this. 
The program works by using ADB to take a screenshot from the phone running the piano app and sends it over to a CLI (written in Rust).
The Rust utility examines the image, computes the area of black piano tiles and then calculates the exact coordinates where a user needs to tap so that they hit the dark piano key.
Those coordinates are then used to send synthetic tap events to the android phone again using ADB.

# How it actually functioned
The project works well for slow speeds but as soon as the scrolling speed increases to any significant level, the latency in the whole process becomes too much and taps are sent to wrong location. So actually, latency needs to be reduced very significantly in order for this utility to break any high scores.

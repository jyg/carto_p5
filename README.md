# cartoP5
p5js + puredata 

## Current status
This is an attempt to use p5js as gui with pd4web

Transmitting values to pd4web from p5.js cannot be done from draw() loop, but can be done from inside following functions, using sendToPureData()  :
* mousePressed()
* mouseDragged()
* mouseMoved()

the idea is to develop first using an osc bridge 

## develop / debug mode
using node/bridge.js for transmitting osc message from p5js to standalone puredata
the main pd patch is named main.pd, located in pd folder

* run osc-bridge.pd that automatically loads main.pd
* in node folder, open a terminal and type : node bridge.js 
* from Processing4, run p5js project

## expor / embedded mode

Build the pd4web project using following command
pd4web --patch main.pd  --page-folder export


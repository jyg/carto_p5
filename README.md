# cartoP5
p5js + puredata 

## Current status
This is an attempt to use p5js as gui with pd4web

## project folder structure

see pd4web doc


## develop / debug mode
using node/bridge.js for transmitting osc message from p5js to standalone puredata
the main pd patch is named main.pd, located in pd folder

* in pd standalone, open osc-bridge.pd that automatically loads main.pd
* in node folder, open a terminal and type : node bridge.js (more info : https://github.com/L05/p5.touchgui/tree/master/examples/osc)
* from Processing4, run p5js project

## export / embedded mode
* copy the root processing js file in export folder
* Build the pd4web project using following command
pd4web --patch main.pd  --page-folder export

## bugs

Transmitting values to pd4web from p5.js cannot be done from draw() loop, but can be done from inside following functions, using sendToPureData()  :
* mousePressed()
* mouseDragged()
* mouseMoved()
  
pd4web doesn't allow to send lists from js. A workaround is to sequentially send atoms to specials receivers (see index.html and main.pd files)

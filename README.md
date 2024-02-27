# cartoP5
p5js + puredata 

## Current status
This is an attempt to use p5js as gui with pd4web 

**demo** here https://jyg.github.io/carto_p5/webpatch/index.html

## project folder structure

see pd4web documentation 
https://charlesneimog.github.io/pd4web/patch/#folder-structure

├─ PROJECT_FOLDER
└── audios/
    ├── AllMyAudioFiles.wav
    └── AllMyAudioFiles.aif
└── export/
    ├── assets/				<- folder copied from "sketch" folder
    ├── libraries/
    	├── p5.min.js
    	└── p5.touchgui.js
    ├── index.html
    └── sketch.js			<- file copied from "sketch" folder
└── extras/
    ├── extrathings.png
    └── mygesture.svg
└── libs/
    ├── pdAbstraction1.pd
    └── pdAbstraction2.pd
└── node/
    └── bridge.js  
└── sketch/
    ├── assets/
    ├── libraries/
    ├── sketch.js
    └── sketch.properties
├── main.pd					<- pd main patch
├── osc-bridge.pd			<- patch for "tethering" mode
└──	README.md				(this file)



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
  
pd4web doesn't allow to send lists to puredata from js script. A workaround is to sequentially send atoms to specials receivers, with pd patch reconcatening the list (see index.html and main.pd files)

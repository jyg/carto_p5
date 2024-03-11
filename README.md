# cartoP5
p5js + pd4web https://github.com/charlesneimog/pd4web 

## Current status
This is an attempt to use p5js as gui with pd4web 

**demo** here https://jyg.github.io/carto_p5/webpatch/index.html

## project folder structure

see pd4web documentation 
https://charlesneimog.github.io/pd4web/patch/#folder-structure

The main pd patch is named main.pd, and is located in root folder.        

    ├─ PROJECT_FOLDER
    └── Audios/    
        ├── AllMyAudioFiles.wav    
        └── AllMyAudioFiles.aif    
    └── Extras/    
        ├── assets/	          (folder copied from "my_script" folder)   
        ├── libraries/    
        	└── p5.min.js    
        ├── index.html   
	├── my_font.ttf  
        └── my_script/		       
	        ├── assets/		       
	        ├── libraries/		       
	        ├── my_script.js	
	 	├── index.html
	        └── sketch.properties	
    └── Libs/		       
        ├── pdAbstraction1.pd		       
        └── pdAbstraction2.pd		       
    └── node/		       
        └── bridge.js 	 	       	       
    ├── main.pd              (pd main patch)       
    ├── osc-bridge.pd        (patch for "tethering" mode)		       
    └── README.md            (this file)	
	    
	       



## develop mode
When developping the patch, we can use processing and puredata standalone apps and make them communicate via OSC, using node/bridge.js.             

* in pd standalone, open osc-bridge.pd for enabling OSC communication (it will automatically load main.pd patch).
* in node folder, open a terminal and type : node bridge.js (more info : https://github.com/L05/p5.touchgui/tree/master/examples/osc)
* from Processing4, run my_script.js project

## exporting the patch and gui to webpatch/ folder
* Copy the file my_script/my_script.js to export/ folder.
* Copy the folder my_script/assets/ and anything it contains to export/ folder.
* You don't have to copy my_script/libraries/'s content, unless you added to it some additional *.js files.
* Build the pd4web project using following command :
__pd4web --patch main.pd  --page-folder export__

## bugs / todo

Check wether values cannot be transmitted to pd4web from p5.js inside draw() loop. Alternatively, it can be done inside following functions, using sendToPureData()  :
* mousePressed()
* mouseDragged()
* mouseMoved()
  
pd4web doesn't allow to send lists to puredata from js script. A workaround is to sequentially send atoms to specials receivers, with pd patch reconcatening the list (see the script section with sendToPd() function in export/index.html and the patch in main.pd file)

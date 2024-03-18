# cartoP5
This is my first project using both p5js for GUI and pd4web for audio. 
* https://p5js.org/
* https://github.com/charlesneimog/pd4web 
pd4web enables the use of puredata patches in a web browser. The current pd4web version for this project is 1.2.1

**demo** here https://jyg.github.io/carto_p5/webpatch/index.html

## project folder structure

I started from pd4web documentation, following suggested folder structure :
https://charlesneimog.github.io/pd4web/patch/#folder-structure

I added in Extras folder some items :
* a custom index.html
* the processing p5js files in my_script/ folder
* for now, assets/ folder has to be duplicated in Extras/ and in Extras/my_script/ folders.


The main pd patch is named main.pd, and is located in root folder.        

    ├─ PROJECT_FOLDER
    └── Audios/    
        ├── AllMyAudioFiles.wav    
        └── AllMyAudioFiles.aif    
    └── Extras/    
        ├── assets/	          (folder duplicated from "my_script" folder)   
        ├── libraries/    
        	└── p5.min.js    
        ├── index.html   
        ├── my_font.ttf            (font duplicated from "my_script" folder) 
        └── my_script/		   (p5js project folder) 
	        ├── assets/		       
	        ├── libraries/		       
	        ├── my_script.js	
	 	├── index.html
   		├── my_font.ttf  
	        └── sketch.properties	
    └── Libs/		       
        ├── pdAbstraction1.pd		       
        └── pdAbstraction2.pd		       
    └── node/		       
        └── bridge.js 	 	       	       
    ├── main.pd              (pd main patch)       
    ├── osc-bridge.pd        (patch for develop mode)		       
    └── README.md            (this file)	
	  
## develop mode
When developping the patch, you can use processing and puredata standalone apps and make them communicate via OSC, using node/bridge.js.             

* in pd standalone, open osc-bridge.pd for enabling OSC communication (it will automatically load main.pd patch).
* in node folder, open a terminal and type : node bridge.js (more info : https://github.com/L05/p5.touchgui/tree/master/examples/osc)
* from Processing4, run my_script.js project

## exporting the patch and gui to webpatch/ folder
* Extras/my_script/assets/ has to be duplicated into Extras/ folder.
* Build the pd4web project using following command :
__pd4web --patch main.pd  --page-folder Extras__
* the webpatch folder contains the project to be published on the web.

## bugs / todo
  
pd4web 1.2.1 doesn't allow to send lists to puredata from js script. 

A workaround is to sequentially send atoms to specials receivers, with pd patch reconcatening the list (see the script section with sendToPd() function in export/index.html and the patch in main.pd file).	

Newer versions of pd4web should support sending lists to pd.

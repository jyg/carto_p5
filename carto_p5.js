   
        function sendToPd(target,value){
          sendOsc('/'+target, value);
          }
        let spots = []; // array of sound objects
        let selectedSpot = -1;
        let currentSid = 0;
        let firstTime = 1;
        
        let table;

        function preload() {
        //my table is comma separated value "csv"
        //and has a header specifying the columns labels
        table = loadTable('assets/spots1.csv', 'csv');
        }
        
        let sizeX = 512;
        let sizeY = 512;
        
        let gridX = sizeX / 20;
        let gridY = sizeY / 20;
        
        // Local server IP and port
        let ip = '127.0.0.1:8081';
        
        // GUI
        let gui;
        
        // array for preset buttons
        let presetButtons = [];
        let nbOfButtons = 2;
        
        function setup()    {
                createCanvas(sizeX, sizeY);
                frameRate(10);
                
                // Create GUI
                gui = createGui();

                // create OSC bindings with puredata
                setupOsc(10000, 12000, ip);
                // 12000 port destination (vers puredata)
                // 10000 port réception (depuis puredata)
   
                // Create preset buttons
                for (let i = 0; i < nbOfButtons ; i++){
                  presetButtons.push(createButton("p"+ i,0, gridY *(i+1), gridX*2, gridY));
                }
                                
                 // Create objects
               // populateSpots()
       
        }

        function draw()
            {
                // draw background
                background(200);
                //translate(-width/2,-height/2); // only for webgl
                fill(240);
                rect(gridX*3,gridY*2, width*0.8,height*0.8);
                
                // draw gui
                drawGui();
                
                // draw tokens
                for (let i = 0; i < spots.length; i++) {
                    spots[i].move();
                    spots[i].display();
               
                }
                
                // check if buttons are pressed
                for (let i = 0;i<presetButtons.length;i++){
                  if (presetButtons[i].isPressed){
                    print(presetButtons[i].label + " is pressed."); 
                    sendToPd('deleteAll','');
                    
                    table = loadTable('assets/spots'+i+'.csv', 'csv','',populateSpots)
                  }
                }
        }
                
                // Soundspot class
        class Soundspot {
            constructor(_id,_x,_y,_diameter,_label) {
                this.i = _id;
                this.x = _x
                this.y = _y;
                this.diameter = _diameter;
                this.selected = 0;
                this.label = _label;
                }
            move() {
           }

            display() {
              if (this.selected){
                fill(100);
              }
              else
                fill (240);
              ellipse(this.x, this.y, this.diameter, this.diameter);
              fill (0);
              text(this.label, this.x-gridX, this.y-gridY*0.5);
            }
            
            checkMouse(){
              let dist = (this.x - mouseX) * (this.x - mouseX) + (this.y - mouseY) * (this.y - mouseY);
              if ((2*dist)<(this.diameter * this.diameter)){
                this.selected = 1;
                return 1;
              }
              else {
                this.selected = 0;
                return 0;
              }
            }
        }
                
        function mouseDragged() {
           if (selectedSpot>-1){
           spots[selectedSpot].x=mouseX;
           spots[selectedSpot].y=mouseY;
           sendToPd('updateObject', [ spots[selectedSpot].i, spots[selectedSpot].x, spots[selectedSpot].y]);
         }
        }
        
        function mouseReleased(){
          if(selectedSpot>-1)
            if ((mouseX<width/10)&&(mouseY<height/10)){
              spots.splice(selectedSpot,1);
               sendToPd('removeObject', selectedSpot);
            }
            else 
              spots[selectedSpot].selected = 0;
          selectedSpot = -1;
        }
        function mousePressed() {
           for (let i = 0; i < spots.length; i++) {
                    if(spots[i].checkMouse()){
                      selectedSpot = i;
                      return;        
                    }
                }
        }
        function populateSpots(){
        
          //count the columns
          print(table.getRowCount() + ' total rows in table');
          print(table.getColumnCount() + ' total columns in table');
        
          spots.splice(0,99);
          for (let i = 0; i < table.getRowCount(); i++) {

            spots.push(new Soundspot(table.getNum(i,0),table.getNum(i,1), table.getNum(i,2), table.getNum(i,3),table.getString(i,4)));
          }

          // send to pd
          for (let i = 0; i < spots.length; i++) {
            sendToPd('addObject', [spots[i].i, spots[i].x, spots[i].y, spots[i].diameter,spots[i].label]);
          }
  
        }

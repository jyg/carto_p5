
          
        let spots = []; // array of sound objects
        let selectedSpot = -1;
        let currentId = 0;
        
        let msg;
        
        let table;
        let tableExport;
        
        let player_x = 0;
        let player_y = 0;

        function preload() {
        //the table is comma separated value "csv"
        //and has an header specifying the columns labels
        table = loadTable('assets/spots1.csv', 'csv', 'header');
        }
        
        let sizeX = 512;
        let sizeY = 512;
        
        let gridX = sizeX / 20;
        let gridY = sizeY / 20;
        

        
        // GUI
        let gui;
        
        // array for preset buttons
        let presetButtons = [];
        let nbOfButtons = 2;
        
        // control buttons
        let saveButton;
        let newSpotButton;
        
        // input field
        let inp;
        let selectSound;
        
        function setup()    {
          
                createExportTable();
                     
                createCanvas(sizeX, sizeY);
                frameRate(10);
                
                // Create GUI
                gui = createGui();
                
                // only for osc bridge mode
                setupOscBridge();
  
                // Create preset buttons
                for (let i = 0; i < nbOfButtons ; i++){
                  presetButtons.push(createButton("p"+ i,0, gridY *(i+1), gridX*2, gridY));
                }
                
                saveButton = createButton("export", gridX*2,0,gridX*2,gridY); 
                newSpotButton = createButton("<-ajouter", gridX*15.5,0,gridX * 4,gridY); 
                
                // input fields
                inp = createInput('');
                inp.position(gridX*4, 0);
                inp.input(false);
                
                selectSound = createSelect();
                selectSound.position(gridX*12.5, 0);
              
                // Add color options.
                selectSound.option('son1');
                selectSound.option('son2');
                selectSound.option('son3');
                selectSound.option('son4');

                  // Set the selected option to "red".
                //  mySelect.selected('red');
       
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
                
                fill (200,0,0);
                circle(player_x, player_y, gridX/4);
                
                // GUI - check if buttons are pressed
                for (let i = 0;i<presetButtons.length;i++){
                  if (presetButtons[i].isPressed){
                    //print(presetButtons[i].label + " is pressed."); 
                    sendToPd('deleteAll','');
                    
                    table = loadTable('assets/spots'+i+'.csv', 'csv','header',populateSpots)
                  }
                }
                // other buttons
                if (saveButton.isPressed){
                  tableExport.clearRows();
                  for(let i = 0 ; i < spots.length ; i++){
                    let newRow = tableExport.addRow();
                    newRow.setNum('x', spots[i].x);
                    newRow.setNum('y', spots[i].y);
                    newRow.setNum('size', spots[i].size);
                    newRow.setString('label', spots[i].label);
                    
                  }
                  saveTable(tableExport, 'tableExport.csv');
                }
                // newSpotButton
                if (newSpotButton.isPressed){
                    let i = spots.length; 
                    currentId+=1;
                    spots.push(new Soundspot(currentId, gridX*10, gridY*10, gridX, selectSound.selected()));
                    sendToPd('addObject', [currentId, spots[i].x, spots[i].y, spots[i].size, spots[i].label]);
                }
                
        }
                
                // Soundspot class
        class Soundspot {
            constructor(_id, _x,_y,_size,_label) {
                this.id = _id
                this.x = _x
                this.y = _y;
                this.size = _size;
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
              ellipse(this.x, this.y, this.size, this.size);
              fill (0);
              text(this.label, this.x-gridX, this.y-gridY*0.5);
            }
            
            checkMouse(){
              let dist = (this.x - mouseX) * (this.x - mouseX) + (this.y - mouseY) * (this.y - mouseY);
              if ((2*dist)<(this.size * this.size)){
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
           sendToPd('updateObject', [ spots[selectedSpot].id, spots[selectedSpot].x, spots[selectedSpot].y]);
         }
           updatePlayer();
        }
        
        function mouseReleased(){
          if(selectedSpot>-1)
            if ((mouseX<width/10)&&(mouseY<height/10)){
              sendToPd('removeObject', spots[selectedSpot].id);
              spots.splice(selectedSpot,1);
              
            }
            else 
              spots[selectedSpot].selected = 0;
          selectedSpot = -1;
        }
        function mousePressed() {
           selectedSpot = -1;
           for (let i = 0; i < spots.length; i++) {
                    if(spots[i].checkMouse()){
                      selectedSpot = i;
                      return;        
                    }
                }
           updatePlayer();
           
           }
        
        
        
        function populateSpots(){
      
          //count the columns
          //print(table.getRowCount() + ' total rows in table');
          //print(table.getColumnCount() + ' total columns in table');
        
          spots.splice(0,99);
          for (let i = 0; i < table.getRowCount(); i++) {

            spots.push(new Soundspot(i, table.getNum(i,'x'), table.getNum(i,'y'), table.getNum(i,'size'),table.getString(i,'label')));
            
          }
          currentId=table.getRowCount()-1;
          // send to pd
          for (let i = 0; i < spots.length; i++) {
            sendToPd('addObject', [i, spots[i].x, spots[i].y, spots[i].size,spots[i].label]);
          }
  
        }
        
        function updatePlayer(){
          if ((selectedSpot == -1)&&(mouseX > 3*gridX)&&(mouseY > 2*gridY)&&(mouseX<(width-gridX))&&(mouseY<(height-2*gridY))){
             player_x = mouseX;
             player_y = mouseY;
             sendToPd('cursor', [mouseX, mouseY]);
         }
        }
        
        function createExportTable(){
          tableExport = new p5.Table();
          tableExport.addColumn('id');
          tableExport.addColumn('x');
          tableExport.addColumn('y');
          tableExport.addColumn('size');
          tableExport.addColumn('label');
          }

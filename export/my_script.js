let webgl = true;
let font;
// soundSpot global variables
let spots = []; // array of sound objects
let selectedSpot = -1;
let currentId = 0;

let msg;    //   ?
let table;

let url = 'http://s184785159.onlinehome.fr/carto/mail.php';  // for posting table

let player_x = 0;
let player_y = 0;


let sizeX = window.innerWidth - 20;
let sizeY = window.innerHeight - 20;
let gridX = sizeX / 25;
let gridY = sizeY / 25;
let leftMargin= 3 * gridX;
let topMargin = 2 * gridY;
let canvasWidth = gridX * 20;
let canvasHeight = gridY * 20;
 
// array for preset buttons
let presetButtons = [];
let nbOfButtons = 2;

// control buttons
let clearButton;
let saveButton;
let newSpotButton;
let fullscreenButton; 

// input field and dropdown menu
let inp;
let selectSound;

function preload() {
    font = loadFont('KronaOne-Regular.ttf');
}


function setup()    {
    if (webgl){
        createCanvas(sizeX, sizeY, WEBGL);
        textFont(font);
        textSize(10);
    }
    else {
        createCanvas(sizeX, sizeY);
    }
      
    //frameRate(10);
                  
    // only for osc bridge mode
    setupOscBridge();
    
    // Create preset buttons
    let newPresetButton;
    for (let i = 0; i < nbOfButtons ; i++){
        newPresetButton = createButton("p"+ i);
        newPresetButton.position(0, gridY *(i+3));
        newPresetButton.size(gridX*2, gridY);
        newPresetButton.mouseClicked(() => {
            table = loadTable('assets/spots'+i+'.csv', 'csv','header',populateSpots)
        });
        presetButtons.push(newPresetButton);
    }
    
    // create clear button
    clearButton = createButton("Poubelle");
    //clearButton.mouseClicked(clearAll);
    // create Export button
    saveButton = createButton("Envoyer ma \n Composition"); 
    saveButton.mouseClicked(exportData);
    
    // Create newSpotButton
    newSpotButton = createButton("+");
    newSpotButton.mouseClicked(createNewSpot);
    
    fullscreenButton = createButton("Plein Ecran"); 
    fullscreenButton.mousePressed(() => {
        let fs = fullscreen();
        fullscreen(!fs);  });
    
    // input fields
    inp = createInput('Prénom - Titre');
    
    selectSound = createSelect();
    selectSound.option('piano1_Juliette_1');
    selectSound.option('piano1_Juliette_2');
    selectSound.option('piano1_Juliette_3');
    selectSound.option('piano1_Juliette_4');
    selectSound.option('piano1_Juliette_5');
    selectSound.option('piano1_Juliette_6');
    selectSound.option('piano1_Juliette_7');
    selectSound.option('piano2_Helene_1');
    selectSound.option('piano2_Helene_2');
    selectSound.option('piano2_Helene_3');
    selectSound.option('piano2_Helene_4');
    selectSound.option('piano2_Helene_5');
    selectSound.option('piano2_Helene_6');
    selectSound.option('piano2_Helene_7');
    selectSound.option('guitare1_Arthur1');
    
    windowResized() 
}

function draw()
{
    // draw background
    background(200);
    
    // only for webgl    
    if (webgl){
        translate(-sizeX/2,-sizeY/2);
    }
    
    // scene rectangle TODO : use variables for margins
    fill(240);
    rect (leftMargin,topMargin, canvasWidth, canvasHeight);
     
    // draw tokens
    for (let i = 0; i < spots.length; i++) {
        spots[i].display();
    }
    
    // draw listener (mouse) position
    fill (200,0,0);
    ellipse(player_x, player_y, gridX/4,gridY/4);
}
  
function windowResized() {
    sizeX = window.innerWidth - 20;
    sizeY = window.innerHeight - 20;

    gridX = sizeX / 25;
    gridY = sizeY / 25;
    
    canvasWidth = gridX * 20;
    canvasHeight = gridY * 20;
    
    leftMargin= 3 * gridX;
    topMargin = 2 * gridY;
    
    // TODO change margins for scene
    
    resizeCanvas(sizeX, sizeY);
    
    // resize preset buttons
    for (let i = 0; i < presetButtons.length ; i++){
          presetButtons[i].position(0, gridY *(i+3));
          presetButtons[i].size(gridX*2, gridY);
    }
    
    // resize clearButton
    clearButton.size(2 * gridX , gridY);
    clearButton.position(0, topMargin + canvasHeight + 2 * gridY);
    //resize saveButton
    saveButton.size(gridX * 2 , 2 * gridY);
    saveButton.position(leftMargin + canvasWidth, 0);
    
    // resize  newSpotButton
    newSpotButton.size(gridX * 2 , gridY);
    newSpotButton.position(gridX * 8, 0);
    
    
    fullscreenButton.size(gridX * 2 , gridY);
    fullscreenButton.position(leftMargin + canvasWidth, topMargin + canvasHeight + 2 * gridY);
    
    // resize textfield (inp)
    inp.position(gridX *19.5 , 0);
    inp.size(gridX * 3, gridY);
    // resize popup menu
    selectSound.position(gridX * 3, 0);
    selectSound.size(gridX*4,gridY);
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
        
    move(_x,_y) {
        this.x = (_x - leftMargin)/canvasWidth;
        this.y=  (_y - topMargin)/canvasHeight;
        sendToPd('updateObject', [ this.id, this.x, this.y]);

    }

    display() {
        if (this.selected){
            fill(100);
        }
        else
            fill (240);
        ellipse(leftMargin + this.x * canvasWidth, topMargin + this.y * canvasHeight, this.size * gridX, this.size * gridY);
        fill (0);
        push();
        translate(0,0,1);  // make text appear in front
        text(this.label, leftMargin + this.x * canvasWidth -gridX, topMargin + this.y * canvasHeight - gridY*0.7);
        pop();
 }
    
    checkMouse(){
        let distX = (leftMargin + this.x * canvasWidth - mouseX)/gridX/this.size;
        let distY = (topMargin + this.y * canvasHeight - mouseY)/gridY/this.size;
        let dist = distX * distX + distY * distY;
        if (dist < 0.25){
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
        spots[selectedSpot].move(mouseX,mouseY);
        }
    updatePlayer();
}

function mouseReleased(){
    if(selectedSpot>-1){
        if ((mouseX < 2 * gridX)&&(mouseY > topMargin+ canvasHeight + 2* gridY)){
            sendToPd('removeObject', spots[selectedSpot].id);
            spots.splice(selectedSpot,1);
        }
        else 
            spots[selectedSpot].selected = 0;
        selectedSpot = -1;
    }

}

function mousePressed() {
    selectedSpot = -1;
    let returnFalse = ((mouseX > leftMargin)&&(mouseY > topMargin)&&(mouseX < leftMargin + canvasWidth)&&(mouseY < topMargin + canvasHeight));
    for (let i = 0; i < spots.length; i++) {
        if(spots[i].checkMouse()){
            selectedSpot = i;
            return false;     // do this prevent default touch interaction
            }
        }
    updatePlayer();
    if (returnFalse) 
        return false;    // do this prevent default touch interaction
    else
        return; 
}
  
 document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
 });  
  
function populateSpots(){
    // delete all existing rows in spots table
    spots.splice(0,99);
    
    for (let i = 0; i < table.getRowCount(); i++) {
        let type = table.getString(i,'type');
        if(type == 'sound'){
            spots.push(new Soundspot(i, table.getNum(i,'x'), table.getNum(i,'y'), table.getNum(i,'size'),table.getString(i,'label')));
        }
        else if (type == 'other'){
            // import other data here
        }
    }
    currentId=table.getRowCount()-1;
    
    // communicate with pd
    sendToPd('deleteAll','');
    for (let i = 0; i < spots.length; i++) {
        sendToPd('addObject', [i, spots[i].x, spots[i].y, spots[i].size,spots[i].label]);
    }
}

function updatePlayer(){
    if ((selectedSpot == -1)){
        let _x = (mouseX-leftMargin)/canvasWidth;
        let _y = (mouseY-topMargin)/canvasHeight;
        if ((_x > 0 )&& (_x < 1) && (_y > 0) && (_y < 1)){
            player_x = mouseX;
            player_y = mouseY;
            sendToPd('cursor', [_x,_y]);         
            }         
    }
}
  
function exportData(){
    let tableExport = new p5.Table();
    tableExport.addColumn('type');
    tableExport.addColumn('x');
    tableExport.addColumn('y');
    tableExport.addColumn('size');
    tableExport.addColumn('label');
    
    // copy all soundspot data
    for(let i = 0 ; i < spots.length ; i++){
        let newRow = tableExport.addRow();
        newRow.setString('type', 'sound');
        newRow.setNum('x', spots[i].x);
        newRow.setNum('y', spots[i].y);
        newRow.setNum('size', spots[i].size);
        newRow.setString('label', spots[i].label);
    }
    
    let tableString = '';
    // Iterate over rows
    for (let i = 0; i < tableExport.getRowCount(); i++) {
        // Iterate over columns
        for (let j = 0; j < tableExport.getColumnCount(); j++) {
            // Append cell value to the string
            tableString += tableExport.getString(i, j) + ',';
        }
        // Append newline after each row
        tableString += '\n';
    }
    // Print the resulting string
    console.log(tableString);
    sendEmail(tableString);
//    saveTable(tableExport, 'tableExport.csv');
}

async function sendEmail(_message) {
    const data = {
        to: 'jyg@gumo.fr',
        subject: 'Cartographie de ' + inp.value(),
        message: _message
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data),
    });

    const result = await response.text();
    
    // la page html renvoyée par le script php
    console.log(result);
}

function createNewSpot(){
    let i = spots.length; 
    currentId+=1;
    spots.push(new Soundspot(currentId, 0.5, 0.5, 1, selectSound.value()));
    sendToPd('addObject', [currentId, spots[i].x, spots[i].y, spots[i].size, spots[i].label]);        
 }
 
 

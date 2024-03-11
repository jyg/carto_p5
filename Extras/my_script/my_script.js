let webgl = true;
let font;
// soundSpot global variables
let spots = []; // array of sound objects
let selectedSpot = -1;
let currentId = 0;

let msg;    //   ?
let table;  // table used for importing session

let img;

let url = 'https://s184785159.onlinehome.fr/carto/mail.php';  // for posting table

let player_x = 0;
let player_y = 0;


let sizeX = window.innerWidth;
let sizeY = window.innerHeight - 20;
let gridX = sizeX / 25;
let gridY = sizeY / 25;
let leftMargin= 3 * gridX;
let topMargin = 2 * gridY;
let canvasWidth = gridX * 20;
let canvasHeight = gridY * 20;
let topOffset = 0;
 
// array for preset buttons
let presetButtons = [];

// list of presets. For each name corresponds a .csv file in assets folder
let presetList = ['aide','groupeA','groupeB'];

let currentPreset = -1;

// control buttons
let clearButton;
let saveButton;
let newSpotButton;
let fullscreenButton; 
// slider
let alphaSlider;  // for transparency of soundpots

// input field and dropdown menu
let inp;
let selectSound;

function getMyPreset(_i){
    // refresh color of preset buttons
    for (let i = 0; i < presetList.length; i++){
        if (i == _i){
            presetButtons[i].style('background-color', color(240));
        }
        else {
          presetButtons[i].style('background-color', color(200));
        }
    }

     // save local storage for currentPreset
    if(currentPreset > -1){
        saveData(currentPreset);
    }
    // update currentPreset number
    currentPreset = _i;
    
    // search for local storage 
    let tableString = getItem(presetList[currentPreset]+ '.csv');
    if(tableString === null) {
       table = loadTable('assets/'+ presetList[currentPreset]+ '.csv', 'csv','header',loadData);
    }
    else {
        table = parseTable(tableString);  
        loadData();
    }
}
function clearCurrentPreset(){
    table = loadTable('assets/'+ presetList[currentPreset]+ '.csv', 'csv','header',loadData);

}



function parseTable(_tableString) {
  // Split the string into rows
  let rows = _tableString.trim().split('\n');

  // Extract header
  let headers = rows[0].split(',').map(header => header.trim());
  
  // Create a new p5.Table
  let newTable = new p5.Table();
  
  // Add columns to the table
  let nb_of_columns=0;
  for (let header of headers) {
    if(header !== ''){
      newTable.addColumn(header);
      nb_of_columns++;
    }
  }
  
  // Parse the rest of the rows
  for (let i = 1; i < rows.length; i++) {
     let rowValues = rows[i].split(',').map(value => value.trim());
     let newRow = newTable.addRow();
         for (let j = 0; j < rowValues.length; j++) {
           if(j< nb_of_columns) {
               newRow.setString(j, rowValues[j]);
           }
         }
    }
  return newTable;
}

  
function saveData(_preset){
    // create export struct
    let tableExport = new p5.Table();
    tableExport.addColumn('type');
    tableExport.addColumn('x');
    tableExport.addColumn('y');
    tableExport.addColumn('size');
    tableExport.addColumn('file');
    
    // create struct for text file export
    let tableString = 'type,x,y,size,file\n';
    
    // copy all soundspot data
    for(let i = 0 ; i < spots.length ; i++){
        let newRow = tableExport.addRow();
        newRow.setString('type', 'sound');
        newRow.setNum('x', spots[i].x);
        newRow.setNum('y', spots[i].y);
        newRow.setNum('size', spots[i].size);
        newRow.setString('file', spots[i].file);
        // append in tableString
        tableString += 'sound,' +  spots[i].x + ','+ spots[i].y + ',' + spots[i].size + ',' + spots[i].file + '\n';
    }
    // copy all sound options in selectSound dropdown
    for (let i = 0; i < table.getRowCount(); i++) {
        
        let type = table.getString(i,'type');
        if (type == 'menu_item'){
            let newRow = tableExport.addRow();
            newRow.setString('type', 'menu_item');
            newRow.setString(1, table.getString(i,1));
            newRow.setString(2, table.getString(i,2));
            // append in tableString
            tableString += 'menu_item,' + table.getString(i,1) + ', ' + table.getString(i,2) + '\n';
       }
        else if (type == 'other'){
            // import other data here
        }
    }   
                // create local storage
     storeItem(presetList[_preset]+ '.csv', tableString) ;
}
  //// EXPORT
    // Print the resulting string
//    console.log(tableString);
//    sendEmail(tableString);
    
//    saveTable(tableExport, 'tableExport.csv');
//}

function loadData(){ 
    // delete all existing rows in spots table
    spots.splice(0,99);
    // delete all existing options in droplist
    selectSound.remove();
    selectSound = createSelect();
    selectSound.position(gridX * 3, topOffset);
    selectSound.size(gridX*4,2 * gridY);    
    currentId = 0;
    for (let i = 0; i < table.getRowCount(); i++) {
        let type = table.getString(i,'type');
        if(type == 'sound'){
            spots.push(new Soundspot(currentId, table.getNum(i,'x'), table.getNum(i,'y'), table.getNum(i,'size'),table.getString(i,'file')));
            currentId ++;
        }
        else if (type == 'menu_item'){
            selectSound.option(table.getString(i,2),table.getString(i,1)+'/'+table.getString(i,2));
        }
        else if (type == 'other'){
            // import other data here
        }
    }
       
    // communicate with pd
    sendToPd('deleteAll','');
    for (let i = 0; i < spots.length; i++) {
        sendToPd('addObject', [i, spots[i].x, spots[i].y, spots[i].size,spots[i].file]); 
    }
}

function preload(){
    font = loadFont('KronaOne-Regular.ttf');
    img = loadImage('assets/fond_de_carte.jpg');
}


function setup(){
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
    
    // detect Start-audio-button and add vertical offset
    if(document.getElementById("Start-Audio-Button") !== null){
        topOffset = 40;
    }
    
    selectSound = createSelect();

    // Create preset buttons
    let newPresetButton;
    for (let i = 0; i < presetList.length ; i++){
        newPresetButton = createButton(presetList[i]);
        newPresetButton.mouseClicked(() => {
            getMyPreset(i);
        });
        presetButtons.push(newPresetButton);
    }
       
    // create clear button
    clearButton = createButton("Supprimer");
    clearButton.mouseClicked(clearCurrentPreset);
    
    // create Export button
    saveButton = createButton("Envoyer ma \n Compo"); 
    saveButton.mouseClicked(saveData);
    
    // Create newSpotButton
    newSpotButton = createButton("+");
    newSpotButton.mouseClicked(createNewSpot);
    
    fullscreenButton = createButton("Plein Ecran"); 
    fullscreenButton.mousePressed(() => {
        let fs = fullscreen();
        fullscreen(!fs);  });
    
    // input fields
    inp = createInput('Prenom - Titre');
    
    alphaSlider = createSlider(0, 255,180);
    
    // load first preset
    getMyPreset(0);  
    
    windowResized(); 
}

function draw(){
    // draw background
    background(200);
    
    // only for webgl    
    if (webgl){
        translate(-sizeX/2,-sizeY/2);
    }
    
    // scene rectangle 
    noFill();
    stroke(0,alphaSlider.value());
    rect (leftMargin, topMargin, canvasWidth, canvasHeight);
    tint(255, 255-alphaSlider.value());
    image(img, leftMargin, topMargin, canvasWidth, canvasHeight);
    push();
    fill(0);
    translate(0,0,10); 
    text("carte <----------> sons", gridX * 12.5, gridY);
    pop();
    // draw tokens
    for (let i = 0; i < spots.length; i++) {
        spots[i].display();
    }
    
    // draw listener (mouse) position
    fill (200,0,0);
    ellipse(player_x, player_y, gridX/4,gridY/4);
}
  
function windowResized() {
    sizeX = window.innerWidth;
    sizeY = window.innerHeight - topOffset;
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
          presetButtons[i].position(0, topOffset+topMargin + i * 2 * gridY);
          presetButtons[i].size(gridX*2, 2 * gridY);
    }
    
    // resize clearButton
    clearButton.size(2 * gridX , 2 * gridY);
    clearButton.position(0, topOffset + topMargin + canvasHeight + 1 * gridY);
    //resize saveButton
    saveButton.size(gridX * 2 , 2 * gridY);
    saveButton.position(leftMargin + canvasWidth, topOffset);
    
    // resize  newSpotButton
    newSpotButton.size(gridX * 2 , 2 * gridY);
    newSpotButton.position(gridX * 8, topOffset);
    
    fullscreenButton.size(gridX * 2 , 2 * gridY);
    fullscreenButton.position(leftMargin + canvasWidth, topOffset + topMargin + canvasHeight + gridY);
    
    // resize textfield (inp)
    inp.position(gridX *19.5 , topOffset);
    inp.size(gridX * 3, 2 * gridY);
    // resize popup menu
    selectSound.position(gridX * 3, topOffset);
    selectSound.size(gridX*4,2 * gridY);
    
    // slider
    alphaSlider.position(gridX * 12, topOffset + gridY);
    alphaSlider.size(gridX * 4);
}
        
        
function mouseDragged() {
    if (selectedSpot>-1){
        spots[selectedSpot].move(mouseX,mouseY);
        }
    updatePlayer();
}

function mouseReleased(){
    if(selectedSpot>-1){
        if ((mouseX < 2 * gridX)&&(mouseY > topMargin+ canvasHeight + gridY)){
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
    if (alphaSlider.value()> 127){  // prevent spot-moving
        for (let i = 0; i < spots.length; i++) {
            if(spots[i].checkMouse()){
                selectedSpot = i;
                return false;     // do this prevent default touch interaction
                }
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
 
    // Soundspot class
class Soundspot {
    constructor(_id, _x,_y,_size,_file) {
        this.id = _id
        this.x = _x
        this.y = _y;
        

        this.size = _size;
        this.selected = 0;
        this.file = _file;

        
        // split folder and filenames. Folder depth MUST be 1 : AUDIOS/<Folder>/<filename>.wav
        let splitString = split(_file, '\/'); 
        
        this.label = splitString[splitString.length - 1];
        }
        
    move(_x,_y) {
        this.x = (_x - leftMargin)/canvasWidth;
        this.y=  (_y - topMargin)/canvasHeight;
        sendToPd('updateObject', [ this.id, this.x, this.y]);

    }

    display() {
        noStroke();
        if (this.selected){
            fill(100,100,100,alphaSlider.value());
        }
        else
            fill (240,240,240,alphaSlider.value());
        ellipse(leftMargin + this.x * canvasWidth, topMargin + this.y * canvasHeight, this.size * gridX, this.size * gridY);
        fill (0,0,0,alphaSlider.value());
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

function createNewSpot(){
    let i = spots.length; 
    currentId+=1;
    spots.push(new Soundspot(currentId, 0.5, 0.5, 1, selectSound.value()));
    // we send to pd the filename prepended with the foldername
    sendToPd('addObject', [currentId, spots[i].x, spots[i].y, spots[i].size, selectSound.value()]);        
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

 
 

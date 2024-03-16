
        // Local server IP and port
        let ip = '127.0.0.1:8081';


        // communication with puredata 
function sendToPd(target,value){
   sendOsc('/'+target, value);
   }
   
function setupOscBridge(){
// create OSC bindings with puredata
    setupOsc(10000, 12000, ip);
         // 12000 port destination (vers puredata)
         // 10000 port réception (depuis puredata)
}

let pdIsInitialized = true;

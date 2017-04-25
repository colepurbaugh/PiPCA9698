var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 1500,
    debug: false
};

var counter = 1;
var duration = 1000;

var red = {
  name: "red",
  arrayC: [],
  currentC: 1,
}

var green = {
  name: "green",
  arrayC: [],
  currentC: 1,
}

var blue = {
  name: "blue",
  arrayC: [],
  currentC: 1,
}

var white = {
  name: "white",
  arrayC: [],
  currentC: 1,
}

pwm = new Pca9685Driver(options, function(err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }
    console.log("Initialization done");
    setColorStartValues();
    console.log("set color start values");
    clearAllLEDs();
    console.log("clear all colors");
    setAllColors(10, 10, 255, 10);
    console.log("set values to: 255, 255, 255, 255");
});

setInterval(function(){
  if(counter < 1000){
    console.log(counter);
    updateLEDs(counter);
    counter++;
  } else{
    counter = 1;
  }
}, 1);

var clearAllLEDs = function(){
  pwm.channelOff(0);
  pwm.channelOff(1);
  pwm.channelOff(2);
  pwm.channelOff(3);
}

var setColorStartValues = function(){
  white.arrayC[0] = 0;
  white.arrayC[1] = 0;
  white.arrayC[1000] = 0;
  red.arrayC[0] = 0;
  red.arrayC[1] = 0;
  red.arrayC[1000] = 0;
  green.arrayC[0] = 0;
  green.arrayC[1] = 0;
  green.arrayC[1000] = 0;
  blue.arrayC[0] = 0;
  blue.arrayC[1] = 0;
  blue.arrayC[1000] = 0;
}

var setAllColors = function(newRedVal, newGreenVal, newBlueVal, newWhiteVal){
  updateSingleColor(red, newRedVal);
  updateSingleColor(green, newGreenVal);
  updateSingleColor(blue, newBlueVal);
  updateSingleColor(white, newWhiteVal);
}

var updateLEDs = function(c){
  redTemp = parseFloat((red.arrayC[c]/255).toFixed(2));
  greenTemp = parseFloat((green.arrayC[c]/255).toFixed(2));
  blueTemp = parseFloat((blue.arrayC[c]/255).toFixed(2));
  whiteTemp = parseFloat((white.arrayC[c]/255).toFixed(2));

  //console.log("updateLEDs*************************************")
  //console.log("set red LED to ", this.redTemp);
  //console.log("set green LED to ", (green.arrayC[c]/255).toFixed(2));
  //console.log("set blue LED to ", (blue.arrayC[c]/255).toFixed(2));
  //console.log("set white LED to ", (white.arrayC[c]/255).toFixed(2));
  //set red value
  pwm.setDutyCycle(3, this.redTemp);
  //set green value
  pwm.setDutyCycle(2, this.greenTemp);
  //set blue value
  pwm.setDutyCycle(1, this.blueTemp);
  //set white value
  pwm.setDutyCycle(0, this.whiteTemp);
}

//takes a new color value,
var updateSingleColor = function(colorObject, val){
  colorObject.arrayC[1] = colorObject.arrayC[duration];
  //console.log(colorObject.name, ".arrayC[1] =", colorObject.arrayC[1]);
  colorObject.arrayC[duration] = val;
  //console.log(colorObject.name, "arrayC[1000] =", colorObject.arrayC[duration]);
  colorObject.arrayC[0] = Math.abs(colorObject.arrayC[duration] - colorObject.arrayC[1]);
  //console.log(colorObject.name, "arrayC[0] =", colorObject.arrayC[0]);
  for(var i = 2; i < duration; i++){
    colorObject.arrayC[i] = easeInOutQuad(i, colorObject.arrayC[1], colorObject.arrayC[0], duration);
  }
}

var printVals = function(c){
  console.log("counter: ", c, "  r:", red.arrayC[c], "  g:", green.arrayC[c], "  b:", blue.arrayC[c], "  w:", white.arrayC[c]);
}

//description: calculates an individual value, from "start" to "duration" at the point "current time"
//parameters: t = current time, b = start value, c = change in value, d = duration
//notes: equation derived from http://gizma.com/easing/
var easeInOutQuad = function (t, b, c, d) {
  //console.log("easInOutQuad fired")
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

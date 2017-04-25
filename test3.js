var i2cBus = require("i2c-bus");
var Gpio = require("onoff").Gpio;
var Pca9685Driver = require("pca9685").Pca9685Driver; //uses pin numbers, not GPIO numbers!!@!

var counter = 0;
var duration = 100;
var buttonMode = 0;

var red = {
  name: "red",
  oldC: 1,
  currentC: 1,
  newC: 1,
  dvC: 1
};
var green = {
  name: "green",
  oldC: 1,
  currentC: 1,
  newC: 1,
  dvC: 1
};
var blue = {
  name: "blue",
  oldC: 1,
  currentC: 1,
  newC: 1,
  dvC: 1
};
var white = {
  name: "white",
  oldC: 1,
  currentC: 1,
  newC: 1,
  dvC: 1
};

var led = new Gpio(26, 'out');
var button = new Gpio(19, 'in', 'both');

var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 1500,
    debug: false
};



pwm = new Pca9685Driver(options, function(err) {
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }
    console.log("Initialization done");
    colorCycle("red");
    //led.writeSync(1);
    //run();

});

button.watch(function(err, value) {
  if(value){
    console.log('button pressed');
    switch(buttonMode){
      case 0:
        console.log("mode 0: default");
        change(6, 7, 46, 26);
        buttonMode++;
        break;
      case 1:
        console.log("mode 1: active");
        change(15, 15, 15, 15);
        buttonMode++;
        break;
      case 2:
        console.log("mode 2: morning sunrise");
        change(94, 94, 1, 47);
        buttonMode++;
        break;
      case 3:
        console.log("mode 3: afternoon sunset");
        change(250, 42, 14, 132);
        buttonMode++;
        break;
      case 4:
        console.log("mode 4: after hours");
        change(163, 13, 163, 88);
        buttonMode++;
        break;
      default:
        console.log("default");
        buttonMode = 0
    }
  }
});
var change = function(r, g, b, w){
  counter = 1;
  red.oldC = red.currentC;
  red.newC = r;
  red.dvC = red.newC - red.oldC;

  green.oldC = green.currentC;
  green.newC = g;
  green.dvC = green.newC - green.oldC;

  blue.oldC = blue.currentC;
  blue.newC = b;
  blue.dvC = blue.newC - blue.oldC;

  white.oldC = white.currentC;
  white.newC = w;
  white.dvC = white.newC - white.oldC;
  run();
}

var run = function(){
  setTimeout(function(){
    if(counter && counter < duration){
      //console.log(counter, easeInOutQuad(counter, 10, 255, duration)/255);
      //console.log("red.currentC", red.currentC, "green.currentC", green.currentC, "blue.currentC", blue.currentC, "white.currentC", white.currentC, counter);
      red.currentC = easeInOutQuad(counter, red.oldC, red.dvC, duration);
      pwm.setDutyCycle(3, red.currentC / 255);
      green.currentC = easeInOutQuad(counter, green.oldC, green.dvC, duration);
      pwm.setDutyCycle(2, green.currentC / 255);
      blue.currentC = easeInOutQuad(counter, blue.oldC, blue.dvC, duration);
      pwm.setDutyCycle(1, blue.currentC / 255);
      white.currentC = easeInOutQuad(counter, white.oldC, white.dvC, duration);
      pwm.setDutyCycle(0, white.currentC / 255);
      counter++;
      run();
    } else{
      counter = 0;
      console.log("finished", counter)
    }
  }, 1);
}

var colorCycle = function(color){
  console.log("colorCycle: ", color)
  setTimeout(function(){
    switch (color) {
      case "red":
        change(50, 1, 1, 1);
        colorCycle("green");
        break;
      case "green":
        change(1, 50, 1, 1);
        colorCycle("blue");
        break;
      case "blue":
        change(1, 1, 50, 1);
        colorCycle("white");
        break;
      case "white":
        change(1, 1, 1, 50);
        colorCycle("red");
        break;
      default:
    }

  }, 2000);
}




//description: calculates an individual value, from "start" to "duration" at the point "current time"
//parameters: t = current time, b = start value, c = change in value, d = duration
//notes: equation derived from http://gizma.com/easing/
var easeInOutQuad = function (t, b, c, d) {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
};

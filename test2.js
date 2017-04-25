var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;

var counter = 0;
var verbalCounter = 0;
var duration = 1000;

var oldR = 1;
var currentR = 1;
var newR = 1;
var dvR = 1;

var oldG = 1;
var currentG = 1;
var newG = 1;
var dvG = 1;

var oldB = 1;
var currentB = 1;
var newB = 1;
var dvB = 1;

var oldW = 1;
var currentW = 1;
var newW = 1;
var dvW = 1;

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
    run();
    setInterval(function(){
      console.log(verbalCounter);
      verbalCounter++;
    }, 1000);
    setTimeout(function(){
      console.log("change(255)")
      change(255, 255, 255, 255);
    }, 3000);
});

var run = function() {
  setTimeout(function () {
    if (counter < duration) {
      currentR = easeInOutQuad(counter, oldR, dvR, duration)
      pwm.setDutyCycle(3, currentR / 255);
      currentG = easeInOutQuad(counter, oldG, dvG, duration)
      pwm.setDutyCycle(2, currentG / 255);
      //currentB = easeInOutQuad(counter, oldB, dvB, duration)
      //pwm.setDutyCycle(1, currentB / 255);
      //currentW = easeInOutQuad(counter, oldW, dvW, duration)
      //pwm.setDutyCycle(0, currentW / 255);
      counter++;
      run()
    } else{
      counter = 0;
    }
  }, 1)
}

var change = function(r, g, b, w){
  oldR = currentR;
  newR = r;
  dvR = newR - oldR;

  oldG = currentG;
  newG = g;
  dvG = newG - oldG;

  oldB = currentB;
  newB = b;
  dvB = newB - oldB;

  oldW = currentW;
  newW = w;
  dvW = newW - oldW;
  run();
}

var easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

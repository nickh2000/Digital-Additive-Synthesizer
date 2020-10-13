//some global variables
let osc, fft, voices;
range = 5000;
playing = false;

async function delay(delayInms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, delayInms);
  });
}

async function wait() {

  let delayres = await delay(50);
  update();
}

function setup() {

  //set screen size
  let cnv = createCanvas(windowWidth, windowHeight);

  //create the first wave
  first = new Wave();

  //this variable will analyze the wave so we can draw it
  fft = new p5.FFT();

  voices = [first];
  colorMode(HSB);

} //called at the beginning

function draw() {

  if (playing) {
    for (voice of voices) {
      let vol = voice.vol.value;
      voice.oscillator.amp(vol / 100);
    }
  }

  //redraw the screen if the mouse is not pressed
  if (!mouseIsPressed) {
    drawWave();
    drawFrequencies();

  }
} //called every frame

function drawWave() {
  background(0);
  let waveform = fft.waveform(); // analyzes the waveform
  beginShape();
  noFill();
  stroke(255);
  strokeWeight(1);
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height / 2, 0);
    vertex(x, y);
  }
  endShape();

} //draw the wave vs time graph

function drawFrequencies() {
  let spectrum = fft.analyze(); //Performs FFT on audio input
  noStroke();

  for (i = 1; i <= range; i += 10) {

    let color = map(i, 0, range, 0, 255);

    fill(color, 200, 200); //Hue is proportional to the current frequency, creates rainbow

    h = map(fft.getEnergy(i, i + 10), 0, 255, 0, height) / 2; //
    rect(map(i, 0, range, 0, width), height - h, 1, h); //Draw a rectangle representing the frequency bin


  }
} //draw the visualizer

class Wave {

  //create the class
  constructor() {

    //Create a new p5 oscillator object
    this.oscillator = new p5.Oscillator();

    //find the HTML element where we'll store our new carrier
    var carriers = document.getElementById("carriers");
    var wave = this;

    //Associate this carrier with the sliders in our HTML document
    this.element = carriers.lastElementChild;

    //Make the hidden sliders visible
    this.element.style.visibility = "visible";

    //Find the frequency slider
    this.freq = this.element.children.namedItem("freq");
    this.freqLabel = this.element.children.namedItem("freqLabel");


    //Find the Volume Slider
    this.vol = this.element.children.namedItem("vol");
    this.volLabel = this.element.children.namedItem("volLabel");


    //FInd the waveshape Slider
    this.shape = this.element.children.namedItem("shape");
    this.shapeLabel = this.element.children.namedItem("shapeLabel");

    this.mute = this.element.children.namedItem("mute");


    this.mute.onclick = function() {
      wave.vol.value = "0";
      wave.oscillator.amp(0);
    }

    //When the slider is changed, change the oscillator frequency
    this.freq.oninput = function() {


      wave.oscillator.freq(Number(this.value));
      wave.freqLabel.innerHTML = this.value + " Hz";
      //redraw the screen
      drawWave();
      drawFrequencies();

    }

    //When the volume slider is changed, changed the amplitude of the oscillator
    this.vol.oninput = function() {
      wave.oscillator.amp(this.value / 100);
      wave.volLabel.innerText = this.value + "%";
      drawWave();
      drawFrequencies();
    }


    //when the shape slider is changed, change the oscillator waveshape
    this.shape.oninput = function() {

      //map the value of the shape slider to different wave-shapes (0=sine, 1=triangle, 2=sawtooth, 3=square
      let shapes = ['Sine', 'Triangle', 'Sawtooth', 'Square'];

      //set oscillator shape according to slider value
      wave.oscillator.setType(shapes[this.value].toLowerCase());
      wave.shapeLabel.innerHTML = shapes[this.value];
      //give the oscillator some time before redrawing, because changing the waveshape takes awhile
      wait();

    }

    //make a new set of HTML elements for the next wave, and collapse them so we don't see them
    var nextWave = document.createElement("DIV");
    nextWave.style.visibility = "Collapse";

    //copy and paste the sliders into the wave element
    nextWave.innerHTML = this.element.innerHTML;

    //add the element to the HTML document
    carriers.appendChild(nextWave);


    //start the new oscillator
    
    this.oscillator.amp(0);
    this.oscillator.start();
    

  }
} //stores information about each wave

function addWave() {
  newWave = new Wave();
  drawWave();
  drawFrequencies();
  voices.push(newWave);
} //called when we press Add Wave button

function removeWave() {
  
  let last = voices[voices.length - 1];
  last.element.remove();
  last.oscillator.stop();

  voices.pop();

} //called when we press Remove Wave

function keyPressed() {

  playing = true;


  for (var carrier of voices) {
    let currentFreq = eval(carrier.freq.value);

    let newFreq = currentFreq * (2 ** (1 / 12 * (keyCode - 49)));

    if (keyCode == ENTER) {
      newFreq = eval(carrier.freq.value);
    }

    carrier.oscillator.freq(newFreq);

    carrier.oscillator.start();
  }

} //called when we press on a key

function keyReleased() {



  if (keyCode == ENTER) {
    return;

  }

  playing = false;

  for (var carrier of voices) {

    carrier.oscillator.amp(0, .5);
  }



} //called when we release a key
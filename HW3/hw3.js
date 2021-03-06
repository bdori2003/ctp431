window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var filter_onoff = false;
var filter_freq = 1000;
var filter_q = 1;
function set_filter_onoff(status){
	filter_onoff=status;
}
function set_filter_freq(freq){
	filter_freq=freq;
}
function set_filter_q(q){
	filter_q=q;
}

// select a preset
window.onload=function(){

    window.addEventListener('keydown', function (key) {
        keyboardDown(key);
    });		

	// launch MIDI 	
	if (navigator.requestMIDIAccess)
        navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
    else
        alert("No MIDI support present in your browser.  You're gonna have a bad time.")

}


function TR808Tone1(context, osc_frequency, osc_sweep, amp_gain, amp_decaytime) {
	this.context = context;
	this.osc_frequency = osc_frequency;
	this.osc_sweep = osc_sweep;
	this.amp_gain = amp_gain;
	this.amp_decaytime = amp_decaytime;

	this.amp_attack_time = 0.0;
//		this.decay = 0.7;		
};

// create and connect
TR808Tone1.prototype.setup = function() {

	// oscillator	
	this.osc = this.context.createOscillator();
	
	// envelope
	this.gain = this.context.createGain();
	
	// lowpass filter 
	var lowFilter = this.context.createBiquadFilter();
	lowFilter.type = 'lowpass';
	lowFilter.frequency.value = filter_freq;
	lowFilter.Q.value = filter_q;
	
	
	// connect
	this.osc.connect(this.gain);
	if (filter_onoff ==true){
		this.gain.connect(lowFilter);
		lowFilter.connect(this.context.destination);
	}
	else{
		this.gain.connect(this.context.destination);
	}
};


// control
TR808Tone1.prototype.trigger = function(time) {
	this.setup();
	
	// frequency sweeping
	this.osc.frequency.setValueAtTime(this.osc_frequency, time);
	if (this.osc_sweep == 'linear') {
		this.osc.frequency.linearRampToValueAtTime(1, time + this.amp_attack_time + this.amp_decaytime);
	}
	else if (this.osc_sweep == 'exp') {
		this.osc.frequency.exponentialRampToValueAtTime(1, time + this.amp_attack_time + this.amp_decaytime);
	}
	
	// amp envelope
	this.gain.gain.setValueAtTime(0, time);
	this.gain.gain.linearRampToValueAtTime(this.amp_gain, time +  this.amp_attack_time);
	this.gain.gain.exponentialRampToValueAtTime(0.01, time + this.amp_attack_time +  this.amp_decaytime);

	this.osc.start(time);

	this.osc.stop(time + this.amp_attack_time +  this.amp_decaytime);
};

function TR808Tone2(context, highpass_freq, amp_gain, amp_decaytime) {
	this.context = context;
	
	this.highpass_frequency = highpass_freq;

	this.amp_decaytime = amp_decaytime;
	this.amp_gain = amp_gain;
	this.amp_attack_time = 0;
//		this.decay = 0.7;		
};

// generate a wavetable for white noise 
TR808Tone2.prototype.noiseBuffer = function() {
	var bufferSize = this.context.sampleRate;
	var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
	var output = buffer.getChannelData(0);

	for (var i = 0; i < bufferSize; i++) {
		output[i] = Math.random() * 2 - 1;
	}

	return buffer;
};

TR808Tone2.prototype.setup = function() {
	// white noise
	this.noise = this.context.createBufferSource();
	this.noise.buffer = this.noiseBuffer();
	
	// highpass filter 
	var noiseFilter = this.context.createBiquadFilter();
	noiseFilter.type = 'highpass';
	noiseFilter.frequency.value = this.highpass_frequency;
	noiseFilter.Q.value = 1;
	this.noise.connect(noiseFilter);
	
	// lowpass filter 
	var lowFilter = this.context.createBiquadFilter();
	lowFilter.type = 'lowpass';
	lowFilter.frequency.value = filter_freq;
	lowFilter.Q.value = filter_q;
	
	
	// amp envelop
	if (filter_onoff==true){
		this.noiseEnvelope = this.context.createGain();
		noiseFilter.connect(this.noiseEnvelope);
		this.noiseEnvelope.connect(lowFilter);
		lowFilter.connect(this.context.destination);
	}
	else{
		this.noiseEnvelope = this.context.createGain();
		noiseFilter.connect(this.noiseEnvelope);
		this.noiseEnvelope.connect(this.context.destination);
	}
};

TR808Tone2.prototype.trigger = function(time) {
	this.setup();

	this.noiseEnvelope.gain.setValueAtTime(this.amp_gain, time);
	this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + this.amp_decaytime);
	this.noise.start(time)
	this.noise.stop(time + this.amp_decaytime);
};

function keyboardDown(key) {

	console.log(key.keyCode);

	switch (key.keyCode) {
	case 76: // 'l'
		play_kick();
		break;
	case 80: //'p'
		play_snare();
		break;		
	case 81: //'q'
		play_close_hihat();
		break;		
	case 87: //'w'
		play_open_hihat();
		break;		
	case 65: //'a'
		play_lowtom();
		break;		
	case 83: //'s'
		play_midtom();
		break;		
	case 68: //'d'
		play_hightom();
		break;		
	}
}

function play_kick()
{
	var kick = new TR808Tone1(context, 150, 'exp', 2, 0.6);
	var now = context.currentTime;
	
	kick.trigger(now);		
}

function play_lowtom()
{
	var low_tom = new TR808Tone1(context, 200, 'linear', 1, 0.3);
	var now = context.currentTime;
	
	low_tom.trigger(now);		
}


function play_midtom()
{
	var mid_tom = new TR808Tone1(context, 300, 'linear', 1, 0.3);
	var now = context.currentTime;
	
	mid_tom.trigger(now);		
}

function play_hightom()
{
	var high_tom = new TR808Tone1(context, 400, 'linear', 1, 0.3);
	var now = context.currentTime;
	
	high_tom.trigger(now);		
}

function play_snare()
{
	var snare = new TR808Tone2(context, 500, 0.5, 0.2);
	var now = context.currentTime;
	
	snare.trigger(now);		
}	

function play_open_hihat()
{
	var snare = new TR808Tone2(context, 1000, 0.1, 0.4);
	var now = context.currentTime;
	
	snare.trigger(now);		
}	

function play_close_hihat()
{
	var snare = new TR808Tone2(context, 2000, 0.5, 0.05);
	var now = context.currentTime;
	
	snare.trigger(now);		
}	

function play_rhythm()
{
	var kick = new TR808Tone1(context, 150, 'exp', 2, 0.6);
	var snare = new TR808Tone2(context, 500, 0.5, 0.2);
	
	var now = context.currentTime;
			
	for(var i = 0; i < 1; i++) {
		kick.trigger(now  +  i*4 );
		snare.trigger(now + 0.5  +  i*4 );
		kick.trigger(now  + 1.25 +  i*4 );
		snare.trigger(now + 1.5  +  i*4 );

		kick.trigger(now  + 2.0  +  i*4 );
		snare.trigger(now + 2.5  +  i*4 );
		kick.trigger(now  + 3.0 +  i*4 );
		kick.trigger(now  + 3.0 + 1/4 + 1/8 +  i*4 );
		kick.trigger(now  + 3.25 +  i*4 );
		snare.trigger(now + 3.5  +  i*4 );
	}
}	


function onMIDIInit(midi) {
	midiAccess = midi;

	var haveAtLeastOneDevice=false;
	var inputs=midiAccess.inputs.values();

	for ( var input = inputs.next(); input && !input.done; input = inputs.next()) {
		input.value.onmidimessage = MIDIMessageEventHandler;
		haveAtLeastOneDevice = true;
	}
      
	if (!haveAtLeastOneDevice)
		console.log("No MIDI input devices present.  You're gonna have a bad time.");
	}


function onMIDIReject(err) {
	console.log("The MIDI system failed to start.  You're gonna have a bad time.");
}


function MIDIMessageEventHandler(event) {
	// Mask off the lower nibble (MIDI channel, which we don't care about)
	switch (event.data[0] & 0xf0) {
		case 0x90:
		if (event.data[2]!=0)   // if velocity != 0, this is a note-on message
			//synth.noteOn(event.data[1], event.data[2]);	
			console.log(event.data[1])
			console.log(event.data[2])

			switch (event.data[1]) {
			case 44: // 'l'
				play_kick();
				break;
			case 45: //'p'
				play_snare();
				break;		
			case 46: //'q'
				play_close_hihat();
				break;		
			case 47: //'w'
				play_open_hihat();
				break;		
			case 48: //'a'
				play_lowtom();
				break;		
			case 49: //'s'
				play_midtom();
				break;		
			case 50: //'d'
				play_hightom();
				break;		
			}

			return;
		
		// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
        case 0x80:
			//synth.noteOff(event.data[1], event.data[2]);
			return;
	}
}	

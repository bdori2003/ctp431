var song;
var button;
var amp;
var mic;
var fft;
var SChist=[];
var VLhist=[];
var XX=[];
var YY=[];
var ZZ=[];
var volslider;
var freslider;
var sizeslider;
var file;
var aud;
var audn;
var fil;
var num=0;

function preload(){
}

function setup() {
    createCanvas(800,600);
    song=loadSound('abc.mp3');
    fil=createFileInput(handleFile);
    fil.position(10,650);
    amp=new p5.Amplitude();
    fft=new p5.FFT();
    print('Music Volume')
    volslider = createSlider(0,1.6,0.5,0.01);
    volslider.position(10,750);
    freslider = createSlider(10,100,70,1);
    freslider.position(10,800);
    sizeslider= createSlider(0.2,3,0.8,0.05);
    sizeslider.position(10,850);
    background(50);
    var volp = createP('Volume Control');
    volp.position(200,730);
    var frep = createP('Square Color Adjust');
    frep.position(200,780);
    var sizep = createP('Square Size Adjust');
    sizep.position(200,830);
    var exp = createP('Music Visualizer.');
    exp.position(900,20);
    var exp1= createP('Choose your music and click play button!');
    exp1.position(900,80);
    var exp2= createP('The larger the volume, the larger the square.');
    exp2.position(900,100);
    var exp3= createP('The higher the frequency, the more red and vivid squares appear.');
    exp3.position(900,120);
    var exp4= createP('You can adjust the volume and color&size of square through slider depends on the music.');
    exp4.position(900,140);
}
function handleFile(file) {
print(file);
if (file.type === 'audio')
 { song = loadSound(file.data);
   if(num==0){
        button = createButton("play");
        button.position(10,700);
        button.mousePressed(togglePlaying);
        num=1;}
  }

 }

function togglePlaying(){
    if(!song.isPlaying()){
    song.play();
    button.html("pause");
 }  else{
    song.pause();
    button.html("play");
 }
}


function Vpush(rvol_){
    VLhist.push(rvol_);
    XX.push(random(0,1));
    YY.push(random(0,1));
    ZZ.push(random(0,1));
}

function draw() {
    console.log(aud);
    background(10);
    var xx;
    var yy;
    var vol=amp.getLevel();
    var spectrum = fft.analyze();
    var sc= fft.getCentroid();
    ///var sc2= log(sc)*7;
    SChist.push(sc);
    var rvol=vol*width*sizeslider.value()+10;
    Vpush(rvol);
    console.log(max(SChist));
    song.setVolume(volslider.value());
    var rwi=map(vol, 0, 0.3, 10, width/2);
    colorMode(HSB,100,100,100,1);
    noStroke()
    translate(width/2,height/2);
    for(var i=0; i<SChist.length/10; i++){
        var scmax=max(SChist);
        var sccol=SChist[i*10]/freslider.value();
        c=color(sccol+10*ZZ[i*10]-5*XX[i*10],sccol+10*ZZ[i*10]+30,sccol+10*ZZ[i*10],0.8);
        fill(c);
        rotate(PI*ZZ[i*10]);
        rect(XX[i*10]*width-width/2,YY[i*10]*height-height/2,VLhist[i*10],VLhist[i*10]/(YY[i*10]*2+1));
    }

    var diam= map(vol,0,0.3,10,100);
    fill(90);
    ellipse(0,0,diam,diam);
}
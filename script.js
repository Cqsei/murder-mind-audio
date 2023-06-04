Audio.prototype.stop = function () {
  this.pause();
  this.currentTime = 0;
};
jQuery.fn.extend({
  //Für GUI Load und unload
  load: function () {
    return this.each(function () {
      if (this.classList.contains('hidden'))
      this.classList.remove('hidden');
      if (!this.classList.contains('showing'))
      this.classList.add('showing');
    });
  },
  unload: function () {
    return this.each(function () {
      if (this.classList.contains('showing'))
      this.classList.remove('showing');
      if (!this.classList.contains('hidden'))
      this.classList.add('hidden');
    });
  } });

jQuery.fn.hide = function () {
  $(this).removeClass('showing');
  $(this).addClass('hidden');
};

jQuery.fn.show = function () {
  $(this).removeClass('hidden');
  $(this).addClass('showing');
};

const getRand = (min, max) => {
  return Random.integer(min, max)(Random.engines.browserCrypto);
};

////////////////////////////////

const STATE = {
  audio: null,
  songEnded: false,
  usingDefault: false,
  minMag: 0,
  canvas: {
    height: 600,
    width: 600 } };



let COLORS = [
'rgb(239,83,80)', // light red - 0
'rgb(211,47,47)', // med red - 1
'rgb(183,28,28)', // dark red - 2
'rgb(255,112,67)', // light orange - 3
'rgb(255,87,34)', // med orange - 4
'rgb(216,67,21)', // dark orange - 5
'rgb(255,213,79)', // light yellow - 6
'rgb(255,193,7)', // med yellow - 7
'rgb(255,160,0)', // dark yellow - 8
'rgb(102,187,106)', // light green - 9
'rgb(67,160,71)', // med green - 10
'rgb(27,94,32)', // dark green - 11
'rgb(41,182,246)', // light blue - 12
'rgb(25,118,210)', // med blue - 13
'rgb(40,53,147)', // dark blue - 14
'rgb(126,87,194)', // light indigo - 15
'rgb(94,53,177)', // med indigo - 16
'rgb(69,39,160)', // dark indigo - 17 
'rgb(171,71,188)', // light violet - 18
'rgb(142,36,170)', // med violet - 19
'rgb(74,20,140)' // dark violet - 20
];

const PARTICLE_CONFIG = {
  particles: {
    number: {
      value: 100 },

    size: {
      value: 3,
      random: true },

    opacity: {
      value: 0.8,
      random: true },

    move: {
      direction: 'right',
      speed: 20 },

    line_linked: {
      enable: false } },


  interactivity: {
    events: {
      onhover: {
        enable: false } } } };





const DROP_ZONE_WRAPPER = $('#drop-zone-wrapper'),
DROP_ZONE = $('#drop-zone'),
ALTERNATE_OPTION = $('#alternate-option'),
AUDIO_CANVAS = $('#audio-canvas')[0],
CENTER_LOGO = $('#center-logo'),
PARTICLES_SLOW = $('#particles-slow'),
PARTICLES_FAST = $('#particles-fast'),
RESET = $('#reset');


const initializeCanvas = () => {
  const ctx = AUDIO_CANVAS.getContext('2d');
  ctx.canvas.width = STATE.canvas.width;
  ctx.canvas.height = STATE.canvas.height;
};

const isValidMp3 = data => {
  return data.items &&
  data.items.length === 1 &&
  data.items[0].kind === 'file' &&
  data.items[0].type === 'audio/mp3';
};

const getMp3FromData = e => {
  const data = e.dataTransfer;
  if (isValidMp3(data)) {
    const mp3 = data.files[0];
    return mp3;
  } else
  {
    console.error('Error: Not a valid Mp3 file.');
    return null;
  }
};

const createAudio = mp3 => {
  const url = URL.createObjectURL(mp3),
  audio = new Audio();
  audio.src = url;
  return audio;
};

const isBassABumpin = dataArray => {
  if (dataArray[0] === 255 && dataArray[1] === 255) {
    if (dataArray[2] === 255) {
      return 2;
    }
    return 1;
  }
  return 0;
};



const rumbleCenterLogo = dataArray => {

  const isBumpin = isBassABumpin(dataArray);
  if (isBumpin > 0) {
    const rumble = isBumpin === 2 ? 'rumble-level-2' : 'rumble-level-1';
    $(CENTER_LOGO)[0].classList.add(rumble);
    setTimeout(() => {
      $(CENTER_LOGO)[0].classList.remove(rumble);
    }, 300);
  }
};

const rumbleParticles = dataArray => {
  if (isBassABumpin(dataArray)) {
    $(PARTICLES_FAST).load();
    setTimeout(() => {
      $(PARTICLES_FAST).unload();
    }, 300);
  }
};

const hasSongEnded = audio => audio.currentTime >= audio.duration;



const drawLine = (ctx, color, c1, c2) => {
  ctx.beginPath();
  ctx.moveTo(c1.x, c1.y);
  ctx.lineTo(c2.x, c2.y);
  ctx.strokeStyle = color;
  ctx.stroke();
};
let audio = null;
let drawVisual = null;
const processAudio = mp3 => {

  if (mp3 === 'default') {
    audio = new Audio('https://cf-media.sndcdn.com/XhBlAmwYA5x5.128.mp3?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLW1lZGlhLnNuZGNkbi5jb20vWGhCbEFtd1lBNXg1LjEyOC5tcDMqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNjg1ODg4NjIyfX19XX0_&Signature=FAz9frkrZZVuNvpCKJ1-LY7Wqs-q1lFi8mwboCT9roAOoWA5nBIbeYeXtca-1w-HA0nhCaRVM7piP-vmGCpwqMS6MzvhFOlHKzGj~SazGxSMbXdx3Oc15idSyeFF4hvqruYheOyb8wxAnzih-Enn762Xax3YzOObfJO5t~zbwzucnZRCY3mFYh9Ox62nVuh8DutY1vRqJuTclk-r~JBKKg5RBAM7NbztKpPxWObKthqBJVHDWxLH177LVppesiK5NftuXCszqWjUYWEu4WrB~lgZF8ISaaOkMtGnhO7MEkNnN-3lj3iX4fCqyrhTp-RPKFj2XiJZSc8F4FGkAdK14Q__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ');
    audio.crossOrigin = 'anonymous';

  } else
  {
    audio = createAudio(mp3);
  }

  STATE.audio = audio;
  audio.addEventListener('loadedmetadata', () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
    audioSrc = audioCtx.createMediaElementSource(audio),
    analyser = audioCtx.createAnalyser(),
    canvasCtx = AUDIO_CANVAS.getContext('2d');

    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);
    analyser.fftSize = 256;
    audio.play();

    const bufferLength = analyser.frequencyBinCount,
    dataArray = new Uint8Array(bufferLength);
    canvasCtx.clearRect(0, 0, STATE.canvas.width, STATE.canvas.height);

    const draw = () => {
      drawVisual = requestAnimationFrame(draw);
      audio.volume = .72;
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, STATE.canvas.width, STATE.canvas.height);
      canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)';
      canvasCtx.fillRect(0, 0, STATE.canvas.width, STATE.canvas.height);

      rumbleCenterLogo(dataArray);
      rumbleParticles(dataArray);

      let radius = 150,
      cX = STATE.canvas.width / 2,cY = STATE.canvas.height / 2,
      inc = Math.round(bufferLength / 10),
      colorIndex = 0;

      for (let i = 0; i < bufferLength; i++) {
        let mag = dataArray[i] / 255;

        if (mag < 0.03) {
          mag = getRand(STATE.minMag, 5) * 0.02;
        }


        let r = radius + 7 + 5,
        angle = degToRad(i / bufferLength * 360) - 90,
        c1 = getCoords(cX, cY, r, angle),
        c2 = getCoords(cX, cY, r + mag * 30, angle),
        c3 = getCoords(cX, cY, r + mag * 35, angle),
        c4 = getCoords(cX, cY, r + mag * 40, angle),
        c5 = getCoords(cX, cY, r + mag * 45, angle);

        canvasCtx.lineWidth = 10;

        canvasCtx.lineCap = 'round';

        drawLine(canvasCtx, COLORS[13], c3, c5);
        drawLine(canvasCtx, COLORS[16], c2, c4);
        drawLine(canvasCtx, COLORS[19], c1, c3);
        drawLine(canvasCtx, 'white', c1, c2);

        if (hasSongEnded(audio) && !STATE.songEnded) {
          resetPlayer();
        }
      }
    };
    draw();
  });
};

const degToRad = deg => deg * Math.PI / 180;

const getCoords = (cX, cY, r, a) => {
  return {
    x: cX + r * Math.cos(a),
    y: cY + r * Math.sin(a) };

};

const hideDropZone = () => {
  $(DROP_ZONE_WRAPPER).unload();
};

const showCenterLogo = () => {
  $(CENTER_LOGO).load();
};

const showParticles = () => {
  $(PARTICLES_FAST).removeClass('initial');
  $(PARTICLES_FAST).load();
  setTimeout(() => {
    $(PARTICLES_FAST).unload();
  }, 5000);
};

const initializeParticles = () => {
  const config = Object.assign({}, PARTICLE_CONFIG);
  particlesJS('particles-slow', config);
  config.particles.size.value = 5;
  config.particles.move.speed = 50;
  config.particles.number.value = 200;
  particlesJS('particles-fast', config);
};

const startPlayer = mp3 => {

  //show playing logo
  $(CENTER_LOGO).load();

  //hide start button
  $(DROP_ZONE_WRAPPER).unload();
  $(DROP_ZONE).unload();

  //show reset btn
  $(RESET).load();
  processAudio(mp3);
};

const resetPlayer = () => {
  // if(STATE.audio) STATE.audio.currentTime = STATE.audio.duration
  STATE.songEnded = false;
  audio.stop();

  cancelAnimationFrame(drawVisual);
  STATE.songEnded = false;

  //hide reset
  $(RESET).unload();

  //hide playing logo
  $(CENTER_LOGO).unload();

  //show start button
  $(DROP_ZONE_WRAPPER).load();
  $(DROP_ZONE).load();

  //reset fast particles  
  $(PARTICLES_FAST).addClass('initial');
  $(PARTICLES_FAST).unload();
};


DROP_ZONE.ondragenter = () => {
  dragStart();
};

DROP_ZONE.ondragover = e => {
  e.stopPropagation();
  e.preventDefault();
  return false;
};

DROP_ZONE.ondragleave = () => {
  dragEnd();
};

DROP_ZONE.ondragend = () => {
  dragEnd();
};

DROP_ZONE.ondrop = e => {
  e.stopPropagation();
  e.preventDefault();
  dragEnd();
  const mp3 = getMp3FromData(e);
  if (mp3) {
    startPlayer(mp3);
  }
};



DROP_ZONE_WRAPPER[0].onclick = () => {
  startPlayer('default');
};
RESET[0].onclick = () => {
  resetPlayer();
};

window.onresize = _.throttle(() => {
  initializeCanvas();
}, 100);

window.onload = () => {
  initializeCanvas();
  initializeParticles();


  setInterval(() => {
    STATE.minMag = getRand(3, 5);
  }, 1000);
};

window.ondragover = e => {
  e = e || event;
  e.stopPropagation();
  e.preventDefault();
};

window.ondrop = e => {
  e = e || event;
  e.stopPropagation();
  e.preventDefault();
};
// GENERADO desde intro-cover.jsx — no editar a mano.
// Regenerar con: node scripts/build-intro.js
var W = 720,
  H = 1280,
  SPLIT = 362;
var SEAL_IMG = './assets/photos/seal_blank.jpg';
var LAND_IMG = './assets/photos/land.jpg';
var INTRO_AUDIO_SRC = './assets/audio/Intro portada sonido.mp3';
var MORE_INFO_AT = 22;
var CUES = {
  Sello: 0,
  Apertura: 0.3,
  Paisaje: 8,
  Historia: 10,
  Acompanas: 15,
  Destello: 19,
  Nombres: 20.5,
  Cierre: 54.5
};
var COMPOSITION_TOTAL = 57;
var HOLD_AT = CUES.Cierre;
var Easing = {
  linear: function (t) {
    return t;
  },
  easeInQuad: function (t) {
    return t * t;
  },
  easeOutQuad: function (t) {
    return t * (2 - t);
  },
  easeInOutQuad: function (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  easeInCubic: function (t) {
    return t * t * t;
  },
  easeOutCubic: function (t) {
    return --t * t * t + 1;
  },
  easeInOutCubic: function (t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },
  easeOutQuart: function (t) {
    return 1 - --t * t * t * t;
  },
  easeOutBack: function (t) {
    var c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
};
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function fadeOutAndStop(audio, ms) {
  if (!audio) return;
  var startVol = audio.volume;
  var startTime = null;
  function step(ts) {
    if (startTime == null) startTime = ts;
    var t = clamp((ts - startTime) / ms, 0, 1);
    audio.volume = startVol * (1 - t);
    if (t < 1) requestAnimationFrame(step);else {
      try {
        audio.pause();
      } catch (e) {}
    }
  }
  requestAnimationFrame(step);
}
function interpolate(input, output, ease) {
  ease = ease || Easing.linear;
  return function (t) {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (var i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        var span = input[i + 1] - input[i];
        var local = span === 0 ? 0 : (t - input[i]) / span;
        var easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        var eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}
function animate(opts) {
  var from = opts.from == null ? 0 : opts.from;
  var to = opts.to == null ? 1 : opts.to;
  var start = opts.start == null ? 0 : opts.start;
  var end = opts.end == null ? 1 : opts.end;
  var ease = opts.ease || Easing.easeInOutCubic;
  return function (t) {
    if (t <= start) return from;
    if (t >= end) return to;
    var local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}
var MOTION = {
  enter: function (from, to, start, end) {
    return animate({
      from: from,
      to: to,
      start: start,
      end: end,
      ease: Easing.easeOutCubic
    });
  },
  draw: function (from, to, start, end) {
    return animate({
      from: from,
      to: to,
      start: start,
      end: end,
      ease: Easing.easeInOutQuad
    });
  },
  pop: function (from, to, start, end) {
    return animate({
      from: from,
      to: to,
      start: start,
      end: end,
      ease: Easing.easeOutBack
    });
  }
};
var serif = "'Cormorant Garamond', Georgia, serif";
var script = "'Pinyon Script', 'Cormorant Garamond', serif";
function Monogram(props) {
  var initials = props.initials,
    size = props.size,
    tone = props.tone;
  return React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: W,
      height: H,
      pointerEvents: 'none'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      left: 370,
      top: 640,
      transform: 'translate(-50%,-50%)',
      fontFamily: script,
      fontSize: size,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      color: tone,
      WebkitTextStroke: '0.5px rgba(120,90,58,0.45)',
      textShadow: '2px 2.5px 1px rgba(255,253,248,1), 3px 3px 3px rgba(255,253,248,0.7), -2px -2px 2px rgba(96,70,42,0.9), -1px -1px 1px rgba(96,70,42,0.85), 0 0 3px rgba(96,70,42,0.5)'
    }
  }, initials));
}
function CardPanel(props) {
  var side = props.side,
    rot = props.rot,
    op = props.op,
    initials = props.initials,
    monoSize = props.monoSize,
    monoTone = props.monoTone;
  var left = side === 'l';
  return React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      height: H,
      left: left ? 0 : SPLIT,
      width: left ? SPLIT : W - SPLIT,
      overflow: 'hidden',
      opacity: op,
      transformOrigin: left ? 'left center' : 'right center',
      transform: 'translateZ(0.1px) rotateY(' + (left ? -rot : rot) + 'deg)',
      transformStyle: 'preserve-3d',
      backgroundColor: '#e8dcc6',
      boxShadow: rot > 1 ? (left ? -22 : 22) + 'px 0 52px -12px rgba(52,38,24,0.5)' : 'none'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: left ? 0 : -SPLIT,
      width: W,
      height: H
    }
  }, React.createElement("img", {
    src: SEAL_IMG,
    width: W,
    height: H,
    style: {
      display: 'block'
    },
    alt: ""
  }), React.createElement(Monogram, {
    initials: initials,
    size: monoSize,
    tone: monoTone
  })), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: left ? 'linear-gradient(to right, rgba(64,46,28,' + 0.30 * clamp(rot / 80, 0, 1) + ') 0%, rgba(255,252,244,0) 45%, rgba(255,252,244,' + 0.42 * clamp(rot / 80, 0, 1) + '))' : 'linear-gradient(to left, rgba(64,46,28,' + 0.30 * clamp(rot / 80, 0, 1) + ') 0%, rgba(255,252,244,0) 45%, rgba(255,252,244,' + 0.42 * clamp(rot / 80, 0, 1) + '))'
    }
  }));
}
function Line(props) {
  return React.createElement("div", {
    style: Object.assign({
      fontFamily: props.family,
      fontSize: props.size,
      lineHeight: 1.28,
      whiteSpace: 'pre-line'
    }, props.style)
  }, props.text);
}
function Butterfly(props) {
  var T = props.T,
    x = props.x,
    y = props.y,
    scale = props.scale,
    hue = props.hue,
    phase = props.phase,
    speed = props.speed,
    drift = props.drift;
  var t = T * speed + phase;
  var px = x + Math.sin(t * 0.55) * drift + Math.sin(t * 0.21) * drift * 0.6;
  var py = y + Math.sin(t * 0.83 + 1.2) * (drift * 0.34) + Math.cos(t * 0.37) * (drift * 0.22);
  var flap = Math.sin(t * 5.2);
  var tilt = Math.sin(t * 0.55) * 14;
  function wing(side) {
    return {
      position: 'absolute',
      top: 0,
      left: side > 0 ? '50%' : 'auto',
      right: side > 0 ? 'auto' : '50%',
      width: 13,
      height: 17,
      background: 'linear-gradient(' + (side > 0 ? 135 : 225) + 'deg, ' + hue + ' 0%, rgba(255,255,255,0.55) 100%)',
      borderRadius: side > 0 ? '60% 85% 55% 30%' : '85% 60% 30% 55%',
      transformOrigin: side > 0 ? 'left center' : 'right center',
      transform: 'rotateY(' + side * flap * 68 + 'deg)',
      boxShadow: '0 1px 3px rgba(70,54,34,0.18)',
      border: '0.5px solid rgba(120,96,64,0.35)'
    };
  }
  function lower(side) {
    return Object.assign(wing(side), {
      top: 11,
      width: 10,
      height: 12,
      opacity: 0.9,
      borderRadius: side > 0 ? '40% 70% 70% 45%' : '70% 40% 45% 70%',
      transform: 'rotateY(' + side * flap * 56 + 'deg)'
    });
  }
  return React.createElement("div", {
    style: {
      position: 'absolute',
      left: px,
      top: py,
      width: 0,
      height: 0,
      transform: 'rotate(' + tilt + 'deg) scale(' + scale + ')',
      transformStyle: 'preserve-3d'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      left: -1,
      top: 4,
      width: 2,
      height: 15,
      borderRadius: 2,
      background: 'rgba(108,86,58,0.6)'
    }
  }), React.createElement("div", {
    style: wing(1)
  }), React.createElement("div", {
    style: wing(-1)
  }), React.createElement("div", {
    style: lower(1)
  }), React.createElement("div", {
    style: lower(-1)
  }));
}
var BUTTERFLIES = [{
  x: 128,
  y: 852,
  scale: 1.2,
  hue: 'rgba(255,253,247,0.95)',
  phase: 0,
  speed: 0.9,
  drift: 118
}, {
  x: 545,
  y: 905,
  scale: 1.0,
  hue: 'rgba(252,248,236,0.92)',
  phase: 2.4,
  speed: 0.72,
  drift: 132
}, {
  x: 320,
  y: 1060,
  scale: 1.45,
  hue: 'rgba(255,255,250,0.96)',
  phase: 4.1,
  speed: 1.05,
  drift: 96
}, {
  x: 600,
  y: 760,
  scale: 0.82,
  hue: 'rgba(250,246,234,0.9)',
  phase: 1.3,
  speed: 0.62,
  drift: 104
}, {
  x: 92,
  y: 1105,
  scale: 0.9,
  hue: 'rgba(253,250,240,0.9)',
  phase: 5.6,
  speed: 0.8,
  drift: 86
}];
function Sparkle(props) {
  var p = props.p;
  if (p <= 0 || p >= 1) return null;
  var rise = interpolate([0, 1], [1, 0], Easing.easeOutQuad)(clamp(p / 0.45, 0, 1));
  var burst = clamp((p - 0.35) / 0.65, 0, 1);
  var cx = 348,
    cy = 215;
  var tailY = cy + (600 - cy) * rise;
  var dots = [];
  for (var i = 0; i < 70; i++) {
    var a = i / 70 * Math.PI * 2 + i * 0.7;
    var r = (45 + i * 37 % 145) * interpolate([0, 1], [0, 1], Easing.easeOutQuart)(burst);
    var o = Math.pow(1 - burst, 1.4) * 1.25;
    dots.push(React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: cx + Math.cos(a) * r,
        top: cy + Math.sin(a) * r * 0.85 + burst * burst * 90,
        width: 5,
        height: 5,
        borderRadius: 5,
        background: '#fffdf2',
        opacity: clamp(o, 0, 1),
        boxShadow: '0 0 10px 4px rgba(255,240,200,0.95)'
      }
    }));
  }
  return React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none'
    }
  }, rise > 0 && React.createElement("div", {
    style: {
      position: 'absolute',
      left: cx - 1,
      top: tailY,
      width: 2,
      height: 120 * rise,
      background: 'linear-gradient(to bottom, rgba(255,246,220,0.85), rgba(255,246,220,0))',
      opacity: rise * 0.9,
      filter: 'blur(1px)'
    }
  }), rise > 0 && React.createElement("div", {
    style: {
      position: 'absolute',
      left: cx - 2,
      top: tailY,
      width: 4,
      height: 4,
      borderRadius: 4,
      background: '#fffbf0',
      opacity: rise,
      boxShadow: '0 0 14px 6px rgba(255,243,210,0.9)'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      left: cx - 90,
      top: cy - 90,
      width: 180,
      height: 180,
      borderRadius: 180,
      background: 'radial-gradient(circle, rgba(255,247,222,0.95), rgba(255,247,222,0) 70%)',
      opacity: clamp(Math.pow(1 - burst, 2.2) * (burst > 0 ? 1 : 0), 0, 1)
    }
  }), dots);
}
function useIntroClock() {
  var startedState = React.useState(false);
  var started = startedState[0],
    setStarted = startedState[1];
  var revealedState = React.useState(false);
  var revealed = revealedState[0],
    setRevealed = revealedState[1];
  var tState = React.useState(0);
  var T = tState[0],
    setT = tState[1];
  var rafRef = React.useRef(null);
  var lastRef = React.useRef(null);
  var frozenRef = React.useRef(false);
  React.useEffect(function () {
    if (!started || revealed) return;
    frozenRef.current = false;
    function step(ts) {
      if (lastRef.current == null) lastRef.current = ts;
      var dt = Math.min((ts - lastRef.current) / 1000, 0.08);
      lastRef.current = ts;
      setT(function (t) {
        var next = t + dt;
        if (next >= HOLD_AT) {
          next = HOLD_AT;
          frozenRef.current = true;
        }
        return next;
      });
      if (!frozenRef.current) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return function () {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [started, revealed]);
  return {
    T: T,
    started: started,
    setStarted: setStarted,
    revealed: revealed,
    setRevealed: setRevealed
  };
}
function IntroCover() {
  var clock = useIntroClock();
  var T = clock.T,
    started = clock.started,
    revealed = clock.revealed;
  var introAudioRef = React.useRef(null);
  function handleStart() {
    if (started) return;
    clock.setStarted(true);
    try {
      var a = new Audio(INTRO_AUDIO_SRC);
      a.volume = 0.65;
      a.play().catch(function () {});
      introAudioRef.current = a;
    } catch (e) {}
  }
  function handleMoreInfo(e) {
    if (e) e.stopPropagation();
    fadeOutAndStop(introAudioRef.current, 900);
    if (typeof window.__triggerOpenInvitation === 'function') window.__triggerOpenInvitation();
    clock.setRevealed(true);
    setTimeout(function () {
      if (typeof window.__removeIntroCover === 'function') window.__removeIntroCover();
    }, 700);
  }
  React.useEffect(function () {
    return function () {
      if (introAudioRef.current) {
        try {
          introAudioRef.current.pause();
        } catch (e) {}
      }
    };
  }, []);
  var rootRef = React.useRef(null);
  React.useEffect(function () {
    var el = rootRef.current;
    var host = el && el.parentElement;
    if (!host) return;
    host.style.pointerEvents = revealed ? 'none' : 'auto';
  }, [revealed]);
  var scaleState = React.useState(1);
  var scale = scaleState[0],
    setScale = scaleState[1];
  React.useEffect(function () {
    function measure() {
      setScale(Math.max(window.innerWidth / W, window.innerHeight / H));
    }
    measure();
    window.addEventListener('resize', measure);
    return function () {
      window.removeEventListener('resize', measure);
    };
  }, []);
  var names = 'Jessica & Juan';
  var initials = 'J&J';
  var kicker = 'Nuestra boda';
  var date = '24 de octubre de 2026';
  var monoSize = 101;
  var monoTone = '#bda083';
  var rot = MOTION.draw(0, 79, CUES.Apertura + 0.15, CUES.Apertura + 2.1)(T);
  var cardScale = MOTION.draw(1, 1.14, CUES.Apertura, CUES.Apertura + 2.4)(T);
  var panelOp = clamp(MOTION.draw(1, 0, CUES.Apertura + 1.65, CUES.Apertura + 2.15)(T), 0, 1);
  var cardGone = T > CUES.Apertura + 2.25;
  var tocaOp = started ? 0 : 1;
  var landOp = MOTION.enter(0, 1, CUES.Apertura + 0.2, CUES.Apertura + 1.5)(T);
  var total = CUES.Cierre + 2.5;
  var landZoom = interpolate([0, 1], [1.16, 1.0], Easing.linear)(clamp((T - CUES.Apertura) / (total - CUES.Apertura), 0, 1));
  var bflyOp = MOTION.enter(0, 1, CUES.Apertura + 2.4, CUES.Paisaje + 1.6)(T) * MOTION.draw(1, 0, CUES.Cierre + 0.2, CUES.Cierre + 1.6)(T);
  var whiteOp = MOTION.draw(0.85, 0, CUES.Apertura + 0.45, CUES.Apertura + 2.0)(T);
  var blockA = clamp(Math.min(MOTION.enter(0, 1, CUES.Historia + 0.2, CUES.Historia + 1.4)(T), MOTION.enter(1, 0, CUES.Acompanas - 0.9, CUES.Acompanas - 0.1)(T)), 0, 1);
  var blockB = clamp(Math.min(MOTION.enter(0, 1, CUES.Acompanas + 0.2, CUES.Acompanas + 1.4)(T), MOTION.enter(1, 0, CUES.Destello - 0.5, CUES.Destello + 0.2)(T)), 0, 1);
  var sparkP = clamp((T - CUES.Destello + 1.1) / 3.4, 0, 1);
  var kickOp = MOTION.enter(0, 1, CUES.Nombres - 0.6, CUES.Nombres + 0.7)(T);
  var nameOp = MOTION.enter(0, 1, CUES.Nombres + 0.15, CUES.Nombres + 1.5)(T);
  var nameY = MOTION.enter(18, 0, CUES.Nombres + 0.15, CUES.Nombres + 1.8)(T);
  var dateOp = MOTION.enter(0, 1, CUES.Nombres + 0.9, CUES.Nombres + 2.2)(T);
  var moreInfoOp = clamp((T - MORE_INFO_AT) / 1, 0, 1);
  var shadow = '0 0 3px rgba(0,0,0,1), 0 2px 5px rgba(0,0,0,1), 0 3px 14px rgba(0,0,0,0.98), 0 0 30px rgba(0,0,0,0.9), 0 0 64px rgba(0,0,0,0.75), 0 0 110px rgba(0,0,0,0.6)';
  return React.createElement("div", {
    ref: rootRef,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      overflow: 'hidden',
      background: '#e8dcc6',
      opacity: revealed ? 0 : 1,
      pointerEvents: revealed ? 'none' : 'auto',
      transition: 'opacity 0.6s ease'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: W,
      height: H,
      transform: 'translate(-50%,-50%) scale(' + scale + ')',
      transformOrigin: 'center'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: '#fff'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: landOp,
      transform: 'scale(' + landZoom + ')',
      transformOrigin: '50% 46%'
    }
  }, React.createElement("img", {
    src: LAND_IMG,
    width: W,
    height: H,
    style: {
      display: 'block'
    },
    alt: ""
  })), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: landOp,
      transform: 'scale(' + landZoom + ')',
      transformOrigin: '50% 46%',
      pointerEvents: 'none'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: W,
      height: H,
      transformOrigin: '50% 100%',
      transform: 'skewX(' + (Math.sin(T * 0.62) * 0.55 + Math.sin(T * 1.13) * 0.22) + 'deg)',
      WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 26%, transparent 44%)',
      maskImage: 'linear-gradient(to top, #000 0%, #000 26%, transparent 44%)'
    }
  }, React.createElement("img", {
    src: LAND_IMG,
    width: W,
    height: H,
    style: {
      display: 'block'
    },
    alt: ""
  })), React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: W,
      height: H,
      transformOrigin: '50% 100%',
      transform: 'skewX(' + Math.sin(T * 0.44 + 1.9) * 0.9 + 'deg)',
      WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 12%, transparent 25%)',
      maskImage: 'linear-gradient(to top, #000 0%, #000 12%, transparent 25%)'
    }
  }, React.createElement("img", {
    src: LAND_IMG,
    width: W,
    height: H,
    style: {
      display: 'block'
    },
    alt: ""
  }))), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: bflyOp,
      perspective: 600,
      pointerEvents: 'none'
    }
  }, BUTTERFLIES.map(function (b, i) {
    return React.createElement(Butterfly, {
      key: i,
      T: T,
      x: b.x,
      y: b.y,
      scale: b.scale,
      hue: b.hue,
      phase: b.phase,
      speed: b.speed,
      drift: b.drift
    });
  })), React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: '#fdfdfb',
      opacity: clamp(whiteOp, 0, 1),
      pointerEvents: 'none'
    }
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 540,
      textAlign: 'center',
      color: '#fffdf7',
      opacity: blockA,
      textShadow: shadow
    }
  }, React.createElement(Line, {
    family: serif,
    size: 58,
    text: 'Porque eres parte\nde nuestra historia...',
    style: {
      fontStyle: 'italic',
      fontWeight: 700,
      letterSpacing: '0.01em'
    }
  })), React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 540,
      textAlign: 'center',
      color: '#fffdf7',
      opacity: blockB,
      textShadow: shadow
    }
  }, React.createElement(Line, {
    family: serif,
    size: 54,
    text: '...queremos que nos acompañes\nen nuestro gran día',
    style: {
      fontStyle: 'italic',
      fontWeight: 700,
      letterSpacing: '0.01em'
    }
  })), React.createElement(Sparkle, {
    p: sparkP
  }), React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 548,
      textAlign: 'center',
      color: '#fffdf7',
      textShadow: shadow
    }
  }, React.createElement("div", {
    style: {
      fontFamily: serif,
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 46,
      letterSpacing: '0.05em',
      opacity: kickOp
    }
  }, kicker), React.createElement("div", {
    style: {
      fontFamily: script,
      fontSize: 86,
      lineHeight: 1.32,
      opacity: nameOp,
      transform: 'translateY(' + nameY + 'px)',
      whiteSpace: 'nowrap'
    }
  }, names), React.createElement("div", {
    style: {
      fontFamily: serif,
      fontWeight: 700,
      fontSize: 48,
      letterSpacing: '0.03em',
      opacity: dateOp,
      marginTop: 10
    }
  }, date)), !cardGone && React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      perspective: 1500,
      perspectiveOrigin: '50% 50%'
    }
  }, React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      transform: 'scale(' + cardScale + ')',
      transformStyle: 'preserve-3d'
    }
  }, React.createElement(CardPanel, {
    side: "l",
    rot: rot,
    op: panelOp,
    initials: initials,
    monoSize: monoSize,
    monoTone: monoTone
  }), React.createElement(CardPanel, {
    side: "r",
    rot: rot,
    op: panelOp,
    initials: initials,
    monoSize: monoSize,
    monoTone: monoTone
  })), React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 962,
      textAlign: 'center',
      fontFamily: serif,
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 34,
      letterSpacing: '0.14em',
      color: '#fffdf6',
      opacity: tocaOp,
      textShadow: '0 2px 6px rgba(58,40,22,0.95), 0 0 20px rgba(58,40,22,0.8), 0 1px 2px rgba(58,40,22,0.9)',
      transition: 'opacity 0.3s ease'
    }
  }, "TOCA PARA ABRIR")), React.createElement("button", {
    onClick: handleMoreInfo,
    style: {
      position: 'absolute',
      left: '50%',
      top: 900,
      transform: 'translateX(-50%)',
      opacity: moreInfoOp,
      pointerEvents: moreInfoOp > 0.05 ? 'auto' : 'none',
      fontFamily: serif,
      fontStyle: 'italic',
      fontWeight: 600,
      fontSize: 30,
      letterSpacing: '0.03em',
      color: '#3a2c14',
      background: 'rgba(255,253,246,0.92)',
      border: '1px solid rgba(120,90,58,0.55)',
      borderRadius: 999,
      padding: '16px 40px',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
      transition: 'opacity 0.3s ease'
    }
  }, "Más información"))), !started && React.createElement("button", {
    onClick: handleStart,
    "aria-label": "Toca para abrir",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      background: 'transparent',
      border: 'none',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      zIndex: 5
    }
  }));
}
window.IntroCover = IntroCover;

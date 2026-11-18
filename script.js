const welcome = document.getElementById("welcome");
const celebration = document.getElementById("celebration");
const enterButton = document.getElementById("enterButton");
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const buildings = document.getElementById("buildings");
const greeting = document.getElementById("greeting");

let started = false;
let startAt = 0;
let lastBurst = 0;
let finaleDone = false;
let particles = [];
let bursts = [];
let width = innerWidth, height = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);

function resize() {
  width = innerWidth; height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  makeCity();
}
addEventListener("resize", resize);

function makeCity() {
  buildings.innerHTML = "";
  const count = Math.ceil(width / 48) + 2;
  for (let i = 0; i < count; i++) {
    const b = document.createElement("div");
    b.className = "building";
    const w = 30 + Math.random() * 65;
    const h = height * (.20 + Math.random() * .30);
    b.style.width = w + "px";
    b.style.height = h + "px";
    if (Math.random() > .72) {
      b.style.borderTopLeftRadius = "2px";
      b.style.borderTopRightRadius = "2px";
    }
    b.style.left = (i * (width / count) + Math.random() * 12) + "px";
    if (Math.random() > .82) b.style.clipPath = "polygon(0 8%,50% 0,100% 8%,100% 100%,0 100%)";
    buildings.appendChild(b);
  }
}
resize();

function startShow() {
  if (started) return;
  started = true;
  startAt = performance.now();
  document.body.classList.add("started");
  celebration.setAttribute("aria-hidden", "false");
  welcome.setAttribute("aria-hidden", "true");
}
enterButton.addEventListener("click", startShow);
addEventListener("keydown", e => {
  if (e.key === "Enter" && !started) startShow();
});

const palette = [
  [255, 207, 119], [255, 239, 194], [110, 173, 255],
  [184, 126, 255], [255, 135, 115], [120, 225, 230]
];

function burst(x, y, color = palette[Math.floor(Math.random()*palette.length)], scale = 1) {
  const count = Math.floor((105 + Math.random()*65) * scale);
  const base = Math.random() * Math.PI * 2;
  for (let i=0; i<count; i++) {
    const a = base + (Math.PI*2*i/count) + (Math.random()-.5)*.035;
    const speed = (1.5 + Math.random()*4.8) * scale;
    particles.push({
      x, y, px:x, py:y,
      vx:Math.cos(a)*speed, vy:Math.sin(a)*speed,
      life:70+Math.random()*48, max:118,
      color, size:.8+Math.random()*2.25,
      gravity:.025+Math.random()*.045,
      drag:.985+Math.random()*.009
    });
  }
  bursts.push({x,y,r:0,color,life:18});
}

function drawParticle(p) {
  const alpha = Math.max(0, p.life/p.max);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `rgb(${p.color.join(",")})`;
  ctx.lineWidth = Math.max(.6,p.size*alpha);
  ctx.beginPath();
  ctx.moveTo(p.px,p.py);
  ctx.lineTo(p.x,p.y);
  ctx.stroke();
  if (alpha > .55) {
    ctx.fillStyle = "#fff7df";
    ctx.fillRect(p.x,p.y,1.4,1.4);
  }
}

function animate(now) {
  requestAnimationFrame(animate);
  if (!started) return;

  const elapsed = (now - startAt)/1000;
  ctx.clearRect(0,0,width,height);

  // First fireworks begin after the city reveal.
  if (elapsed > 1.7 && now-lastBurst > (850 + Math.random()*450)) {
    burst(width*(.12+Math.random()*.76), height*(.12+Math.random()*.38));
    lastBurst = now;
  }

  // Grand finale: several simultaneous large bursts.
  if (elapsed > 11 && !finaleDone) {
    finaleDone = true;
    const spots = [
      [.10,.27],[.25,.18],[.42,.31],[.58,.16],
      [.76,.25],[.91,.34],[.50,.09]
    ];
    spots.forEach((s,i) => burst(width*s[0],height*s[1],palette[i%palette.length],1.35));
  }
  if (finaleDone && Math.random() < .055) {
    burst(width*(.08+Math.random()*.84),height*(.12+Math.random()*.35),undefined,1.05);
  }

  for (let i=particles.length-1;i>=0;i--) {
    const p=particles[i];
    p.px=p.x; p.py=p.y;
    p.x+=p.vx; p.y+=p.vy;
    p.vx*=p.drag; p.vy=p.vy*p.drag+p.gravity;
    p.life--;
    drawParticle(p);
    if (p.life<=0) particles.splice(i,1);
  }

  for (let i=bursts.length-1;i>=0;i--) {
    const b=bursts[i];
    b.r+=3; b.life--;
    ctx.globalAlpha=Math.max(0,b.life/18)*.55;
    ctx.strokeStyle=`rgb(${b.color.join(",")})`;
    ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.stroke();
    if (b.life<=0) bursts.splice(i,1);
  }
  ctx.globalAlpha=1;
}
requestAnimationFrame(animate);

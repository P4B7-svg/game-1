(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  function resize(){
    const r = canvas.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    canvas.width = r.width * d;
    canvas.height = r.height * d;
    ctx.setTransform(d,0,0,d,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  let W = canvas.width, H = canvas.height;
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');

  const player = { x:0.5, y:0.85, w:60, h:20, speed:0.012 };
  let px = player.x * W;
  let py = player.y * H;

  let obstacles = [], spawnTimer = 0, spawnInterval = 900;
  let lastTime = 0, running = false, paused = false, score = 0;

  function rand(a,b){ return Math.random()*(b-a)+a; }

  function spawnObstacle(){
    const ow = rand(30,120);
    const ox = rand(0, W - ow);
    const spd = rand(120,360);
    obstacles.push({ x:ox, y:-20, w:ow, h:20, spd });
  }

  function rectIntersect(a,b){
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  function drawStars(){
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for(const s of stars){
      ctx.fillRect(s.x, s.y, s.r, s.r);
      s.y += 0.15;
      if(s.y > H) s.y = 0;
    }
  }

  const stars = Array.from({length:80}, () => ({
    x: rand(0,W), y: rand(0,H), r: rand(0.3,1.6)
  }));

  let left = false, right = false;

  window.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft') left = true;
    if(e.key === 'ArrowRight') right = true;
  });
  window.addEventListener('keyup', e => {
    if(e.key === 'ArrowLeft') left = false;
    if(e.key === 'ArrowRight') right = false;
  });

  canvas.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const x = t.clientX - canvas.getBoundingClientRect().left;
    if(x < canvas.width/2) px -= W * 0.01;
    else px += W * 0.01;
  });

  function update(dt){
    if(!running || paused) return;

    spawnTimer += dt;
    if(spawnTimer > spawnInterval){
      spawnTimer = 0;
      spawnObstacle();
    }

    for(let i = obstacles.length - 1; i >= 0; i--){
      const o = obstacles[i];
      o.y += o.spd * (dt/1000);
      if(o.y > H + 50){
        obstacles.splice(i,1);
        score += 10;
      }
    }

    const pr = {
      x: px - player.w/2,
      y: py - player.h/2,
      w: player.w,
      h: player.h
    };

    for(const o of obstacles){
      if(rectIntersect(pr,o)){
        running = false;
        paused = true;
      }
    }

    scoreEl.textContent = score;
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawStars();

    ctx.fillStyle = '#61dafb';
    ctx.beginPath();
    ctx.moveTo(px, py - player.h);
    ctx.lineTo(px - player.w/2, py + player.h);
    ctx.lineTo(px + player.w/2, py + player.h);
    ctx.fill();

    ctx.fillStyle = '#ff6b6b';
    for(const o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);
  }

  startBtn.onclick = () => {
    running = true;
    paused = false;
    obstacles = [];
    score = 0;
    spawnTimer = 0;
  };

  pauseBtn.onclick = () => paused = !paused;

  resetBtn.onclick = () => {
    running = false;
    paused = false;
    obstacles = [];
    score = 0;
    scoreEl.textContent = 0;
  };

  function loop(ts){
    if(!lastTime) lastTime = ts;
    const dt = ts - lastTime;
    lastTime = ts;

    if(left) px -= W * 0.01;
    if(right) px += W * 0.01;

    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

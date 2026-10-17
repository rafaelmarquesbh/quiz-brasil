/* ============================================================
   Quiz Brasil — lógica do jogo (PWA, roda offline)
   ============================================================ */
'use strict';

/* ---------- utils ---------- */
const $  = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const shuffle = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[b[i],b[j]]=[b[j],b[i]];} return b; };
const sample  = (a,n) => shuffle(a).slice(0,n);
const rand    = a => a[(Math.random()*a.length)|0];
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');

/* ---------- persistência ---------- */
const store = {
  load(k, fb){ try{ return JSON.parse(localStorage.getItem(k)) ?? fb; }catch(e){ return fb; } },
  save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
};
let DB = store.load('quizBrasil', null) || {
  games:0, totalScore:0, bestScore:0, correct:0, answered:0,
  byCat:{ bandeiras:{c:0,t:0}, capitais:{c:0,t:0}, estados:{c:0,t:0}, tabuada:{c:0,t:0}, paises:{c:0,t:0}, bandeirasMundiais:{c:0,t:0}, capitaisMundiais:{c:0,t:0}, times:{c:0,t:0} },
  history:[] // últimos jogos: {score, acc, date}
};
let settings = Object.assign({ diff:'medio', sound:true }, store.load('quizBrasilSet', {}));
// Compatibilidade com estatísticas salvas de versões anteriores.
DB.byCat = Object.assign({ bandeiras:{c:0,t:0}, capitais:{c:0,t:0}, estados:{c:0,t:0}, tabuada:{c:0,t:0}, paises:{c:0,t:0}, capitaisMundiais:{c:0,t:0}, times:{c:0,t:0} }, DB.byCat || {});

const DIFFS = { facil:{label:'Fácil', time:20}, medio:{label:'Médio', time:15}, dificil:{label:'Difícil', time:10} };
const CAT_LABEL = { bandeiras:'Bandeiras do Brasil', capitais:'Capitais do Brasil', estados:'Estados', tabuada:'Tabuada de X', paises:'Países do Mundo', bandeirasMundiais:'Bandeiras do Mundo', capitaisMundiais:'Capitais Mundiais', times:'Escudos de Times' };

/* ---------- países, capitais mundiais e clubes ---------- */
const WORLD_COUNTRIES = [
  {name:'Argentina',capital:'Buenos Aires',code:'ar'},{name:'Brasil',capital:'Brasília',code:'br'},{name:'Austrália',capital:'Camberra',code:'au'},
  {name:'Alemanha',capital:'Berlim',code:'de'},{name:'Arábia Saudita',capital:'Riade',code:'sa'},
  {name:'África do Sul',capital:'Pretória',code:'za'},{name:'Bélgica',capital:'Bruxelas',code:'be'},
  {name:'Bolívia',capital:'Sucre',code:'bo'},{name:'Canadá',capital:'Ottawa',code:'ca'},
  {name:'Chile',capital:'Santiago',code:'cl'},{name:'China',capital:'Pequim',code:'cn'},
  {name:'Colômbia',capital:'Bogotá',code:'co'},{name:'Coreia do Sul',capital:'Seul',code:'kr'},
  {name:'Costa Rica',capital:'San José',code:'cr'},{name:'Cuba',capital:'Havana',code:'cu'},
  {name:'Dinamarca',capital:'Copenhague',code:'dk'},{name:'Egito',capital:'Cairo',code:'eg'},
  {name:'Equador',capital:'Quito',code:'ec'},{name:'Espanha',capital:'Madri',code:'es'},
  {name:'Estados Unidos',capital:'Washington, D.C.',code:'us'},{name:'Finlândia',capital:'Helsinque',code:'fi'},
  {name:'França',capital:'Paris',code:'fr'},{name:'Grécia',capital:'Atenas',code:'gr'},
  {name:'Índia',capital:'Nova Délhi',code:'in'},{name:'Indonésia',capital:'Jacarta',code:'id'},
  {name:'Irlanda',capital:'Dublin',code:'ie'},{name:'Israel',capital:'Jerusalém',code:'il'},
  {name:'Itália',capital:'Roma',code:'it'},{name:'Japão',capital:'Tóquio',code:'jp'},
  {name:'Marrocos',capital:'Rabat',code:'ma'},{name:'México',capital:'Cidade do México',code:'mx'},
  {name:'Noruega',capital:'Oslo',code:'no'},{name:'Nova Zelândia',capital:'Wellington',code:'nz'},
  {name:'Países Baixos',capital:'Amsterdã',code:'nl'},{name:'Paquistão',capital:'Islamabad',code:'pk'},
  {name:'Peru',capital:'Lima',code:'pe'},{name:'Polônia',capital:'Varsóvia',code:'pl'},
  {name:'Portugal',capital:'Lisboa',code:'pt'},{name:'Reino Unido',capital:'Londres',code:'gb'},
  {name:'República Tcheca',capital:'Praga',code:'cz'},{name:'Rússia',capital:'Moscou',code:'ru'},
  {name:'Singapura',capital:'Singapura',code:'sg'},{name:'Suécia',capital:'Estocolmo',code:'se'},
  {name:'Suíça',capital:'Berna',code:'ch'},{name:'Tailândia',capital:'Bangkok',code:'th'},
  {name:'Turquia',capital:'Ancara',code:'tr'},{name:'Ucrânia',capital:'Kyiv',code:'ua'},
  {name:'Uruguai',capital:'Montevidéu',code:'uy'},{name:'Venezuela',capital:'Caracas',code:'ve'},
  {name:'Vietnã',capital:'Hanói',code:'vn'}
];
const CONTINENT_BY_CODE = {};
['ar br bo cl co ec pe uy ve'].join(' ').split(' ').forEach(c=>CONTINENT_BY_CODE[c]='América do Sul');
['ca cr cu mx us'].join(' ').split(' ').forEach(c=>CONTINENT_BY_CODE[c]='América do Norte');
['au nz'].join(' ').split(' ').forEach(c=>CONTINENT_BY_CODE[c]='Oceania');
['cn in id jp kr pk sg th vn sa il'].join(' ').split(' ').forEach(c=>CONTINENT_BY_CODE[c]='Ásia');
['za eg ma'].join(' ').split(' ').forEach(c=>CONTINENT_BY_CODE[c]='África');
['de be dk es fi fr gr ie it nl no pl pt gb cz ru se ch tr ua'].join(' ').split(' ').forEach(c=>CONTINENT_BY_CODE[c]='Europa');
WORLD_COUNTRIES.forEach(country=>country.continent=CONTINENT_BY_CODE[country.code] || 'Europa');
const CONTINENTS = ['África','América do Norte','América do Sul','Ásia','Europa','Oceania'];
const CLUBS = [
  {name:'Flamengo',league:'Brasil · Série A',id:127},{name:'Palmeiras',league:'Brasil · Série A',id:121},
  {name:'Corinthians',league:'Brasil · Série A',id:131},{name:'São Paulo',league:'Brasil · Série A',id:126},
  {name:'Santos',league:'Brasil · Série A',id:128},{name:'Fluminense',league:'Brasil · Série A',id:124},
  {name:'Botafogo',league:'Brasil · Série A',id:120},{name:'Vasco da Gama',league:'Brasil · Série A',id:133},
  {name:'Grêmio',league:'Brasil · Série A',id:130},{name:'Internacional',league:'Brasil · Série A',id:119},
  {name:'Arsenal',league:'Inglaterra · Premier League',id:42},{name:'Chelsea',league:'Inglaterra · Premier League',id:49},
  {name:'Liverpool',league:'Inglaterra · Premier League',id:40},{name:'Manchester City',league:'Inglaterra · Premier League',id:50},
  {name:'Manchester United',league:'Inglaterra · Premier League',id:33},{name:'Tottenham',league:'Inglaterra · Premier League',id:47},
  {name:'Newcastle United',league:'Inglaterra · Premier League',id:34},{name:'Aston Villa',league:'Inglaterra · Premier League',id:66},
  {name:'Real Madrid',league:'Espanha · LaLiga',id:541},{name:'Barcelona',league:'Espanha · LaLiga',id:529},
  {name:'Atlético de Madrid',league:'Espanha · LaLiga',id:530},{name:'Sevilla',league:'Espanha · LaLiga',id:536},
  {name:'Valencia',league:'Espanha · LaLiga',id:532},{name:'Athletic Club',league:'Espanha · LaLiga',id:531},
  {name:'Real Sociedad',league:'Espanha · LaLiga',id:548},{name:'Villarreal',league:'Espanha · LaLiga',id:533},
  {name:'Benfica',league:'Portugal · Primeira Liga',id:211},{name:'Porto',league:'Portugal · Primeira Liga',id:212},
  {name:'Sporting CP',league:'Portugal · Primeira Liga',id:228},{name:'Braga',league:'Portugal · Primeira Liga',id:217},
  {name:'Vitória de Guimarães',league:'Portugal · Primeira Liga',id:294},{name:'Boavista',league:'Portugal · Primeira Liga',id:224}
];


/* ---------- áudio (WebAudio, sem arquivos) ---------- */
let AC = null;
function beep(freq, dur=0.12, type='sine', vol=0.16, when=0){
  if(!settings.sound) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const t = AC.currentTime + when;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t+dur);
    o.connect(g); g.connect(AC.destination);
    o.start(t); o.stop(t+dur+0.02);
  }catch(e){}
}
const sfx = {
  ok(){ beep(523,.1,'sine',.18); beep(784,.14,'sine',.18,.09); },
  bad(){ beep(220,.18,'sawtooth',.10); beep(160,.22,'sawtooth',.10,.1); },
  tick(){ beep(880,.05,'square',.05); },
  win(){ [523,659,784,1046].forEach((f,i)=>beep(f,.16,'sine',.18,i*.12)); },
};

/* ---------- estado do jogo ---------- */
let G = null, timerId = null;

function startGame(mode){
  const pool = mode==='paises' || mode==='bandeirasMundiais' || mode==='capitaisMundiais' ? WORLD_COUNTRIES : mode==='times' ? CLUBS : STATES;
  const qs = mode==='tabuada' ? Array.from({length:10},()=>makeQuestion(mode,null)) : sample(pool,10).map(item => makeQuestion(mode,item));
  G = {
    mode, qs, i:0, score:0, streak:0, bestStreak:0, correct:0, locked:false,
    time: DIFFS[settings.diff].time,
    byCat:{ bandeiras:{c:0,t:0}, capitais:{c:0,t:0}, estados:{c:0,t:0}, tabuada:{c:0,t:0}, paises:{c:0,t:0}, capitaisMundiais:{c:0,t:0}, times:{c:0,t:0} },
  };
  showScreen('quiz');
  renderQuestion();
}

function makeQuestion(mode, st){
  if(mode === 'misto'){
    const selected=rand(['bandeiras','capitais','estados','paises','bandeirasMundiais','capitaisMundiais','times','tabuada']);
    const item=['paises','bandeirasMundiais','capitaisMundiais'].includes(selected)?rand(WORLD_COUNTRIES):selected==='times'?rand(CLUBS):selected==='tabuada'?null:rand(STATES);
    return makeQuestion(selected,item);
  }
  if(mode === 'paises') return {cat:'paises',prompt:'Em qual continente fica <b>'+esc(st.name)+'</b>?',answer:st.continent,options:mkOpts(CONTINENTS,st.continent)};
  if(mode === 'bandeirasMundiais') return {cat:'bandeirasMundiais',prompt:'Qual país esta bandeira representa?',image:'https://flagcdn.com/w320/'+st.code+'.png',imageClass:'world-flag',answer:st.name,options:mkOpts(WORLD_COUNTRIES.map(x=>x.name),st.name)};
  if(mode === 'capitaisMundiais') return {cat:'capitaisMundiais',prompt:'Qual é a capital de <b>'+esc(st.name)+'</b>?',answer:st.capital,options:mkOpts(WORLD_COUNTRIES.map(x=>x.capital),st.capital)};
  if(mode === 'times') return {cat:'times',prompt:'A qual clube pertence este escudo?<br><small>'+esc(st.league)+'</small>',image:'https://media.api-sports.io/football/teams/'+st.id+'.png',imageClass:'club-crest',answer:st.name,options:mkOpts(CLUBS.map(x=>x.name),st.name)};
  if(mode === 'tabuada'){
    const a = 1 + ((Math.random()*10)|0), b = 1 + ((Math.random()*10)|0);
    const answer = a*b;
    const pool = new Set([answer]);
    while(pool.size < 4){
      const candidate = Math.random() < .65 ? answer + (((Math.random()*9)|0)+1)*(Math.random()<.5?-1:1) : (1+((Math.random()*10)|0))*(1+((Math.random()*10)|0));
      if(candidate > 0 && candidate <= 100 && candidate !== answer) pool.add(candidate);
    }
    return { cat:'tabuada', prompt:`Quanto é <strong>${a} × ${b}</strong>?`, answer:String(answer), options:shuffle([...pool].map(String)) };
  }
  if(mode === 'bandeiras')
    return { cat:'bandeiras', prompt:'De qual unidade federativa é esta bandeira?',
             flag:st, answer:st.name, options:mkOpts(STATES.map(x=>x.name), st.name) };
  if(mode === 'capitais')
    return { cat:'capitais', prompt:`Qual é a capital de <b>${esc(st.name)}</b>?`,
             answer:st.capital, options:mkOpts(STATES.map(x=>x.capital), st.capital) };
  if(Math.random() < 0.5)
    return { cat:'estados', prompt:`Qual unidade federativa tem como capital <b>${esc(st.capital)}</b>?`,
             answer:st.name, options:mkOpts(STATES.map(x=>x.name), st.name) };
  return { cat:'estados', prompt:`A sigla <b>${st.uf}</b> pertence a qual unidade federativa?`,
           answer:st.name, options:mkOpts(STATES.map(x=>x.name), st.name) };
}
function mkOpts(pool, correct){
  return shuffle([correct, ...sample(pool.filter(x=>x!==correct), 3)]);
}

/* ---------- render ---------- */
function showScreen(name){
  $$('.screen').forEach(s=>s.classList.remove('active'));
  $('#screen-'+name).classList.add('active');
  if(name==='home') renderHome();
  if(name==='stats') renderStats();
}

function renderHome(){
  $('#bestScoreHome').textContent = DB.bestScore;
  $('#gamesHome').textContent = DB.games;
  $$('.diff-btn').forEach(b=>b.classList.toggle('sel', b.dataset.diff===settings.diff));
}

function renderQuestion(){
  const q = G.qs[G.i];
  G.locked = false;
  $('#qIndex').textContent = `Questão ${G.i+1} de ${G.qs.length}`;
  $('#qCat').textContent = CAT_LABEL[q.cat] + (G.mode==='misto' ? ' · Modo Misto' : '');
  $('#qCat').dataset.cat = q.cat;
  $('#qPrompt').innerHTML = q.prompt;
  const fw = $('#flagWrap');
  if(q.flag){ fw.innerHTML = flagSVG(q.flag); fw.style.display='block'; }
  else if(q.image){ fw.innerHTML = `<img class="flag ${q.imageClass||''}" src="${q.image}" alt="Imagem da pergunta" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\'image-fallback\'>Imagem indisponível</span>')">`; fw.style.display='flex'; }
  else { fw.innerHTML=''; fw.style.display='none'; }

  const grid = $('#options');
  grid.innerHTML = '';
  q.options.forEach(opt=>{
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="opt-letter"></span><span>${esc(opt)}</span>`;
    b.onclick = () => answer(b, opt);
    grid.appendChild(b);
  });

  $('#scoreLive').textContent = G.score;
  $('#streakLive').textContent = '🔥 '+G.streak;
  $('#feedback').textContent = '';
  $('#feedback').className = 'feedback';
  startTimer();
}

function startTimer(){
  clearInterval(timerId);
  const total = DIFFS[settings.diff].time;
  G.timeLeft = total;
  const bar = $('#timeBar');
  bar.style.width = '100%';
  bar.classList.remove('low');
  const t0 = performance.now();
  timerId = setInterval(()=>{
    const elapsed = (performance.now()-t0)/1000;
    G.timeLeft = Math.max(0, total - elapsed);
    const pct = (G.timeLeft/total)*100;
    bar.style.width = pct+'%';
    if(pct < 30) bar.classList.add('low');
    if(G.timeLeft <= 5.05 && G.timeLeft > 4.95 && !G.locked) sfx.tick();
    if(G.timeLeft <= 0 && !G.locked){ clearInterval(timerId); timeout(); }
  }, 50);
}

function lockOptions(){
  G.locked = true;
  clearInterval(timerId);
  $$('#options .opt').forEach(b=>{
    b.disabled = true;
    if(b.textContent.trim().endsWith(G.qs[G.i].answer)) b.classList.add('correct');
  });
}

function answer(btn, opt){
  if(G.locked) return;
  const q = G.qs[G.i];
  lockOptions();
  const ok = opt === q.answer;
  if(ok){
    G.streak++;
    G.bestStreak = Math.max(G.bestStreak, G.streak);
    const pts = 100 + Math.round(G.timeLeft)*5 + G.streak*10;
    G.score += pts;
    G.correct++;
    G.byCat[q.cat].c++;
    sfx.ok();
    $('#feedback').textContent = `✔ Correto! +${pts} pontos`;
    $('#feedback').classList.add('good');
  }else{
    G.streak = 0;
    btn.classList.add('wrong');
    $('#options').classList.add('shake');
    setTimeout(()=>$('#options').classList.remove('shake'), 450);
    sfx.bad();
    $('#feedback').textContent = `✘ Errado! Resposta: ${q.answer}`;
    $('#feedback').classList.add('bad');
  }
  G.byCat[q.cat].t++;
  $('#scoreLive').textContent = G.score;
  $('#streakLive').textContent = '🔥 '+G.streak;
  setTimeout(nextQuestion, 1400);
}

function timeout(){
  const q = G.qs[G.i];
  lockOptions();
  G.streak = 0;
  G.byCat[q.cat].t++;
  sfx.bad();
  $('#feedback').textContent = `⏱ Tempo esgotado! Resposta: ${q.answer}`;
  $('#feedback').classList.add('bad');
  $('#streakLive').textContent = '🔥 0';
  setTimeout(nextQuestion, 1600);
}

function nextQuestion(){
  G.i++;
  if(G.i >= G.qs.length) endGame();
  else renderQuestion();
}

/* ---------- fim de jogo + gráficos ---------- */
function endGame(){
  const acc = Math.round((G.correct/G.qs.length)*100);
  DB.games++;
  DB.totalScore += G.score;
  DB.correct += G.correct;
  DB.answered += G.qs.length;
  const isRecord = G.score > DB.bestScore;
  if(isRecord) DB.bestScore = G.score;
  for(const k of Object.keys(G.byCat)){
    DB.byCat[k].c += G.byCat[k].c;
    DB.byCat[k].t += G.byCat[k].t;
  }
  DB.history.push({ score:G.score, acc, date:new Date().toISOString().slice(0,10) });
  DB.history = DB.history.slice(-20);
  store.save('quizBrasil', DB);

  showScreen('result');
  $('#resMode').textContent = G.mode==='misto' ? 'Modo Misto' : CAT_LABEL[G.mode];
  $('#resMsg').textContent =
    acc===100 ? 'Perfeito! Você é um atlas ambulante! 🏆' :
    acc>=80  ? 'Excelente! Quase lá! 🌟' :
    acc>=60  ? 'Muito bom! Continue treinando! 💪' :
    acc>=40  ? 'Bom começo! Revise o mapa! 🗺' : 'Não desista, tente de novo! 📚';
  if(isRecord) $('#resRecord').style.display='inline-block'; else $('#resRecord').style.display='none';

  // score animado
  const el = $('#resScore'); el.textContent = '0';
  let cur = 0;
  const step = Math.max(1, Math.round(G.score/50));
  const iv = setInterval(()=>{
    cur = Math.min(G.score, cur+step);
    el.textContent = cur;
    if(cur>=G.score) clearInterval(iv);
  }, 20);

  $('#resStats').innerHTML =
    statBox(G.correct+'/'+G.qs.length, 'Acertos') +
    statBox(acc+'%', 'Precisão') +
    statBox(G.bestStreak, 'Melhor sequência');

  drawDonut($('#chartAcc'), acc);
  drawBars($('#chartCats'),
    ['BR Flags','BR Caps','Estados','Tabuada','Países','Mundo Flags','Cap. Mundo','Times'],
    ['bandeiras','capitais','estados','tabuada','paises','bandeirasMundiais','capitaisMundiais','times'].map(k=>{
      const v = G.byCat[k]; return v.t ? Math.round(v.c/v.t*100) : 0;
    }),
    ['#ff9800','#00e676','#40c4ff','#e040fb','#29b6f6','#26c6da','#ab47bc','#ef5350']);

  if(acc>=70){ sfx.win(); confetti(); }
}

const statBox = (v,l) => `<div class="stat-box"><div class="stat-v">${v}</div><div class="stat-l">${l}</div></div>`;

/* ---------- canvas helpers (DPR-aware) ---------- */
function setupCanvas(cv){
  const dpr = window.devicePixelRatio||1;
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = w*dpr; cv.height = h*dpr;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  return { ctx, w, h };
}
function drawDonut(cv, pct){
  const {ctx,w,h} = setupCanvas(cv);
  const cx=w/2, cy=h/2, R=Math.min(w,h)/2-10, r=R*0.62;
  ctx.lineWidth = R-r; ctx.lineCap='round';
  ctx.strokeStyle = 'rgba(255,255,255,.09)';
  ctx.beginPath(); ctx.arc(cx,cy,(R+r)/2,0,Math.PI*2); ctx.stroke();
  const col = pct>=80?'#00e676':pct>=50?'#ffca28':'#ef5350';
  const t0 = performance.now();
  (function anim(){
    const p = Math.min(1,(performance.now()-t0)/900);
    const ease = 1-Math.pow(1-p,3);
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,255,255,.09)';
    ctx.beginPath(); ctx.arc(cx,cy,(R+r)/2,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle=col;
    ctx.beginPath();
    ctx.arc(cx,cy,(R+r)/2,-Math.PI/2,-Math.PI/2+Math.PI*2*(pct/100)*ease);
    ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='700 22px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(Math.round(pct*ease)+'%', cx, cy);
    if(p<1) requestAnimationFrame(anim);
  })();
}
function drawBars(cv, labels, values, colors){
  const {ctx,w,h} = setupCanvas(cv);
  const pad = 6, bw = (w - pad*(labels.length-1)) / labels.length;
  const max = 100;
  const t0 = performance.now();
  (function anim(){
    const p = Math.min(1,(performance.now()-t0)/800);
    const ease = 1-Math.pow(1-p,3);
    ctx.clearRect(0,0,w,h);
    labels.forEach((lb,i)=>{
      const v = values[i]*ease;
      const bh = (v/max)*(h-34);
      const x = i*(bw+pad), y = h-24-bh;
      const rr = Math.min(8, bw/3);
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.moveTo(x, h-24);
      ctx.lineTo(x, y+rr); ctx.arcTo(x,y,x+rr,y,rr); ctx.lineTo(x+bw-rr,y);
      ctx.arcTo(x+bw,y,x+bw,y+rr,rr); ctx.lineTo(x+bw,h-24); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font='600 12px system-ui'; ctx.textAlign='center';
      ctx.fillText(Math.round(values[i])+'%', x+bw/2, y-6);
      ctx.fillStyle='rgba(255,255,255,.6)'; ctx.font='11px system-ui';
      ctx.fillText(lb, x+bw/2, h-8);
    });
    if(p<1) requestAnimationFrame(anim);
  })();
}
function drawLine(cv, points){
  const {ctx,w,h} = setupCanvas(cv);
  if(points.length < 2){
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='13px system-ui';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('Jogue mais partidas para ver o histórico', w/2, h/2);
    return;
  }
  const pad=14, max=Math.max(...points,100)*1.15;
  const px = i => pad + i*(w-2*pad)/(points.length-1);
  const py = v => h-pad - (v/max)*(h-2*pad);
  const t0 = performance.now();
  (function anim(){
    const p = Math.min(1,(performance.now()-t0)/900);
    const n = Math.max(2, Math.ceil(points.length*p));
    ctx.clearRect(0,0,w,h);
    // grid
    ctx.strokeStyle='rgba(255,255,255,.07)';
    for(let g=0; g<=4; g++){ const y=pad+g*(h-2*pad)/4;
      ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke(); }
    // fill
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'rgba(0,230,118,.35)'); grad.addColorStop(1,'rgba(0,230,118,0)');
    ctx.beginPath(); ctx.moveTo(px(0), py(points[0]));
    for(let i=1;i<n;i++) ctx.lineTo(px(i), py(points[i]));
    ctx.lineTo(px(n-1), h-pad); ctx.lineTo(px(0), h-pad); ctx.closePath();
    ctx.fillStyle=grad; ctx.fill();
    // line
    ctx.beginPath(); ctx.moveTo(px(0), py(points[0]));
    for(let i=1;i<n;i++) ctx.lineTo(px(i), py(points[i]));
    ctx.strokeStyle='#00e676'; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.stroke();
    // dots
    for(let i=0;i<n;i++){ ctx.beginPath(); ctx.arc(px(i),py(points[i]),3.5,0,7); ctx.fillStyle='#00e676'; ctx.fill(); }
    if(p<1) requestAnimationFrame(anim);
  })();
}

/* ---------- tela de estatísticas ---------- */
function renderStats(){
  const acc = DB.answered ? Math.round(DB.correct/DB.answered*100) : 0;
  $('#stGames').innerHTML   = statBox(DB.games,'Partidas');
  $('#stAcc').innerHTML      = statBox(acc+'%','Precisão geral');
  $('#stBest').innerHTML     = statBox(DB.bestScore,'Recorde');
  $('#stAvg').innerHTML      = statBox(DB.games?Math.round(DB.totalScore/DB.games):0,'Média de pontos');
  drawBars($('#stCats'),
    ['BR Flags','BR Caps','Estados','Tabuada','Mundo','Cap. Mundo','Times'],
    ['bandeiras','capitais','estados','tabuada','paises','capitaisMundiais','times'].map(k=>{
      const v=DB.byCat[k]; return v.t?Math.round(v.c/v.t*100):0;
    }), ['#ff9800','#00e676','#40c4ff','#e040fb','#29b6f6','#26c6da','#ab47bc','#ef5350']);
  drawLine($('#stHist'), DB.history.map(x=>x.score));
}

/* ---------- confete ---------- */
function confetti(){
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio||1;
  cv.width = innerWidth*dpr; cv.height = innerHeight*dpr;
  ctx.scale(dpr,dpr);
  const colors=['#00e676','#ffdf00','#40c4ff','#ff5252','#e040fb','#ff9800'];
  const parts = Array.from({length:140},()=>({
    x:Math.random()*innerWidth, y:-20-Math.random()*innerHeight*.4,
    w:5+Math.random()*6, h:8+Math.random()*8,
    vy:2+Math.random()*3, vx:-1.5+Math.random()*3,
    rot:Math.random()*Math.PI, vr:-.1+Math.random()*.2,
    c:rand(colors)
  }));
  let frames=0;
  (function anim(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.y+=p.vy; p.x+=p.vx+Math.sin(p.y*.02); p.rot+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.c; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    });
    if(++frames < 240) requestAnimationFrame(anim);
    else ctx.clearRect(0,0,innerWidth,innerHeight);
  })();
}

/* ---------- PWA: service worker + install ---------- */
if('serviceWorker' in navigator){
  addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
let deferredPrompt = null;
addEventListener('beforeinstallprompt', e=>{
  e.preventDefault(); deferredPrompt = e;
  $('#btnInstall').style.display='inline-flex';
});
$('#btnInstall').onclick = async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $('#btnInstall').style.display='none';
};

/* ---------- eventos da UI ---------- */
$$('.mode-card').forEach(c => c.onclick = () => startGame(c.dataset.mode));
$$('.diff-btn').forEach(b => b.onclick = () => {
  settings.diff = b.dataset.diff;
  store.save('quizBrasilSet', settings);
  renderHome();
});
$('#btnSound').onclick = () => {
  settings.sound = !settings.sound;
  store.save('quizBrasilSet', settings);
  $('#btnSound').textContent = settings.sound ? '🔊' : '🔇';
  if(settings.sound) sfx.ok();
};
$('#btnStats').onclick = () => showScreen('stats');
$('#btnBackStats').onclick = () => showScreen('home');
$('#btnAgain').onclick = () => startGame(G.mode);
$('#btnHomeResult').onclick = () => showScreen('home');
$('#btnQuit').onclick = () => { clearInterval(timerId); showScreen('home'); };

/* init */
$('#btnSound').textContent = settings.sound ? '🔊' : '🔇';
renderHome();

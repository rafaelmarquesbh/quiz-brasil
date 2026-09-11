/* ============================================================
   Quiz Brasil — dados: 27 unidades federativas + bandeiras SVG
   (bandeiras em versão estilizada/simplificada para o quiz)
   ============================================================ */
'use strict';

const STATES = [
  { uf:'AC', name:'Acre',             capital:'Rio Branco'     },
  { uf:'AL', name:'Alagoas',          capital:'Maceió'         },
  { uf:'AP', name:'Amapá',            capital:'Macapá'         },
  { uf:'AM', name:'Amazonas',         capital:'Manaus'         },
  { uf:'BA', name:'Bahia',            capital:'Salvador'       },
  { uf:'CE', name:'Ceará',            capital:'Fortaleza'      },
  { uf:'DF', name:'Distrito Federal', capital:'Brasília'       },
  { uf:'ES', name:'Espírito Santo',   capital:'Vitória'        },
  { uf:'GO', name:'Goiás',            capital:'Goiânia'        },
  { uf:'MA', name:'Maranhão',         capital:'São Luís'       },
  { uf:'MT', name:'Mato Grosso',      capital:'Cuiabá'         },
  { uf:'MS', name:'Mato Grosso do Sul',capital:'Campo Grande'  },
  { uf:'MG', name:'Minas Gerais',     capital:'Belo Horizonte' },
  { uf:'PA', name:'Pará',             capital:'Belém'          },
  { uf:'PB', name:'Paraíba',          capital:'João Pessoa'    },
  { uf:'PR', name:'Paraná',           capital:'Curitiba'       },
  { uf:'PE', name:'Pernambuco',       capital:'Recife'         },
  { uf:'PI', name:'Piauí',            capital:'Teresina'       },
  { uf:'RJ', name:'Rio de Janeiro',   capital:'Rio de Janeiro' },
  { uf:'RN', name:'Rio Grande do Norte',capital:'Natal'        },
  { uf:'RS', name:'Rio Grande do Sul',capital:'Porto Alegre'   },
  { uf:'RO', name:'Rondônia',         capital:'Porto Velho'    },
  { uf:'RR', name:'Roraima',          capital:'Boa Vista'      },
  { uf:'SC', name:'Santa Catarina',   capital:'Florianópolis'  },
  { uf:'SP', name:'São Paulo',        capital:'São Paulo'      },
  { uf:'SE', name:'Sergipe',          capital:'Aracaju'        },
  { uf:'TO', name:'Tocantins',        capital:'Palmas'         },
];

/* ---------- helpers de desenho (viewBox 120x80) ---------- */
function hStripes(colors, h = 80, w = 120){
  const sh = h / colors.length;
  return colors.map((c,i)=>`<rect x="0" y="${(i*sh).toFixed(2)}" width="${w}" height="${(sh+0.6).toFixed(2)}" fill="${c}"/>`).join('');
}
function vStripes(colors, w = 120, h = 80){
  const sw = w / colors.length;
  return colors.map((c,i)=>`<rect x="${(i*sw).toFixed(2)}" y="0" width="${(sw+0.6).toFixed(2)}" height="${h}" fill="${c}"/>`).join('');
}
function star(cx, cy, R, r, fill, extra=''){
  let pts = [];
  for (let i=0;i<10;i++){
    const ang = -Math.PI/2 + i*Math.PI/5;
    const rad = (i%2===0) ? R : r;
    pts.push((cx+rad*Math.cos(ang)).toFixed(2)+','+(cy+rad*Math.sin(ang)).toFixed(2));
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" ${extra}/>`;
}
function circle(cx, cy, r, fill, extra=''){
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
}

/* ---------- bandeiras estilizadas ---------- */
const FLAGS = {
  AC: hStripes(['#d52b1e','#009c3b']) + star(60,40,15,5.8,'#ffdf00'),
  AL: hStripes(['#d52b1e','#ffffff','#003399']) +
      circle(60,40,9,'#003399') + star(60,40,5.5,2.2,'#ffdf00'),
  AP: hStripes(['#003399','#ffdf00','#009c3b']) + star(60,40,10,4,'#003399'),
  AM: `<rect width="120" height="80" fill="#ffffff"/>
       <polygon points="0,80 34,80 120,0 86,0" fill="#d52b1e"/>
       ${star(42,58,4.5,1.8,'#fff')}${star(60,40,4.5,1.8,'#fff')}${star(78,22,4.5,1.8,'#fff')}`,
  BA: hStripes(['#ffffff','#d52b1e','#ffffff','#d52b1e']) +
      `<rect width="42" height="40" fill="#003399"/>
       <polygon points="9,35 36,20 9,5" fill="#ffffff"/>`,
  CE: `<rect width="120" height="80" fill="#009c3b"/>
       ${circle(60,40,19,'#ffdf00')}${star(60,40,9,3.6,'#ffffff')}`,
  DF: `<rect width="120" height="80" fill="#ffffff"/>
       <rect x="0" y="10" width="120" height="7" fill="#000000"/>
       <rect x="0" y="63" width="120" height="7" fill="#000000"/>
       <path d="M32,54 A28,28 0 0 1 88,54" fill="none" stroke="#003399" stroke-width="6"/>
       <rect x="52" y="50" width="16" height="5" fill="#003399"/>`,
  ES: `<rect width="120" height="80" fill="#6fa8dc"/>
       <rect x="0" y="26" width="120" height="11" fill="#ffffff"/>
       <polygon points="55,31.5 60,26.5 65,31.5 60,36.5" fill="#e91e63"/>
       <polygon points="75,31.5 80,26.5 85,31.5 80,36.5" fill="#e91e63"/>`,
  GO: `<rect width="120" height="80" fill="#009c3b"/>
       <polygon points="60,7 113,40 60,73 7,40" fill="#ffdf00"/>
       ${star(60,40,10,4,'#ffffff')}`,
  MA: hStripes(Array.from({length:9},(_,i)=> i%2 ? '#000000' : '#ffffff'), 80) +
      `<rect width="50" height="42" fill="#d52b1e"/>${star(25,21,10,4,'#ffffff')}`,
  MT: `<rect width="120" height="80" fill="#003399"/>
       <polygon points="60,11 106,40 60,69 14,40" fill="#ffffff"/>
       ${star(60,40,9,3.6,'#ffdf00')}`,
  MS: `<rect width="120" height="80" fill="#009c3b"/>
       <polygon points="0,80 24,80 120,0 96,0" fill="#ffffff"/>
       ${star(60,40,12,5,'#ffdf00')}`,
  MG: `<rect width="120" height="80" fill="#ffffff"/>
       <polygon points="60,10 13,69 107,69" fill="#d52b1e"/>`,
  PA: `<rect width="120" height="80" fill="#d52b1e"/>
       <rect x="0" y="30" width="120" height="20" fill="#ffffff"/>
       ${star(60,40,11,4.5,'#003399')}`,
  PB: vStripes(['#d52b1e','#000000']) +
      `<text x="30" y="46" font-family="Arial, sans-serif" font-size="13" font-weight="bold"
       fill="#ffffff" text-anchor="middle">NEGO</text>`,
  PR: vStripes(['#009c3b','#ffffff','#009c3b']) +
      circle(60,40,15,'#003399') + star(60,40,7,2.8,'#ffffff'),
  PE: hStripes(['#003399','#ffdf00']) +
      ['#d52b1e','#ff7f00','#ffdf00','#009c3b','#003399'].map((c,i)=>
        `<path d="M ${60-(22-i*4)},52 A ${22-i*4},${22-i*4} 0 0 1 ${60+(22-i*4)},52"
         fill="none" stroke="${c}" stroke-width="3.2"/>`).join('') +
      star(60,16,6,2.4,'#ffffff'),
  PI: vStripes(['#003399','#ffdf00']) + star(20,18,7,2.8,'#ffffff'),
  RJ: hStripes(Array.from({length:8},(_,i)=> i%2 ? '#ffffff' : '#003399'), 80) +
      circle(60,40,14,'#ffffff','stroke="#003399" stroke-width="2"') +
      star(60,40,6,2.4,'#003399'),
  RN: `<rect width="120" height="80" fill="#ffffff"/>
       <rect width="42" height="80" fill="#009c3b"/>${star(21,40,10,4,'#ffdf00')}`,
  RS: hStripes(['#009c3b','#ffdf00','#d52b1e','#ffdf00','#009c3b']) +
      circle(60,40,13,'#ffffff','stroke="#003399" stroke-width="2.5"') +
      star(60,36,4.5,1.8,'#d52b1e'),
  RO: `<rect width="120" height="80" fill="#009c3b"/>
       <rect x="0" y="0" width="120" height="80" fill="none" stroke="#ffdf00" stroke-width="4"/>
       ${star(60,40,19,7.6,'#ffdf00')}${star(60,40,7,2.8,'#ffffff')}`,
  RR: hStripes(['#003399','#ffdf00','#009c3b']) + star(60,13,7,2.8,'#ffffff'),
  SC: hStripes(['#d52b1e','#ffffff','#d52b1e']) +
      `<polygon points="0,0 46,40 0,80" fill="#009c3b"/>`,
  SP: hStripes(Array.from({length:13},(_,i)=> i%2 ? '#ffffff' : '#000000'), 80) +
      `<rect width="42" height="34" fill="#d52b1e"/>`,
  SE: `<rect width="120" height="42" fill="#003399"/>
       <rect y="42" width="120" height="19" fill="#ffdf00"/>
       <rect y="61" width="120" height="19" fill="#009c3b"/>
       ${[[22,24],[40,14],[60,10],[80,14],[98,24]].map(p=>star(p[0],p[1],5,2,'#ffdf00')).join('')}`,
  TO: `<rect width="120" height="80" fill="#003399"/>
       ${circle(44,32,15,'#ffdf00')}
       ${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;
          return `<line x1="${44+18*Math.cos(a)}" y1="${32+18*Math.sin(a)}"
          x2="${44+23*Math.cos(a)}" y2="${32+23*Math.sin(a)}" stroke="#ffdf00" stroke-width="3"/>`;}).join('')}
       <polygon points="0,80 28,80 120,18 120,0 106,0 14,80" fill="#ffffff"/>`,
};

function flagSVG(st, cls='flag'){
  return `<svg class="${cls}" viewBox="0 0 120 80" role="img" aria-label="Bandeira de ${st.name}">${FLAGS[st.uf]}</svg>`;
}

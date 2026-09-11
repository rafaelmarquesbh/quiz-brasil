# Quiz Brasil — Bandeiras, Capitais e Estados (PWA)

Quiz web progressivo (PWA) sobre as 27 unidades federativas do Brasil.

## Como rodar

O Service Worker exige HTTP(S) (não funciona via `file://`):

```bash
cd quiz-brasil
python -m http.server 8000
# abra http://localhost:8000
```

Para instalar como app (Android/Chrome/Edge): abra o site e toque em
"Instalar" (botão no topo ou prompt do navegador). Depois da primeira
carga, funciona 100% offline.

Para publicar de graça: jogue a pasta em GitHub Pages, Netlify ou Vercel.

## Modos
- Bandeiras — identifique o estado pela bandeira (versão estilizada em SVG)
- Capitais — diga a capital de cada estado
- Estados — encontre o estado pela capital ou pela sigla
- Misto — desafio combinado

## Recursos
- Timer por dificuldade (20s / 15s / 10s), bônus de tempo e sequência (streak)
- Pontuação com recorde salvo (localStorage)
- Gráficos animados em canvas: precisão (anel), desempenho por categoria (barras)
  e histórico de pontuação (linha)
- Estatísticas gerais persistentes
- Sons via WebAudio, confete, design responsivo

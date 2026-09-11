# 🚀 Guia de publicação — GitHub + Vercel

## PARTE 1 — Subir para o GitHub

### 1.1 Criar o repositório
1. Acesse https://github.com/new e crie um repositório chamado `quiz-brasil`
2. Deixe **Public** e **NÃO** marque "Add a README" (para não dar conflito)

### 1.2 Enviar os arquivos (terminal, dentro da pasta `quiz-brasil`)

Primeira vez usando o git? Configure seu usuário:
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

Agora suba o projeto:
```bash
cd quiz-brasil
git init
git add .
git commit -m "Quiz Brasil PWA - bandeiras, capitais e estados"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/quiz-brasil.git
git push -u origin main
```

> 💡 Se pedir senha: o GitHub não aceita mais senha da conta. Use um
> **Personal Access Token** (github.com → Settings → Developer settings →
> Personal access tokens → gerar com escopo `repo`) como senha, ou instale o
> **GitHub CLI** (`gh auth login`) que faz o login com o navegador.

✅ Pronto: seu código está em `https://github.com/SEU-USUARIO/quiz-brasil`

---

## PARTE 2 — Publicar na Vercel (grátis, com HTTPS)

1. Acesse https://vercel.com e clique em **Sign Up** → **Continue with GitHub**
2. No dashboard, clique em **Add New... → Project**
3. Clique em **Import** ao lado do repositório `quiz-brasil`
4. Não mude nada — o projeto é estático:
   - Framework Preset: **Other**
   - Build Command: *(vazio)*
   - Output Directory: *(vazio / raiz)*
5. Clique em **Deploy**

✅ Em ~30 segundos seu app estará no ar em algo como:
**`https://quiz-brasil.vercel.app`**

### Bônus: deploy automático
Daí em diante, **todo `git push` na branch `main`** recria o deploy
automaticamente. Faça uma alteração, dê push e a Vercel atualiza sozinha.

---

## PARTE 3 — Instalar no celular

1. Abra a URL da Vercel no Chrome (Android) ou Safari (iPhone)
2. Toque em **Instalar** no botão do app ou no menu do navegador
   ("Adicionar à tela inicial")
3. O app abre em tela cheia e **funciona offline** graças ao Service Worker

---

## Alternativa sem Vercel: GitHub Pages
Se preferir só o GitHub: **Settings → Pages → Source: branch `main`, folder `/root` → Save**.
O app fica em `https://SEU-USUARIO.github.io/quiz-brasil/`.

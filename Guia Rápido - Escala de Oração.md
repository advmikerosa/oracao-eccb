# Guia Rápido - Escala de Oração

## 🚀 Comece em 5 Minutos

### 1. Abrir Localmente
```bash
# Opção A: Clique duplo em index.html
# Opção B: Use um servidor local
npx http-server
# Acesse http://localhost:8080
```

### 2. Testar o Site
1. Digite seu nome no campo "Seu nome ou apelido"
2. Clique em "Confirmar Oração"
3. Veja seu nome aparecer na lista "Quem Orou Hoje?"
4. Verifique os contadores atualizarem
5. Clique em um dia do calendário para ver participantes

### 3. Deploy (Escolha Uma)

#### Vercel (Recomendado)
```bash
# 1. Crie repositório no GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# 2. Acesse https://vercel.com
# 3. Clique "New Project"
# 4. Selecione seu repositório
# 5. Deploy automático!
```

#### Netlify
```bash
# 1. Crie repositório no GitHub (mesmo que acima)
# 2. Acesse https://netlify.com
# 3. Clique "New site from Git"
# 4. Selecione seu repositório
# 5. Deploy automático!
```

#### GitHub Pages
```bash
# 1. Crie repositório seu-usuario.github.io
# 2. Faça push dos arquivos
# 3. Ative GitHub Pages em Settings
# 4. Site ao vivo em seu-usuario.github.io
```

---

## 📁 Arquivos Principais

| Arquivo | Tamanho | Propósito |
|---------|---------|----------|
| index.html | 5 KB | Estrutura HTML |
| styles.css | 15 KB | Design e layout |
| app.js | 13 KB | Lógica e interatividade |

**Total: ~33 KB** (sem dependências!)

---

## 🎨 Personalizar

### Mudar Cores
Edite `styles.css`:
```css
:root {
    --primary-dark: #1e3a5f;  /* Azul escuro */
    --accent-gold: #d4a574;   /* Dourado */
    --cream: #f5f1e8;         /* Creme */
}
```

### Mudar Textos
Edite `index.html`:
```html
<h1 class="title">Seu Título Aqui</h1>
<p class="subtitle">Seu Subtítulo</p>
```

---

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| Site não carrega | Verifique se todos os arquivos estão no mesmo diretório |
| Dados não salvam | Ative LocalStorage no navegador (não está em modo privado?) |
| Estilo quebrado | Limpe cache (Ctrl+Shift+Delete) |
| Calendário vazio | Registre uma oração primeiro |

---

## 📚 Documentação Completa

- **README.md** - Documentação completa
- **DEPLOYMENT.md** - Guia detalhado de deploy
- **PROJECT_SUMMARY.md** - Resumo técnico do projeto

---

## ✅ Checklist de Deploy

- [ ] Todos os arquivos estão no diretório
- [ ] Testou localmente (funciona?)
- [ ] Criou repositório no GitHub
- [ ] Fez push dos arquivos
- [ ] Escolheu plataforma (Vercel/Netlify/GitHub Pages)
- [ ] Seguiu instruções de deploy
- [ ] Site está ao vivo!
- [ ] Compartilhou com a comunidade

---

## 🎯 Próximos Passos

1. **Agora**: Teste localmente
2. **Depois**: Faça deploy
3. **Finalmente**: Compartilhe com a comunidade!

---

**Pronto? Comece agora! 🙏**

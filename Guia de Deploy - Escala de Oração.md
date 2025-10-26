# Guia de Deploy - Escala de Oração

Este documento fornece instruções detalhadas para fazer o deploy da aplicação "Escala de Oração - Escola Cristã Clássica" em plataformas de hospedagem gratuitas.

## Visão Geral

A aplicação é um site estático moderno construído com:
- **HTML5** para estrutura semântica
- **CSS3** com Flexbox e Grid para layout responsivo
- **JavaScript vanilla** para interatividade (sem dependências externas)
- **LocalStorage** para persistência de dados no navegador

Não há backend, banco de dados ou servidor necessário. Todos os dados são armazenados localmente no navegador do usuário.

---

## 1. Deploy no Vercel (Recomendado)

Vercel é a plataforma mais simples e rápida para deploy de sites estáticos.

### Pré-requisitos
- Conta GitHub (gratuita em https://github.com)
- Conta Vercel (gratuita em https://vercel.com)

### Passo a Passo

#### 1.1 Preparar o repositório GitHub

1. Crie um novo repositório no GitHub:
   - Acesse https://github.com/new
   - Nome: `escala-oracao`
   - Descrição: "Escala de Oração - Escola Cristã Clássica"
   - Escolha "Public" para visibilidade
   - Clique em "Create repository"

2. Clone o repositório localmente:
   ```bash
   git clone https://github.com/seu-usuario/escala-oracao.git
   cd escala-oracao
   ```

3. Adicione os arquivos do projeto:
   ```bash
   # Copie os arquivos (index.html, styles.css, app.js, package.json)
   # para o diretório clonado
   
   git add .
   git commit -m "Initial commit: Escala de Oração website"
   git push origin main
   ```

#### 1.2 Deploy no Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Selecione "Import Git Repository"
4. Conecte sua conta GitHub e selecione o repositório `escala-oracao`
5. Configure o projeto:
   - **Framework**: Selecione "Other" (site estático)
   - **Root Directory**: `/` (deixe em branco)
   - **Build Command**: Deixe em branco (não é necessário)
   - **Output Directory**: Deixe em branco
6. Clique em "Deploy"

Seu site estará disponível em: `https://escala-oracao.vercel.app`

### Atualizar o site no Vercel

Após fazer alterações locais:
```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

O Vercel fará o deploy automaticamente!

---

## 2. Deploy no Netlify

Netlify oferece uma alternativa excelente ao Vercel.

### Pré-requisitos
- Conta GitHub (gratuita em https://github.com)
- Conta Netlify (gratuita em https://netlify.com)

### Passo a Passo

#### 2.1 Preparar o repositório GitHub

Siga os mesmos passos da seção 1.1 acima.

#### 2.2 Deploy no Netlify

1. Acesse https://app.netlify.com
2. Clique em "New site from Git"
3. Selecione "GitHub" como provedor Git
4. Autorize Netlify a acessar sua conta GitHub
5. Selecione o repositório `escala-oracao`
6. Configure o build:
   - **Branch to deploy**: `main`
   - **Build command**: Deixe em branco
   - **Publish directory**: `.` (ponto, raiz do repositório)
7. Clique em "Deploy site"

Seu site estará disponível em: `https://escala-oracao.netlify.app`

### Atualizar o site no Netlify

Assim como no Vercel, faça push para o GitHub e o Netlify fará o deploy automaticamente:
```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

---

## 3. Deploy no GitHub Pages

GitHub Pages oferece hospedagem gratuita diretamente do GitHub.

### Pré-requisitos
- Conta GitHub (gratuita em https://github.com)

### Passo a Passo

#### 3.1 Preparar o repositório

1. Crie um novo repositório no GitHub com o nome: `seu-usuario.github.io`
   - Exemplo: `joao.github.io`
   - Este é um repositório especial do GitHub Pages

2. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-usuario.github.io.git
   cd seu-usuario.github.io
   ```

3. Adicione os arquivos do projeto:
   ```bash
   # Copie index.html, styles.css, app.js, package.json
   
   git add .
   git commit -m "Initial commit: Escala de Oração website"
   git push origin main
   ```

#### 3.2 Ativar GitHub Pages

1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Pages**
3. Em "Source", selecione **"Deploy from a branch"**
4. Selecione **branch: main** e **folder: / (root)**
5. Clique em "Save"

Seu site estará disponível em: `https://seu-usuario.github.io`

### Alternativa: Usar um repositório com nome customizado

Se preferir usar um repositório com outro nome (ex: `escala-oracao`):

1. Crie o repositório normalmente
2. Vá para **Settings** > **Pages**
3. Em "Source", selecione **"Deploy from a branch"**
4. Selecione **branch: main** e **folder: / (root)**
5. Seu site estará em: `https://seu-usuario.github.io/escala-oracao`

---

## 4. Domínio Customizado (Opcional)

Todas as plataformas permitem conectar um domínio customizado.

### Para Vercel:
1. Vá para **Project Settings** > **Domains**
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `escala-oracao.com.br`)
4. Siga as instruções para atualizar os registros DNS do seu provedor

### Para Netlify:
1. Vá para **Site Settings** > **Domain Management**
2. Clique em "Add Custom Domain"
3. Digite seu domínio
4. Siga as instruções para atualizar os registros DNS

### Para GitHub Pages:
1. Vá para **Settings** > **Pages**
2. Em "Custom domain", digite seu domínio
3. Clique em "Save"
4. Siga as instruções para atualizar os registros DNS

---

## 5. Estrutura de Arquivos

```
escala-oracao/
├── index.html          # Arquivo principal HTML
├── styles.css          # Estilos CSS
├── app.js              # Lógica JavaScript
├── package.json        # Metadados do projeto
├── DEPLOYMENT.md       # Este arquivo
└── README.md           # Documentação do projeto
```

---

## 6. Funcionalidades Principais

- ✅ **Calendário interativo**: Navegue entre meses e veja dias com orações
- ✅ **Registro anônimo**: Sem login necessário
- ✅ **Contador de minutos**: Total diário e semanal
- ✅ **Lista de participantes**: Veja quem orou hoje
- ✅ **Responsivo**: Funciona em desktop, tablet e mobile
- ✅ **Rápido**: Sem dependências pesadas, carrega em milissegundos
- ✅ **Persistente**: Dados armazenados localmente no navegador

---

## 7. Dados e Privacidade

### Armazenamento de Dados
- Todos os dados são armazenados no **LocalStorage** do navegador
- Cada visitante tem seu próprio armazenamento local
- Os dados **não são enviados para nenhum servidor**
- Os dados **persistem entre visitas** no mesmo navegador

### Limpeza de Dados
Para limpar todos os dados (útil para testes):
```javascript
// Abra o console do navegador (F12) e execute:
localStorage.removeItem('escala_oracao_data');
location.reload();
```

### Sincronização Entre Dispositivos
**Nota importante**: Como os dados são locais, cada dispositivo/navegador terá sua própria cópia. Se você quiser sincronizar dados entre dispositivos, será necessário adicionar um backend (fora do escopo desta versão).

---

## 8. Personalizações Recomendadas

### Alterar Cores
Edite `styles.css` e modifique as variáveis CSS:
```css
:root {
    --primary-dark: #1e3a5f;      /* Azul escuro */
    --primary-light: #2d5a8c;     /* Azul claro */
    --accent-gold: #d4a574;       /* Dourado */
    --cream: #f5f1e8;             /* Creme */
}
```

### Alterar Fontes
As fontes são carregadas do Google Fonts. Para mudar:
1. Visite https://fonts.google.com
2. Selecione as fontes desejadas
3. Copie o link `<link>` e substitua em `index.html`
4. Atualize os nomes das fontes em `styles.css`

### Adicionar Logo
Adicione uma imagem ao header em `index.html`:
```html
<header class="header">
    <div class="header-content">
        <img src="logo.png" alt="Logo" class="logo">
        <h1 class="title">Escala de Oração</h1>
        <p class="subtitle">Escola Cristã Clássica</p>
    </div>
</header>
```

---

## 9. Troubleshooting

### O site não carrega
- Verifique se todos os arquivos foram enviados (index.html, styles.css, app.js)
- Aguarde alguns minutos para o deploy completar
- Limpe o cache do navegador (Ctrl+Shift+Delete)

### Os dados não persistem
- Verifique se o LocalStorage está habilitado no navegador
- Alguns navegadores em modo privado não permitem LocalStorage
- Tente em outro navegador ou modo normal

### Estilo não aparece corretamente
- Verifique se `styles.css` está no mesmo diretório que `index.html`
- Limpe o cache do navegador
- Verifique o console do navegador (F12) para erros

### Formulário não funciona
- Verifique se `app.js` está no mesmo diretório
- Abra o console (F12) e procure por erros
- Verifique se JavaScript está habilitado no navegador

---

## 10. Próximos Passos

### Melhorias Futuras
- Adicionar backend para sincronizar dados entre dispositivos
- Implementar autenticação para acesso administrativo
- Adicionar notificações por email
- Criar dashboard de estatísticas
- Adicionar suporte a múltiplos idiomas

### Suporte e Contribuições
Para reportar bugs ou sugerir melhorias, abra uma issue no repositório GitHub.

---

## 11. Licença

Este projeto é licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.

---

**Última atualização**: Outubro de 2025

Para dúvidas ou suporte, entre em contato com a equipe da Escola Cristã Clássica.


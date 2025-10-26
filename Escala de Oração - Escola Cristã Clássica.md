# Escala de Oração - Escola Cristã Clássica

Um site moderno, fluido e rápido para organizar uma escala diária de oração aberta, anônima e espontânea pelo projeto da Escola Cristã Clássica.

## 🙏 Visão Geral

**Escala de Oração** é uma plataforma web que convida a comunidade a se unir em oração pelo futuro da Escola Cristã Clássica. Qualquer pessoa pode participar de forma anônima, dedicando 5 minutos de oração e registrando seu nome ou apelido.

### Propósito Espiritual

Este projeto transmite **paz, união espiritual e encorajamento cristão**, estimulando o envolvimento espontâneo da comunidade através da intercessão coletiva.

---

## ✨ Características Principais

### 🎨 Design Moderno e Acolhedor
- Visual minimalista com cores clássicas (azul, creme, dourado discreto)
- Tipografia elegante (Playfair Display e Inter)
- Animações suaves (fade-in, hover)
- Totalmente responsivo (PC, tablet, mobile)

### 📅 Calendário Interativo
- Navegação entre meses
- Visualização de dias com orações registradas
- Clique em qualquer dia para ver quem orou
- Indicação visual do dia atual

### 🙌 Registro Anônimo
- Sem necessidade de login
- Apenas nome/apelido digitado aparece no calendário
- Participação aberta e espontânea
- Foco em privacidade e simplicidade

### 📊 Contadores e Estatísticas
- Total de minutos de oração **hoje**
- Total de minutos de oração **esta semana**
- Número de participantes **hoje**
- Atualização em tempo real

### ⚡ Performance
- HTML5 semântico
- CSS moderno (Flexbox, Grid)
- JavaScript vanilla (sem dependências)
- Carregamento instantâneo
- Dados armazenados localmente (LocalStorage)

---

## 🚀 Como Usar

### Localmente

1. **Clone ou baixe os arquivos**:
   ```bash
   git clone https://github.com/seu-usuario/escala-oracao.git
   cd escala-oracao
   ```

2. **Abra no navegador**:
   - Clique duplo em `index.html` ou
   - Use um servidor local:
     ```bash
     npx http-server
     ```
   - Acesse `http://localhost:8080`

### Online

O site está pronto para deploy em plataformas gratuitas:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções detalhadas.

---

## 📁 Estrutura de Arquivos

```
escala-oracao/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS (design responsivo)
├── app.js              # Lógica JavaScript (calendário, dados)
├── package.json        # Metadados do projeto
├── README.md           # Este arquivo
├── DEPLOYMENT.md       # Guia de deploy
└── LICENSE             # Licença MIT
```

### Descrição dos Arquivos

#### `index.html`
- Estrutura semântica HTML5
- Seções: cabeçalho, introdução, formulário, calendário, lista de participantes
- Meta tags para SEO e responsividade
- Importação de fontes do Google Fonts

#### `styles.css`
- Variáveis CSS para cores e tipografia
- Layout com Flexbox e Grid
- Animações suaves
- Media queries para responsividade
- Breakpoints: 768px (tablet), 480px (mobile)

#### `app.js`
- **DataManager**: Gerencia dados no LocalStorage
- **CalendarManager**: Renderiza e controla o calendário
- **UIManager**: Atualiza a interface e trata eventos
- Sem dependências externas

#### `package.json`
- Metadados do projeto
- Scripts para desenvolvimento
- Informações de repositório

---

## 🎯 Funcionalidades Detalhadas

### 1. Registrar Oração
1. Digite seu nome ou apelido no campo de entrada
2. Clique em "Confirmar Oração"
3. Receba feedback positivo: "Obrigado por se unir em oração!"
4. Seu nome aparecerá na lista de participantes do dia

### 2. Visualizar Calendário
- Navegue entre meses com os botões "Anterior" e "Próximo"
- Dias com orações registradas têm uma borda dourada
- O dia atual é destacado com fundo azul
- Clique em qualquer dia para ver quem orou naquele dia

### 3. Ver Estatísticas
- **Minutos Hoje**: Total de minutos de oração registrados hoje (5 min por pessoa)
- **Minutos Esta Semana**: Total acumulado da semana
- **Participantes Hoje**: Número de pessoas que oraram hoje

### 4. Lista de Participantes
- Mostra quem orou **hoje** por padrão
- Clique em um dia do calendário para ver participantes daquele dia
- Nomes aparecem em ordem de registro

---

## 🔒 Privacidade e Dados

### Armazenamento
- Todos os dados são armazenados no **LocalStorage** do navegador
- **Nenhum dado é enviado para servidores**
- Cada visitante tem seu próprio armazenamento isolado
- Dados persistem entre visitas

### Segurança
- Nomes são escapados para prevenir XSS
- Sem autenticação necessária (por design)
- Sem cookies de rastreamento
- Compatível com GDPR (dados locais, sem coleta centralizada)

### Limpeza de Dados
Para limpar todos os dados (útil para testes):
```javascript
// Abra o console do navegador (F12) e execute:
localStorage.removeItem('escala_oracao_data');
location.reload();
```

---

## 🎨 Personalização

### Alterar Cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
    --primary-dark: #1e3a5f;      /* Azul escuro */
    --primary-light: #2d5a8c;     /* Azul claro */
    --accent-gold: #d4a574;       /* Dourado */
    --cream: #f5f1e8;             /* Creme */
    --text-dark: #2c3e50;         /* Texto escuro */
}
```

### Alterar Textos
Edite o conteúdo em `index.html`:
- Título: `<h1 class="title">`
- Subtítulo: `<p class="subtitle">`
- Introdução: `<section class="intro-section">`
- Rótulos: Busque por `textContent` em `app.js`

### Adicionar Logo
```html
<header class="header">
    <div class="header-content">
        <img src="logo.png" alt="Logo" style="height: 60px; margin-bottom: 20px;">
        <h1 class="title">Escala de Oração</h1>
        <p class="subtitle">Escola Cristã Clássica</p>
    </div>
</header>
```

---

## 📱 Responsividade

O site é totalmente responsivo com breakpoints em:
- **Desktop**: 1000px (máximo)
- **Tablet**: até 768px
- **Mobile**: até 480px

Todos os elementos se adaptam automaticamente:
- Fontes reduzem em tamanho
- Grid se torna single-column
- Espaçamento se ajusta
- Toque amigável em mobile

---

## ⚙️ Desenvolvimento

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Sem dependências externas

### Servidor Local
```bash
# Usando http-server (Node.js)
npx http-server

# Ou usando Python 3
python3 -m http.server 8000

# Ou usando Python 2
python -m SimpleHTTPServer 8000
```

### Debugging
Abra o console do navegador (F12) para:
- Ver logs de erro
- Inspecionar elementos
- Testar JavaScript
- Verificar dados do LocalStorage

---

## 🚀 Deploy

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções completas de deploy em:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**
- **Domínio customizado**

---

## 📊 Estrutura de Dados

Os dados são armazenados no LocalStorage com a seguinte estrutura:

```javascript
{
  "2025-10-26": [
    {
      "name": "João Silva",
      "timestamp": "2025-10-26T14:30:00.000Z"
    },
    {
      "name": "Maria Santos",
      "timestamp": "2025-10-26T15:45:00.000Z"
    }
  ],
  "2025-10-25": [
    {
      "name": "Pedro Costa",
      "timestamp": "2025-10-25T09:15:00.000Z"
    }
  ]
}
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para melhorias:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é licenciado sob a **MIT License**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para a comunidade da Escola Cristã Clássica.

> *"Portanto, confessem uns aos outros os seus pecados e orem uns pelos outros, para que sejam curados. A oração feita por um justo é poderosa e eficaz."* — Tiago 5:16

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar bugs:
- Abra uma issue no GitHub
- Entre em contato com a equipe da Escola Cristã Clássica

---

**Última atualização**: Outubro de 2025

Desenvolvido com fé, comunhão e dedicação à Escola Cristã Clássica.


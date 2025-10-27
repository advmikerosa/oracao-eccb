# Calendário de Orações - Documentação

## Visão Geral

O Calendário de Orações é uma nova funcionalidade adicionada ao sistema de Escala de Oração da Escola Cristã Clássica. Ele permite que os usuários:

- 📅 **Visualizem** orações registradas em um calendário mensal
- 📊 **Consultem** estatísticas de orações por dia (quantidade e tempo total)
- ⏰ **Agendem** próximas orações selecionando data e horário
- 📱 **Acessem** de forma responsíva em dispositivos móveis e desktop

## Funcionalidades Principais

### 1. Visualização do Calendário

- **Navegação mensal**: Use os botões "← Anterior" e "Próximo →" para navegar entre os meses
- **Indicadores visuais**:
  - 🟢 **Ponto verde**: Indica que há orações registradas naquele dia
  - 🔵 **Ponto azul**: Indica que há orações agendadas para aquele dia
  - 🟡 **Destaque amarelo**: Marca o dia atual

### 2. Detalhes do Dia

Ao clicar em qualquer dia no calendário:

- Exibe a **data completa** selecionada
- Mostra o **número de orações** registradas naquele dia
- Calcula o **tempo total** de oração (em minutos ou horas)
- Lista as **orações agendadas** para aquele dia, ordenadas por horário

### 3. Agendar Orações

Para agendar uma nova oração:

1. **Selecione um dia** clicando nele no calendário
2. **Preencha o formulário** "Agendar Oração":
   - **Horário**: Escolha o horário da oração
   - **Nome**: Digite seu nome ou apelido
3. Clique em **"Agendar Oração"**

### 4. Gerenciar Agendamentos

- Cada oração agendada é listada com **horário** e **nome**
- Clique no **×** para remover um agendamento (será solicitada confirmação)

## Configuração do Banco de Dados

### Pré-requisito

Você precisa ter acesso ao painel do **Supabase** do projeto.

### Passos para Configuração

1. **Acesse o Supabase**:
   - Vá para [https://supabase.com](https://supabase.com)
   - Faça login no projeto `illgbfpmtcxiszihuyfh`

2. **Execute o Script SQL**:
   - Abra o **SQL Editor** no painel do Supabase
   - Copie o conteúdo completo do arquivo `database_setup.sql`
   - Cole e execute o script no editor SQL

3. **Verifique a Criação**:
   - Vá para a seção **Table Editor**
   - Confirme que a tabela `oracoes_agendadas` foi criada com as seguintes colunas:
     - `id` (BIGSERIAL, PRIMARY KEY)
     - `data` (DATE, NOT NULL)
     - `horario` (TIME, NOT NULL)
     - `nome` (VARCHAR(50), NOT NULL)
     - `created_at` (TIMESTAMP WITH TIME ZONE)

4. **Verifique as Permissões**:
   - As políticas de Row Level Security (RLS) devem estar habilitadas
   - Três políticas devem estar configuradas:
     - "Permitir leitura pública" (SELECT)
     - "Permitir inserção pública" (INSERT)
     - "Permitir deleção pública" (DELETE)

## Estrutura de Arquivos Modificados

### 1. `index.html`

**Adições**:
- Nova seção `<section id="calendarioSection">` após a lista de oradores
- Cabeçalho e navegação do calendário (mês anterior/próximo)
- Grid do calendário com 7 colunas (dias da semana)
- Seção de detalhes do dia selecionado
- Formulário para agendar orações
- Lista de orações agendadas

### 2. `app.js`

**Novas Funções**:
- `renderCalendar()`: Renderiza o calendário do mês atual
- `selectDate(date)`: Mostra detalhes de um dia selecionado
- `loadScheduledPrayers(dateStr)`: Carrega orações agendadas para uma data
- `scheduleNewPrayer(event)`: Agenda uma nova oração
- `deleteScheduled(id)`: Remove uma oração agendada

**Variáveis de Estado**:
- `currentMonth`: Data do mês sendo visualizado
- `selectedDate`: Data atualmente selecionada no calendário

**Event Listeners**:
- Botões de navegação do calendário (anterior/próximo)
- Formulário de agendamento de orações

### 3. `database_setup.sql` (Novo)

Script SQL completo para:
- Criar a tabela `oracoes_agendadas`
- Adicionar índices para melhor performance
- Configurar Row Level Security (RLS)
- Definir políticas de acesso público

## Design Responsívo

O calendário foi desenvolvido usando **Tailwind CSS** e é totalmente responsívo:

### Mobile (📱)
- Grid do calendário se ajusta automaticamente
- Botões e formulários são otimizados para toque
- Textos e espaçamentos adaptáveis

### Desktop (🖥️)
- Layout amplo com melhor visualização
- Efeitos hover nos botões e dias do calendário
- Melhor organização de informações

## Paleta de Cores

O calendário segue o design existente do site:

- **🟫 Amber/Dourado**: Elementos principais e botões
- **🟫 Teal/Verde-azulado**: Detalhes do dia e agendamentos
- **⚪ Branco/Fundo claro**: Conteúdo e cards
- **🟢 Verde**: Indicador de orações registradas
- **🔵 Azul**: Indicador de orações agendadas

## Integração com Supabase

### Tabelas Utilizadas

1. **`escala_oracao`** (Existente):
   - Armazena orações já registradas
   - Consultada para exibir estatísticas no calendário

2. **`oracoes_agendadas`** (Nova):
   - Armazena orações futuras agendadas
   - Permite consulta, inserção e deleção

### Operações Realizadas

- **SELECT**: Busca orações por período (dia, mês)
- **INSERT**: Adiciona novos agendamentos
- **DELETE**: Remove agendamentos (com confirmação)

## Testes Recomendados

1. ✅ **Testar navegação** entre meses (anterior/próximo)
2. ✅ **Selecionar diferentes dias** e verificar detalhes
3. ✅ **Agendar orações** para diferentes dias e horários
4. ✅ **Remover agendamentos** e verificar atualização
5. ✅ **Testar em mobile** (responsividade e usabilidade)
6. ✅ **Verificar indicadores visuais** (pontos verde/azul)
7. ✅ **Registrar uma oração** e ver o calendário atualizar

## Próximos Passos Sugeridos

- 🔔 **Notificações**: Adicionar alertas para orações próximas
- 📊 **Relatórios**: Criar estatísticas mensais e anuais
- 👥 **Compartilhamento**: Permitir compartilhar dias de oração
- 📋 **Exportação**: Exportar calendário para .ics ou PDF
- ⚙️ **Configurações**: Permitir ajustar tempo padrão de oração

## Suporte

Para dúvidas ou problemas:

1. Verifique se o script SQL foi executado corretamente no Supabase
2. Confirme que as credenciais do Supabase em `app.js` estão corretas
3. Verifique o console do navegador para erros JavaScript
4. Teste a conexão com o Supabase usando as ferramentas de desenvolvedor

---

🙏 **Que este calendário ajude a fortalecer a vida de oração da Escola Cristã Clássica!**

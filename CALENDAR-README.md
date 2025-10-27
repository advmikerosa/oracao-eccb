# Calendário de Orações - Documentação

## Visão Geral
O Calendário de Orações é uma funcionalidade do sistema de Escala de Oração da Escola Cristã Clássica. Ele permite:
- Visualizar orações registradas num calendário mensal
- Consultar estatísticas por dia e por dia da semana
- Agendar orações futuras por data/horário
- Operação responsiva em mobile e desktop

## Novidades desta versão
- Barra de seleção dos dias da semana (Dom a Sáb) acima do calendário
- Painel de resumo do dia da semana selecionado: total de orações e tempo total, listando cada ocorrência no mês (ex.: todos os domingos)
- Botão “Ir para Hoje” acima da barra
- Integração com Supabase para obter contagens reais

## Como funciona
1) Ir para Hoje
- Botão com id "goToToday". Ao clicar, o calendário navega para o mês corrente e o dia atual é selecionado, exibindo o detalhe do dia.

2) Barra de dias da semana
- Botões com classe "weekday-btn" e atributo data-weekday (0=Dom ... 6=Sáb).
- Ao clicar em um botão, a função renderWeekdaySummary(weekday) é chamada.
- O botão ativo recebe a classe .active (estilo em index.html) para feedback visual.

3) Cálculo do resumo por dia da semana
- O app consulta a tabela escala_oracao com data entre o primeiro e o último dia do mês visível.
- Filtra os registros pelo weekday selecionado (getDay()).
- Soma total de registros (cada registro = 5 min) e converte para horas/minutos quando >= 60 min.
- Lista cada ocorrência do weekday no mês, com a contagem/tempo daquele dia.

4) Detalhe de um dia específico
- Ao clicar em um dia no grid do calendário, selectDate(date) busca as orações em escala_oracao para a data e exibe:
  - Quantidade (Orações)
  - Tempo total (minutos ou horas:minutos)
  - Lista de orações agendadas (tabela oracoes_agendadas), ordenada por horário

## Estrutura de arquivos alterados
- index.html
  - Adicionados elementos: botão #goToToday, barra de botões .weekday-btn (Dom-Sáb) e painel #weekdayDetails com títulos/estatísticas/lista
  - Pequenos estilos utilitários e classe .weekday-btn.active
- app.js
  - Novas funções: renderWeekdaySummary(weekday), goToToday(), wireEvents()
  - Atualizações: manter weekdaySelected, atualizar painel ao mudar o mês ou registrar nova oração

## Integração Supabase
- Usa @supabase/supabase-js via CDN ESM
- Tabelas esperadas:
  - escala_oracao(data date, hora time, nome text, responsavel text, observacoes text, ...)
  - oracoes_agendadas(id serial, data date, horario time, nome text, ...)
- Permissões: as políticas devem permitir leitura pública (select) e inserção conforme a necessidade do projeto

## Acessibilidade e responsividade
- Todos os botões possuem rótulos visuais claros
- Layout com Tailwind e grids responsivos; funciona bem em telas pequenas
- Active state para indicar dia da semana selecionado

## Eventos principais
- #prevMonth / #nextMonth: navegação mensal e atualização do resumo do weekday, se ativo
- #goToToday: vai para o mês/dia atual e abre o detalhe
- .weekday-btn: chama renderWeekdaySummary para o dia da semana selecionado
- #formOracao: registra rapidamente 5 min no dia atual
- #scheduleForm: agenda oração no dia selecionado

## Observações
- Cada registro de escala_oracao representa 5 minutos
- O total em horas é exibido como "Xh Ymin" quando aplicável
- Ajuste textos/labels conforme necessidade da escola

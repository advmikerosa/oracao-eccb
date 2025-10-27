import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);

// Registrar oração
async function registrarOracao(event) {
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (!name) return alert('Por favor, digite seu nome ou apelido.');
  const now = new Date();
  const hojeStr = now.toISOString().slice(0, 10);
  const horaStr = now.toTimeString().slice(0, 8);
  const { error } = await supabase
    .from('escala_oracao')
    .insert([{
      nome: name,
      data: hojeStr,
      hora: horaStr,
      responsavel: name,
      observacoes: ''
    }]);
  if (error) {
    alert('Erro ao registrar oração! Tente novamente.');
    return;
  }
  nameInput.value = '';
  await atualizarOracoes();
}

async function atualizarOracoes() {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());

  const { data: oracoesHoje = [] } = await supabase
    .from('escala_oracao')
    .select('*')
    .eq('data', hoje.toISOString().slice(0, 10));

  const { data: oracoesSemana = [] } = await supabase
    .from('escala_oracao')
    .select('*')
    .gte('data', inicioSemana.toISOString().slice(0, 10));

  document.getElementById('minutosHoje').textContent = oracoesHoje.length * 5;
  document.getElementById('participantesHoje').textContent = oracoesHoje.length;
  document.getElementById('weeklyMinutes').textContent = oracoesSemana.length * 5;

  const listaEl = document.getElementById('listaOradores');
  if (oracoesHoje.length === 0) {
    listaEl.innerHTML = `<p class="italic text-amber-400 text-base empty-state">Nenhuma oração registrada ainda. Seja o primeiro!</p>`;
  } else {
    listaEl.innerHTML = oracoesHoje.map((item, idx) =>
      `<div class="w-full bg-white rounded-lg border border-amber-200 text-teal-900 text-base px-3 py-2 shadow-lg animate-fadeIn" style="animation-delay:${idx*0.07+0.2}s">${item.nome}</div>`
    ).join('');
  }
}

document.getElementById('formOracao').addEventListener('submit', registrarOracao);
document.addEventListener('DOMContentLoaded', atualizarOracoes);

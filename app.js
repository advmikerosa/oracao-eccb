import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase client
const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);

// State
let currentMonth = new Date();
let selectedDate = null;
let weekdaySelected = null; // 0-6 Sunday-Saturday
const WEEKDAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Helpers
function toDateStr(d) { return d.toISOString().slice(0,10); }
function minutesToHuman(min) { return min >= 60 ? `${Math.floor(min/60)}h ${min%60}min` : `${min} min`; }

// Buscar orações (global)
let allPrayers = [];

async function atualizarOracoes() {
  const { data, error } = await supabase.from('escala_oracao').select('*').order('data', { ascending: false }).order('hora', { ascending: false });
  if (error) { console.error(error); return; }
  allPrayers = data || [];
}

// Função para criar cartão visual
function createPrayerCard(nome, horario) {
  const card = document.createElement('div');
  card.className = 'flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-sm bg-white/70 border border-amber-200 hover:shadow-md hover:bg-white/80 transition';
  
  const left = document.createElement('div');
  left.className = 'text-teal-900 font-medium truncate';
  left.textContent = nome;
  
  const right = document.createElement('div');
  right.className = 'text-amber-800 font-semibold tabular-nums';
  right.textContent = horario;
  
  card.appendChild(left);
  card.appendChild(right);
  
  return card;
}

// Painel diário atualizado - agora popula diretamente o cardsList
function atualizarPainelDiario() {
  try {
    const todayStr = toDateStr(new Date());
    const hoje = allPrayers.filter(p => p.data === todayStr);
    
    // Elementos do painel
    const cardsListEl = document.getElementById('cardsList');
    const emptyStateEl = document.getElementById('emptyState');
    
    // Garante que os elementos existem
    if (!cardsListEl || !emptyStateEl) {
      console.warn('Elementos cardsList ou emptyState não encontrados');
      return;
    }
    
    // Limpa cartões existentes
    cardsListEl.innerHTML = '';
    
    if (hoje.length === 0) {
      // Mostra estado vazio
      emptyStateEl.classList.remove('hidden');
    } else {
      // Esconde estado vazio
      emptyStateEl.classList.add('hidden');
      
      // Ordena por hora ascendente
      const ordenado = [...hoje].sort((a,b) => a.hora.localeCompare(b.hora));
      
      // Cria cartões para cada oração
      ordenado.forEach(p => {
        const card = createPrayerCard(p.nome, p.hora);
        cardsListEl.appendChild(card);
      });
    }
    
  } catch(e) {
    console.warn('Falha ao atualizar painel diário', e);
  }
}

// Registrar oração rápida (5 min)
async function registrarOracao(event) {
  event.preventDefault();
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  
  if (!name) {
    alert('Por favor, digite seu nome ou apelido.');
    return;
  }
  
  const now = new Date();
  const { error } = await supabase
    .from('escala_oracao')
    .insert([{ 
      nome: name, 
      data: toDateStr(now), 
      hora: now.toTimeString().slice(0,8), 
      responsavel: name, 
      observacoes: '' 
    }]);
    
  if (error) { 
    alert('Erro ao registrar oração! Tente novamente.'); 
    return; 
  }
  
  nameInput.value = '';
  await atualizarOracoes();
  atualizarPainelDiario();
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  // Wire events
  const formOracao = document.getElementById('formOracao');
  if (formOracao) {
    formOracao.addEventListener('submit', registrarOracao);
  }
  
  // Carrega dados iniciais
  await atualizarOracoes();
  atualizarPainelDiario();
});

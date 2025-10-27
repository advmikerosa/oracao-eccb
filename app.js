// ============================================
// ESCALA DE ORAÇÃO - APPLICATION LOGIC
// ============================================

// Import Supabase client
import supabase from './supabaseClient.js';

// Data Management
async function registrarOracao() {
  const nome = document.getElementById("nameInput").value;
  const responsavel = "Web Anônimo";
  const hoje = new Date();

  const { error } = await supabase.from("escala_oracao").insert([{
    nome,
    data: hoje.toISOString().substring(0, 10),
    hora: hoje.toTimeString().substring(0, 8),
    responsavel,
    observacoes: ""
  }]);

  if (error) {
    alert("Erro ao registrar: " + error.message);
  } else {
    alert("Oração registrada com sucesso!");
    await atualizarOracoes();
  }
}

// DataManager via Supabase
const DataManager = {
  // Adiciona uma oração no banco
  async addPrayer(date, name) {
    const { data, error } = await supabase
      .from('escala_oracao')
      .insert([{
        nome: name.trim(),
        data: date.toISOString().slice(0,10),
        hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        responsavel: name.trim(),
        observacoes: ''
      }]);
    return { data, error };
  },

  // Busca orações de um dia
  async getPrayersForDate(date) {
    const dateStr = date.toISOString().slice(0,10);
    let { data, error } = await supabase
      .from('escala_oracao')
      .select('*')
      .eq('data', dateStr);

    // Adapta para ["name"]
    if (!error && data) {
      return data.map(item => item.nome);
    }
    return [];
  },

  // Remove uma oração
  async removePrayer(date, name) {
    const dateStr = date.toISOString().slice(0,10);
    const { error } = await supabase
      .from('escala_oracao')
      .delete()
      .eq('data', dateStr)
      .eq('nome', name);
    return { error };
  }
};

// Calendar Management
class CalendarManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.selectedDate = null;
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let html = `
      <div class="calendar-header">
        <button id="prevMonth">◄</button>
        <h2>${this.getMonthName(month)} ${year}</h2>
        <button id="nextMonth">►</button>
      </div>
      <div class="calendar-weekdays">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div>
        <div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>
      <div class="calendar-days">
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = this.isToday(date);
      const isSelected = this.selectedDate && this.isSameDay(date, this.selectedDate);
      const classes = ['calendar-day'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');

      html += `<div class="${classes.join(' ')}" data-date="${date.toISOString()}">${day}</div>`;
    }

    html += '</div></div>';
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    document.getElementById('prevMonth')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    const dayElements = this.container.querySelectorAll('.calendar-day:not(.empty)');
    dayElements.forEach(el => {
      el.addEventListener('click', () => {
        this.selectedDate = new Date(el.dataset.date);
        this.render();
        this.onDateSelect(this.selectedDate);
      });
    });
  }

  onDateSelect(date) {
    // Override this method
    console.log('Date selected:', date);
  }

  getMonthName(month) {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month];
  }

  isToday(date) {
    const today = new Date();
    return this.isSameDay(date, today);
  }

  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}

// Prayer List Manager
class PrayerListManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDate = null;
    this.prayers = [];
  }

  async loadPrayers(date) {
    this.currentDate = date;
    this.prayers = await DataManager.getPrayersForDate(date);
    this.render();
  }

  render() {
    if (!this.currentDate) {
      this.container.innerHTML = '<p>Selecione uma data no calendário</p>';
      return;
    }

    const dateStr = this.currentDate.toLocaleDateString('pt-BR');
    let html = `<h3>Orações para ${dateStr}</h3>`;

    if (this.prayers.length === 0) {
      html += '<p>Nenhuma oração registrada para esta data.</p>';
    } else {
      html += '<ul class="prayer-list">';
      this.prayers.forEach(name => {
        html += `
          <li>
            <span>${name}</span>
            <button class="remove-prayer" data-name="${name}">Remover</button>
          </li>
        `;
      });
      html += '</ul>';
    }

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
    const removeButtons = this.container.querySelectorAll('.remove-prayer');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const name = btn.dataset.name;
        await this.removePrayer(name);
      });
    });
  }

  async removePrayer(name) {
    const { error } = await DataManager.removePrayer(this.currentDate, name);
    if (error) {
      alert('Erro ao remover oração: ' + error.message);
    } else {
      await this.loadPrayers(this.currentDate);
    }
  }

  async addPrayer(name) {
    if (!this.currentDate) {
      alert('Selecione uma data primeiro');
      return;
    }

    if (!name.trim()) {
      alert('Digite um nome válido');
      return;
    }

    const { error } = await DataManager.addPrayer(this.currentDate, name);
    if (error) {
      alert('Erro ao adicionar oração: ' + error.message);
    } else {
      await this.loadPrayers(this.currentDate);
    }
  }
}

// Initialize Application
let calendar, prayerList;

window.addEventListener('DOMContentLoaded', () => {
  // Initialize calendar
  calendar = new CalendarManager('calendar');
  calendar.onDateSelect = async (date) => {
    await prayerList.loadPrayers(date);
  };
  calendar.render();

  // Initialize prayer list
  prayerList = new PrayerListManager('prayerList');

  // Add prayer button
  document.getElementById('addPrayerBtn')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value;
    await prayerList.addPrayer(name);
    nameInput.value = '';
  });
});

// Função auxiliar para atualizar a lista de orações
async function atualizarOracoes() {
  if (prayerList && prayerList.currentDate) {
    await prayerList.loadPrayers(prayerList.currentDate);
  }
}

// Export for use in HTML
window.registrarOracao = registrarOracao;

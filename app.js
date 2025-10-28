// ===== Atualiza UI (homepage always shows today by default) =====
function atualizarUI(){
  // Ensure default state is today on first load
  if (!selectedDate) selectedDate = startOfDaySP(new Date());
  if (!currentWeekStart) currentWeekStart = startOfWeek(selectedDate);

  // Daily panel and summaries are always driven by the selected date (defaults to today)
  atualizarPainelDiario(selectedDate);
  atualizarCardsResumo(selectedDate);
  buildCalendar();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async ()=>{
  // Force initial state to today
  selectedDate = startOfDaySP(new Date());
  currentWeekStart = startOfWeek(selectedDate);

  await atualizarOracoes();
  subscribeRealtime();
  wireNavigation();
  atualizarUI();

  const form = document.getElementById('prayerForm');
  if (form) form.addEventListener('submit', registrarOracao);
});

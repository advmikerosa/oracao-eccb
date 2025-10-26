// ============================================
// ESCALA DE ORAÇÃO - APPLICATION LOGIC
// ============================================

// Data Management
const DataManager = {
    STORAGE_KEY: 'escala_oracao_data',
    
    // Initialize or retrieve data
    getData() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    },
    
    // Save data to localStorage
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    // Add a prayer entry for a specific date
    addPrayer(date, name) {
        const data = this.getData();
        const dateStr = this.formatDate(date);
        
        if (!data[dateStr]) {
            data[dateStr] = [];
        }
        
        data[dateStr].push({
            name: name.trim(),
            timestamp: new Date().toISOString()
        });
        
        this.saveData(data);
        return data;
    },
    
    // Get prayers for a specific date
    getPrayersForDate(date) {
        const data = this.getData();
        const dateStr = this.formatDate(date);
        return data[dateStr] || [];
    },
    
    // Format date as YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    },
    
    // Get all dates with prayers in a month
    getDatesWithPrayersInMonth(year, month) {
        const data = this.getData();
        const dates = [];
        
        for (const dateStr in data) {
            const [y, m, d] = dateStr.split('-');
            if (parseInt(y) === year && parseInt(m) === month + 1) {
                dates.push(parseInt(d));
            }
        }
        
        return dates;
    },
    
    // Get total minutes for today
    getTodayMinutes() {
        const today = new Date();
        const prayers = this.getPrayersForDate(today);
        return prayers.length * 5; // 5 minutes per prayer
    },
    
    // Get total minutes for this week
    getWeeklyMinutes() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        let total = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const prayers = this.getPrayersForDate(date);
            total += prayers.length * 5;
        }
        
        return total;
    }
};

// Calendar Manager
const CalendarManager = {
    currentDate: new Date(),
    
    // Render the calendar
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.updateMonthYear(year, month);
        this.renderCalendarDays(year, month);
    },
    
    // Update month/year display
    updateMonthYear(year, month) {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const monthYearEl = document.getElementById('monthYear');
        monthYearEl.textContent = `${monthNames[month]} ${year}`;
    },
    
    // Render calendar days
    renderCalendarDays(year, month) {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.style.cssText = 'font-weight: 600; color: var(--primary-dark); text-align: center; padding: 8px; font-size: 0.85rem;';
            header.textContent = day;
            calendar.appendChild(header);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Add previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayEl = this.createDayElement(day, true);
            calendar.appendChild(dayEl);
        }
        
        // Add current month's days
        const today = new Date();
        const datesWithPrayers = DataManager.getDatesWithPrayersInMonth(year, month);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = 
                day === today.getDate() && 
                month === today.getMonth() && 
                year === today.getFullYear();
            
            const hasPrayers = datesWithPrayers.includes(day);
            const dayEl = this.createDayElement(day, false, isToday, hasPrayers);
            
            // Add click handler
            dayEl.addEventListener('click', () => {
                const clickedDate = new Date(year, month, day);
                this.showDayPrayers(clickedDate);
            });
            
            calendar.appendChild(dayEl);
        }
        
        // Add next month's days
        const totalCells = firstDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = this.createDayElement(day, true);
            calendar.appendChild(dayEl);
        }
    },
    
    // Create a day element
    createDayElement(day, isOtherMonth = false, isToday = false, hasPrayers = false) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (isOtherMonth) dayEl.classList.add('other-month');
        if (isToday) dayEl.classList.add('today');
        if (hasPrayers) dayEl.classList.add('has-prayers');
        
        const numberEl = document.createElement('div');
        numberEl.className = 'calendar-day-number';
        numberEl.textContent = day;
        dayEl.appendChild(numberEl);
        
        if (!isOtherMonth && hasPrayers) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const prayers = DataManager.getPrayersForDate(date);
            const countEl = document.createElement('div');
            countEl.className = 'calendar-day-count';
            countEl.textContent = `${prayers.length}`;
            dayEl.appendChild(countEl);
        }
        
        return dayEl;
    },
    
    // Show prayers for a specific day
    showDayPrayers(date) {
        const prayers = DataManager.getPrayersForDate(date);
        const participantsList = document.getElementById('participantsList');
        
        // Update the section title to show the selected date
        const dateStr = date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const section = document.querySelector('.participants-section h3');
        section.textContent = `Quem Orou em ${dateStr}?`;
        
        if (prayers.length === 0) {
            participantsList.innerHTML = '<p class="empty-state">Nenhuma oração registrada neste dia.</p>';
        } else {
            participantsList.innerHTML = '';
            prayers.forEach(prayer => {
                const item = document.createElement('div');
                item.className = 'participant-item';
                item.innerHTML = `<span class="participant-name">${this.escapeHtml(prayer.name)}</span>`;
                participantsList.appendChild(item);
            });
        }
    },
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Navigate to previous month
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },
    
    // Navigate to next month
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }
};

// UI Manager
const UIManager = {
    // Initialize the UI
    init() {
        this.setupEventListeners();
        this.updateStats();
        this.updateTodayParticipants();
        CalendarManager.render();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Prayer form submission
        const form = document.getElementById('prayerForm');
        form.addEventListener('submit', (e) => this.handlePrayerSubmit(e));
        
        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            CalendarManager.prevMonth();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            CalendarManager.nextMonth();
        });
    },
    
    // Handle prayer form submission
    handlePrayerSubmit(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('nameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Por favor, digite seu nome ou apelido.');
            return;
        }
        
        // Add prayer to today's date
        const today = new Date();
        DataManager.addPrayer(today, name);
        
        // Clear input
        nameInput.value = '';
        
        // Show success message
        this.showSuccessMessage();
        
        // Update UI
        this.updateStats();
        this.updateTodayParticipants();
        CalendarManager.render();
    },
    
    // Show success message
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.remove('hidden');
        
        // Hide after 3 seconds
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    },
    
    // Update statistics
    updateStats() {
        const dailyMinutes = DataManager.getTodayMinutes();
        const weeklyMinutes = DataManager.getWeeklyMinutes();
        const dailyCount = DataManager.getPrayersForDate(new Date()).length;
        
        document.getElementById('dailyMinutes').textContent = dailyMinutes;
        document.getElementById('weeklyMinutes').textContent = weeklyMinutes;
        document.getElementById('dailyCount').textContent = dailyCount;
    },
    
    // Update today's participants list
    updateTodayParticipants() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const section = document.querySelector('.participants-section h3');
        section.textContent = `Quem Orou Hoje?`;
        
        const prayers = DataManager.getPrayersForDate(today);
        const participantsList = document.getElementById('participantsList');
        
        if (prayers.length === 0) {
            participantsList.innerHTML = '<p class="empty-state">Nenhuma oração registrada ainda. Seja o primeiro!</p>';
        } else {
            participantsList.innerHTML = '';
            prayers.forEach(prayer => {
                const item = document.createElement('div');
                item.className = 'participant-item';
                item.innerHTML = `<span class="participant-name">${this.escapeHtml(prayer.name)}</span>`;
                participantsList.appendChild(item);
            });
        }
    },
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});

// Optional: Refresh stats every minute to keep data fresh
setInterval(() => {
    UIManager.updateStats();
    UIManager.updateTodayParticipants();
}, 60000);


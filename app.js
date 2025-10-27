import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://illgbfpmtcxiszihuyfh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsbGdiZnBtdGN4aXN6aWh1eWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzM4MTUsImV4cCI6MjA3NzE0OTgxNX0.lKoU_mX_5q7dWEFi3wi7-eRC-rhmfe4tuIkJTbbSHhM'
);
// ========================================
// CONFIGURAÇÃO
// ========================================

// Elementos DOM
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const prayerForm = document.getElementById('prayerForm');
const submitBtn = document.getElementById('submitBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const oracaoTextarea = document.getElementById('oracao');
const charCount = document.getElementById('charCount');
const prayersGrid = document.getElementById('prayersGrid');

// ========================================
// MENU MOBILE
// ========================================
menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    
    const spans = menuToggle.querySelectorAll('span');
    if (mainNav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans.forEach(span => {
            span.style.transform = '';
            span.style.opacity = '';
        });
    }
});

// Fechar menu ao clicar em link
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('active');
    });
});

// ========================================
// CONTADOR DE CARACTERES
// ========================================
oracaoTextarea.addEventListener('input', (e) => {
    const length = e.target.value.length;
    const maxLength = 500;
    charCount.textContent = `${length}/${maxLength}`;
    
    if (length > maxLength) {
        e.target.value = e.target.value.substring(0, maxLength);
        charCount.textContent = `${maxLength}/${maxLength}`;
    }
    
    if (length > maxLength * 0.9) {
        charCount.style.color = 'var(--accent-color)';
    } else {
        charCount.style.color = 'var(--text-secondary)';
    }
});

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// VALIDAÇÃO
// ========================================
function validateForm(formData) {
    const errors = [];
    
    if (!formData.get('nome').trim()) {
        errors.push('Nome é obrigatório');
    }
    
    if (!formData.get('categoria')) {
        errors.push('Selecione uma categoria');
    }
    
    if (!formData.get('oracao').trim()) {
        errors.push('Pedido de oração é obrigatório');
    }
    
    return errors;
}

// ========================================
// ENVIO DO FORMULÁRIO
// ========================================
prayerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(prayerForm);
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showToast(errors[0], 'error');
        return;
    }
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        const prayerData = {
            nome: formData.get('anonimo') ? 'Anônimo' : formData.get('nome'),
            categoria: formData.get('categoria'),
            oracao: formData.get('oracao'),
            anonimo: formData.get('anonimo') === 'on',
            created_at: new Date().toISOString()
        };
        
        // Integração com Supabase aqui
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast('✅ Oração registrada com sucesso!', 'success');
        prayerForm.reset();
        charCount.textContent = '0/500';
        loadPrayers();
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('❌ Erro ao registrar oração', 'error');
    } finally {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// ========================================
// CARREGAR ORAÇÕES
// ========================================
async function loadPrayers() {
    try {
        const prayers = [
            {
                id: 1,
                categoria: 'Saúde',
                oracao: 'Peço orações pela recuperação da minha mãe...',
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
                oracoes_count: 12
            }
        ];
        
        renderPrayers(prayers);
    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}

function renderPrayers(prayers) {
    prayersGrid.innerHTML = prayers.map(prayer => `
        <div class="prayer-card">
            <div class="prayer-header">
                <span class="prayer-category">${prayer.categoria}</span>
                <span class="prayer-date">${getRelativeTime(prayer.created_at)}</span>
            </div>
            <p class="prayer-text">${truncateText(prayer.oracao, 120)}</p>
            <div class="prayer-footer">
                <button class="btn-icon pray-btn">
                    🙏 <span>Orar (${prayer.oracoes_count})</span>
                </button>
            </div>
        </div>
    `).join('');
}

function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours}h`;
    return 'Há alguns dias';
}

function truncateText(text, maxLength) {
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadPrayers();
    console.log('🚀 Aplicação iniciada');
});

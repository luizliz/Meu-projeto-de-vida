(function() {
  const goals = [
    {
      id: "carro",
      emoji: "🚗",
      title: "Comprar um carro",
      yearsToAdd: 1,
      reasonTime: "1 ano é o suficiente para planejar finanças, pesquisar modelos e juntar uma entrada sem aperto.",
      reasonWhy: "Liberdade de locomoção, conforto para viajar e realizar um sonho de independência."
    },
    {
      id: "faculdade",
      emoji: "🎓",
      title: "Formar na faculdade",
      yearsToAdd: 5,
      reasonTime: "5 anos é a duração típica de uma graduação de qualidade, com tempo para estágios e network.",
      reasonWhy: "Diploma que abre portas profissionais, crescimento pessoal e realização acadêmica."
    },
    {
      id: "casa",
      emoji: "🏡",
      title: "Ter uma casa própria",
      yearsToAdd: 7,
      reasonTime: "7 anos para um planejamento financeiro sólido, valorização de investimentos e escolha do imóvel ideal.",
      reasonWhy: "Estabilidade, segurança, patrimônio e um lar para construir memórias."
    },
    {
      id: "pai",
      emoji: "👶",
      title: "Ser pai",
      yearsToAdd: 9,
      reasonTime: "9 anos de amadurecimento, estabilidade emocional e financeira para receber uma criança com plenitude.",
      reasonWhy: "Realizar o sonho da paternidade, construir uma família e deixar legado."
    }
  ];

  const iconElements = {
    carro: document.getElementById('iconTopLeft'),
    faculdade: document.getElementById('iconTopRight'),
    casa: document.getElementById('iconBottomLeft'),
    pai: document.getElementById('iconBottomRight')
  };

  function getTargetDate(yearsToAdd) {
    const now = new Date();
    const target = new Date(now);
    target.setFullYear(now.getFullYear() + yearsToAdd);
    target.setHours(23, 59, 59, 999);
    return target;
  }

  function getDateDiff(targetDate) {
    const now = new Date();
    if (now >= targetDate) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    
    let years = targetDate.getFullYear() - now.getFullYear();
    let months = targetDate.getMonth() - now.getMonth();
    let days = targetDate.getDate() - now.getDate();
    let hours = targetDate.getHours() - now.getHours();
    let minutes = targetDate.getMinutes() - now.getMinutes();
    let seconds = targetDate.getSeconds() - now.getSeconds();
    
    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += lastMonth;
      months--;
    }
    if (months < 0) { months += 12; years--; }
    
    return { years, months, days, hours, minutes, seconds, expired: false };
  }

  function formatTwoDigits(n) { return n < 10 ? '0' + n : '' + n; }

  function setupProximityEffect() {
    document.addEventListener('mousemove', (e) => {
      for (const [goalId, icon] of Object.entries(iconElements)) {
        if (!icon) continue;
        const rect = icon.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const maxDist = 150;
        let intensity = 1 - Math.min(1, distance / maxDist);
        intensity = Math.max(0, Math.min(1, intensity));
        
        const newOpacity = 0.2 + intensity * 0.8;
        const newScale = 0.7 + intensity * 0.6;
        icon.style.opacity = newOpacity;
        icon.style.transform = `scale(${newScale})`;
        
        const label = icon.querySelector('.icon-label');
        if (label) {
          label.style.opacity = intensity > 0.3 ? 1 : 0;
          const goal = goals.find(g => g.id === goalId);
          if (intensity > 0.7) label.textContent = `✨ ${goal.title} ✨`;
          else if (intensity > 0.3) label.textContent = goal.title;
        }
      }
    });
  }

  const modal = document.getElementById('goalModal');
  const modalEmoji = document.getElementById('modalEmoji');
  const modalTitle = document.getElementById('modalTitle');
  const modalDeadline = document.getElementById('modalDeadline');
  const modalTimer = document.getElementById('modalTimer');
  const reasonTimeSpan = document.getElementById('reasonTime');
  const reasonWhySpan = document.getElementById('reasonWhy');
  const closeBtn = document.getElementById('closeModalBtn');
  
  let currentGoal = null;
  let timerInterval = null;
  
  function updateModalTimer() {
    if (!currentGoal) return;
    const targetDate = getTargetDate(currentGoal.yearsToAdd);
    const diff = getDateDiff(targetDate);
    
    if (diff.expired) {
      modalTimer.innerHTML = `<div class="finished-message">🏆 OBJETIVO ALCANÇADO! 🏆</div>`;
      return;
    }
    
    modalTimer.innerHTML = `
      <div class="timer-units">
        <div class="timer-block"><span class="timer-number">${diff.years}</span><span class="timer-label">anos</span></div>
        <div class="timer-block"><span class="timer-number">${diff.months}</span><span class="timer-label">meses</span></div>
        <div class="timer-block"><span class="timer-number">${diff.days}</span><span class="timer-label">dias</span></div>
        <div class="timer-block"><span class="timer-number">${formatTwoDigits(diff.hours)}</span><span class="timer-label">horas</span></div>
        <div class="timer-block"><span class="timer-number">${formatTwoDigits(diff.minutes)}</span><span class="timer-label">min</span></div>
        <div class="timer-block"><span class="timer-number">${formatTwoDigits(diff.seconds)}</span><span class="timer-label">seg</span></div>
      </div>
    `;
  }
  
  function openGoalModal(goal) {
    currentGoal = goal;
    const targetDate = getTargetDate(goal.yearsToAdd);
    
    modalEmoji.textContent = goal.emoji;
    modalTitle.textContent = goal.title;
    modalDeadline.textContent = `📅 Prazo final: ${targetDate.toLocaleDateString('pt-BR')} (${goal.yearsToAdd} ano${goal.yearsToAdd !== 1 ? 's' : ''})`;
    reasonTimeSpan.textContent = goal.reasonTime;
    reasonWhySpan.textContent = goal.reasonWhy;
    
    if (timerInterval) clearInterval(timerInterval);
    updateModalTimer();
    timerInterval = setInterval(updateModalTimer, 1000);
    
    modal.classList.add('active');
  }
  
  function closeModal() {
    modal.classList.remove('active');
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    currentGoal = null;
  }
  
  closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  for (const [goalId, icon] of Object.entries(iconElements)) {
    if (icon) {
      const goal = goals.find(g => g.id === goalId);
      icon.addEventListener('click', () => openGoalModal(goal));
    }
  }
  
  const canvas = document.getElementById('particleCanvas');
  let ctx = canvas.getContext('2d');
  let width = window.innerWidth, height = window.innerHeight;
  let particles = [];
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  function createParticles() {
    particles = [];
    const num = Math.min(80, Math.floor(width * height / 14000));
    for (let i = 0; i < num; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.1,
        color: `hsl(${Math.random() * 40 + 30}, 70%, 60%)`
      });
    }
  }
  
  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace('hsl', 'hsla').replace('60%', `60%, ${p.alpha})`);
      ctx.fill();
    });
  }
  
  function animateParticles() {
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;
      if (p.y < -30) p.y = height + 30;
      if (p.y > height + 30) p.y = -30;
    });
    drawParticles();
    requestAnimationFrame(animateParticles);
  }
  
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
  resizeCanvas();
  createParticles();
  animateParticles();
  
  setupProximityEffect();
})();
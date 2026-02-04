document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // KONFIGURASI TOMBOL NO (BISA DIUBAH)
    // ============================================
    const ESCAPE_SETTINGS = {
        detectionRadius: 250,    // Jarak deteksi cursor (pixel)
        maxForce: 1500,           // Kekuatan maksimal menjauh
        forceMultiplier: 16,      // Pengali kekuatan
        smoothness: 0.3,        // Kehalusan gerakan (0.1-0.3)
        returnSpeed: 1,       // Kecepatan kembali ke tengah
        maxXMovement: 10,      // Batas gerak horizontal (0.0-1.0)
        maxYMovement: 10       // Batas gerak vertikal (0.0-1.0)
    };
    
    const PRESETS = {
        default: ESCAPE_SETTINGS,
        aggressive: {
            detectionRadius: 120,
            maxForce: 1000,
            forceMultiplier: 10,
            smoothness: 0.3,
            returnSpeed: 0.05,
            maxXMovement: 0.6,
            maxYMovement: 0.6
        },
        soft: {
            detectionRadius: 80,
            maxForce: 400,
            forceMultiplier: 5,
            smoothness: 0.15,
            returnSpeed: 0.12,
            maxXMovement: 0.35,
            maxYMovement: 0.35
        },
        extreme: {
            detectionRadius: 150,
            maxForce: 1500,
            forceMultiplier: 12,
            smoothness: 0.35,
            returnSpeed: 0.03,
            maxXMovement: 0.8,
            maxYMovement: 0.8
        }
    };
    
    // ============================================
    // ELEMENT REFERENCES
    // ============================================
    const valentinePage = document.getElementById('valentinePage');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const messageContainer = document.getElementById('messageContainer');
    const heartsBg = document.getElementById('heartsBg');
    const buttonsContainer = document.getElementById('buttonsContainer');
    const clickCounter = document.getElementById('clickCounter');
    const clickCountElement = document.getElementById('clickCount');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsContainer = document.getElementById('settingsContainer');
    
    // ============================================
    // VARIABLES
    // ============================================
    let clickCount = 0;
    let yesScale = 1;
    let isAnimating = false;
    let mouseX = 0;
    let mouseY = 0;
    let noBtnX = 0;
    let noBtnY = 0;
    let animationId = null;
    let activeHearts = 0;
    const maxHearts = 20; // Batasi jumlah hati untuk performa
    
    // ============================================
    // FUNGSI UTAMA
    // ============================================
    
    // Fungsi ringan untuk membuat hati
    function createFloatingHearts(count) {
        if (activeHearts >= maxHearts) return;
        
        for (let i = 0; i < count && activeHearts < maxHearts; i++) {
            activeHearts++;
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            
            // Posisi acak
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 3}s`;
            heart.style.fontSize = `${12 + Math.random() * 16}px`;
            heart.style.color = ['#ff4d6d', '#ff8fa3', '#c9184a'][Math.floor(Math.random() * 3)];
            
            heartsBg.appendChild(heart);
            
            // Hapus hati setelah animasi
            setTimeout(() => {
                heart.remove();
                activeHearts--;
            }, 6000);
        }
    }
    
    // Inisialisasi hati awal
    setTimeout(() => createFloatingHearts(5), 500);
    setInterval(() => createFloatingHearts(2), 5000);
    
    // ============================================
    // KONTROL TOMBOL NO (SMOOTH)
    // ============================================
    
    // Dapatkan posisi tombol
    function getButtonPosition() {
        const rect = noBtn.getBoundingClientRect();
        const containerRect = buttonsContainer.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
    }
    
    // Hitung jarak
    function calculateDistance(mx, my, bx, by) {
        const dx = mx - bx;
        const dy = my - by;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Animasi smooth dengan requestAnimationFrame
    function animateButton() {
        if (!isAnimating) return;
        
        const currentPos = getButtonPosition();
        noBtnX = currentPos.x;
        noBtnY = currentPos.y;
        
        const distance = calculateDistance(mouseX, mouseY, noBtnX, noBtnY);
        
        if (distance < ESCAPE_SETTINGS.detectionRadius) {
            // Hitung arah menjauh dari cursor
            const angle = Math.atan2(noBtnY - mouseY, noBtnX - mouseX);
            const proximity = ESCAPE_SETTINGS.detectionRadius - distance;
            const force = Math.min(
                ESCAPE_SETTINGS.maxForce, 
                proximity * ESCAPE_SETTINGS.forceMultiplier
            );
            
            // Posisi target baru
            let targetX = noBtnX + Math.cos(angle) * force;
            let targetY = noBtnY + Math.sin(angle) * force;
            
            // Batasi dalam container
            const containerRect = buttonsContainer.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const centerY = containerRect.height / 2;
            
            const maxXDistance = containerRect.width * ESCAPE_SETTINGS.maxXMovement;
            const maxYDistance = containerRect.height * ESCAPE_SETTINGS.maxYMovement;
            
            targetX = Math.max(centerX - maxXDistance, Math.min(centerX + maxXDistance, targetX));
            targetY = Math.max(centerY - maxYDistance, Math.min(centerY + maxYDistance, targetY));
            
            // Interpolasi smooth
            const dx = targetX - noBtnX;
            const dy = targetY - noBtnY;
            
            noBtn.style.transform = `translate(${dx * ESCAPE_SETTINGS.smoothness}px, ${dy * ESCAPE_SETTINGS.smoothness}px)`;
        } else {
            // Kembali ke tengah
            const centerX = buttonsContainer.offsetWidth / 2;
            const centerY = buttonsContainer.offsetHeight / 2;
            
            const dx = centerX - noBtnX;
            const dy = centerY - noBtnY;
            
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                noBtn.style.transform = `translate(${dx * ESCAPE_SETTINGS.returnSpeed}px, ${dy * ESCAPE_SETTINGS.returnSpeed}px)`;
            } else {
                noBtn.style.transform = 'translate(0, 0)';
            }
        }
        
        animationId = requestAnimationFrame(animateButton);
    }
    
    // Mulai animasi
    function startAnimation() {
        if (!isAnimating) {
            isAnimating = true;
            animateButton();
        }
    }
    
    // Hentikan animasi
    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        noBtn.style.transition = 'transform 0.5s ease';
        noBtn.style.transform = 'translate(0, 0)';
        setTimeout(() => noBtn.style.transition = '', 500);
    }
    
    // ============================================
    // PANEL SETTINGS
    // ============================================
    
    function createSettingsPanel() {
        const settings = [
            { key: 'detectionRadius', label: 'Jarak Deteksi', min: 50, max: 200, step: 1, unit: 'px' },
            { key: 'maxForce', label: 'Kekuatan Maks', min: 200, max: 2000, step: 50, unit: '' },
            { key: 'forceMultiplier', label: 'Pengali Kekuatan', min: 2, max: 20, step: 1, unit: 'x' },
            { key: 'smoothness', label: 'Kehalusan', min: 0.1, max: 0.5, step: 0.01, unit: '' },
            { key: 'returnSpeed', label: 'Kembali ke Tengah', min: 0.02, max: 0.2, step: 0.01, unit: '' },
            { key: 'maxXMovement', label: 'Batas Horizontal', min: 0.1, max: 0.9, step: 0.05, unit: '%' },
            { key: 'maxYMovement', label: 'Batas Vertikal', min: 0.1, max: 0.9, step: 0.05, unit: '%' }
        ];
        
        let html = '';
        
        settings.forEach(setting => {
            const value = ESCAPE_SETTINGS[setting.key];
            const displayValue = setting.key.includes('Movement') 
                ? `${(value * 100).toFixed(0)}%` 
                : value.toFixed(setting.step < 1 ? 2 : 0) + setting.unit;
            
            html += `
                <div class="setting-item">
                    <div class="setting-label">
                        <span>${setting.label}</span>
                        <span class="setting-value" id="value-${setting.key}">${displayValue}</span>
                    </div>
                    <input type="range" class="setting-slider" id="slider-${setting.key}"
                        min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${value}">
                </div>
            `;
        });
        
        settingsContainer.innerHTML = html;
        
        // Event listeners untuk slider
        settings.forEach(setting => {
            const slider = document.getElementById(`slider-${setting.key}`);
            const valueDisplay = document.getElementById(`value-${setting.key}`);
            
            slider.addEventListener('input', function() {
                const value = parseFloat(this.value);
                ESCAPE_SETTINGS[setting.key] = value;
                
                const displayValue = setting.key.includes('Movement') 
                    ? `${(value * 100).toFixed(0)}%` 
                    : value.toFixed(setting.step < 1 ? 2 : 0) + setting.unit;
                
                valueDisplay.textContent = displayValue;
            });
        });
        
        // Event listeners untuk preset
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                applyPreset(this.dataset.preset);
            });
        });
    }
    
    function applyPreset(presetName) {
        const preset = PRESETS[presetName];
        Object.keys(preset).forEach(key => {
            ESCAPE_SETTINGS[key] = preset[key];
            const slider = document.getElementById(`slider-${key}`);
            const valueDisplay = document.getElementById(`value-${key}`);
            if (slider && valueDisplay) {
                slider.value = preset[key];
                const setting = getSettingByKey(key);
                const displayValue = key.includes('Movement') 
                    ? `${(preset[key] * 100).toFixed(0)}%` 
                    : preset[key].toFixed(setting.step < 1 ? 2 : 0) + setting.unit;
                valueDisplay.textContent = displayValue;
            }
        });
    }
    
    function getSettingByKey(key) {
        const settings = [
            { key: 'detectionRadius', unit: 'px', step: 1 },
            { key: 'maxForce', unit: '', step: 50 },
            { key: 'forceMultiplier', unit: 'x', step: 1 },
            { key: 'smoothness', unit: '', step: 0.01 },
            { key: 'returnSpeed', unit: '', step: 0.01 },
            { key: 'maxXMovement', unit: '%', step: 0.05 },
            { key: 'maxYMovement', unit: '%', step: 0.05 }
        ];
        return settings.find(s => s.key === key);
    }
    
    // Toggle settings panel
    settingsToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
    });
    
    // Tutup panel saat klik di luar
    document.addEventListener('click', function(e) {
        if (!settingsPanel.contains(e.target) && e.target !== settingsToggle) {
            settingsPanel.style.display = 'none';
        }
    });
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // Track mouse untuk tombol NO
    buttonsContainer.addEventListener('mousemove', function(e) {
        const rect = buttonsContainer.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        if (!isAnimating) {
            startAnimation();
        }
    });
    
    buttonsContainer.addEventListener('mouseleave', stopAnimation);
    
    // Touch support (sederhana)
    buttonsContainer.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = buttonsContainer.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        
        if (!isAnimating) {
            startAnimation();
        }
    }, { passive: false });
    
    buttonsContainer.addEventListener('touchend', stopAnimation);
    
    // Handler tombol NO
    function handleNoClick() {
        clickCount++;
        clickCountElement.textContent = clickCount;
        clickCounter.classList.add('updated');
        setTimeout(() => clickCounter.classList.remove('updated'), 300);
        
        noBtn.classList.add('no-clicked');
        setTimeout(() => noBtn.classList.remove('no-clicked'), 300);
        
        // Perbesar tombol YES
        yesScale += 0.1;
        yesBtn.classList.remove('enlarged');
        void yesBtn.offsetWidth; // Trigger reflow
        yesBtn.classList.add('enlarged');
        yesBtn.style.transform = `scale(${yesScale})`;
        
        // Ubah warna tombol YES
        const greenValue = Math.max(50, 205 - (clickCount * 10));
        yesBtn.style.background = `linear-gradient(145deg, rgb(${greenValue}, 180, 70), rgb(${greenValue - 15}, 160, 50))`;
        
        // Tampilkan pesan berdasarkan klik
        if (clickCount === 1) {
            showMessage("Hmm... Are you sure? 🤔", "Aduh, jangan tolak aku dong!");
        } else if (clickCount === 3) {
            showMessage("You're persistent! 😄", "Coba klik YES deh!");
        } else if (clickCount === 5) {
            showMessage("Okay, I see how it is! 😏", "Tombol YES udah nungguin loh!");
        } else if (clickCount >= 7) {
            showMessage("Alright, you win! 😅", "Klik YES dong! Aku janji worth it! ❤️");
        }
        
        createFloatingHearts(3);
    }
    
    noBtn.addEventListener('click', handleNoClick);
    
    // Handler tombol YES
    yesBtn.addEventListener('click', function() {
        yesBtn.innerHTML = '<i class="fas fa-heart me-2"></i> I LOVE YOU CARINO!';
        yesBtn.style.background = 'linear-gradient(145deg, #ff4d6d, #c9184a)';
        yesBtn.style.transform = `scale(${yesScale + 0.1})`;
        yesBtn.classList.add('enlarged');
        
        noBtn.style.opacity = '0';
        noBtn.style.pointerEvents = 'none';
        stopAnimation();
        
        clickCounter.innerHTML = `<span class="text-success fw-bold">Akhirnya kamu milih yang benar! 💖</span>`;
        clickCounter.classList.add('updated');
        
        showMessage("Yay! Kamu Bikin Aku Jadi Paling Bahagia! 💖", 
                   "Aku senang banget kamu bilang YES! Membawamu ke dashboard spesial kita...");
        
        createFloatingHearts(10);
        
        // Redirect ke dashboard setelah 2 detik
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    });
    
    // Fungsi tampilkan pesan
    function showMessage(title, text) {
        messageContainer.innerHTML = `
            <h3>${title}</h3>
            <p class="mb-3">${text}</p>
            <div class="d-flex justify-content-center mt-3">
                <div class="p-2 rounded" style="background-color: var(--light-pink);">
                    <i class="fas fa-gift fa-lg me-2" style="color: var(--primary-pink);"></i>
                    <span>Gak sabar nunggu Valentine's Day sama kamu!</span>
                </div>
            </div>
        `;
        messageContainer.style.display = 'block';
    }
    
    // ============================================
    // INISIALISASI
    // ============================================
    
    // Inisialisasi posisi tombol
    setTimeout(() => {
        const pos = getButtonPosition();
        noBtnX = pos.x;
        noBtnY = pos.y;
    }, 100);
    
    // Buat panel settings
    createSettingsPanel();
});
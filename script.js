// ============================================
// DETEKSI DEVICE & INITIAL SETUP
// ============================================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ============================================
// KONFIGURASI TOMBOL NO (BISA DIUBAH)
// ============================================
const ESCAPE_SETTINGS = isMobile ? {
    // SETTING RINGAN UNTUK MOBILE
    detectionRadius: 200,    // Jarak deteksi lebih besar
    maxForce: 300,           // Kekuatan lebih kecil
    forceMultiplier: 1.5,    // Pengali kecil
    smoothness: 0.1,         // Gerakan lebih halus
    returnSpeed: 0.1,        // Kembali cepat ke tengah
    maxXMovement: 0.3,       // Batas gerak kecil
    maxYMovement: 0.3        // Batas gerak kecil
} : {
    // SETTING UNTUK DESKTOP (ASLI)
    detectionRadius: 120,
    maxForce: 1500,
    forceMultiplier: 16,
    smoothness: 0.3,
    returnSpeed: 0.1,
    maxXMovement: 0.6,
    maxYMovement: 0.6
};

const PRESETS = {
    default: ESCAPE_SETTINGS,
    mobile: {
        detectionRadius: 200,
        maxForce: 300,
        forceMultiplier: 1.5,
        smoothness: 0.1,
        returnSpeed: 0.1,
        maxXMovement: 0.3,
        maxYMovement: 0.3
    },
    aggressive: {
        detectionRadius: 10,
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

document.addEventListener('DOMContentLoaded', function() {
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
    const maxHearts = 20;
    
    // ============================================
    // MOBILE OPTIMIZATION
    // ============================================
    if (isMobile) {
        // Tambah class untuk styling khusus mobile
        document.body.classList.add('mobile-device');
        
        // Nonaktifkan hover effect di mobile
        yesBtn.style.transition = 'transform 0.2s ease';
        noBtn.style.transition = 'transform 0.2s ease';
        
        // Pastikan tombol NO tidak terlalu mengganggu
        noBtn.style.position = 'relative';
        noBtn.style.zIndex = '1';
        
        // Perbesar area klik untuk touch
        yesBtn.style.minWidth = '140px';
        yesBtn.style.minHeight = '50px';
        yesBtn.style.padding = '15px 35px';
        
        // Kurangi animasi untuk performa
        maxHearts = 10;
    }
    
    // ============================================
    // FUNGSI UTAMA
    // ============================================
    
    function createFloatingHearts(count) {
        if (activeHearts >= maxHearts) return;
        
        const heartCount = isMobile ? Math.min(count, 2) : count;
        
        for (let i = 0; i < heartCount && activeHearts < maxHearts; i++) {
            activeHearts++;
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.innerHTML = '❤️';
            
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 3}s`;
            heart.style.fontSize = `${(isMobile ? 10 : 12) + Math.random() * (isMobile ? 12 : 16)}px`;
            heart.style.color = ['#ff4d6d', '#ff8fa3', '#c9184a'][Math.floor(Math.random() * 3)];
            
            heartsBg.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                    activeHearts--;
                }
            }, 6000);
        }
    }
    
    // Inisialisasi hati
    setTimeout(() => createFloatingHearts(isMobile ? 3 : 5), 500);
    setInterval(() => createFloatingHearts(isMobile ? 1 : 2), 5000);
    
    // ============================================
    // KONTROL TOMBOL NO (OPTIMIZED)
    // ============================================
    
    function getButtonPosition() {
        const rect = noBtn.getBoundingClientRect();
        const containerRect = buttonsContainer.getBoundingClientRect();
        return {
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top + rect.height / 2
        };
    }
    
    function calculateDistance(mx, my, bx, by) {
        const dx = mx - bx;
        const dy = my - by;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
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
            
            // Di mobile, gerakan lebih sederhana
            if (isMobile) {
                noBtn.style.transform = `translate(${dx * 0.05}px, ${dy * 0.05}px)`;
            } else {
                noBtn.style.transform = `translate(${dx * ESCAPE_SETTINGS.smoothness}px, ${dy * ESCAPE_SETTINGS.smoothness}px)`;
            }
        } else {
            // Kembali ke tengah
            const centerX = buttonsContainer.offsetWidth / 2;
            const centerY = buttonsContainer.offsetHeight / 2;
            
            const dx = centerX - noBtnX;
            const dy = centerY - noBtnY;
            
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                const speed = isMobile ? 0.2 : ESCAPE_SETTINGS.returnSpeed;
                noBtn.style.transform = `translate(${dx * speed}px, ${dy * speed}px)`;
            } else {
                noBtn.style.transform = 'translate(0, 0)';
            }
        }
        
        // Di mobile, gunakan interval yang lebih lama untuk hemat baterai
        if (isMobile) {
            setTimeout(() => {
                animationId = requestAnimationFrame(animateButton);
            }, 16); // ~60fps
        } else {
            animationId = requestAnimationFrame(animateButton);
        }
    }
    
    function startAnimation() {
        if (!isAnimating) {
            isAnimating = true;
            animateButton();
        }
    }
    
    function stopAnimation() {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        noBtn.style.transition = isMobile ? 'none' : 'transform 0.3s ease';
        noBtn.style.transform = 'translate(0, 0)';
    }
    
    // ============================================
    // EVENT LISTENERS (OPTIMIZED FOR MOBILE)
    // ============================================
    
    // Track mouse untuk desktop
    if (!isMobile) {
        buttonsContainer.addEventListener('mousemove', function(e) {
            const rect = buttonsContainer.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            
            if (!isAnimating) {
                startAnimation();
            }
        });
        
        buttonsContainer.addEventListener('mouseleave', stopAnimation);
    }
    
    // Touch events untuk mobile
    buttonsContainer.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        const rect = buttonsContainer.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        
        // Di mobile, mulai animasi dengan delay
        if (!isAnimating) {
            setTimeout(() => {
                startAnimation();
            }, 50);
        }
        
        // Cegah zoom dan scroll tidak sengaja
        if (e.touches.length === 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    buttonsContainer.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const rect = buttonsContainer.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        
        // Cegah scroll default
        e.preventDefault();
    }, { passive: false });
    
    buttonsContainer.addEventListener('touchend', function(e) {
        // Hentikan animasi saat jari diangkat
        setTimeout(stopAnimation, 100);
    });
    
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
        void yesBtn.offsetWidth;
        yesBtn.classList.add('enlarged');
        yesBtn.style.transform = `scale(${yesScale})`;
        
        // Di mobile, skala lebih kecil
        if (isMobile) {
            yesBtn.style.transform = `scale(${Math.min(1.5, yesScale)})`;
        }
        
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
    // Di mobile, tambah touch feedback
    if (isMobile) {
        noBtn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        noBtn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    }
    
    // Handler tombol YES (OPTIMIZED FOR TOUCH)
    function handleYesClick() {
        // Nonaktifkan event sementara untuk mencegah multi-click
        yesBtn.removeEventListener('click', handleYesClick);
        if (isMobile) {
            yesBtn.removeEventListener('touchend', handleYesClick);
        }
        
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
        
        createFloatingHearts(isMobile ? 5 : 10);
        
        // Di mobile, tambah delay lebih panjang untuk feedback visual
        const redirectDelay = isMobile ? 2500 : 2000;
        
        // Redirect ke dashboard
        setTimeout(() => {
            // Tampilkan loading feedback di mobile
            if (isMobile) {
                yesBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Loading...';
            }
            window.location.href = 'dashboard.html';
        }, redirectDelay);
    }
    
    yesBtn.addEventListener('click', handleYesClick);
    
    // Di mobile, gunakan touchend untuk respons lebih cepat
    if (isMobile) {
        yesBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            handleYesClick();
        }, { passive: false });
    }
    
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
        
        // Auto-hide pesan setelah beberapa saat di mobile
        if (isMobile) {
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 3000);
        }
    }
    
    // ============================================
    // SETTINGS PANEL (MOBILE FRIENDLY)
    // ============================================
    
    function createSettingsPanel() {
        if (isMobile) {
            // Di mobile, sembunyikan settings panel atau buat sederhana
            if (settingsToggle) settingsToggle.style.display = 'none';
            if (settingsPanel) settingsPanel.style.display = 'none';
            return;
        }
        
        // Kode settings panel untuk desktop (sama seperti sebelumnya)
        // ... [kode settings panel yang sudah ada]
    }
    
    // ============================================
    // INISIALISASI
    // ============================================
    
    // Inisialisasi posisi tombol
    setTimeout(() => {
        const pos = getButtonPosition();
        noBtnX = pos.x;
        noBtnY = pos.y;
        
        // Di mobile, set default position
        if (isMobile) {
            noBtn.style.transform = 'translate(0, 0)';
        }
    }, 100);
    
    // Buat panel settings (hanya di desktop)
    if (!isMobile && typeof createSettingsPanel === 'function') {
        createSettingsPanel();
    }
});
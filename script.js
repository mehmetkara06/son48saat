document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Allow navigation if it's not just a pure hash link
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Button interactions
    const calcBtn = document.getElementById('calcBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            // Simple animation or alert for the demo
            const originalText = calcBtn.textContent;
            calcBtn.textContent = 'Hesaplanıyor...';
            calcBtn.style.opacity = '0.8';

            setTimeout(() => {
                alert('PVGIS Simülasyonu Başlatıldı: Lütfen konumunuzu seçin.');
                calcBtn.textContent = originalText;
                calcBtn.style.opacity = '1';
            }, 1000);
        });
    }

    // Nav blur effect on scroll
    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(20, 25, 35, 0.7)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.03)';
            nav.style.boxShadow = 'none';
        }
    });
});

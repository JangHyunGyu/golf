document.addEventListener('DOMContentLoaded', () => {
    // Mobile Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
        document.body.classList.add('is-mobile');
    }

    // 3D Tilt Effect (PC Only) - Event Delegation for Dynamic Content
    if (!isMobile) {
        const container = document.getElementById('venue-results');
        
        if (container) {
            container.addEventListener('mouseover', (e) => {
                const card = e.target.closest('.venue-card');
                if (!card) return;

                // Prevent multiple listeners
                if (card.dataset.tiltActive === 'true') return;
                card.dataset.tiltActive = 'true';

                const onMouseMove = (ev) => {
                    const rect = card.getBoundingClientRect();
                    const x = ev.clientX - rect.left;
                    const y = ev.clientY - rect.top;
                    
                    // Spotlight (Optional, if CSS supports it)
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);

                    // 3D Tilt Calculation
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const mouseX = ev.clientX - centerX;
                    const mouseY = ev.clientY - centerY;
                    
                    // Max rotation degrees (adjust for intensity)
                    const rotateX = (mouseY / (rect.height / 2)) * -5; // Reduced intensity for smaller cards
                    const rotateY = (mouseX / (rect.width / 2)) * 5;

                    // Apply 3D Transform
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                };

                const onMouseLeave = () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                    card.removeEventListener('mousemove', onMouseMove);
                    card.removeEventListener('mouseleave', onMouseLeave);
                    card.dataset.tiltActive = 'false';
                };

                card.addEventListener('mousemove', onMouseMove);
                card.addEventListener('mouseleave', onMouseLeave);
            });
        }
    }

    // Floating Particles (Latin Dance Theme)
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0'; // Behind content but above background
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = Math.random() > 0.5 ? 'rgba(189, 52, 254, ' : 'rgba(65, 209, 255, ';
            this.alpha = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Reduced particle count for performance
        const particleCount = isMobile ? 20 : 40; 
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
});

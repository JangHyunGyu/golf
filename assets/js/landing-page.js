/**
 * Language Redirection Logic
 */
const detectBrowserLanguage = () => {
  const candidate = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages[0]
    : navigator.language || navigator.userLanguage || "";

  if (!candidate) return null;

  const lowered = candidate.toLowerCase();
  if (lowered.startsWith("ko")) return "ko";
  return "en";
};

(function() {
    const docLang = (document.documentElement.lang || "en").toLowerCase();
    const browserLang = detectBrowserLanguage();

    // 검색 봇 감지 (SEO 문제 방지)
    const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
    
    // 내부 이동 감지 (사이트 내에서 링크 클릭으로 이동한 경우 리다이렉트 방지)
    const referrer = document.referrer;
    const isInternal = referrer && referrer.indexOf(window.location.hostname) !== -1;

    // 봇이 아니고, 내부 이동이 아닐 때만(외부 유입/첫 진입) 브라우저 언어에 따라 리다이렉션합니다.
    if (browserLang && !isBot && !isInternal) {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || "index.html";
        
        // 현재 파일명에서 기본 이름 추출 (예: analysis-en.html -> analysis)
        let baseName = currentFile.replace(/-en\.html$|-es\.html$|\.html$/, "");
        if (!baseName || baseName === "index") baseName = "index";

        let targetFile = null;
        
        // 브라우저 언어와 현재 페이지 언어가 다를 경우 타겟 파일 설정
        if (browserLang === "ko" && !docLang.startsWith("ko")) {
            targetFile = baseName + ".html";
        } else if (browserLang === "en" && !docLang.startsWith("en")) {
            targetFile = baseName + "-en.html";
        }

        // 타겟 파일이 존재하고 현재 파일과 다를 경우 이동
        if (targetFile && targetFile !== currentFile) {
            window.location.replace(targetFile);
        }
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
        document.body.classList.add('is-mobile');
    }

    // Spotlight & 3D Tilt Effect (PC Only)
    const cards = document.querySelectorAll('.hub-card');
    
    if (!isMobile) {
        document.addEventListener('mousemove', (e) => {
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Spotlight
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                // 3D Tilt Calculation
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                
                // Max rotation degrees (adjust for intensity)
                const rotateX = (mouseY / (rect.height / 2)) * -10; // Invert Y
                const rotateY = (mouseX / (rect.width / 2)) * 10;

                // Apply 3D Transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
        });

        // Reset Tilt on Mouse Leave
        cards.forEach(card => {
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });
    }

    // Daytime Clouds Background (Golf Theme)
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.8';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    
    const clouds = [];
    const cloudCount = 12;

    class Cloud {
        constructor() {
            this.init(true);
        }

        init(randomX = false) {
            this.x = randomX ? Math.random() * width : -300;
            this.y = Math.random() * (height * 0.6); // Upper 60%
            this.vx = Math.random() * 0.2 + 0.1; // Slow drift right
            this.size = Math.random() * 100 + 60; // Large radius
            this.alpha = Math.random() * 0.15 + 0.05; // Very subtle
            
            // Create a "puff" cluster for this cloud
            this.puffs = [];
            const puffCount = Math.floor(Math.random() * 3) + 3;
            for(let i=0; i<puffCount; i++) {
                this.puffs.push({
                    dx: (Math.random() - 0.5) * this.size * 1.5,
                    dy: (Math.random() - 0.5) * this.size * 0.5,
                    r: this.size * (Math.random() * 0.5 + 0.5)
                });
            }
        }

        update() {
            this.x += this.vx;
            if (this.x > width + 300) {
                this.init(false);
            }
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            this.puffs.forEach(puff => {
                ctx.beginPath();
                ctx.arc(this.x + puff.dx, this.y + puff.dy, puff.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initClouds();
    }

    function initClouds() {
        clouds.length = 0;
        for (let i = 0; i < cloudCount; i++) {
            clouds.push(new Cloud());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        clouds.forEach(c => {
            c.update();
            c.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
});
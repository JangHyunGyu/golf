document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'analysis-bg-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '1'; 
    document.body.prepend(canvas);

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
            this.y = Math.random() * (height * 0.5); // Upper half
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

    function draw() {
        ctx.clearRect(0, 0, width, height);
        clouds.forEach(c => {
            c.update();
            c.draw();
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    resize();
    draw();
});

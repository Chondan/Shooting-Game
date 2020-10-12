(() => {
    const canvas = document.getElementById("canvas");
    const canvasContext = canvas.getContext("2d");
    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function isHit(obj1, obj2) {
        const distance = Math.hypot(obj1.x - obj2.x, obj1.y - obj2.y);
        if (distance - obj1.radius - obj2.radius  < 0) {
            return true;
        }
        return false;
    }
    function getVelocity(diffY, diffX, speedRate) {
        const angle = Math.atan2(diffY, diffX);
        const velocity = {
            x: Math.cos(angle) * speedRate,
            y: Math.sin(angle) * speedRate,
        }
        return velocity;
    }
    function getEnemyPosition(radius) {
        const randomPosX = random(0, canvas.width);
        const randomPosY = random(0, canvas.height);
        const positions = [
            { x: 0 - radius, y: randomPosY },
            { x: canvas.width + radius, y: randomPosY },
            { x: randomPosX, y: 0 - radius },
            { x: randomPosX, y: canvas.height + radius }
        ];
        return positions[random(0, 3)];
    }
    function getRandomColor() {
        const opacity = random(0.5, 1);
        return `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, ${opacity})`;
    }
    class GameMethod {
        draw() {
            canvasContext.beginPath();
            canvasContext.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            canvasContext.fillStyle = this.color;
            canvasContext.fill();
        }
        update() {
            this.draw();
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            if (this.x < 0 - (2 * this.radius) || 
                this.x > innerWidth + (2 * this.radius) || 
                this.y < 0 - (2 * this.radius) ||
                this.y > innerHeight + (2 * this.radius)
            ) {
                this.isRemove = true;
            }
        }
    }
    class GameObject extends GameMethod {
        constructor(x, y, radius, color, velocity) {
            super();
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.color = color;
            this.velocity = velocity;
            this.isRemove = false;
        }
    }
    class Particle extends GameObject {
        constructor(x, y, radius, color, velocity, startX, startY, distanToRemoveParticle) {
            super(x, y, radius, color, velocity);
            this.startX = startX;
            this.startY = startY;
            this.distanToRemoveParticle = distanToRemoveParticle;
            this.friction = 1;
        }
        update() {
            this.draw();
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            if (Math.hypot(this.x - this.startX, this.y - this.startY) > this.distanToRemoveParticle) {
                this.isRemove = true;
            }
        }
    }
    let isGameOver = true;
    let score;
    const gameControl = document.querySelector(".control");
    const gameStartButton = document.querySelector("#start-game-button");
    const scoreBoard = document.querySelector("#score");
    gameStartButton.addEventListener("click", () => {
        isGameOver = false;
        gameControl.style.display = "none";
        app();
        score = 0;
    });
    function app() {
        // responsive
        canvas.height = innerHeight;
        canvas.width = innerWidth;
        if (isGameOver) {
            return;
        }
        // setup player
        const player = new GameObject(canvas.width/2, canvas.height/2, 10, "white", { x: 0, y: 0 });
        // progectile
        const projectiles = [];
        // enemy
        let enemies = [];
        // particles
        const particles = [];
        // create enemies
        let timer;
        function spawnEnemies() {
            timer = setInterval(() => {
                const radius = random(15, 30);
                const posObj = getEnemyPosition(radius);
                const x = posObj.x;
                const y = posObj.y;
                const color = getRandomColor();
                const velocity = getVelocity(-(y - player.y), -(x - player.x), 0.5);
                enemies.push(new GameObject(
                    x, y, radius, color, velocity
                ))
            }, 1000);
        }
        spawnEnemies();
        // animation
        function animate() {
            scoreBoard.innerHTML = score || 0;
            canvasContext.fillStyle = "rgba(0, 0, 0, 0.1)";
            const animationId = requestAnimationFrame(animate);  
            canvasContext.fillRect(0, 0, innerWidth, innerHeight);
            // draw player
            player.update();
            // draw projectiles
            projectiles.forEach((projectile, projectileIndex) => {
                projectile.update();
                if (projectile.isRemove) {
                    projectiles.splice(projectileIndex, 1);
                }
            });
            // draw particles
            particles.forEach((particle, particleIndex) => {
                particle.update();
                if (particle.isRemove) {
                    particles.splice(particleIndex, 1);
                }
            });
            // draw enemies
            enemies.forEach((enemy, enemyIndex) => {
                enemy.update();
                if (isHit(enemy, player)) {
                    // GAME OVER
                    cancelAnimationFrame(animationId);
                    clearInterval(timer);
                    isGameOver = true;
                    gameControl.style.display = "flex";      
                }
                if (enemy.isRemove) {
                    enemies.splice(enemyIndex, 1);
                }
                projectiles.forEach((projectile, projectileIndex) => {
                    if (isHit(enemy, projectile)) {
                        score += 10;
                        // particle animation
                        const particlesArray = Array(Math.floor(enemy.radius) * 2).fill(null).map(particle => {
                            const speedRate = random(1, 2);
                            const velocity = {
                                x: projectile.x > enemy.x ? Math.max(0.5, Math.random()) : Math.max(-0.5, Math.random() * -1),
                                y: projectile.y > enemy.y ? Math.max(0.5, Math.random()) : Math.max(-0.5, Math.random() * -1)
                            };
                            velocity.x *= speedRate;
                            velocity.y *= speedRate;
                            return new Particle(
                                projectile.x,
                                projectile.y,
                                Math.random() * 2,
                                enemy.color,
                                velocity,
                                projectile.x,
                                projectile.y,
                                random(50, 100)
                            );
                        });
                        particles.push(...particlesArray);
                        // gsap animation library
                        gsap.to(enemy, {
                            radius: enemy.radius * 0.6
                        });
                        if (enemy.radius < 10) {
                            enemies.splice(enemyIndex, 1);
                        }
                        projectiles.splice(projectileIndex, 1);
                    }
                });
            });
        }
        animate();
        // projectiles
        function addProjectiles() {
            const velocity = getVelocity(targetY - player.y, targetX - player.x, 3);
            const bullets = Array(1).fill(null).map((bullet, index) => (
                new GameObject(
                    player.x + velocity.x * index,
                    player.y + velocity.y * index,
                    5,
                    "white",
                    velocity,
                )
            ));
            projectiles.push(...bullets);
        }
        let targetX, targetY;
        window.addEventListener("mousemove", (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });
        window.addEventListener("click", addProjectiles);
        window.addEventListener("keydown", e => {
            e.preventDefault();
            addProjectiles();
        });
         canvas.addEventListener("touchstart", e => {
            e.preventDefault();
            targetX = e.touches[0].clientX;
            targetY = e.touches[0].clientY;
            addProjectiles();
        });
    }
    app();
    window.addEventListener("resize", () => {
        app();
    });
})();

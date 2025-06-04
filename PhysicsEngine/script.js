// OJSN
const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 800;

const GRAVITY = 0.8;
const FRICTION = 0.99;
const BOUNCE = 0.7;
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const stats = { totalObjects: 0, totalCollisions: 0, avgSpeed: 0 };

class PhysicsObject {
    constructor(x, y, radius, colorIndex) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colorIndex = colorIndex;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = (Math.random() - 0.5) * 4;
        this.mass = radius * radius;
        this.id = Date.now() + Math.random();
        this.isDragging = false;
        this.selected = false;
    }

    update() {
        if (!this.isDragging) {
            this.velocityY += GRAVITY;
            this.velocityX *= FRICTION;
            this.velocityY *= FRICTION;
            this.x += this.velocityX;
            this.y += this.velocityY;

            if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.velocityX *= -BOUNCE;
            } else if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.velocityX *= -BOUNCE;
            }
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.velocityY *= -BOUNCE;
            } else if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.velocityY *= -BOUNCE;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[this.colorIndex];
        ctx.fill();
        ctx.strokeStyle = this.selected ? '#FFD700' : '#000';
        ctx.lineWidth = this.selected ? 3 : 1;
        ctx.stroke();
    }

    getSpeed() {
        return Math.hypot(this.velocityX, this.velocityY);
    }
}

const objects = [];
function spawnObject(radius) {
    const x = Math.random() * (canvas.width - 2 * radius) + radius;
    const y = Math.random() * (canvas.height - 2 * radius) + radius;
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    objects.push(new PhysicsObject(x, y, radius, colorIndex));
}

for (let i = 0; i < 5; i++) spawnObject(30);

function updateStats() {
    stats.totalObjects = objects.length;
    let totalSpeed = objects.reduce((sum, obj) => sum + obj.getSpeed(), 0);
    stats.avgSpeed = (totalSpeed / objects.length).toFixed(2);

    document.getElementById('totalObjects').textContent = stats.totalObjects;
    document.getElementById('totalCollisions').textContent = stats.totalCollisions;
    document.getElementById('avgSpeed').textContent = stats.avgSpeed;
}

const radiusSlider = document.getElementById('radiusSlider');
const addObjectButton = document.getElementById('addObject');

addObjectButton.addEventListener('click', () => {
    spawnObject(parseInt(radiusSlider.value));
    updateStats();
});

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    for (const obj of objects) {
        if (Math.hypot(mouseX - obj.x, mouseY - obj.y) < obj.radius) {
            obj.isDragging = true;
            obj.selected = true;
        } else {
            obj.selected = false;
        }
    }
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    for (const obj of objects) {
        if (obj.isDragging) {
            obj.x = mouseX;
            obj.y = mouseY;
            obj.velocityX = 0;
            obj.velocityY = 0;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    for (const obj of objects) {
        if (obj.isDragging) {
            obj.velocityX = (Math.random() - 0.5) * 10;
            obj.velocityY = (Math.random() - 0.5) * 10;
            obj.isDragging = false;
        }
    }
});

window.addEventListener('keydown', e => {
    const selected = objects.find(o => o.selected);
    if (selected) {
        if (e.key === '+') {
            selected.radius *= 1.1;
            selected.mass = selected.radius * selected.radius;
        } else if (e.key === '-') {
            selected.radius *= 0.9;
            selected.mass = selected.radius * selected.radius;
        } else if (e.key === 'Delete') {
            const index = objects.indexOf(selected);
            if (index !== -1) objects.splice(index, 1);
        }
    }
});

function resolveCollision(obj1, obj2) {
    const dx = obj2.x - obj1.x;
    const dy = obj2.y - obj1.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return;

    const overlap = obj1.radius + obj2.radius - distance;
    if (overlap > 0) {
        stats.totalCollisions++;

        const nx = dx / distance;
        const ny = dy / distance;

        obj1.x -= (overlap / 2) * nx;
        obj1.y -= (overlap / 2) * ny;
        obj2.x += (overlap / 2) * nx;
        obj2.y += (overlap / 2) * ny;

        const p = 2 * (obj1.velocityX * nx + obj1.velocityY * ny - obj2.velocityX * nx - obj2.velocityY * ny) /
                  (obj1.mass + obj2.mass);

        obj1.velocityX -= p * obj2.mass * nx;
        obj1.velocityY -= p * obj2.mass * ny;
        obj2.velocityX += p * obj1.mass * nx;
        obj2.velocityY += p * obj1.mass * ny;
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < objects.length; i++) {
        objects[i].update();
        for (let j = i + 1; j < objects.length; j++) {
            resolveCollision(objects[i], objects[j]);
        }
        objects[i].draw();
    }

    updateStats();
    requestAnimationFrame(animate);
}

animate();

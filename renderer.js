const Colors = {
    background: '#222',
    ant: '#ff0000',
    nest: '#00ff00',
    resource: '#ffff00',
    pheromone: 'rgba(0,255,255,0.4)',
    private: '#00ffff',
    general: '#ffffff',
    artillery: '#ff00ff',
    queen: '#ffaaaa',
    worker: '#ff8800',
    tree: '#004400',
};

let frame = 0;

function nextFrame() {
    frame++;
}

function drawCircle(ctx, x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawRectangle(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawPheromones(ctx, pheromones, cellWidth, cellHeight) {
    for (let y = 0; y < pheromones.length; y++) {
        for (let x = 0; x < pheromones[y].length; x++) {
            const strength = pheromones[y][x];
            if (strength > 0) {
                ctx.fillStyle = `rgba(0,255,255,${Math.min(strength, 1)})`;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }
}

function drawAnt(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    const half = size / 2;
    ctx.fillRect(x - half, y - half, size, size);
    ctx.fillRect(x - half, y - size * 1.5, size, size);
    ctx.fillRect(x - half, y + size * 0.5, size, size);
    ctx.fillRect(x - size * 1.5, y - half, size, size);
    ctx.fillRect(x + size * 0.5, y - half, size, size);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.2);
    ctx.beginPath();
    if (Math.floor(frame / 10) % 2 === 0) {
        ctx.moveTo(x - half, y + size);
        ctx.lineTo(x - size, y + size * 1.4);
        ctx.moveTo(x + half, y + size);
        ctx.lineTo(x + size, y + size * 1.4);
    } else {
        ctx.moveTo(x - half, y + size);
        ctx.lineTo(x - size * 1.2, y + size * 1.2);
        ctx.moveTo(x + half, y + size);
        ctx.lineTo(x + size * 1.2, y + size * 1.2);
    }
    ctx.stroke();
}

window.Renderer = {
    Colors,
    drawCircle,
    drawRectangle,
    drawLine,
    drawPheromones,
    drawAnt,
    nextFrame,
};

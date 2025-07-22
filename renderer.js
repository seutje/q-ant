const Colors = {
    background: '#222',
    ant: '#ff0000',
    nest: '#00ff00',
    resource: '#ffff00',
    pheromone: 'rgba(0,255,255,0.4)',
};

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

window.Renderer = {
    Colors,
    drawCircle,
    drawRectangle,
    drawLine,
    drawPheromones,
};

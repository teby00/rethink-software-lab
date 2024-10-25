class Particles {
  constructor(options) {
    this.canvas = document.querySelector(options.selector);
    this.context = this.canvas.getContext('2d');
    this.quantity = options.quantity || 100;
    this.staticity = options.staticity || 50;
    this.ease = options.ease || 50;
    this.size = options.size || 0.4;
    this.color = options.color || '#ffffff';
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.circles = [];
    this.mouse = { x: 0, y: 0 };
    this.dpr = window.devicePixelRatio || 1;
    this.canvasSize = { w: 0, h: 0 };
    this.rgb = this.hexToRgb(this.color);

    this.init();
  }

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }
    const hexInt = parseInt(hex, 16);
    return [(hexInt >> 16) & 255, (hexInt >> 8) & 255, hexInt & 255];
  }

  init() {
    this.resizeCanvas();
    this.drawParticles();
    this.animate();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  resizeCanvas() {
    this.circles = [];
    this.canvasSize.w = this.canvas.offsetWidth;
    this.canvasSize.h = this.canvas.offsetHeight;
    this.canvas.width = this.canvasSize.w * this.dpr;
    this.canvas.height = this.canvasSize.h * this.dpr;
    this.canvas.style.width = `${this.canvasSize.w}px`;
    this.canvas.style.height = `${this.canvasSize.h}px`;
    this.context.scale(this.dpr, this.dpr);
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - this.canvasSize.w / 2;
    const y = event.clientY - rect.top - this.canvasSize.h / 2;
    this.mouse.x = x;
    this.mouse.y = y;
  }

  circleParams() {
    const x = Math.floor(Math.random() * this.canvasSize.w);
    const y = Math.floor(Math.random() * this.canvasSize.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + this.size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }

  drawCircle(circle, update = false) {
    const { x, y, translateX, translateY, size, alpha } = circle;
    this.context.translate(translateX, translateY);
    this.context.beginPath();
    this.context.arc(x, y, size, 0, 2 * Math.PI);
    this.context.fillStyle = `rgba(${this.rgb.join(', ')}, ${alpha})`;
    this.context.fill();
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (!update) {
      this.circles.push(circle);
    }
  }

  clearContext() {
    this.context.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
  }

  drawParticles() {
    this.clearContext();
    for (let i = 0; i < this.quantity; i++) {
      const circle = this.circleParams();
      this.drawCircle(circle);
    }
  }

  remapValue(value, start1, end1, start2, end2) {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }

  animate() {
    this.clearContext();
    this.circles.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        this.canvasSize.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        this.canvasSize.h - circle.y - circle.translateY - circle.size,
      ];
      const closestEdge = Math.min(...edge);
      const remapClosestEdge = parseFloat(
        this.remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx + this.vx;
      circle.y += circle.dy + this.vy;
      circle.translateX +=
        (this.mouse.x / (this.staticity / circle.magnetism) -
          circle.translateX) /
        this.ease;
      circle.translateY +=
        (this.mouse.y / (this.staticity / circle.magnetism) -
          circle.translateY) /
        this.ease;

      this.drawCircle(circle, true);

      if (
        circle.x < -circle.size ||
        circle.x > this.canvasSize.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > this.canvasSize.h + circle.size
      ) {
        this.circles.splice(i, 1);
        const newCircle = this.circleParams();
        this.drawCircle(newCircle);
      }
    });
    requestAnimationFrame(this.animate.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Particles({
    selector: '#particles-canvas',
    quantity: 100,
    staticity: 50,
    ease: 50,
    size: 0.4,
    color: '#ffffff',
    vx: 0,
    vy: 0,
  });
});

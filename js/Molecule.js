class Molecule {
  constructor(x, y, vx, vy, type) {
    this.pos = { x, y };
    this.vel = { x: vx, y: vy };
    this.type = type; // 'A', 'B', 'C'
    this.radius = type === 'C' ? 9 : 7;
    this.flash = 0; // countdown for reaction flash effect
    this.age = 0;
  }

  update() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    if (this.flash > 0) this.flash--;
    this.age++;
  }

  bounceWalls(x1, y1, x2, y2) {
    const r = this.radius;
    if (this.pos.x - r < x1) { this.pos.x = x1 + r; this.vel.x =  Math.abs(this.vel.x); }
    if (this.pos.x + r > x2) { this.pos.x = x2 - r; this.vel.x = -Math.abs(this.vel.x); }
    if (this.pos.y - r < y1) { this.pos.y = y1 + r; this.vel.y =  Math.abs(this.vel.y); }
    if (this.pos.y + r > y2) { this.pos.y = y2 - r; this.vel.y = -Math.abs(this.vel.y); }
  }

  display(theme) {
    let dark = theme !== "light";
    let baseColor;
    if      (this.type === 'A') baseColor = color(79,  142, 247);
    else if (this.type === 'B') baseColor = color(247, 130,  60);
    else                        baseColor = color( 52, 199, 130);

    let r = this.radius;

    // Glow ring
    noStroke();
    fill(red(baseColor), green(baseColor), blue(baseColor), dark ? 30 : 40);
    ellipse(this.pos.x, this.pos.y, (r + 6) * 2);

    // Reaction flash burst
    if (this.flash > 0) {
      let a = map(this.flash, 0, 18, 0, 180);
      fill(255, 240, 80, a);
      noStroke();
      ellipse(this.pos.x, this.pos.y, (r + 10) * 2);
    }

    // Body gradient (two ellipses to simulate depth)
    fill(baseColor);
    noStroke();
    ellipse(this.pos.x, this.pos.y, r * 2);

    // Specular highlight
    fill(255, 255, 255, dark ? 60 : 90);
    ellipse(this.pos.x - r * 0.28, this.pos.y - r * 0.28, r * 0.75);

    // Letter label
    fill(255, 255, 255, dark ? 230 : 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(r * 1.1);
    text(this.type, this.pos.x, this.pos.y + 0.5);
  }
}

/****************************************************
  PASSWORD + P5 SKETCH LOGIC
 ****************************************************/

// ==================== PASSWORD CHECK ====================
const SECRET_PASSWORD = "mySecret"; // Change to whatever you want

function checkPassword() {
  const input = document.getElementById("passwordInput");
  if (input.value === SECRET_PASSWORD) {
    // Hide the password modal
    document.getElementById("passwordModal").style.display = "none";
    // Show the app content
    document.getElementById("appContent").style.display = "block";
  } else {
    alert("Wrong password. Please try again.");
  }
}

// ==================== P5 SKETCH BELOW ====================

// Define constants for initial and final counts.
const INITIAL_FIREFLY_COUNT = 50;
const FINAL_FIREFLY_COUNT   = 140; // (59 for "I", 30 for heart, 51 for "U")
let totalFireflies = FINAL_FIREFLY_COUNT;
let fireflies = []; // Array to hold all firefly objects.

// Add your memories here. 
let memories = [
  { text: "Remember our very romantic first date at Tortilla where our chairs were faced towards a wall?", photo: "memories/tort.jpg" },
  { text: "CANT FORGET SPOONS (or Greggs)", photo: "memories/newc3.jpg" },
  { text: "Winter Ball", photo: "memories/ball.jpg" },
  { text: "Minigolf in Newcastle with the gimp?", photo: "memories/newc2.jpg" },
  { text: "First time we actually went out (all my idea ofc)", photo: "memories/climbing.jpg" },
  {
    text: "Remember when we were sat in the rain ontop of fake obersatory hill?",
    spotify: "https://open.spotify.com/embed/track/6nGdBJ5J0vKgLGrnuQEjql?si=f4d3ede41bca4584?utm_source=generator"
  },
  { text: "Going to Morrisons in Birmingham for picnic stuff then finding the posh botanical garden that was expensive to enter" },
  { text: "Watching the stars together at Burnhall on the park bench", photo: "memories/stars.jpg" },
  { text: "Winter wonderland", photo: "memories/wonderland.jpg" },
  { text: "Arcade 🕹️🎮👾", photo: "memories/arcade.jpg" },
  { text: "🏛️", photo: "memories/museum.jpg" },
  { text: "Just love this picture (I love them all though)", photo: "memories/field.jpg" },
  { text: "Chiquitos", photo: "memories/newc1.jpg" },
  {
    text: "A song that reminds me of you",
    spotify: "https://open.spotify.com/embed/track/4cgR4F6jeLJCJsQM5w3ax5?si=19011271f65d4fb0?utm_source=generator"
  },
  { text: "Aurora Borealis on top of mound", photo: "memories/aurora.jpg" },
  { text: "Beatles are Scouse"},
  { text: "🎃 Making halloween shaped pizzas 👻"},
  { text: "Scuffed halloumni wraps"},
];

let bgImage; // Global variable for the background image.
let jarX, jarY, jarWidth, jarHeight;
let finalRelease = false;
let releaseTriggered = false;
let font;

function preload() {
  font = loadFont(
    'https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf',
    () => console.log("Online font loaded successfully."),
    (e) => console.error("Failed to load online font.", e)
  );
  // Load the background image
  bgImage = loadImage("bg2.webp");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // We'll cycle through the memories in order using a separate index
  let memoryIndex = 0;

  // Create FINAL_FIREFLY_COUNT fireflies in two phases:
  //   - First 50 appear on-screen randomly
  //   - The rest appear off-screen and enter later
  for (let i = 0; i < totalFireflies; i++) {
    let memory = memories[memoryIndex];
    memoryIndex = (memoryIndex + 1) % memories.length;  // move to the next memory
    
    let x, y;
    let active;
    
    if (i < INITIAL_FIREFLY_COUNT) {
      // The first 50 fireflies appear at random positions on screen.
      x = random(width);
      y = random(height);
      active = true;
    } else {
      // The remaining ones will come from off-screen.
      if (i < 59) {  
        // "I" group (indices 0-58): for the ones after the first 50, come from the left.
        x = random(-100, -20);
        y = random(0, height);
      } else if (i < 89) {
        // Heart group (indices 59-88): For variety, choose left OR right randomly.
        if (random() < 0.5) {
          x = random(-100, -20);
        } else {
          x = random(width + 20, width + 100);
        }
        y = random(0, height);
      } else {
        // "U" group (indices 89-139): come from the right
        x = random(width + 20, width + 100);
        y = random(0, height);
      }
      active = false;
    }
    
    fireflies.push(new Firefly(x, y, memory, active));
  }
  
  // Define jar dimensions and position.
  jarWidth = 100;
  jarHeight = 150;
  jarX = width - jarWidth - 20;
  jarY = height - jarHeight - 20;
}

function draw() {
  if (bgImage) {
    image(bgImage, 0, 0, width, height);
    noStroke();
    fill(0, 0, 0, 50);
    rect(0, 0, width, height);
  } else {
    background(20, 20, 40);
  }
  
  if (finalRelease) {
    // During the final formation, update and display all fireflies.
    for (let fly of fireflies) {
      fly.updateAnimation();
      fly.display();
    }
  } else {
    // While still in the “free” phase, only update active (on-screen) fireflies.
    for (let fly of fireflies) {
      if (!fly.collected && fly.active) {
        fly.move();
        fly.display();
      }
    }
    // Update the ones that have been collected and are “in” the jar
    for (let fly of fireflies) {
      if (fly.collected) {
        if (fly.animating) {
          fly.updateAnimation();
        } else {
          fly.updateJarMotion();
        }
        fly.displayInJar();
      }
    }
  }
  
  // Draw the jar on top
  push();
  translate(jarX, jarY);
  drawJar(jarWidth, jarHeight);
  pop();
}

function mousePressed() {
  // If you click on the jar, trigger the final formation
  if (
    mouseX >= jarX && mouseX <= jarX + jarWidth &&
    mouseY >= jarY && mouseY <= jarY + jarHeight
  ) {
    releaseFireflies();
    return;
  }
  
  // Otherwise, see if any free (active & uncollected) firefly is clicked.
  for (let fly of fireflies) {
    if (!fly.collected && fly.active && fly.isClicked(mouseX, mouseY)) {
      fly.pause();
      showMemory(fly);
      break;
    }
  }
}

// --- Firefly class definition ---
class Firefly {
  constructor(x, y, memory, active) {
    this.x = x;
    this.y = y;
    this.memory = memory;
    this.collected = false;
    this.speedX = random(-1, 1);
    this.speedY = random(-1, 1);
    this.paused = false;
    this.size = random(3, 5);
    this.blinkOffset = random(TWO_PI);
    this.targetX = this.x;
    this.targetY = this.y;
    this.animating = false;
    this.jarBaseX = this.x;
    this.jarBaseY = this.y;
    this.active = active;
  }
  
  move() {
    if (this.paused) return;
    if (this.animating) {
      this.updateAnimation();
      return;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > width) this.speedX *= -1;
    if (this.y < 0 || this.y > height) this.speedY *= -1;
  }
  
  updateAnimation() {
    if (this.animating) {
      this.x = lerp(this.x, this.targetX, 0.07);
      this.y = lerp(this.y, this.targetY, 0.07);
      if (abs(this.x - this.targetX) < 1 && abs(this.y - this.targetY) < 1) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.animating = false;
      }
    }
  }
  
  updateJarMotion() {
    let offsetX = sin(millis() / 1000 + this.blinkOffset) * 5;
    let offsetY = cos(millis() / 1000 + this.blinkOffset) * 5;
    this.x = this.jarBaseX + offsetX;
    this.y = this.jarBaseY + offsetY;
  }
  
  display() {
    let blinkFactor = sin(millis() * 0.005 + this.blinkOffset);
    let alpha = map(blinkFactor, -1, 1, 50, 255);
    noStroke();
    for (let r = this.size; r < this.size * 4; r += this.size) {
      fill(255, 255, 150, alpha * (1 - r / (this.size * 4)));
      ellipse(this.x, this.y, r * 2);
    }
    fill(255, 255, 200, alpha);
    ellipse(this.x, this.y, this.size * 2);
  }
  
  displayInJar() {
    let blinkFactor = sin(millis() * 0.005 + this.blinkOffset);
    let alpha = map(blinkFactor, -1, 1, 50, 180);
    noStroke();
    for (let r = this.size; r < this.size * 4; r += this.size) {
      fill(255, 255, 150, alpha * (1 - r / (this.size * 4)));
      ellipse(this.x, this.y, r * 2);
    }
    fill(255, 255, 200, alpha);
    ellipse(this.x, this.y, this.size * 2);
  }
  
  isClicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.size * 2;
  }
  
  pause() {
    this.paused = true;
  }
  
  collect() {
    this.collected = true;
    this.jarBaseX = jarX + jarWidth / 2 + random(-10, 10);
    this.jarBaseY = jarY + jarHeight / 2 + random(-10, 10);
    this.setTarget({ x: this.jarBaseX, y: this.jarBaseY });
    this.startAnimation();
  }
  
  setTarget(target) {
    this.targetX = target.x;
    this.targetY = target.y;
  }
  
  startAnimation() {
    this.animating = true;
  }
}

// --- Memory popup functions ---
function showMemory(firefly) {
  let memoryTextElem = document.getElementById("memoryText");
  let memoryPhotoElem = document.getElementById("memoryPhoto");
  let spotifyContainer = document.getElementById("spotifyContainer");
  
  if (typeof firefly.memory === 'object') {
    memoryTextElem.textContent = firefly.memory.text || "";
    
    if (firefly.memory.photo) {
      memoryPhotoElem.src = firefly.memory.photo;
      memoryPhotoElem.style.display = "block";
    } else {
      memoryPhotoElem.style.display = "none";
    }
    
    if (firefly.memory.spotify) {
      spotifyContainer.innerHTML = `<iframe src="${firefly.memory.spotify}"
        width="300" height="80" frameborder="0" allowtransparency="true"
        allow="encrypted-media" style="border-radius:12px;"></iframe>`;
      spotifyContainer.style.display = "block";
    } else {
      spotifyContainer.style.display = "none";
    }
    
  } else {
    // If memory is just a string
    memoryTextElem.textContent = firefly.memory;
    memoryPhotoElem.style.display = "none";
    spotifyContainer.style.display = "none";
  }
  
  document.getElementById("memoryModal").style.display = "flex";
  window.currentFirefly = firefly;
}

function closeMemory() {
  document.getElementById("memoryModal").style.display = "none";
  if (window.currentFirefly) {
    window.currentFirefly.collect();
    window.currentFirefly = null;
  }
}

// --- Jar Drawing Functions ---
function drawJar(w, h) {
  let jarGradientGraphics = createJarGradient(w, h);
  let jarGradient = jarGradientGraphics.get();
  let jarMaskGraphics = createJarMask(w, h);
  let jarMask = jarMaskGraphics.get();
  jarGradient.mask(jarMask);
  image(jarGradient, 0, 0);
  
  let collectedCount = fireflies.filter(f => f.collected).length;
  if (collectedCount > 0) {
    let pulsate = map(sin(millis() * 0.005), -1, 1, 0.8, 1.2);
    let intensity = map(collectedCount, 0, totalFireflies, 0, 0.3) * pulsate;
    let ctx = drawingContext;
    let jarCenterX = w / 2;
    let jarCenterY = h * 0.5;
    let maxRadius = w * 0.6;
    let gradient = ctx.createRadialGradient(
      jarCenterX, jarCenterY, 0, jarCenterX, jarCenterY, maxRadius
    );
    gradient.addColorStop(0, `rgba(255,255,150,${intensity})`);
    gradient.addColorStop(1, `rgba(255,255,150,0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
  
  drawJarOutline(w, h);
  drawJarLid(w, h);
}

function createJarGradient(w, h) {
  let pg = createGraphics(w, h);
  pg.noFill();
  for (let y = 0; y < h; y++) {
    let inter = map(y, 0, h, 0, 1);
    let c = lerpColor(color(200, 220, 255, 80), color(255, 255, 255, 20), inter);
    pg.stroke(c);
    pg.line(0, y, w, y);
  }
  return pg;
}

function createJarMask(w, h) {
  let pg = createGraphics(w, h);
  pg.clear();
  pg.noStroke();
  pg.fill(255);
  pg.beginShape();
    pg.vertex(w * 0.3, h * 0.15);
    pg.bezierVertex(w * 0.3, h * 0.05, w * 0.7, h * 0.05, w * 0.7, h * 0.15);
    pg.vertex(w * 0.8, h * 0.25);
    pg.bezierVertex(w * 0.9, h * 0.5, w * 0.9, h * 0.75, w * 0.8, h * 0.85);
    pg.vertex(w * 0.2, h * 0.85);
    pg.bezierVertex(w * 0.1, h * 0.75, w * 0.1, h * 0.5, w * 0.2, h * 0.25);
  pg.endShape(CLOSE);
  return pg;
}

function drawJarLid(w, h) {
  push();
  let lidW = w * 0.45;
  let lidH = h * 0.08;
  let lidX = w * 0.275;
  let lidY = h * 0.03;
  noStroke();
  fill(100, 100, 100, 230);
  rect(lidX, lidY, lidW, lidH, 8, 8, 0, 0);
  fill(255, 255, 255, 100);
  ellipse(lidX + lidW * 0.75, lidY + lidH * 0.5, lidW * 0.3, lidH * 0.5);
  pop();
}

function drawJarOutline(w, h) {
  noFill();
  stroke(255, 255, 255, 150);
  strokeWeight(2);
  beginShape();
    vertex(w * 0.3, h * 0.15);
    bezierVertex(w * 0.3, h * 0.05, w * 0.7, h * 0.05, w * 0.7, h * 0.15);
    vertex(w * 0.8, h * 0.25);
    bezierVertex(w * 0.9, h * 0.5, w * 0.9, h * 0.75, w * 0.8, h * 0.85);
    vertex(w * 0.2, h * 0.85);
    bezierVertex(w * 0.1, h * 0.75, w * 0.1, h * 0.5, w * 0.2, h * 0.25);
  endShape(CLOSE);
  ellipse((w * 0.3 + w * 0.7) / 2, h * 0.15, w * 0.4, 10);
}

// --- Final release (firefly formation) ---
function releaseFireflies() {
  if (releaseTriggered) return; // only trigger once
  releaseTriggered = true;
  finalRelease = true;
  
  // Make sure all fireflies become active so they animate
  for (let fly of fireflies) {
    fly.active = true;
  }
  
  let targets = generateFormationTargets();
  for (let i = 0; i < fireflies.length; i++) {
    fireflies[i].setTarget(targets[i]);
    fireflies[i].startAnimation();
  }
}

// Generate "I ♥ U" formation
function generateFormationTargets() {
  // "I": 59, Heart: 30, "U": 51.
  let iCount = 59;
  let heartCount = 30;
  let uCount = 51;
  
  let fontSize = 500;
  let iBaseline = height / 2 + fontSize / 4; 
  let iX = width / 2 - 600;
  let iPoints = font.textToPoints("I", iX, iBaseline, fontSize, { sampleFactor: 0.02 });
  while (iPoints.length < iCount) {
    iPoints = iPoints.concat(iPoints);
  }
  iPoints = shuffle(iPoints, true).slice(0, iCount);
  
  let heartCenterX = width / 2;
  let heartCenterY = height / 2 - 100;
  let heartScale   = 15; 
  let heartPoints = generateHeartOutline(heartCenterX, heartCenterY, heartScale, heartCount);
  heartPoints = shuffle(heartPoints, true);
  
  let uBaseline = iBaseline;
  let uX = width / 2 + 300;
  let uPoints = font.textToPoints("U", uX, uBaseline, fontSize, { sampleFactor: 0.02 });
  while (uPoints.length < uCount) {
    uPoints = uPoints.concat(uPoints);
  }
  uPoints = shuffle(uPoints, true).slice(0, uCount);
  
  return iPoints.concat(heartPoints).concat(uPoints);
}

function generateHeartOutline(cx, cy, scale, nPoints) {
  let arr = [];
  for (let i = 0; i < nPoints; i++) {
    let t = map(i, 0, nPoints, 0, TWO_PI);
    let x = 16 * pow(sin(t), 3);
    let y = 13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t);
    x *= scale;
    y *= -scale;
    x += cx;
    y += cy;
    arr.push({ x, y });
  }
  return arr;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  jarX = width - jarWidth - 20;
  jarY = height - jarHeight - 20;
}

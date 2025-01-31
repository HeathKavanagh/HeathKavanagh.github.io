/*******************************************************
 * STARFIELD: Infinite star background + shooting stars
 *******************************************************/
let STAR_COUNT = 200;         // Normal star count
let SHOOTING_STAR_CHANCE = 0.0015; // Probability of spawning a shooting star each frame
let SHOOTING_STARS = [];      // Array to hold shooting stars
let NORMAL_STARS = [];        // Array to hold normal stars

let canvas, ctx;
let w, h;

/** Resize the canvas to fill the window */
function resizeCanvas() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
}

/** Create a normal star with random position/speed/color */
function createNormalStar() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
    color: getRandomStarColor(),
    twinkleSpeed: Math.random() * 0.02,
    opacity: Math.random() * 0.5 + 0.5 // Initial twinkle state
  };
}

/** Random colors for stars based on real astronomical colors */
function getRandomStarColor() {
  const colors = ["white", "lightblue"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Initialize all normal stars */
function initStars() {
  NORMAL_STARS = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    NORMAL_STARS.push(createNormalStar());
  }
}

/** Update positions of normal stars */
function updateStars() {
  for (let i = 0; i < NORMAL_STARS.length; i++) {
    const s = NORMAL_STARS[i];
    s.y += s.speed;
    // Twinkle effect
    s.opacity += s.twinkleSpeed * (Math.random() > 0.5 ? 1 : -1);
    s.opacity = Math.max(0.2, Math.min(1, s.opacity)); // Keep opacity in range

    // If a star goes beyond bottom edge, respawn it at the top
    if (s.y > h) {
      NORMAL_STARS[i] = createNormalStar();
      NORMAL_STARS[i].y = 0;
    }
  }
}

/** Draw all normal stars */
function drawStars() {
  for (let i = 0; i < NORMAL_STARS.length; i++) {
    const s = NORMAL_STARS[i];
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

let PLANET_COUNT = 8; // Rare planets
let PLANETS = [];     // Array to hold planets

/** Create a planet with realistic properties */
function createPlanet() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: Math.random() * 3 + 1.5, // Similar in size to stars
    speed: Math.random() * 0.3 + 0.1, // Slower movement
    color: getRandomPlanetColor(),
    glowSize: Math.random() * 5 + 5, // Glow effect
    twinkleSpeed: Math.random() * 0.01, // Slight twinkle
    opacity: Math.random() * 0.5 + 0.5 // Initial opacity
  };
}

/** Converts planet color to RGB values for glow effects */
function getRGB(color) {
  const colors = {
      "#b35c1e": "179, 92, 30",  // Mars-like (Rusty Orange-Red)
      "#2a3b8f": "42, 59, 143",  // Neptune-like (Deep Blue)
      "#6e7051": "110, 112, 81", // Mercury-like (Grayish)
      "#a6a57a": "166, 165, 122", // Venus-like (Pale Yellowish)
      "#d4af37": "212, 175, 55", // Saturn-like (Golden Yellow)
      "#745c48": "116, 92, 72",  // Io-like (Brownish)
      "#4b6eaf": "75, 110, 175", // Ice Giant (Muted Blue)
      "earth": "30, 144, 255"   // Earth-like (Ocean Blue)
  };
  return colors[color] || "255, 255, 255"; // Default to white
}

/** Random colors for planets */
function getRandomPlanetColor() {
  const colors = [
      "#b35c1e",  // Mars-like (Rusty Orange-Red)
      "#2a3b8f",  // Neptune-like (Deep Blue)
      "#6e7051",  // Mercury-like (Grayish)
      "#a6a57a",  // Venus-like (Pale Yellowish)
      "earth",    // 🌍 Earth-like (special case)
      "#d4af37",  // Saturn-like (Golden Yellow)
      "#745c48",  // Io-like (Brownish)
      "#4b6eaf"   // Ice Giant (Muted Blue)
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Initialize all planets */
function initPlanets() {
  PLANETS = [];
  for (let i = 0; i < PLANET_COUNT; i++) {
    PLANETS.push(createPlanet());
  }
}

/** Update planet positions & opacity for twinkling effect */
function updatePlanets() {
  for (let i = 0; i < PLANETS.length; i++) {
    const p = PLANETS[i];
    p.y += p.speed;
    p.opacity += p.twinkleSpeed * (Math.random() > 0.5 ? 1 : -1);
    p.opacity = Math.max(0.4, Math.min(1, p.opacity)); // Keep opacity in range

    // If a planet moves beyond the bottom, respawn it at the top
    if (p.y > h) {
      PLANETS[i] = createPlanet();
      PLANETS[i].y = 0;
    }
  }
}

/** Determines which planets should have rings */
function shouldHaveRings(color) {
  return color === "#d4af37" || // Saturn-like (Golden Yellow)
         color === "#4b6eaf" || // Uranus-like (Muted Blue)
         color === "#2a3b8f";   // Neptune-like (Deep Blue)
}

/** Draws elliptical rings around specific planets */
function drawPlanetRings(planet) {
    ctx.save();

    ctx.globalAlpha = 0.5; // Semi-transparent rings
    ctx.strokeStyle = `rgba(${getRGB(planet.color)}, 0.6)`; // Slight tint from planet color
    ctx.lineWidth = planet.radius * 0.4; // Ring thickness

    ctx.translate(planet.x, planet.y); // Move to planet position
    ctx.rotate(Math.PI / 8); // Slight tilt for realism

    ctx.beginPath();
    ctx.ellipse(0, 0, planet.radius * 2.5, planet.radius * 1.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

/** Draws an Earth-like planet with blue oceans, green land, and white clouds */
function drawEarthTexture(planet) {
  const gradient = ctx.createRadialGradient(
      planet.x, planet.y, planet.radius * 0.3,
      planet.x, planet.y, planet.radius
  );

  // Add ocean (blue), land (green), and mix
  gradient.addColorStop(0, "#1e90ff"); // Deep blue (oceans)
  gradient.addColorStop(0.4, "#228b22"); // Green (land)
  gradient.addColorStop(0.7, "#1e90ff"); // More ocean
  gradient.addColorStop(1, "#154360"); // Darker edges for depth

  ctx.globalAlpha = planet.opacity;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
  ctx.fill();

  // Add cloud layer (random white patches)
  ctx.globalAlpha = 0.3; // Soft cloud transparency
  ctx.fillStyle = "white";
  for (let i = 0; i < 5; i++) { // Random small clouds
      let cloudX = planet.x + (Math.random() - 0.5) * planet.radius * 1.2;
      let cloudY = planet.y + (Math.random() - 0.5) * planet.radius * 1.2;
      let cloudSize = Math.random() * planet.radius * 0.5;

      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.globalAlpha = 1; // Reset transparency
}

/** Draw all planets */
function drawPlanets() {
  for (let i = 0; i < PLANETS.length; i++) {
      const p = PLANETS[i];

      ctx.save();

      // Subtle glow effect
      ctx.shadowBlur = p.glowSize;
      ctx.shadowColor = `rgba(${getRGB(p.color)}, 0.3)`;

      // If planet is "Earth-like", apply texture
      if (p.color === "earth") {
          drawEarthTexture(p);
      } else {
          // Draw solid planet
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
      }

      // Draw rings for ringed planets
      if (shouldHaveRings(p.color)) {
          drawPlanetRings(p);
      }

      ctx.restore(); // Reset settings
  }
}

let CONSTELLATION_CHANCE = 0.0005; // Probability of a constellation appearing each frame
let CONSTELLATIONS = [];
let CONSTELLATION_SPEED = 0.3; // Speed at which constellations move down

/** Create a random constellation with stars connected by lines */
function createConstellation() {
  let numStars = Math.floor(Math.random() * 4) + 3; // 3 to 6 stars
  let startX = Math.random() * w;
  let startY = Math.random() * h * 0.6; // Prefer upper part of screen
  let stars = [];

  for (let i = 0; i < numStars; i++) {
    let x = startX + (Math.random() - 0.5) * 100;
    let y = startY + (Math.random() - 0.5) * 100;
    stars.push({ x, y });
  }

  return {
    stars,
    alpha: 0, // Start invisible
    fadeSpeed: Math.random() * 0.01 + 0.005, // Slow fade in
  };
}

/** Update constellations, moving them down at a uniform speed */
function updateConstellations() {
  for (let i = CONSTELLATIONS.length - 1; i >= 0; i--) {
    let constellation = CONSTELLATIONS[i];
    if (constellation.alpha < 1) {
      constellation.alpha += constellation.fadeSpeed;
    }
    
    // Move all stars in the constellation downward
    for (let star of constellation.stars) {
      star.y += CONSTELLATION_SPEED;
    }
    
    // Remove constellations that move off the screen
    if (constellation.stars.every(star => star.y > h)) {
      CONSTELLATIONS.splice(i, 1);
    }
  }
}

/** Draw constellations as stars connected by lines */
function drawConstellations() {
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;

  for (let constellation of CONSTELLATIONS) {
    ctx.globalAlpha = constellation.alpha * 0.6; // Fade effect
    ctx.beginPath();
    for (let i = 0; i < constellation.stars.length - 1; i++) {
      let starA = constellation.stars[i];
      let starB = constellation.stars[i + 1];
      ctx.moveTo(starA.x, starA.y);
      ctx.lineTo(starB.x, starB.y);
    }
    ctx.stroke();

    // Draw individual stars in constellation
    ctx.fillStyle = "white";
    for (let star of constellation.stars) {
      ctx.globalAlpha = constellation.alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/*******************************************************
 * SHOOTING STARS
 *******************************************************/
/**
 * Create a new shooting star from a random (x,y) near top-left or top-right,
 * traveling diagonally.
 */


function spawnShootingStar() {
  const fromLeft = Math.random() < 0.5;
  const startX = fromLeft ? 0 : w;
  const startY = Math.random() * h * 0.5;

  const baseSpeedX = fromLeft ? Math.random() * 4 + 2 : -(Math.random() * 4 + 2);
  const baseSpeedY = Math.random() * 2 + 1;

  const numStars = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 2 : 1; // 30% chance of a cluster (2-4 stars)

  for (let i = 0; i < numStars; i++) {
    const offsetX = (Math.random() - 0.5) * 20; // Slight variation in spawn position
    const offsetY = (Math.random() - 0.5) * 20;
    const speedX = baseSpeedX * (0.9 + Math.random() * 0.2); // Small variation in speed
    const speedY = baseSpeedY * (0.9 + Math.random() * 0.2);

    SHOOTING_STARS.push({
      x: startX + offsetX,
      y: startY + offsetY,
      speedX: speedX,
      speedY: speedY,
      length: Math.random() * 120 + 80, // 80 to 200
      alpha: 1.0,
      fadeSpeed: Math.random() * 0.003 + 0.003 // 0.003 to 0.006
    });
  }
}


/** Update shooting star positions & remove them if off screen or faded */
function updateShootingStars() {
  for (let i = SHOOTING_STARS.length - 1; i >= 0; i--) {
    const star = SHOOTING_STARS[i];
    star.x += star.speedX;
    star.y += star.speedY;
    star.alpha -= star.fadeSpeed;

    if (
      star.x < -star.length ||
      star.x > w + star.length ||
      star.y > h + star.length ||
      star.alpha <= 0
    ) {
      SHOOTING_STARS.splice(i, 1);
    }
  }
}

/** Draw shooting stars with glowing trails */
function drawShootingStars() {
  for (let i = 0; i < SHOOTING_STARS.length; i++) {
    const s = SHOOTING_STARS[i];
    // Make the visible tail portion longer (0.1 -> 0.3 for example)
    const tailX = s.x - s.speedX * s.length * 0.3;
    const tailY = s.y - s.speedY * s.length * 0.3;

    const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    gradient.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  }
}

// Fiery meteors
let FIERY_METEORS = [];
let METEOR_PARTICLES = [];
let METEOR_SPAWN_CHANCE = 0.0005;
let METEOR_SPARKS = [];

function spawnFieryMeteor() {
  const fromLeft = Math.random() < 0.5;
  
  let startX, startY, speedX, speedY;
  
  if (fromLeft) {
    startX = -100; // Start off-screen on the left
    startY = Math.random() * h;
    speedX = Math.random() * 3 + 3; // Moving right
    speedY = (Math.random() - 0.5) * 4; // Random slight up/down movement
  } else {
    startX = w + 100; // Start off-screen on the right
    startY = Math.random() * h;
    speedX = -(Math.random() * 3 + 3); // Moving left
    speedY = (Math.random() - 0.5) * 4; // Random slight up/down movement
  }

  FIERY_METEORS.push({
    x: startX,
    y: startY,
    speedX: speedX,
    speedY: speedY,
    length: Math.random() * 100 + 150,
    alpha: 1.0,
    fadeSpeed: Math.random() * 0.004 + 0.003
  });
}


function updateFieryMeteors() {
  for (let i = FIERY_METEORS.length - 1; i >= 0; i--) {
    const m = FIERY_METEORS[i];

    m.x += m.speedX;
    m.y += m.speedY;
    m.alpha -= m.fadeSpeed;

    spawnMeteorSparks(m);

    if (m.alpha <= 0 || m.x < -200 || m.x > w + 200 || m.y > h + 200) {
      FIERY_METEORS.splice(i, 1);
    }
  }
}

function spawnMeteorSparks(meteor) {
  const sparkCount = Math.floor(Math.random() * 3 + 3);

  for (let i = 0; i < sparkCount; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 2 + 1;

    // Random spark colors: red, orange, yellow, and white
    const colors = ["rgba(255, 50, 50, 1)", "rgba(255, 100, 0, 1)", "rgba(255, 200, 50, 1)", "rgb(42, 42, 35)", "rgb(84, 84, 84)"];
    const sparkColor = colors[Math.floor(Math.random() * colors.length)];

    METEOR_SPARKS.push({
      x: meteor.x,
      y: meteor.y,
      vx: Math.cos(angle) * speed + meteor.speedX * 0.3, 
      vy: Math.sin(angle) * speed + meteor.speedY * 0.3, 
      alpha: 1,
      fadeSpeed: 0.02 + Math.random() * 0.02,
      size: Math.random() * 4 + 3,
      color: sparkColor
    });
  }
}

function updateMeteorSparks() {
  for (let i = METEOR_SPARKS.length - 1; i >= 0; i--) {
    const s = METEOR_SPARKS[i];

    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= s.fadeSpeed;

    if (s.alpha <= 0 || s.x < -100 || s.x > w + 100 || s.y < -100 || s.y > h + 100) {
      METEOR_SPARKS.splice(i, 1);
    }
  }
}

function drawMeteorSparks() {
  for (let i = 0; i < METEOR_SPARKS.length; i++) {
    const s = METEOR_SPARKS[i];

    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = s.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = s.color;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
}

function drawHeatDistortion(x, y, size) {
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "rgba(255,100,0,0.2)";
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}


function drawFieryMeteors() {
  for (let i = 0; i < FIERY_METEORS.length; i++) {
    const m = FIERY_METEORS[i];

    const tailX = m.x - m.speedX * m.length;
    const tailY = m.y - m.speedY * m.length;

    // Gradient tail from red → orange → yellow
    const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
    gradient.addColorStop(0, `rgba(255, 0, 0, ${m.alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 140, 0, ${m.alpha})`);
    gradient.addColorStop(1, `rgba(255, 255, 50, 0)`);

    for (let meteor of FIERY_METEORS) {
      drawHeatDistortion(meteor.x, meteor.y, 25);
    }
    

    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = "rgba(255, 150, 0, 0.9)";
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
    ctx.restore();

    // Solid brown meteor head
    ctx.save();
    ctx.globalAlpha = m.alpha;
    ctx.fillStyle = "rgb(110, 55, 30)";
    ctx.shadowBlur = 40;
    ctx.shadowColor = "rgba(90, 45, 25, 0.9)";
    ctx.beginPath();
    ctx.arc(m.x, m.y, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}


function animateStarfield() {
  ctx.clearRect(0, 0, w, h);

  updateStars();
  drawStars();

  if (Math.random() < SHOOTING_STAR_CHANCE) {
    spawnShootingStar();
  }
  updateShootingStars();
  drawShootingStars();

  if (Math.random() < METEOR_SPAWN_CHANCE) {
    spawnFieryMeteor();
  }
  updateFieryMeteors();
  drawFieryMeteors();

  updateMeteorSparks();
  drawMeteorSparks();

  updatePlanets();
  drawPlanets();

  if (Math.random() < CONSTELLATION_CHANCE) {
    CONSTELLATIONS.push(createConstellation());
  }
  updateConstellations();
  drawConstellations();

  requestAnimationFrame(animateStarfield);
}



/*******************************************************
 * DOMContentLoaded
 *******************************************************/
document.addEventListener("mousemove", (e) => {
  // Cursor sparkle effect
  const sparkle = document.createElement("div");
  sparkle.classList.add("cursor-sparkle");
  sparkle.style.left = e.pageX + "px";
  sparkle.style.top = e.pageY + "px";
  document.body.appendChild(sparkle);
  setTimeout(() => {
    sparkle.remove();
  }, 700);
});

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

document.addEventListener("DOMContentLoaded", () => {
  /*--------------------------------------
   | 1) STARFIELD BACKGROUND
   --------------------------------------*/
  canvas = document.getElementById("starsCanvas");
  if (canvas) {
    ctx = canvas.getContext("2d");
    resizeCanvas();
    initStars();
    initPlanets();
    animateStarfield();
    window.addEventListener("resize", () => {
      resizeCanvas();
      initStars();
    });
  }

  /*--------------------------------------
   | 2) SLIDESHOWS
   --------------------------------------*/
  const projectSlideshows = document.querySelectorAll(".project-slideshow");
  projectSlideshows.forEach((slideshow) => {
    const slides = slideshow.querySelectorAll(".slide");
    const prevButton = slideshow.querySelector(".prev-slide");
    const nextButton = slideshow.querySelector(".next-slide");
    let currentSlideIndex = 0;

    // Show the initial slide
    slides[currentSlideIndex].classList.add("active");

    // Helper function to update slides
    const updateSlides = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
    };

    // Event listeners for buttons
    prevButton.addEventListener("click", () => {
      currentSlideIndex =
        (currentSlideIndex - 1 + slides.length) % slides.length;
      updateSlides(currentSlideIndex);
    });

    nextButton.addEventListener("click", () => {
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      updateSlides(currentSlideIndex);
    });
  });

  /*--------------------------------------
   | 3) INTERSECTION OBSERVERS FOR CARDS
   --------------------------------------*/
  // 3A) Fade in .card-custom-* elements
  const cards = document.querySelectorAll(
    ".card-custom-education, .card-custom-experience, .card-custom-skills, .card-custom-picture, .card-custom-travel"
  );
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("card-visible");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  cards.forEach((card) => {
    cardObserver.observe(card);
  });

  // 3B) Fade in .project-card elements
  const projectCards = document.querySelectorAll(".project-card");
  const projectObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          projectObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  projectCards.forEach((card) => {
    projectObserver.observe(card);
  });

  // 3C) Fade in the contact card
  const contactCard = document.querySelector(".card-custom-contact");
  if (contactCard) {
    const contactObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          contactCard.classList.add("visible");
          contactObserver.unobserve(contactCard);
        }
      },
      { threshold: 0.1 }
    );
    contactObserver.observe(contactCard);
  }

  /*--------------------------------------
   | 4) TRAVEL VIDEOS - Play on hover
   --------------------------------------*/
  const travelVideos = document.querySelectorAll("#Travel video");
  travelVideos.forEach((video) => {
    // Pause initially
    video.pause();

    // Play on mouse enter
    video.addEventListener("mouseenter", () => {
      video.play();
    });

    // Pause on mouse leave
    video.addEventListener("mouseleave", () => {
      video.pause();
      // video.currentTime = 0; // Uncomment if you want to reset to start
    });
  });
});



if (!isMobileDevice()) {
  // Only run guardian code if NOT mobile
  const guardEl = document.getElementById('guard');

  // Mouse and guard positions
  let mouseX = 0, mouseY = 0;
  let guardX = 200, guardY = 200; // Initial guard position
  
  // The no-go radius: guard will never get within this distance of the cursor
  const MIN_DISTANCE = 50;
  
  // Rotation angle in degrees for the guard
  let rotationAngle = 0;
  
  // Capture mouse coordinates on move
  document.addEventListener('mousemove', (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  document.addEventListener("DOMContentLoaded", () => {
    const targetText = "Heath Kavanagh";  // Final text
    const letters = "⏃⏚☊⎅⟒⎎☌⊑⟟⟊☍⌰⋔⋏⍜⌿⍾⍀⌇⏁⎍⎐⍙⌖⊬⋉";
    const nameElement = document.getElementById("nameTitle");

    let iteration = 0;
    let totalScrambleTime = targetText.length * 6; // Increase for a longer effect

    let scrambleInterval = setInterval(() => {
        nameElement.innerText = targetText
            .split("")
            .map((letter, index) => {
                // Delay correct letters appearing
                if (iteration > totalScrambleTime - targetText.length + index) {
                    return targetText[index]; // Show correct letter
                }
                return letters[Math.floor(Math.random() * letters.length)]; // Scramble
            })
            .join("");

        if (iteration >= totalScrambleTime) {
            clearInterval(scrambleInterval); // Stop animation when complete
        }
        iteration += 1;
    }, 75); // Adjust speed of scrambling (lower = faster changes)
});
  
//  function animateGuard() {
    requestAnimationFrame(animateGuard);
    
    // Calculate distance from guard to the mouse
    const dx = mouseX - guardX;
    const dy = mouseY - guardY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If guard is farther than MIN_DISTANCE, move closer (but stop at MIN_DISTANCE)
    if (distance > MIN_DISTANCE) {
      const speed = 2;
      const distBeyondRadius = distance - MIN_DISTANCE;
      const moveStep = Math.min(distBeyondRadius, speed);
      const ratio = moveStep / distance;
      guardX += dx * ratio;
      guardY += dy * ratio;
    }
    
    // Constantly rotate clockwise
    rotationAngle += 2;
    
    // Update the guard's position and rotation
    guardEl.style.left = guardX + 'px';
    guardEl.style.top = guardY + 'px';
    guardEl.style.transform = `rotate(${rotationAngle}deg)`;
//  }
  
  // Start the loop
//  animateGuard();
//} else {
  // If on mobile, remove/hide the guardian element
//  const guardEl = document.getElementById('guard');
//  if (guardEl) {
 //   guardEl.remove(); // Or guardEl.style.display = 'none';
//  }

}


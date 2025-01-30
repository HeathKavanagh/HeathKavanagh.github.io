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
  const colors = ["white", "lightblue", "white", "white", "white"];
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

  // Speed remains the same
  const speedX = fromLeft ? Math.random() * 4 + 2 : -(Math.random() * 4 + 2);
  const speedY = Math.random() * 2 + 1;

  // Larger length range, slower fade speed
  SHOOTING_STARS.push({
    x: startX,
    y: startY,
    speedX: speedX,
    speedY: speedY,
    length: Math.random() * 120 + 80, // 80 to 200
    alpha: 1.0,
    fadeSpeed: Math.random() * 0.003 + 0.003 // 0.003 to 0.006
  });
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

/** Main animation loop */
function animateStarfield() {
  ctx.clearRect(0, 0, w, h);

  updateStars();
  drawStars();

  if (Math.random() < SHOOTING_STAR_CHANCE) {
    spawnShootingStar();
  }

  updateShootingStars();
  drawShootingStars();

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

document.addEventListener("DOMContentLoaded", () => {
  /*--------------------------------------
   | 1) STARFIELD BACKGROUND
   --------------------------------------*/
  canvas = document.getElementById("starsCanvas");
  if (canvas) {
    ctx = canvas.getContext("2d");
    resizeCanvas();
    initStars();
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


const guardEl = document.getElementById('guard');
    
    // Mouse and guard positions
    let mouseX = 0, mouseY = 0;
    let guardX = 200, guardY = 200; // Initial guard position (arbitrary)
    
    // The no-go radius: guard will never get within this distance of the cursor
    const MIN_DISTANCE = 50; 
    
    // Rotation angle in degrees for the guard
    let rotationAngle = 0;
    
    // Capture mouse coordinates on move
    document.addEventListener('mousemove', (e) => {
      mouseX = e.pageX;
      mouseY = e.pageY;
    });
    
    function animateGuard() {
      requestAnimationFrame(animateGuard);
      
      // Calculate distance from guard to the mouse
      const dx = mouseX - guardX;
      const dy = mouseY - guardY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If guard is farther than MIN_DISTANCE, it moves closer
      // (but stops exactly at MIN_DISTANCE from the cursor).
      if (distance > MIN_DISTANCE) {
        // Move speed per frame (adjust to taste)
        const speed = 2;
        
        // How far the guard needs to move to get to exactly MIN_DISTANCE
        const distBeyondRadius = distance - MIN_DISTANCE;
        
        // If we can't close the entire gap in one frame, move by `speed` only
        const moveStep = Math.min(distBeyondRadius, speed);
        
        // Move guard along the line from guard -> mouse
        const ratio = moveStep / distance;
        guardX += dx * ratio;
        guardY += dy * ratio;
      }
      // Otherwise (distance <= MIN_DISTANCE), guard stays put.
      
      // Constantly rotate clockwise
      rotationAngle += 5; // degrees per frame (adjust for faster/slower spin)
      
      // Update the guard's position and rotation
      guardEl.style.left = guardX + 'px';
      guardEl.style.top = guardY + 'px';
      guardEl.style.transform = `rotate(${rotationAngle}deg)`;
    }
    
    // Start the loop
    animateGuard();
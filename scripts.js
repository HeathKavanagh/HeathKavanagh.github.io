document.addEventListener("DOMContentLoaded", () => {
    // Select all project slideshows
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
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length; // Go to previous slide
        updateSlides(currentSlideIndex);
      });
  
      nextButton.addEventListener("click", () => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length; // Go to next slide
        updateSlides(currentSlideIndex);
      });
    });
  });
  


  document.addEventListener('DOMContentLoaded', function () {
    // Select all cards
    const cards = document.querySelectorAll('.card-custom-education, .card-custom-experience, .card-custom-skills, .card-custom-picture, .card-custom-travel');

    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-visible'); // Add the fade-in class when the card is in view
                observer.unobserve(entry.target); // Stop observing after the card has appeared
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is in view
    });

    // Observe each card
    cards.forEach(card => {
        observer.observe(card);
    });
});


document.addEventListener("DOMContentLoaded", function () {
  // Select all project cards
  const projectCards = document.querySelectorAll(".project-card");

  // Intersection Observer callback
  const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              // Add the in-view class when the card enters the viewport
              entry.target.classList.add("in-view");
              observer.unobserve(entry.target); // Stop observing once in view
          }
      });
  }, {
      threshold: 0.5 // Trigger the animation when 50% of the element is in view
  });

  // Start observing each project card
  projectCards.forEach(card => {
      observer.observe(card);
  });
});

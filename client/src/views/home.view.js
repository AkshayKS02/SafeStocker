import { log } from "../utils/logger.js"; 

export function initHomeCarousel() {
    // We select the images directly here 
    const slides = document.querySelectorAll(".hero-image");
    
    if (slides.length > 1) {
        let currentSlide = 0;
        
        setInterval(() => {
            // 1. Hide current slide (Fades out via CSS)
            slides[currentSlide].classList.remove("active");
            
            // 2. Calculate next slide index
            currentSlide = (currentSlide + 1) % slides.length;
            
            // 3. Show next slide (Fades in via CSS)
            slides[currentSlide].classList.add("active");
        }, 5000); // Changes every 5 seconds
        
        log("Hero carousel started", "success");
    } else {
        log("Hero carousel: Not enough images found", "warn");
    }
}
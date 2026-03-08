document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, Flip);

    // 1. Locomotive Scroll Initialization
    const scroller = new LocomotiveScroll({
        el: document.querySelector("[data-scroll-container]"),
        smooth: true,
        multiplier: 1, // luxury, weighted smooth-scrolling experience
        class: 'is-appear'
    });

    scroller.on("scroll", ScrollTrigger.update);

    // Tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element since Locomotive Scroll is hijacking things
    ScrollTrigger.scrollerProxy("[data-scroll-container]", {
        scrollTop(value) {
            return arguments.length ? scroller.scrollTo(value, 0, 0) : scroller.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
        pinType: document.querySelector("[data-scroll-container]").style.transform ? "transform" : "fixed"
    });

    // Each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
    ScrollTrigger.addEventListener("refresh", () => scroller.update());
    ScrollTrigger.refresh();


    // 2. Zone 1: Staggered Character Reveal using GSAP
    const splitTextReveal = () => {
        document.querySelectorAll('.hero-text .line').forEach((line, index) => {
            const text = line.innerText;
            line.innerHTML = ''; // clear
            
            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.innerText = char === ' ' ? '\u00A0' : char;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = 'translateY(30px)';
                line.appendChild(span);
            });

            gsap.to(line.querySelectorAll('span'), {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.02,
                ease: "power3.out",
                delay: 0.2 + (index * 0.3),
                force3D: true
            });
        });

        // Fade in subtext
        gsap.to('.sub-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 1.2,
            ease: "power2.out",
            force3D: true
        });
    };
    
    // Slight delay to ensure fonts/layout are loaded.
    setTimeout(splitTextReveal, 300);


    // 3. Cinematic Video Scroll Scrubs (Tropical Island)
    const bgVideo = document.getElementById('bg-video');
    
    if (bgVideo) {
        // Wait for video metadata to load so we know the duration
        bgVideo.addEventListener('loadedmetadata', () => {
            const videoDuration = bgVideo.duration;

            ScrollTrigger.create({
                trigger: "#main-container",
                scroller: "[data-scroll-container]",
                start: "top top",
                end: "bottom bottom",
                scrub: true,
                onUpdate: (self) => {
                    // Map scroll progress (0 to 1) to video duration
                    if (videoDuration && !isNaN(videoDuration)) {
                        requestAnimationFrame(() => {
                            bgVideo.currentTime = videoDuration * self.progress;
                        });
                    }
                }
            });
        });
        
        // Fallback or force metadata load
        bgVideo.load();
    }


    // 4. Ghost Cards CSS scan-line effect trigger via GSAP (Optional intersection enhancement)
    gsap.utils.toArray('.ghost-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                scroller: "[data-scroll-container]",
                start: "top 80%",
            },
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out",
            force3D: true
        });
    });


    // 5. Card 1: GSAP Flip for Python Cards
    const subCards = document.querySelectorAll('.sub-card');
    
    // Add CSS rule dynamically for the expanded state within the flex container
    const style = document.createElement('style');
    style.innerHTML = `
        .sub-card.is-expanded {
            min-width: 350px !important;
            background: rgba(79, 142, 247, 0.1) !important;
            border-color: var(--accent-azure) !important;
        }
        .expanded-details {
            display: none;
            margin-top: 10px;
            font-size: 0.9rem;
            color: var(--text-muted);
            line-height: 1.5;
        }
        .sub-card.is-expanded .expanded-details {
            display: block;
        }
    `;
    document.head.appendChild(style);

    // Inject details container into each card for testing
    subCards.forEach((card, i) => {
        const details = document.createElement('div');
        details.className = 'expanded-details';
        details.innerText = "Here is a detailed breakdown of the logic used in this project, showcasing database integration and robust error handling.";
        card.insertBefore(details, card.querySelector('.expand-btn'));

        const btn = card.querySelector('.expand-btn');
        btn.addEventListener('click', () => {
            // Get initial state
            const state = Flip.getState(subCards);

            // Toggle expansion
            const isExpanded = card.classList.toggle('is-expanded');
            btn.innerText = isExpanded ? "Close" : "View Details";

            // Recalculate horizontal scroll container layout implicitly because of Flip
            Flip.from(state, {
                duration: 0.6,
                ease: "power2.inOut",
                absolute: false, // let flex handle layout
                onComplete: () => {
                    scroller.update(); // Update locomotive scroll bounds when layout changes
                }
            });
        });
    });


    // 6. Contact Form Magnetic Hover & Submit Animation
    const magneticBtn = document.querySelector('.magnetic-btn');
    if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', (e) => {
            const bounds = magneticBtn.getBoundingClientRect();
            // Need mouse position relative to viewport due to fixed/scroller quirks, clientX is viewport
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            const x = (mouseX - bounds.width / 2) * 0.4;
            const y = (mouseY - bounds.height / 2) * 0.4;
            
            gsap.to(magneticBtn, {
                x: x,
                y: y,
                duration: 0.5,
                ease: "power2.out",
                force3D: true
            });
        });

        magneticBtn.addEventListener('mouseleave', () => {
            gsap.to(magneticBtn, {
                x: 0,
                y: 0,
                duration: 0.9,
                ease: "elastic.out(1, 0.3)",
                force3D: true
            });
        });
    }

    // Submit Simulation (Particle dissolve logic minimal implementation)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btnText = magneticBtn.querySelector('.btn-text');
            const successMsg = document.querySelector('.success-message');
            
            // Dissolve effect using GSAP opacity & scale
            gsap.to(magneticBtn, {
                scale: 0.5,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in",
                onComplete: () => {
                    magneticBtn.style.display = 'none';
                    successMsg.style.display = 'block';
                    gsap.fromTo(successMsg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
                    scroller.update();
                }
            });
        });
    }

});

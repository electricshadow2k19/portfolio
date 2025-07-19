// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Artifact Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const artifactCards = document.querySelectorAll('.artifact-card');

    if (filterButtons.length > 0 && artifactCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Filter artifacts
                artifactCards.forEach(card => {
                    const categories = card.getAttribute('data-category').split(' ');
                    
                    if (filter === 'all' || categories.includes(filter)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease-in';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = '#fff';
                navbar.style.backdropFilter = 'none';
            }
        }
    });

    // Add loading animation to cards
    const cards = document.querySelectorAll('.link-card, .artifact-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-on-scroll');
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.link-card, .artifact-card, .bio-card, .artifact-section').forEach(el => {
        observer.observe(el);
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideInFromLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }

    .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .link-card:nth-child(odd) {
        animation: slideInFromLeft 0.6s ease forwards;
    }

    .link-card:nth-child(even) {
        animation: slideInFromRight 0.6s ease forwards;
    }

    .artifact-card {
        animation: fadeIn 0.6s ease forwards;
    }

    /* Hover effects */
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .link-card:hover,
    .artifact-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    /* Loading states */
    .loading {
        opacity: 0.7;
        pointer-events: none;
    }

    /* Focus states for accessibility */
    .btn:focus,
    .nav-link:focus,
    .filter-btn:focus {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
    }

    /* Print styles */
    @media print {
        .navbar,
        .footer,
        .hero-buttons,
        .artifact-links,
        .project-links {
            display: none !important;
        }

        .hero {
            background: white !important;
            color: black !important;
        }

        .page-header {
            background: white !important;
            color: black !important;
        }
    }
`;
document.head.appendChild(style);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(function() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
}, 250));

// Add error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.style.display = 'none';
        console.warn('Image failed to load:', e.target.src);
    }
}, true);

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
});

// Performance optimization: Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Chatbot iframe handling
document.addEventListener('DOMContentLoaded', function() {
    const chatbotIframe = document.querySelector('.chatbot-container iframe');
    
    if (chatbotIframe) {
        // Add loading state for chatbot
        const chatbotContainer = document.querySelector('.chatbot-container');
        const originalContent = chatbotContainer.innerHTML;
        
        // Show loading state
        chatbotContainer.innerHTML = `
            <div class="presentation-fallback">
                <h4><i class="fas fa-spinner fa-spin"></i> Loading Chatbot...</h4>
                <p>Please wait while the chatbot loads. This may take a few moments.</p>
            </div>
        `;

        // Check if iframe loads successfully
        chatbotIframe.onload = function() {
            // Iframe loaded successfully, restore original content
            chatbotContainer.innerHTML = originalContent;
        };

        chatbotIframe.onerror = function() {
            // Iframe failed to load, show fallback
            chatbotContainer.innerHTML = `
                <div class="presentation-fallback">
                    <h4><i class="fas fa-exclamation-triangle"></i> Chatbot Not Available</h4>
                    <p>The chatbot couldn't be loaded directly. Please use the link below to access it.</p>
                    <div class="chatbot-options">
                        <a href="https://college-assistant-chatbot.vercel.app/" target="_blank" class="btn btn-primary">
                            <i class="fas fa-external-link-alt"></i> Open Chatbot
                        </a>
                    </div>
                </div>
            `;
        };

        // Set a timeout to restore original content if loading takes too long
        setTimeout(function() {
            if (chatbotContainer.querySelector('.presentation-fallback')) {
                // Still showing loading, restore original iframe
                chatbotContainer.innerHTML = originalContent;
            }
        }, 5000);
    }
}); 
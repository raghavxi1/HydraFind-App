// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            } else {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            }
        });
    }

    // Animate skill bars on page load (Skills page)
    const skillBars = document.querySelectorAll('.skill-progress');
    if (skillBars.length > 0) {
        // Add intersection observer for skill bars
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progress = entry.target.dataset.progress;
                    entry.target.style.width = progress + '%';
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.1
        });

        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    }

    // Project filtering (Projects page)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    if (filterBtns.length > 0 && projectItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                const filter = this.dataset.filter;

                projectItems.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                        item.classList.remove('hidden');
                    } else {
                        const categories = item.dataset.category.split(' ');
                        if (categories.includes(filter)) {
                            item.style.display = 'block';
                            item.classList.remove('hidden');
                        } else {
                            item.style.display = 'none';
                            item.classList.add('hidden');
                        }
                    }
                });
            });
        });
    }

    // FAQ accordion (Contact page)
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', function() {
                // Close other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
            });
        });
    }

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });

            // Show loading state
            const submitBtn = this.querySelector('.form-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual submission logic)
            setTimeout(() => {
                // Reset form
                this.reset();
                
                // Show success message
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
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

    // Add animation classes on scroll
    const animateElements = document.querySelectorAll('.highlight-card, .project-card, .skill-card, .value-card, .stat-card, .certification-card, .interest-card, .social-card');
    
    if (animateElements.length > 0) {
        const animateObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.1
        });

        animateElements.forEach(element => {
            animateObserver.observe(element);
        });
    }

    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Typing effect for hero title (if needed)
    const heroTitle = document.querySelector('.hero-title .highlight');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let index = 0;

        function typeWriter() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            }
        }

        // Start typing effect after a short delay
        setTimeout(typeWriter, 1000);
    }
});

// Project modal functionality
const projectModals = {
    'hydrafind': {
        title: 'HydraFind - Free Water Locator',
        image: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
        description: 'HydraFind is a community-focused web application designed to help people locate free water sources in their area. Built with Python Flask and featuring real-time geo-location integration, the app serves as a vital resource for communities, travelers, and those in need of accessible water sources.',
        tech: ['Python', 'Flask', 'HTML/CSS', 'JavaScript', 'Maps API', 'MySQL'],
        features: [
            'Real-time geo-location integration for accurate water source mapping',
            'Community-driven database of free water locations',
            'Interactive map interface with search and filter capabilities',
            'User authentication and contribution system',
            'Mobile-responsive design for on-the-go access',
            'Rating and review system for water source quality'
        ],
        github: '#',
        demo: '#'
    },
    'inclusive-learning': {
        title: 'Inclusive Learning Tool for Visually Impaired',
        image: 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg',
        description: 'An accessibility-focused Flask application that breaks down barriers to education for visually impaired students. The tool provides seamless text-to-audio conversion and innovative text-to-Braille translation using custom algorithms, making educational content more accessible.',
        tech: ['Python', 'Flask', 'Text-to-Speech', 'Braille Conversion', 'Accessibility APIs', 'Custom Algorithms'],
        features: [
            'Advanced text-to-speech conversion with natural voice synthesis',
            'Custom text-to-Braille conversion algorithm',
            'Support for multiple document formats (PDF, DOCX, TXT)',
            'Adjustable reading speed and voice selection',
            'Keyboard navigation and screen reader compatibility',
            'Educational content library with categorized resources'
        ],
        github: '#',
        demo: '#'
    },
    'resume-tools': {
        title: 'Resume Crafter & Resume Analyzer',
        image: 'https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg',
        description: 'A comprehensive dual-purpose application combining resume creation and AI-powered analysis. The Resume Crafter uses Flask and Jinja templating for dynamic resume generation, while the Resume Analyzer leverages FastAPI and Gemini Vision Pro API for intelligent feedback and scoring.',
        tech: ['Flask', 'FastAPI', 'Jinja2', 'Gemini API', 'AI Analysis', 'PDF Generation'],
        features: [
            'Dynamic resume creation with professional templates',
            'AI-powered resume analysis using Gemini Vision Pro',
            'Automated feedback on content, formatting, and structure',
            'ATS (Applicant Tracking System) compatibility scoring',
            'Industry-specific recommendations and improvements',
            'Export options in multiple formats (PDF, DOCX, HTML)'
        ],
        github: '#',
        demo: '#'
    },
    'interview-coach': {
        title: 'Smart IT Interview Coach',
        image: 'https://images.pexels.com/photos/8439093/pexels-photo-8439093.jpeg',
        description: 'An AI-powered mock interview platform designed specifically for IT professionals. Using LangChain and OpenAI API, the system provides personalized technical interview preparation with adaptive difficulty scoring and resume-based question generation.',
        tech: ['LangChain', 'OpenAI API', 'Flask', 'NLP', 'Interview AI', 'Machine Learning'],
        features: [
            'Resume-based personalized question generation',
            'Real-time interview simulation with voice interaction',
            'Adaptive difficulty adjustment based on user performance',
            'Comprehensive performance analytics and feedback',
            'Technical and behavioral question categories',
            'Progress tracking and improvement recommendations'
        ],
        github: '#',
        demo: '#'
    },
    'carbon-calculator': {
        title: 'Carbon Footprint Calculator',
        image: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg',
        description: 'An environmental impact tracking web application that helps users monitor and reduce their carbon footprint. Features personalized carbon scoring, community leaderboards, and comprehensive analytics dashboards to promote environmental consciousness.',
        tech: ['Python', 'Flask', 'Data Visualization', 'Charts.js', 'MySQL', 'Environmental APIs'],
        features: [
            'Comprehensive carbon footprint calculation across multiple categories',
            'Interactive data visualization and trend analysis',
            'Community leaderboard and social comparison features',
            'Personalized recommendations for carbon reduction',
            'Historical data tracking and progress monitoring',
            'Integration with environmental impact databases'
        ],
        github: '#',
        demo: '#'
    },
    'home-automation': {
        title: 'Home Automation using IoT',
        image: 'https://images.pexels.com/photos/4254157/pexels-photo-4254157.jpeg',
        description: 'A comprehensive IoT-based home automation system combining hardware and software components. Features Arduino-based device control with a Python interface for monitoring and dashboard visualization, enabling smart home functionality.',
        tech: ['Arduino', 'C Language', 'Python', 'IoT Sensors', 'Dashboard', 'Wireless Communication'],
        features: [
            'Multiple sensor integration (temperature, humidity, motion, light)',
            'Remote device control via web and mobile interfaces',
            'Real-time monitoring and alerting system',
            'Energy consumption tracking and optimization',
            'Automated scheduling and scene management',
            'Voice control integration and mobile app connectivity'
        ],
        github: '#',
        demo: '#'
    },
    'football-ai': {
        title: 'AI Football Shorts Automation',
        image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
        description: 'An innovative automated video generation system that creates football highlight reels using AI-driven analysis. Combines Python video processing with sports data analytics to generate engaging short-form content automatically.',
        tech: ['Python', 'Video Processing', 'AI Automation', 'Data Scraping', 'Sports Analytics', 'Computer Vision'],
        features: [
            'Automated highlight detection using computer vision',
            'Real-time sports data scraping and analysis',
            'Dynamic video editing and compilation',
            'Player statistics integration and visualization',
            'Social media optimized output formats',
            'Customizable highlight criteria and team focus'
        ],
        github: '#',
        demo: '#'
    },
    'publications-ai': {
        title: 'Publications Summary Generator',
        image: 'https://images.pexels.com/photos/159581/dictionary-reference-book-learning-meaning-159581.jpeg',
        description: 'A Smart India Hackathon 2025 project that revolutionizes academic profile management through AI-powered publication analysis. The Flask-based system automatically generates comprehensive faculty profiles by analyzing research publications and academic contributions.',
        tech: ['Flask', 'NLP', 'Text Analysis', 'AI Summarization', 'Academic Data APIs', 'Research Analytics'],
        features: [
            'Automated academic publication discovery and analysis',
            'Intelligent text summarization for research abstracts',
            'Citation network analysis and impact scoring',
            'Faculty profile generation with research insights',
            'Multi-database integration for comprehensive coverage',
            'Export functionality for institutional use'
        ],
        github: '#',
        demo: '#'
    }
};

function openProjectModal(projectId) {
    const modal = document.getElementById('modalOverlay');
    const project = projectModals[projectId];
    
    if (modal && project) {
        // Populate modal content
        document.getElementById('modalTitle').textContent = project.title;
        document.getElementById('modalImage').src = project.image;
        document.getElementById('modalDescription').textContent = project.description;
        
        // Populate tech tags
        const techContainer = document.getElementById('modalTechTags');
        techContainer.innerHTML = '';
        project.tech.forEach(tech => {
            const tag = document.createElement('span');
            tag.className = 'tech-tag';
            tag.textContent = tech;
            techContainer.appendChild(tag);
        });
        
        // Populate features
        const featuresList = document.getElementById('modalFeatures');
        featuresList.innerHTML = '';
        project.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
        
        // Set links
        document.getElementById('modalGithub').href = project.github;
        document.getElementById('modalDemo').href = project.demo;
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeProjectModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking overlay
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeProjectModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background-color 0.2s;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

document.head.appendChild(notificationStyles);

// Performance optimization: Lazy loading for images
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Console welcome message
console.log(`
🚀 Welcome to Raghav Siddharth's Portfolio!
📧 Contact: raghav.siddharth@example.com
🔗 GitHub: https://github.com/raghav-siddharth
💼 LinkedIn: https://linkedin.com/in/raghav-siddharth

Built with love using HTML, CSS, and JavaScript.
Interested in collaborating? Let's connect!
`);
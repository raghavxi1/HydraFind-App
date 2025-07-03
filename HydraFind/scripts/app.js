// scripts/app.js

// Wait for the DOM to fully load before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("HydraFind website is ready!");

    // Select buttons by their IDs
    const learnMoreBtn = document.getElementById("learn-more");
    const findWaterBtn = document.getElementById("find-water");
    const geoLocationBtn = document.getElementById("geo-location");
    const ecoFriendlyTipsBtn = document.getElementById("eco-friendly-tips");
    const contactUsBtn = document.getElementById("contact-us");
    const premiumFeaturesBtn = document.getElementById("premium-features");

    // Add event listeners for each button
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener("click", () => {
            alert("Learn more about HydraFind's mission and features!");
        });
    }

    if (findWaterBtn) {
        findWaterBtn.addEventListener("click", () => {
            alert("Locating the nearest free water source...");
            // Simulated geolocation functionality
            console.log("Geo-location activated. Searching for nearby water sources...");
        });
    }

    if (geoLocationBtn) {
        geoLocationBtn.addEventListener("click", () => {
            alert("Geo-location enabled! We can now find water sources near you.");
        });
    }

    if (ecoFriendlyTipsBtn) {
        ecoFriendlyTipsBtn.addEventListener("click", () => {
            alert("Tip: Carry a reusable bottle to save money and reduce plastic waste!");
        });
    }

    if (contactUsBtn) {
        contactUsBtn.addEventListener("click", () => {
            alert("Redirecting to the contact page...");
            // Replace with navigation logic when contact page is built
        });
    }

    if (premiumFeaturesBtn) {
        premiumFeaturesBtn.addEventListener("click", () => {
            alert("Explore premium features like offline maps and advanced filters!");
        });
    }
});
// scripts/app.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("HydraFind website is ready!");

    // Modal Elements
    const learnMoreModal = document.getElementById("learn-more-modal");
    const premiumFeaturesModal = document.getElementById("premium-features-modal");

    const learnMoreBtn = document.getElementById("learn-more");
    const premiumFeaturesBtn = document.getElementById("premium-features");

    const closeLearnMore = document.getElementById("close-learn-more");
    const closePremiumFeatures = document.getElementById("close-premium-features");

    // Show Modals
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener("click", () => {
            learnMoreModal.style.display = "flex";
        });
    }

    if (premiumFeaturesBtn) {
        premiumFeaturesBtn.addEventListener("click", () => {
            premiumFeaturesModal.style.display = "flex";
        });
    }

    // Close Modals
    if (closeLearnMore) {
        closeLearnMore.addEventListener("click", () => {
            learnMoreModal.style.display = "none";
        });
    }

    if (closePremiumFeatures) {
        closePremiumFeatures.addEventListener("click", () => {
            premiumFeaturesModal.style.display = "none";
        });
    }

    // Close Modal on Outside Click
    window.addEventListener("click", (event) => {
        if (event.target === learnMoreModal) {
            learnMoreModal.style.display = "none";
        } else if (event.target === premiumFeaturesModal) {
            premiumFeaturesModal.style.display = "none";
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const radiusSlider = document.getElementById('radius-slider');
    const radiusValue = document.getElementById('radius-value');
    const locationForm = document.getElementById('location-form');

    // Update radius value display in real-time
    radiusSlider.addEventListener('input', () => {
        radiusValue.textContent = radiusSlider.value;
    });

    // Handle form submission
    locationForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page refresh
        const location = document.getElementById('location-input').value;
        const resourceType = document.getElementById('resource-type').value;
        const radius = radiusSlider.value;

        console.log(`Location: ${location}, Resource Type: ${resourceType}, Radius: ${radius} Km`);
        alert(`Searching for ${resourceType} within ${radius} Km of ${location}.`);
        // Add functionality to fetch and display results here
    });
});

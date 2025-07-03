// Global variables
let map;
let userLocation = null;
let resources = [];
let markers = [];
let isAddingResource = false;

// Custom icons for different resource types
const icons = {
    water: '💧',
    washroom: '🚻',
    user: '📍'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadResources();
    setupEventListeners();
    requestLocation();
});

// Initialize Leaflet map
function initializeMap() {
    // Default to New York City
    map = L.map('map').setView([40.7128, -74.0060], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add click event for adding resources
    map.on('click', function(e) {
        if (isAddingResource) {
            document.getElementById('resourceLat').value = e.latlng.lat.toFixed(6);
            document.getElementById('resourceLng').value = e.latlng.lng.toFixed(6);
            showToast('Location selected! Coordinates updated in the form.', 'success');
        }
    });
}

// Request user's current location
function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Center map on user location
                map.setView([userLocation.lat, userLocation.lng], 15);
                
                // Add user location marker
                const userMarker = L.marker([userLocation.lat, userLocation.lng])
                    .addTo(map)
                    .bindPopup(`
                        <div class="custom-popup">
                            <h4>${icons.user} Your Location</h4>
                            <p>You are here!</p>
                        </div>
                    `);
                
                showToast('Location found! Map centered on your position.', 'success');
            },
            function(error) {
                console.error('Geolocation error:', error);
                showToast('Could not get your location. Using default location.', 'warning');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    } else {
        showToast('Geolocation is not supported by this browser.', 'error');
    }
}

// Load resources from the API
async function loadResources() {
    showLoading(true);
    
    try {
        const response = await fetch('/api/resources');
        if (!response.ok) throw new Error('Failed to load resources');
        
        resources = await response.json();
        displayResourcesOnMap();
        displayResourcesList();
        
        showToast(`Loaded ${resources.length} resources successfully!`, 'success');
    } catch (error) {
        console.error('Error loading resources:', error);
        showToast('Failed to load resources. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Display resources on the map
function displayResourcesOnMap() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const waterVisible = document.getElementById('waterToggle').checked;
    const washroomVisible = document.getElementById('washroomToggle').checked;

    resources.forEach(resource => {
        // Check if resource type should be visible
        if ((resource.resource_type === 'water' && !waterVisible) ||
            (resource.resource_type === 'washroom' && !washroomVisible)) {
            return;
        }

        // Create custom icon
        const iconHtml = `
            <div style="
                background: ${resource.resource_type === 'water' ? '#3b82f6' : '#8b5cf6'};
                color: white;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                ${resource.is_verified ? 'border-color: #10b981;' : ''}
            ">
                ${icons[resource.resource_type]}
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        // Create marker
        const marker = L.marker([resource.latitude, resource.longitude], {
            icon: customIcon
        }).addTo(map);

        // Create popup content
        const popupContent = `
            <div class="custom-popup">
                <h4>${icons[resource.resource_type]} ${resource.name}</h4>
                ${resource.is_verified ? '<span class="verified-badge">✅ Verified</span>' : ''}
                <p>${resource.description || 'No description available'}</p>
                ${resource.address ? `<p><i class="fas fa-map-marker-alt"></i> ${resource.address}</p>` : ''}
                <div class="popup-rating">
                    ${generateStars(resource.rating)} (${resource.total_ratings} reviews)
                </div>
                <div class="popup-actions">
                    <button class="btn btn-small btn-primary" onclick="getDirections(${resource.latitude}, ${resource.longitude})">
                        <i class="fas fa-directions"></i> Directions
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="showResourceDetail(${resource.id})">
                        <i class="fas fa-info"></i> Details
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
    });
}

// Display resources in the list
function displayResourcesList() {
    const resourceList = document.getElementById('resourceList');
    const waterVisible = document.getElementById('waterToggle').checked;
    const washroomVisible = document.getElementById('washroomToggle').checked;

    // Filter resources based on toggles
    const filteredResources = resources.filter(resource => {
        if (resource.resource_type === 'water' && !waterVisible) return false;
        if (resource.resource_type === 'washroom' && !washroomVisible) return false;
        return true;
    });

    // Sort by distance if user location is available
    if (userLocation) {
        filteredResources.sort((a, b) => {
            const distA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
            const distB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
            return distA - distB;
        });
    }

    resourceList.innerHTML = '';

    if (filteredResources.length === 0) {
        resourceList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #64748b;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No resources found matching your criteria.</p>
                <button class="btn btn-primary" onclick="openModal('addResourceModal')">
                    <i class="fas fa-plus"></i> Add the first resource
                </button>
            </div>
        `;
        return;
    }

    filteredResources.forEach(resource => {
        const distance = userLocation ? 
            calculateDistance(userLocation.lat, userLocation.lng, resource.latitude, resource.longitude) : null;

        const resourceCard = document.createElement('div');
        resourceCard.className = `resource-card ${resource.resource_type}`;
        resourceCard.onclick = () => showResourceDetail(resource.id);

        resourceCard.innerHTML = `
            <div class="resource-header">
                <span class="resource-icon">${icons[resource.resource_type]}</span>
                <span class="resource-title">${resource.name}</span>
                ${resource.is_verified ? '<span class="verified-badge">✅ Verified</span>' : ''}
            </div>
            <div class="resource-description">
                ${resource.description || 'No description available'}
            </div>
            ${resource.address ? `
                <div class="resource-address">
                    <i class="fas fa-map-marker-alt"></i>
                    ${resource.address}
                </div>
            ` : ''}
            ${distance ? `
                <div class="resource-address">
                    <i class="fas fa-route"></i>
                    ${distance.toFixed(1)} km away
                </div>
            ` : ''}
            <div class="resource-rating">
                <div class="stars">${generateStars(resource.rating)}</div>
                <span class="rating-text">(${resource.total_ratings} reviews)</span>
            </div>
            <div class="resource-actions">
                <button class="btn-icon btn-directions" onclick="event.stopPropagation(); getDirections(${resource.latitude}, ${resource.longitude})" title="Get Directions">
                    <i class="fas fa-directions"></i>
                </button>
                <button class="btn-icon btn-rate" onclick="event.stopPropagation(); rateResource(${resource.id})" title="Rate Resource">
                    <i class="fas fa-star"></i>
                </button>
            </div>
        `;

        resourceList.appendChild(resourceCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter toggles
    document.getElementById('waterToggle').addEventListener('change', function() {
        displayResourcesOnMap();
        displayResourcesList();
    });

    document.getElementById('washroomToggle').addEventListener('change', function() {
        displayResourcesOnMap();
        displayResourcesList();
    });

    // Location button
    document.getElementById('locateBtn').addEventListener('click', function() {
        if (userLocation) {
            map.setView([userLocation.lat, userLocation.lng], 15);
            showToast('Map centered on your location!', 'success');
        } else {
            requestLocation();
        }
    });

    // Add resource button
    document.getElementById('addResourceBtn').addEventListener('click', function() {
        isAddingResource = true;
        openModal('addResourceModal');
        showToast('Click on the map to set the resource location!', 'info');
    });

    // Add resource form
    document.getElementById('addResourceForm').addEventListener('submit', handleAddResource);

    // Use current location button
    document.getElementById('useCurrentLocation').addEventListener('click', function() {
        if (userLocation) {
            document.getElementById('resourceLat').value = userLocation.lat.toFixed(6);
            document.getElementById('resourceLng').value = userLocation.lng.toFixed(6);
            showToast('Current location coordinates filled!', 'success');
        } else {
            showToast('Location not available. Please allow location access.', 'error');
        }
    });

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

// Perform search
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        loadResources();
        return;
    }

    showLoading(true);

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        
        resources = await response.json();
        displayResourcesOnMap();
        displayResourcesList();
        
        showToast(`Found ${resources.length} resources matching "${query}"`, 'success');
    } catch (error) {
        console.error('Search error:', error);
        showToast('Search failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle add resource form submission
async function handleAddResource(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('resourceName').value,
        resource_type: document.getElementById('resourceType').value,
        description: document.getElementById('resourceDescription').value,
        address: document.getElementById('resourceAddress').value,
        latitude: parseFloat(document.getElementById('resourceLat').value),
        longitude: parseFloat(document.getElementById('resourceLng').value),
        submitted_by: document.getElementById('submitterName').value || 'Anonymous'
    };

    // Validation
    if (!formData.name || !formData.resource_type || !formData.latitude || !formData.longitude) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (Math.abs(formData.latitude) > 90 || Math.abs(formData.longitude) > 180) {
        showToast('Invalid coordinates. Please check latitude and longitude values.', 'error');
        return;
    }

    showLoading(true);

    try {
        const response = await fetch('/api/resources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Resource added successfully! Thank you for contributing.', 'success');
            closeModal('addResourceModal');
            document.getElementById('addResourceForm').reset();
            loadResources(); // Reload resources
        } else {
            showToast(result.message || 'Failed to add resource.', 'error');
        }
    } catch (error) {
        console.error('Error adding resource:', error);
        showToast('Failed to add resource. Please try again.', 'error');
    } finally {
        showLoading(false);
        isAddingResource = false;
    }
}

// Show resource details
function showResourceDetail(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const modal = document.getElementById('resourceDetailModal');
    const title = document.getElementById('resourceDetailTitle');
    const content = document.getElementById('resourceDetailContent');

    title.textContent = resource.name;

    const distance = userLocation ? 
        calculateDistance(userLocation.lat, userLocation.lng, resource.latitude, resource.longitude) : null;

    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <span style="font-size: 3rem;">${icons[resource.resource_type]}</span>
            ${resource.is_verified ? '<div class="verified-badge" style="margin-top: 0.5rem;">✅ Verified Resource</div>' : ''}
        </div>
        
        <div class="form-group">
            <label>Description</label>
            <p>${resource.description || 'No description available'}</p>
        </div>
        
        ${resource.address ? `
            <div class="form-group">
                <label>Address</label>
                <p><i class="fas fa-map-marker-alt"></i> ${resource.address}</p>
            </div>
        ` : ''}
        
        <div class="form-group">
            <label>Location</label>
            <p>Latitude: ${resource.latitude.toFixed(6)}, Longitude: ${resource.longitude.toFixed(6)}</p>
        </div>
        
        ${distance ? `
            <div class="form-group">
                <label>Distance</label>
                <p><i class="fas fa-route"></i> ${distance.toFixed(1)} km from your location</p>
            </div>
        ` : ''}
        
        <div class="form-group">
            <label>Rating</label>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div class="stars">${generateStars(resource.rating)}</div>
                <span>${resource.rating.toFixed(1)} (${resource.total_ratings} reviews)</span>
            </div>
        </div>
        
        <div class="form-group">
            <label>Submitted by</label>
            <p>${resource.submitted_by} on ${new Date(resource.created_at).toLocaleDateString()}</p>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button class="btn btn-primary" onclick="getDirections(${resource.latitude}, ${resource.longitude})">
                <i class="fas fa-directions"></i> Get Directions
            </button>
            <button class="btn btn-secondary" onclick="rateResource(${resource.id})">
                <i class="fas fa-star"></i> Rate Resource
            </button>
        </div>
    `;

    openModal('resourceDetailModal');
}

// Rate resource
function rateResource(resourceId) {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const rating = prompt(`Rate "${resource.name}" (1-5 stars):`);
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        showToast('Please enter a valid rating between 1 and 5.', 'error');
        return;
    }

    const comment = prompt('Add a comment (optional):') || '';

    submitRating(resourceId, parseInt(rating), comment);
}

// Submit rating
async function submitRating(resourceId, rating, comment) {
    showLoading(true);

    try {
        const response = await fetch(`/api/resources/${resourceId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating, comment })
        });

        const result = await response.json();

        if (result.success) {
            showToast('Thank you for your rating!', 'success');
            loadResources(); // Reload to get updated ratings
        } else {
            showToast(result.message || 'Failed to submit rating.', 'error');
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        showToast('Failed to submit rating. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Get directions
function getDirections(lat, lng) {
    if (userLocation) {
        const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${lat},${lng}`;
        window.open(url, '_blank');
    } else {
        const url = `https://www.google.com/maps/search/${lat},${lng}`;
        window.open(url, '_blank');
        showToast('Opening location in Google Maps. Enable location for turn-by-turn directions.', 'info');
    }
}

// Utility functions
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'error' ? 'fa-exclamation-circle' : 
                           type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.getElementById('toastContainer').appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('active');
    } else {
        spinner.classList.remove('active');
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    isAddingResource = false;
}

function showAbout() {
    openModal('aboutModal');
}

function showStats() {
    const waterCount = resources.filter(r => r.resource_type === 'water').length;
    const washroomCount = resources.filter(r => r.resource_type === 'washroom').length;
    const verifiedCount = resources.filter(r => r.is_verified).length;
    const avgRating = resources.length > 0 ? 
        (resources.reduce((sum, r) => sum + r.rating, 0) / resources.length).toFixed(1) : 0;

    document.getElementById('statsContent').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: center;">
            <div style="padding: 1rem; background: #f1f5f9; border-radius: 10px;">
                <div style="font-size: 2rem; color: #3b82f6;">💧</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #334155;">${waterCount}</div>
                <div style="color: #64748b;">Water Sources</div>
            </div>
            <div style="padding: 1rem; background: #f1f5f9; border-radius: 10px;">
                <div style="font-size: 2rem; color: #8b5cf6;">🚻</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #334155;">${washroomCount}</div>
                <div style="color: #64748b;">Washrooms</div>
            </div>
            <div style="padding: 1rem; background: #f1f5f9; border-radius: 10px;">
                <div style="font-size: 2rem; color: #10b981;">✅</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #334155;">${verifiedCount}</div>
                <div style="color: #64748b;">Verified</div>
            </div>
            <div style="padding: 1rem; background: #f1f5f9; border-radius: 10px;">
                <div style="font-size: 2rem; color: #f59e0b;">⭐</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #334155;">${avgRating}</div>
                <div style="color: #64748b;">Avg Rating</div>
            </div>
        </div>
        <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 10px;">
            <h4 style="margin-bottom: 1rem; color: #334155;">Platform Impact</h4>
            <p style="color: #64748b; margin-bottom: 0.5rem;">
                <strong>${resources.length}</strong> total resources helping the community
            </p>
            <p style="color: #64748b; margin-bottom: 0.5rem;">
                <strong>${resources.reduce((sum, r) => sum + r.total_ratings, 0)}</strong> community reviews and ratings
            </p>
            <p style="color: #64748b;">
                Making essential resources accessible to everyone, everywhere.
            </p>
        </div>
    `;
    
    openModal('statsModal');
}

// Add CSS for toast slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
// Global variables
let map;
let userLocation = null;
let resources = [];
let markers = [];
let isAddingResource = false;
let infoWindow;

// Custom icons for different resource types
const icons = {
    water: '💧',
    washroom: '🚻',
    user: '📍'
};

// Indian city coordinates for map centering
const cityCoordinates = {
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadResources();
    setupEventListeners();
    requestLocation();
});

// Initialize Google Maps
function initializeMap() {
    // Default to Delhi
    const defaultCenter = cityCoordinates['Delhi'];
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true
    });

    infoWindow = new google.maps.InfoWindow();

    // Add click event for adding resources
    map.addListener('click', function(event) {
        if (isAddingResource) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            document.getElementById('resourceLat').value = lat.toFixed(6);
            document.getElementById('resourceLng').value = lng.toFixed(6);
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
                
                // Center map on user location if in India
                if (userLocation.lat >= 6.0 && userLocation.lat <= 37.0 && 
                    userLocation.lng >= 68.0 && userLocation.lng <= 97.0) {
                    map.setCenter(userLocation);
                    map.setZoom(15);
                    
                    // Add user location marker
                    new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: 'Your Location',
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="18" fill="#4285f4" stroke="white" stroke-width="4"/>
                                    <circle cx="20" cy="20" r="8" fill="white"/>
                                </svg>
                            `),
                            scaledSize: new google.maps.Size(40, 40),
                            anchor: new google.maps.Point(20, 20)
                        }
                    });
                    
                    showToast('Location found! Map centered on your position.', 'success');
                } else {
                    showToast('Location detected outside India. Showing Delhi by default.', 'info');
                }
            },
            function(error) {
                console.error('Geolocation error:', error);
                showToast('Could not get your location. Showing Delhi by default.', 'warning');
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
        const selectedCity = document.getElementById('citySelect').value;
        const url = selectedCity === 'all' ? '/api/resources' : `/api/resources?city=${selectedCity}`;
        
        const response = await fetch(url);
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

// Display resources on Google Maps
function displayResourcesOnMap() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const waterVisible = document.getElementById('waterToggle').checked;
    const washroomVisible = document.getElementById('washroomToggle').checked;

    resources.forEach(resource => {
        // Check if resource type should be visible
        if ((resource.resource_type === 'water' && !waterVisible) ||
            (resource.resource_type === 'washroom' && !washroomVisible)) {
            return;
        }

        // Create custom marker icon
        const iconColor = resource.resource_type === 'water' ? '#3b82f6' : '#8b5cf6';
        const borderColor = resource.is_verified ? '#10b981' : '#ffffff';
        
        const markerIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="${iconColor}" stroke="${borderColor}" stroke-width="4"/>
                    <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">${icons[resource.resource_type]}</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        };

        // Create marker
        const marker = new google.maps.Marker({
            position: { lat: resource.latitude, lng: resource.longitude },
            map: map,
            title: resource.name,
            icon: markerIcon
        });

        // Create info window content
        const infoContent = `
            <div style="max-width: 300px; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 10px 0; color: #333;">${icons[resource.resource_type]} ${resource.name}</h4>
                ${resource.is_verified ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">✅ Verified</span><br><br>' : ''}
                <p style="margin: 5px 0;"><strong>City:</strong> ${resource.city || 'Not specified'}</p>
                <p style="margin: 5px 0;"><strong>Description:</strong><br>${resource.description || 'No description available'}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong><br>${resource.address || 'No address provided'}</p>
                <p style="margin: 5px 0;"><strong>Rating:</strong> ${generateStars(resource.rating)} (${resource.rating.toFixed(1)}/5)</p>
                <p style="margin: 5px 0;"><strong>Reviews:</strong> ${resource.total_ratings}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Added by:</strong> ${resource.submitted_by}</p>
                <div style="margin-top: 10px;">
                    <button onclick="getDirections(${resource.latitude}, ${resource.longitude})" 
                            style="background: #4285f4; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-right: 5px; cursor: pointer;">
                        🗺️ Directions
                    </button>
                    <button onclick="showResourceDetail(${resource.id})" 
                            style="background: #34a853; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">
                        ℹ️ Details
                    </button>
                </div>
            </div>
        `;

        marker.addListener('click', function() {
            infoWindow.setContent(infoContent);
            infoWindow.open(map, marker);
        });

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
            <div class="resource-city">
                <i class="fas fa-city"></i>
                <strong>${resource.city || 'City not specified'}</strong>
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

    // City selection
    document.getElementById('citySelect').addEventListener('change', function() {
        const selectedCity = this.value;
        if (selectedCity !== 'all' && cityCoordinates[selectedCity]) {
            map.setCenter(cityCoordinates[selectedCity]);
            map.setZoom(12);
        }
        loadResources();
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
            map.setCenter(userLocation);
            map.setZoom(15);
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

// Handle add resource form submission
async function handleAddResource(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('resourceName').value,
        resource_type: document.getElementById('resourceType').value,
        city: document.getElementById('resourceCity').value,
        description: document.getElementById('resourceDescription').value,
        address: document.getElementById('resourceAddress').value,
        latitude: parseFloat(document.getElementById('resourceLat').value),
        longitude: parseFloat(document.getElementById('resourceLng').value),
        submitted_by: document.getElementById('submitterName').value || 'Anonymous'
    };

    // Validation
    if (!formData.name || !formData.resource_type || !formData.city || !formData.latitude || !formData.longitude) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    // Validate coordinates are within India
    if (formData.latitude < 6.0 || formData.latitude > 37.0 || 
        formData.longitude < 68.0 || formData.longitude > 97.0) {
        showToast('Coordinates must be within India. Please check your location.', 'error');
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
            showToast('Resource added successfully! Thank you for contributing to the community.', 'success');
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

// Perform search
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const selectedCity = document.getElementById('citySelect').value;
    
    if (!query) {
        loadResources();
        return;
    }

    showLoading(true);

    try {
        let url = `/api/search?q=${encodeURIComponent(query)}`;
        if (selectedCity !== 'all') {
            url += `&city=${selectedCity}`;
        }
        
        const response = await fetch(url);
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
            <label>City</label>
            <p><i class="fas fa-city"></i> ${resource.city || 'Not specified'}</p>
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

// Get directions using Google Maps
function getDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, '_blank');
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

    // City-wise statistics
    const cityStats = {};
    resources.forEach(r => {
        if (r.city) {
            cityStats[r.city] = (cityStats[r.city] || 0) + 1;
        }
    });

    let cityStatsHtml = '';
    Object.entries(cityStats).forEach(([city, count]) => {
        cityStatsHtml += `
            <div style="padding: 0.5rem; background: #f1f5f9; border-radius: 5px; margin: 0.25rem;">
                <strong>${city}:</strong> ${count} resources
            </div>
        `;
    });

    document.getElementById('statsContent').innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; text-align: center; margin-bottom: 2rem;">
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
        
        <div style="margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem; color: #334155;">City-wise Distribution</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
                ${cityStatsHtml}
            </div>
        </div>
        
        <div style="padding: 1rem; background: #f8fafc; border-radius: 10px;">
            <h4 style="margin-bottom: 1rem; color: #334155;">Platform Impact</h4>
            <p style="color: #64748b; margin-bottom: 0.5rem;">
                <strong>${resources.length}</strong> total resources across major Indian cities
            </p>
            <p style="color: #64748b; margin-bottom: 0.5rem;">
                <strong>${resources.reduce((sum, r) => sum + r.total_ratings, 0)}</strong> community reviews and ratings
            </p>
            <p style="color: #64748b;">
                Making essential resources accessible across India! 🇮🇳💧
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
import streamlit as st
import pandas as pd
import folium
from streamlit_folium import st_folium
import sqlite3
import os
from datetime import datetime
import math

# Page configuration
st.set_page_config(
    page_title="HydraFind - Free Resource Locator",
    page_icon="💧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .resource-card {
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        border-left: 4px solid #667eea;
        margin-bottom: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    
    .resource-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .metric-card {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
    }
    
    .water-card {
        border-left-color: #3b82f6;
    }
    
    .washroom-card {
        border-left-color: #8b5cf6;
    }
    
    .verified-badge {
        background: #10b981;
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        display: inline-block;
        margin-left: 0.5rem;
    }
    
    .rating-stars {
        color: #fbbf24;
        font-size: 1.1rem;
    }
    
    .stButton > button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 0.5rem 2rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .success-message {
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        margin: 1rem 0;
    }
    
    .info-box {
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        border-radius: 10px;
        padding: 1rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize database
@st.cache_resource
def init_db():
    """Initialize the database with sample data"""
    db_path = 'hydrafind_streamlit.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create resources table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            resource_type TEXT NOT NULL,
            address TEXT,
            is_verified BOOLEAN DEFAULT FALSE,
            rating REAL DEFAULT 0.0,
            total_ratings INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            submitted_by TEXT
        )
    ''')
    
    # Check if we need to add sample data
    cursor.execute("SELECT COUNT(*) FROM resources")
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Insert sample data
        sample_data = [
            ("Central Park Water Fountain", "Clean drinking water fountain near the main entrance", 40.7829, -73.9654, "water", "Central Park, New York, NY", True, 4.5, 12, "Admin"),
            ("Public Restroom - City Hall", "Clean public restrooms, wheelchair accessible", 40.7127, -74.0059, "washroom", "City Hall, New York, NY", True, 4.0, 8, "Admin"),
            ("Community Water Station", "Free water refill station, available 24/7", 40.7589, -73.9851, "water", "Times Square, New York, NY", True, 4.2, 15, "Admin"),
            ("Bryant Park Facilities", "Clean restrooms and water fountains", 40.7536, -73.9832, "washroom", "Bryant Park, New York, NY", True, 4.7, 20, "Admin"),
            ("Brooklyn Bridge Water Point", "Water fountain with great bridge views", 40.7061, -73.9969, "water", "Brooklyn Bridge, NY", True, 4.3, 18, "Admin"),
            ("Washington Square Park Restroom", "Public facilities in the heart of Greenwich Village", 40.7308, -73.9973, "washroom", "Washington Square Park, NY", True, 3.8, 14, "Admin")
        ]
        
        for data in sample_data:
            cursor.execute('''
                INSERT INTO resources (name, description, latitude, longitude, resource_type, address, is_verified, rating, total_ratings, submitted_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', data)
    
    conn.commit()
    conn.close()
    return db_path

# Database functions
def get_resources(resource_type="all"):
    """Get resources from database with optional filtering"""
    conn = sqlite3.connect(init_db())
    
    if resource_type == "all":
        query = "SELECT * FROM resources ORDER BY created_at DESC"
        df = pd.read_sql_query(query, conn)
    else:
        query = "SELECT * FROM resources WHERE resource_type = ? ORDER BY created_at DESC"
        df = pd.read_sql_query(query, conn, params=(resource_type,))
    
    conn.close()
    return df

def add_resource(name, description, latitude, longitude, resource_type, address, submitted_by):
    """Add a new resource to the database"""
    try:
        conn = sqlite3.connect(init_db())
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO resources (name, description, latitude, longitude, resource_type, address, submitted_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (name, description, latitude, longitude, resource_type, address, submitted_by))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        st.error(f"Database error: {str(e)}")
        return False

def search_resources(query):
    """Search resources by name, description, or address"""
    conn = sqlite3.connect(init_db())
    search_query = f"%{query}%"
    
    sql_query = '''
        SELECT * FROM resources 
        WHERE name LIKE ? OR description LIKE ? OR address LIKE ?
        ORDER BY created_at DESC
    '''
    
    df = pd.read_sql_query(sql_query, conn, params=(search_query, search_query, search_query))
    conn.close()
    return df

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def generate_stars(rating):
    """Generate star rating display"""
    full_stars = int(rating)
    half_star = 1 if rating - full_stars >= 0.5 else 0
    empty_stars = 5 - full_stars - half_star
    
    return "⭐" * full_stars + "⭐" * half_star + "☆" * empty_stars

# Initialize database
init_db()

# Header
st.markdown("""
<div class="main-header">
    <h1>💧 HydraFind - Free Resource Locator</h1>
    <p>Find free water sources and public washrooms in your community</p>
    <p><em>Making essential resources accessible to everyone, everywhere</em></p>
</div>
""", unsafe_allow_html=True)

# Sidebar
st.sidebar.title("🗺️ Navigation")

# Main navigation
page = st.sidebar.selectbox(
    "Choose a page:",
    ["🏠 Home", "🔍 Search Resources", "➕ Add Resource", "📊 Statistics", "ℹ️ About"]
)

# Resource type filter
st.sidebar.subheader("🎛️ Filters")
resource_filter = st.sidebar.selectbox(
    "Resource Type:",
    ["all", "water", "washroom"],
    format_func=lambda x: {"all": "🌐 All Resources", "water": "💧 Water Sources", "washroom": "🚻 Washrooms"}[x]
)

# Get filtered resources
resources_df = get_resources(resource_filter)

# Statistics in sidebar
st.sidebar.subheader("📈 Quick Stats")
total_resources = len(resources_df)
water_count = len(resources_df[resources_df['resource_type'] == 'water']) if not resources_df.empty else 0
washroom_count = len(resources_df[resources_df['resource_type'] == 'washroom']) if not resources_df.empty else 0
verified_count = len(resources_df[resources_df['is_verified'] == True]) if not resources_df.empty else 0

col1, col2 = st.sidebar.columns(2)
with col1:
    st.metric("💧 Water", water_count)
    st.metric("✅ Verified", verified_count)
with col2:
    st.metric("🚻 Washrooms", washroom_count)
    st.metric("📍 Total", total_resources)

# Main content based on selected page
if page == "🏠 Home":
    st.header("🗺️ Interactive Resource Map")
    
    if not resources_df.empty:
        # Create map
        center_lat = resources_df['latitude'].mean()
        center_lon = resources_df['longitude'].mean()
        
        m = folium.Map(
            location=[center_lat, center_lon], 
            zoom_start=12,
            tiles='OpenStreetMap'
        )
        
        # Add markers
        for idx, row in resources_df.iterrows():
            icon_emoji = "💧" if row['resource_type'] == 'water' else "🚻"
            color = "blue" if row['resource_type'] == 'water' else "purple"
            
            popup_html = f"""
            <div style="width: 250px; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 10px 0; color: #333;">{icon_emoji} {row['name']}</h4>
                {'<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">✅ Verified</span><br><br>' if row['is_verified'] else ''}
                <p style="margin: 5px 0;"><strong>Description:</strong><br>{row['description'] or 'No description'}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong><br>{row['address'] or 'No address provided'}</p>
                <p style="margin: 5px 0;"><strong>Rating:</strong> {generate_stars(row['rating'])} ({row['rating']:.1f}/5)</p>
                <p style="margin: 5px 0;"><strong>Reviews:</strong> {row['total_ratings']}</p>
                <p style="margin: 5px 0; font-size: 12px; color: #666;"><strong>Added by:</strong> {row['submitted_by']}</p>
                <a href="https://www.google.com/maps/search/{row['latitude']},{row['longitude']}" target="_blank" 
                   style="display: inline-block; background: #4285f4; color: white; padding: 5px 10px; 
                          text-decoration: none; border-radius: 5px; margin-top: 10px;">
                   🗺️ Open in Google Maps
                </a>
            </div>
            """
            
            folium.Marker(
                location=[row['latitude'], row['longitude']],
                popup=folium.Popup(popup_html, max_width=300),
                tooltip=f"{icon_emoji} {row['name']}",
                icon=folium.Icon(
                    color=color, 
                    icon='tint' if row['resource_type'] == 'water' else 'home',
                    prefix='fa'
                )
            ).add_to(m)
        
        # Display map
        map_data = st_folium(m, width=700, height=500, returned_objects=["last_object_clicked"])
        
        # Show clicked resource info
        if map_data['last_object_clicked']:
            clicked_lat = map_data['last_object_clicked']['lat']
            clicked_lng = map_data['last_object_clicked']['lng']
            
            # Find the closest resource to the clicked point
            closest_resource = None
            min_distance = float('inf')
            
            for idx, row in resources_df.iterrows():
                distance = calculate_distance(clicked_lat, clicked_lng, row['latitude'], row['longitude'])
                if distance < min_distance and distance < 0.1:  # Within 100 meters
                    min_distance = distance
                    closest_resource = row
            
            if closest_resource is not None:
                st.info(f"📍 Selected: {closest_resource['name']}")
        
        # Resource list below map
        st.header("📋 Resource List")
        
        # Sort by distance if user provides location
        user_lat = st.sidebar.number_input("Your Latitude (optional)", value=40.7128, format="%.6f")
        user_lng = st.sidebar.number_input("Your Longitude (optional)", value=-74.0060, format="%.6f")
        
        if st.sidebar.button("📍 Sort by Distance"):
            # Calculate distances and sort
            distances = []
            for idx, row in resources_df.iterrows():
                dist = calculate_distance(user_lat, user_lng, row['latitude'], row['longitude'])
                distances.append(dist)
            
            resources_df = resources_df.copy()
            resources_df['distance'] = distances
            resources_df = resources_df.sort_values('distance')
        
        for idx, row in resources_df.iterrows():
            icon = "💧" if row['resource_type'] == 'water' else "🚻"
            verified_badge = '<span class="verified-badge">✅ Verified</span>' if row['is_verified'] else ""
            card_class = "water-card" if row['resource_type'] == 'water' else "washroom-card"
            
            distance_info = ""
            if 'distance' in row:
                distance_info = f"<p><strong>📍 Distance:</strong> {row['distance']:.1f} km away</p>"
            
            st.markdown(f"""
            <div class="resource-card {card_class}">
                <h4>{icon} {row['name']} {verified_badge}</h4>
                <p><strong>Description:</strong> {row['description'] or 'No description available'}</p>
                <p><strong>Address:</strong> {row['address'] or 'No address provided'}</p>
                {distance_info}
                <p><strong>Rating:</strong> <span class="rating-stars">{generate_stars(row['rating'])}</span> ({row['rating']:.1f}/5) • {row['total_ratings']} reviews</p>
                <p><strong>Type:</strong> {row['resource_type'].title()}</p>
                <p style="font-size: 0.9em; color: #666;"><strong>Added by:</strong> {row['submitted_by']} on {row['created_at'][:10]}</p>
                <a href="https://www.google.com/maps/search/{row['latitude']},{row['longitude']}" target="_blank" 
                   style="display: inline-block; background: #4285f4; color: white; padding: 8px 16px; 
                          text-decoration: none; border-radius: 20px; margin-top: 10px;">
                   🗺️ Get Directions
                </a>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("No resources found matching your criteria. Be the first to add one!")
        if st.button("➕ Add First Resource"):
            st.session_state.page = "➕ Add Resource"
            st.experimental_rerun()

elif page == "🔍 Search Resources":
    st.header("🔍 Search Resources")
    
    search_query = st.text_input("🔍 Search for resources:", placeholder="Enter keywords (name, description, or address)...")
    
    col1, col2 = st.columns([3, 1])
    with col1:
        search_type = st.selectbox("Filter by type:", ["all", "water", "washroom"], 
                                 format_func=lambda x: {"all": "All Types", "water": "Water Sources", "washroom": "Washrooms"}[x])
    with col2:
        if st.button("🔍 Search", type="primary"):
            if search_query:
                st.session_state.search_performed = True
    
    if search_query and st.session_state.get('search_performed', False):
        search_results = search_resources(search_query)
        
        # Filter by type if not "all"
        if search_type != "all":
            search_results = search_results[search_results['resource_type'] == search_type]
        
        if not search_results.empty:
            st.success(f"🎉 Found {len(search_results)} resources matching '{search_query}'")
            
            for idx, row in search_results.iterrows():
                icon = "💧" if row['resource_type'] == 'water' else "🚻"
                verified_badge = '<span class="verified-badge">✅ Verified</span>' if row['is_verified'] else ""
                card_class = "water-card" if row['resource_type'] == 'water' else "washroom-card"
                
                st.markdown(f"""
                <div class="resource-card {card_class}">
                    <h4>{icon} {row['name']} {verified_badge}</h4>
                    <p><strong>Description:</strong> {row['description'] or 'No description'}</p>
                    <p><strong>Address:</strong> {row['address'] or 'No address provided'}</p>
                    <p><strong>Rating:</strong> <span class="rating-stars">{generate_stars(row['rating'])}</span> ({row['rating']:.1f}/5) • {row['total_ratings']} reviews</p>
                    <p><strong>Type:</strong> {row['resource_type'].title()}</p>
                    <a href="https://www.google.com/maps/search/{row['latitude']},{row['longitude']}" target="_blank" 
                       style="display: inline-block; background: #4285f4; color: white; padding: 8px 16px; 
                              text-decoration: none; border-radius: 20px; margin-top: 10px;">
                       🗺️ Get Directions
                    </a>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.warning(f"😔 No resources found matching '{search_query}' in {search_type} category")
            st.info("💡 Try different keywords or check the 'All Types' filter")
    elif search_query:
        st.info("👆 Click the Search button to find resources")
    else:
        st.markdown("""
        <div class="info-box">
            <h4>🔍 How to Search</h4>
            <ul>
                <li>Enter keywords like "park", "fountain", "accessible", etc.</li>
                <li>Search by location names like "Central Park" or "Times Square"</li>
                <li>Use the filter to narrow down by resource type</li>
                <li>Try different combinations for best results</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

elif page == "➕ Add Resource":
    st.header("➕ Add New Resource")
    
    st.markdown("""
    <div class="info-box">
        <h4>🤝 Help Your Community</h4>
        <p>Add a new water source or washroom to help others in your community. Your contribution makes a difference!</p>
    </div>
    """, unsafe_allow_html=True)
    
    with st.form("add_resource_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        
        with col1:
            name = st.text_input("🏷️ Resource Name *", placeholder="e.g., Central Park Water Fountain")
            resource_type = st.selectbox("🎯 Resource Type *", ["water", "washroom"], 
                                       format_func=lambda x: "💧 Water Source" if x == "water" else "🚻 Washroom")
            description = st.text_area("📝 Description", placeholder="Describe the resource (accessibility, hours, condition, etc.)")
        
        with col2:
            address = st.text_input("📍 Address", placeholder="Street address or landmark")
            latitude = st.number_input("🌐 Latitude *", format="%.6f", value=40.7128, help="You can find coordinates on Google Maps by right-clicking")
            longitude = st.number_input("🌐 Longitude *", format="%.6f", value=-74.0060, help="You can find coordinates on Google Maps by right-clicking")
            submitted_by = st.text_input("👤 Your Name (Optional)", placeholder="Anonymous")
        
        st.markdown("""
        <div class="info-box">
            <h4>💡 How to Find Coordinates</h4>
            <ol>
                <li>Go to <a href="https://maps.google.com" target="_blank">Google Maps</a></li>
                <li>Search for your location</li>
                <li>Right-click on the exact spot</li>
                <li>Click on the coordinates that appear</li>
                <li>Copy and paste them above</li>
            </ol>
        </div>
        """, unsafe_allow_html=True)
        
        submitted = st.form_submit_button("🚀 Add Resource", type="primary")
        
        if submitted:
            if name and resource_type and latitude and longitude:
                # Validate coordinates
                if abs(latitude) <= 90 and abs(longitude) <= 180:
                    try:
                        success = add_resource(
                            name, description, latitude, longitude, 
                            resource_type, address, submitted_by or "Anonymous"
                        )
                        
                        if success:
                            st.markdown("""
                            <div class="success-message">
                                <h3>🎉 Success!</h3>
                                <p>Resource added successfully! Thank you for contributing to the community.</p>
                                <p>Your resource will help others find essential services in your area.</p>
                            </div>
                            """, unsafe_allow_html=True)
                            st.balloons()
                            
                            # Clear the session state to refresh data
                            if 'search_performed' in st.session_state:
                                del st.session_state.search_performed
                                
                        else:
                            st.error("❌ Failed to add resource. Please try again.")
                            
                    except Exception as e:
                        st.error(f"❌ Error adding resource: {str(e)}")
                else:
                    st.error("❌ Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.")
            else:
                st.error("❌ Please fill in all required fields (marked with *)")

elif page == "📊 Statistics":
    st.header("📊 Platform Statistics")
    
    # Overview metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h3>💧</h3>
            <h2>{water_count}</h2>
            <p>Water Sources</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h3>🚻</h3>
            <h2>{washroom_count}</h2>
            <p>Washrooms</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h3>✅</h3>
            <h2>{verified_count}</h2>
            <p>Verified</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        avg_rating = resources_df['rating'].mean() if not resources_df.empty else 0
        st.markdown(f"""
        <div class="metric-card">
            <h3>⭐</h3>
            <h2>{avg_rating:.1f}</h2>
            <p>Avg Rating</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Charts
    if not resources_df.empty:
        st.subheader("📈 Resource Distribution")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("🎯 By Type")
            type_counts = resources_df['resource_type'].value_counts()
            st.bar_chart(type_counts)
        
        with col2:
            st.subheader("⭐ Rating Distribution")
            # Create rating bins
            rating_bins = pd.cut(resources_df['rating'], bins=[0, 1, 2, 3, 4, 5], labels=['1⭐', '2⭐', '3⭐', '4⭐', '5⭐'])
            rating_dist = rating_bins.value_counts().sort_index()
            st.bar_chart(rating_dist)
        
        # Recent additions
        st.subheader("🕒 Recent Additions")
        recent_resources = resources_df.head(5)
        
        for idx, row in recent_resources.iterrows():
            icon = "💧" if row['resource_type'] == 'water' else "🚻"
            verified = "✅" if row['is_verified'] else "⏳"
            st.write(f"{icon} **{row['name']}** {verified} - Added by {row['submitted_by']} on {row['created_at'][:10]}")
        
        # Community impact
        st.subheader("🌍 Community Impact")
        total_reviews = resources_df['total_ratings'].sum()
        
        impact_col1, impact_col2, impact_col3 = st.columns(3)
        with impact_col1:
            st.metric("📝 Total Reviews", total_reviews)
        with impact_col2:
            st.metric("🏆 Top Rated", f"{resources_df['rating'].max():.1f}⭐")
        with impact_col3:
            st.metric("📍 Coverage", f"{len(resources_df['address'].dropna())} locations")

elif page == "ℹ️ About":
    st.header("ℹ️ About HydraFind")
    
    st.markdown("""
    ## 🌟 Welcome to HydraFind!
    
    HydraFind is a community-driven platform that helps you locate free water sources and public washrooms in your area. 
    Our mission is to make essential resources accessible to everyone, everywhere.
    
    ### 🎯 Features
    
    - **🗺️ Interactive Map**: Real-time location tracking with detailed resource information
    - **💧 Water Sources**: Find drinking fountains, refill stations, and free water access points
    - **🚻 Public Washrooms**: Locate clean, accessible restroom facilities
    - **🔍 Smart Search**: Find resources by name, description, or location
    - **⭐ Community Reviews**: Rate and review resources to help others
    - **➕ Community Contributions**: Add new resources to help your community
    - **📱 Mobile Friendly**: Works perfectly on all devices
    
    ### 🚀 How to Use
    
    1. **🏠 Home**: Browse the interactive map and resource list
    2. **🔍 Search**: Find specific resources using keywords
    3. **➕ Add Resource**: Contribute by adding new water sources or washrooms
    4. **📊 Statistics**: View platform usage and community impact
    
    ### 🤝 Community Impact
    
    - **{total_resources}** total resources helping the community
    - **{total_reviews}** community reviews and ratings
    - Making essential resources accessible to everyone
    
    ### 🛠️ Technology
    
    Built with:
    - **Streamlit**: Interactive web application framework
    - **Folium**: Interactive mapping with OpenStreetMap
    - **SQLite**: Lightweight, reliable database
    - **Python**: Backend processing and data management
    
    ### 🌍 Our Mission
    
    We believe that access to clean water and sanitary facilities is a basic human right. 
    HydraFind empowers communities to share information about these essential resources, 
    making cities more livable and inclusive for everyone.
    
    ### 🤝 Get Involved
    
    - **Add Resources**: Help by adding water sources and washrooms you know about
    - **Rate & Review**: Share your experiences to help others
    - **Spread the Word**: Tell friends and family about HydraFind
    - **Provide Feedback**: Help us improve the platform
    
    ### 📞 Support
    
    Have questions or suggestions? We'd love to hear from you!
    
    ---
    
    **HydraFind** - Making essential resources accessible to everyone, everywhere. 🌍💧
    """.format(
        total_resources=total_resources, 
        total_reviews=resources_df['total_ratings'].sum() if not resources_df.empty else 0
    ))
    
    # Fun facts
    st.subheader("🎉 Fun Facts")
    
    if not resources_df.empty:
        most_reviewed = resources_df.loc[resources_df['total_ratings'].idxmax()]
        highest_rated = resources_df.loc[resources_df['rating'].idxmax()]
        
        col1, col2 = st.columns(2)
        with col1:
            st.info(f"🏆 Most Reviewed: **{most_reviewed['name']}** with {most_reviewed['total_ratings']} reviews")
        with col2:
            st.info(f"⭐ Highest Rated: **{highest_rated['name']}** with {highest_rated['rating']:.1f}/5 stars")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666; padding: 1rem; background: #f8fafc; border-radius: 10px; margin-top: 2rem;">
    <p><strong>Made with ❤️ by Raghav Siddharth</strong></p>
    <p>HydraFind - Free Resource Locator | Making essential resources accessible to everyone, everywhere 🌍💧</p>
    <p><em>Deployed on Streamlit Cloud</em></p>
</div>
""", unsafe_allow_html=True)

# Initialize session state
if 'search_performed' not in st.session_state:
    st.session_state.search_performed = False
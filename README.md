# HydraFind India - Free Water & Washroom Locator

A Flask-based web application that helps users locate free water sources and public washrooms across major Indian cities including Delhi, Mumbai, Bengaluru, Hyderabad, and Lucknow using Google Maps integration.

## 🇮🇳 Features

### 🏙️ Indian Cities Coverage
- **Delhi** - National Capital Region with detailed street mapping
- **Mumbai** - Financial capital with comprehensive coverage
- **Bengaluru** - IT capital with tech-friendly locations
- **Hyderabad** - Cyberabad with modern infrastructure
- **Lucknow** - City of Nawabs with historical landmarks

### 🗺️ Google Maps Integration
- Real-time location tracking with Google Maps API
- Street-level detail for Indian cities
- Custom markers for different resource types
- Click-to-add resource functionality
- Directions integration with Google Maps

### 💧 Resource Management
- **Water Sources**: Drinking fountains, refill stations, public taps
- **Washrooms**: Public restrooms, accessible facilities
- City-wise filtering and search
- Verified resource badges
- Community ratings and reviews

### 🔍 Advanced Search & Filter
- Text-based search across resource names, descriptions, and addresses
- Filter by resource type (water/washroom)
- City-specific filtering
- Distance-based sorting when location is available

### ⭐ Community Features
- User-submitted resources with city tagging
- Rating and review system (1-5 stars)
- Community verification system
- Anonymous or named contributions

### 📱 Mobile-Friendly Design
- Responsive design optimized for Indian mobile users
- Touch-friendly interface
- Geolocation support for Indian coordinates
- Works on all devices and browsers

## 🚀 Technology Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **RESTful API**: JSON-based endpoints
- **Gunicorn**: Production WSGI server

### Frontend
- **Google Maps JavaScript API**: Interactive maps with Indian region focus
- **HTML5/CSS3**: Modern web standards
- **JavaScript ES6+**: Interactive functionality
- **Font Awesome**: Icons
- **Responsive CSS**: Mobile-first design

### Deployment
- **Heroku**: Cloud platform deployment
- **Gunicorn**: Production server
- **Environment variables**: Secure configuration

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Google Maps API Key
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HydraFind
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Google Maps API**
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API and Places API
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` in `templates/index.html`

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

### Production Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create hydrafind-india
   ```

2. **Set environment variables**
   ```bash
   heroku config:set GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## 🗺️ API Endpoints

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources?type=water` - Get water sources only
- `GET /api/resources?type=washroom` - Get washrooms only
- `GET /api/resources?city=Delhi` - Get resources by city
- `POST /api/resources` - Add new resource

### Search
- `GET /api/search?q=query` - Search resources
- `GET /api/search?q=query&type=water&city=Mumbai` - Advanced search

### Cities
- `GET /api/cities` - Get list of available cities

### Ratings
- `POST /api/resources/{id}/rate` - Rate a resource

## 🏙️ Supported Cities

### Delhi (National Capital Region)
- India Gate area
- Connaught Place
- Red Fort vicinity
- Metro stations
- Major landmarks

### Mumbai (Financial Capital)
- Gateway of India
- Marine Drive
- Railway stations
- Business districts
- Tourist areas

### Bengaluru (IT Capital)
- Cubbon Park
- MG Road
- Electronic City
- Whitefield
- Tech parks

### Hyderabad (Cyberabad)
- Charminar area
- Hussain Sagar Lake
- HITEC City
- Banjara Hills
- Secunderabad

### Lucknow (City of Nawabs)
- Bara Imambara
- Hazratganj
- Aminabad
- Gomti Nagar
- Historical sites

## 📱 Usage Guide

### For Users

1. **Finding Resources**
   - Select your city from the dropdown
   - Allow location access for best results
   - Use the map to see nearby resources
   - Toggle water/washroom visibility as needed
   - Click markers for detailed information

2. **Adding Resources**
   - Click "Add Resource" button
   - Select your city and resource type
   - Fill in the required information
   - Click on map to set location or use current location
   - Submit to help the community

3. **Rating Resources**
   - Click on any resource card or marker
   - Use the "Rate Resource" button
   - Provide 1-5 star rating and optional comment

### For Developers

#### Google Maps Configuration
- Ensure API key has proper restrictions for Indian domains
- Enable required APIs: Maps JavaScript API, Places API
- Configure billing for production use

#### Adding New Cities
1. Add city coordinates to `cityCoordinates` object in `app.js`
2. Update city dropdown in `templates/index.html`
3. Add sample data for the new city in `app.py`

#### Customizing for Indian Context
- Map styles optimized for Indian street layouts
- Hindi language support in Google Maps
- Indian coordinate validation
- Local landmark integration

## 🔒 Security Features

- Input validation for Indian coordinates (6°N to 37°N, 68°E to 97°E)
- SQL injection prevention via SQLAlchemy ORM
- XSS protection through proper escaping
- Rate limiting for API endpoints
- Secure API key management

## 🌟 Indian Context Features

- **Regional Focus**: Optimized for Indian cities and landmarks
- **Local Landmarks**: Integration with famous Indian locations
- **Cultural Sensitivity**: Appropriate for Indian users and contexts
- **Mobile Optimization**: Designed for Indian mobile usage patterns
- **Community Driven**: Built for Indian community collaboration

## 📊 Database Schema

### Resources Table
- `id`: Primary key
- `name`: Resource name
- `description`: Optional description
- `latitude/longitude`: GPS coordinates (validated for India)
- `resource_type`: 'water' or 'washroom'
- `address`: Street address or landmark
- `city`: Indian city name
- `is_verified`: Verification status
- `rating`: Average rating (0-5)
- `total_ratings`: Number of ratings
- `created_at`: Timestamp
- `submitted_by`: Contributor name

## 🤝 Contributing

### Adding Resources
- Focus on Indian cities and landmarks
- Provide accurate location information
- Include helpful descriptions for Indian users
- Verify accessibility information

### Development
1. Fork the repository
2. Create a feature branch
3. Test with Indian locations
4. Submit a pull request

## 📞 Support

For questions, issues, or contributions related to Indian cities and locations:
- Create an issue in the repository
- Provide detailed location information
- Include city and landmark details

## 🎯 Future Enhancements

- **More Cities**: Expansion to Pune, Chennai, Kolkata, Jaipur
- **Hindi Language**: Multi-language support
- **Offline Maps**: Downloadable city maps
- **Public Transport**: Integration with Indian public transport
- **Government Integration**: Partnership with municipal corporations
- **Accessibility**: Enhanced features for differently-abled users

## 📄 License

This project is open source and available under the MIT License.

---

**HydraFind India** - Making essential resources accessible across India! 🇮🇳💧

*Serving the communities of Delhi, Mumbai, Bengaluru, Hyderabad, Lucknow and expanding to more Indian cities.*
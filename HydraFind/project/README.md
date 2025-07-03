# HydraFind - Location-Based Free Resource Finder

A Flask-based web application that helps users locate free water sources and public washrooms in their area using interactive maps and community contributions.

## Features

### 🗺️ Interactive Map
- Real-time location tracking with Leaflet.js
- Custom markers for different resource types
- Click-to-add resource functionality
- Responsive map with zoom controls

### 💧 Resource Management
- **Water Sources**: Drinking fountains, refill stations, etc.
- **Washrooms**: Public restrooms, accessible facilities
- Toggle visibility for different resource types
- Verified resource badges

### 🔍 Search & Filter
- Text-based search across resource names, descriptions, and addresses
- Filter by resource type (water/washroom)
- Distance-based sorting when location is available

### ⭐ Community Features
- User-submitted resources
- Rating and review system (1-5 stars)
- Community verification
- Anonymous or named contributions

### 📱 Mobile-Friendly
- Responsive design for all screen sizes
- Touch-friendly interface
- Geolocation support
- Offline-capable map tiles

## Technology Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **RESTful API**: JSON-based endpoints

### Frontend
- **HTML5/CSS3**: Modern web standards
- **JavaScript ES6+**: Interactive functionality
- **Leaflet.js**: Interactive maps
- **OpenStreetMap**: Free map tiles
- **Font Awesome**: Icons

### Features Implementation
- **Geolocation API**: User location detection
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: WCAG compliant

## Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Quick Start

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Database Setup
The application automatically creates the SQLite database and sample data on first run.

## API Endpoints

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources?type=water` - Get water sources only
- `GET /api/resources?type=washroom` - Get washrooms only
- `POST /api/resources` - Add new resource

### Search
- `GET /api/search?q=query` - Search resources
- `GET /api/search?q=query&type=water` - Search with type filter

### Ratings
- `POST /api/resources/{id}/rate` - Rate a resource

## Usage Guide

### For Users

1. **Finding Resources**
   - Allow location access for best results
   - Use the map to see nearby resources
   - Toggle water/washroom visibility as needed
   - Click markers for detailed information

2. **Adding Resources**
   - Click "Add Resource" button
   - Fill in the required information
   - Click on map to set location or use current location
   - Submit to help the community

3. **Rating Resources**
   - Click on any resource card or marker
   - Use the "Rate Resource" button
   - Provide 1-5 star rating and optional comment

### For Developers

#### Adding New Resource Types
1. Update the `icons` object in `app.js`
2. Add new option to resource type select in HTML
3. Update CSS for new resource type styling
4. Modify database model if needed

#### Customizing Map Appearance
- Edit the Leaflet tile layer in `initializeMap()`
- Modify marker styles in `displayResourcesOnMap()`
- Update CSS custom properties for colors

#### Extending API
- Add new routes in `app.py`
- Update JavaScript fetch calls
- Modify database models as needed

## Project Structure

```
hydrafind/
├── app.py                 # Flask application and API routes
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── style.css     # Styles and responsive design
    └── js/
        └── app.js        # JavaScript functionality
```

## Database Schema

### Resources Table
- `id`: Primary key
- `name`: Resource name
- `description`: Optional description
- `latitude/longitude`: GPS coordinates
- `resource_type`: 'water' or 'washroom'
- `address`: Optional street address
- `is_verified`: Verification status
- `rating`: Average rating (0-5)
- `total_ratings`: Number of ratings
- `created_at`: Timestamp
- `submitted_by`: Contributor name

### Ratings Table
- `id`: Primary key
- `resource_id`: Foreign key to resources
- `rating`: 1-5 star rating
- `comment`: Optional comment
- `created_at`: Timestamp
- `user_ip`: Basic duplicate prevention

## Contributing

### Adding Features
1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Issues
- Use the GitHub issues tracker
- Provide detailed reproduction steps
- Include browser and device information

## Security Considerations

- Input validation on all user submissions
- SQL injection prevention via SQLAlchemy ORM
- XSS protection through proper escaping
- Rate limiting recommended for production
- HTTPS recommended for location data

## Performance Optimization

- Database indexing on frequently queried fields
- Efficient map marker clustering for large datasets
- Image optimization for faster loading
- Caching strategies for static resources
- CDN integration for global performance

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators for all interactive elements
- Alternative text for all images and icons

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with geolocation support

## License

This project is open source and available under the MIT License.

## Future Enhancements

- **User Accounts**: Registration and login system
- **Advanced Filtering**: Hours, accessibility features, etc.
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Alerts for nearby resources
- **Social Features**: Comments, photos, check-ins
- **Admin Panel**: Resource moderation and management
- **Analytics**: Usage statistics and insights
- **Multi-language**: Internationalization support

## Support

For questions, issues, or contributions, please refer to the project documentation or create an issue in the repository.

---

**HydraFind** - Making essential resources accessible to everyone, everywhere. 🌍💧
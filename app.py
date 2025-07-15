from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hydrafind-india-secret-key-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hydrafind_india.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    resource_type = db.Column(db.String(20), nullable=False)  # 'water' or 'washroom'
    address = db.Column(db.String(200))
    city = db.Column(db.String(50))
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_ratings = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    submitted_by = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'resource_type': self.resource_type,
            'address': self.address,
            'city': self.city,
            'is_verified': self.is_verified,
            'rating': self.rating,
            'total_ratings': self.total_ratings,
            'created_at': self.created_at.isoformat(),
            'submitted_by': self.submitted_by
        }

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey('resource.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_ip = db.Column(db.String(45))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/resources')
def get_resources():
    resource_type = request.args.get('type', 'all')
    city = request.args.get('city', 'all')
    
    query = Resource.query
    
    if resource_type != 'all':
        query = query.filter_by(resource_type=resource_type)
    
    if city != 'all':
        query = query.filter_by(city=city)
    
    resources = query.all()
    return jsonify([resource.to_dict() for resource in resources])

@app.route('/api/resources', methods=['POST'])
def add_resource():
    data = request.get_json()
    
    try:
        resource = Resource(
            name=data['name'],
            description=data.get('description', ''),
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            resource_type=data['resource_type'],
            address=data.get('address', ''),
            city=data.get('city', ''),
            submitted_by=data.get('submitted_by', 'Anonymous')
        )
        
        db.session.add(resource)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Resource added successfully!',
            'resource': resource.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error adding resource: {str(e)}'
        }), 400

@app.route('/api/resources/<int:resource_id>/rate', methods=['POST'])
def rate_resource(resource_id):
    data = request.get_json()
    user_ip = request.remote_addr
    
    # Check if user already rated this resource
    existing_rating = Rating.query.filter_by(
        resource_id=resource_id,
        user_ip=user_ip
    ).first()
    
    if existing_rating:
        return jsonify({
            'success': False,
            'message': 'You have already rated this resource'
        }), 400
    
    try:
        rating = Rating(
            resource_id=resource_id,
            rating=int(data['rating']),
            comment=data.get('comment', ''),
            user_ip=user_ip
        )
        
        db.session.add(rating)
        
        # Update resource rating
        resource = Resource.query.get(resource_id)
        if resource:
            total_rating = (resource.rating * resource.total_ratings) + int(data['rating'])
            resource.total_ratings += 1
            resource.rating = total_rating / resource.total_ratings
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Rating added successfully!',
            'new_rating': resource.rating
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error adding rating: {str(e)}'
        }), 400

@app.route('/api/search')
def search_resources():
    query = request.args.get('q', '').lower()
    resource_type = request.args.get('type', 'all')
    city = request.args.get('city', 'all')
    
    resources_query = Resource.query
    
    if resource_type != 'all':
        resources_query = resources_query.filter_by(resource_type=resource_type)
    
    if city != 'all':
        resources_query = resources_query.filter_by(city=city)
    
    if query:
        resources_query = resources_query.filter(
            db.or_(
                Resource.name.ilike(f'%{query}%'),
                Resource.description.ilike(f'%{query}%'),
                Resource.address.ilike(f'%{query}%')
            )
        )
    
    resources = resources_query.all()
    return jsonify([resource.to_dict() for resource in resources])

@app.route('/api/cities')
def get_cities():
    cities = db.session.query(Resource.city).distinct().all()
    return jsonify([city[0] for city in cities if city[0]])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Add sample data for Indian cities if database is empty
        if Resource.query.count() == 0:
            indian_resources = [
                # Delhi
                Resource(
                    name="India Gate Water Fountain",
                    description="Public water fountain near India Gate, available 24/7",
                    latitude=28.6129,
                    longitude=77.2295,
                    resource_type="water",
                    address="India Gate, New Delhi",
                    city="Delhi",
                    is_verified=True,
                    rating=4.2,
                    total_ratings=25,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Connaught Place Public Restroom",
                    description="Clean public restrooms in CP, wheelchair accessible",
                    latitude=28.6315,
                    longitude=77.2167,
                    resource_type="washroom",
                    address="Connaught Place, New Delhi",
                    city="Delhi",
                    is_verified=True,
                    rating=3.8,
                    total_ratings=18,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Red Fort Water Station",
                    description="Free water refill station near Red Fort entrance",
                    latitude=28.6562,
                    longitude=77.2410,
                    resource_type="water",
                    address="Red Fort, Delhi",
                    city="Delhi",
                    is_verified=True,
                    rating=4.0,
                    total_ratings=12,
                    submitted_by="Admin"
                ),
                
                # Mumbai
                Resource(
                    name="Gateway of India Water Point",
                    description="Public water fountain at Gateway of India",
                    latitude=18.9220,
                    longitude=72.8347,
                    resource_type="water",
                    address="Gateway of India, Mumbai",
                    city="Mumbai",
                    is_verified=True,
                    rating=4.1,
                    total_ratings=30,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Marine Drive Public Facilities",
                    description="Clean restrooms along Marine Drive",
                    latitude=18.9434,
                    longitude=72.8234,
                    resource_type="washroom",
                    address="Marine Drive, Mumbai",
                    city="Mumbai",
                    is_verified=True,
                    rating=4.3,
                    total_ratings=22,
                    submitted_by="Admin"
                ),
                
                # Bengaluru
                Resource(
                    name="Cubbon Park Water Fountain",
                    description="Multiple water fountains throughout Cubbon Park",
                    latitude=12.9716,
                    longitude=77.5946,
                    resource_type="water",
                    address="Cubbon Park, Bengaluru",
                    city="Bengaluru",
                    is_verified=True,
                    rating=4.4,
                    total_ratings=35,
                    submitted_by="Admin"
                ),
                Resource(
                    name="MG Road Metro Station Facilities",
                    description="Modern restrooms at MG Road Metro Station",
                    latitude=12.9759,
                    longitude=77.6069,
                    resource_type="washroom",
                    address="MG Road Metro Station, Bengaluru",
                    city="Bengaluru",
                    is_verified=True,
                    rating=4.5,
                    total_ratings=28,
                    submitted_by="Admin"
                ),
                
                # Hyderabad
                Resource(
                    name="Charminar Water Station",
                    description="Public water facility near Charminar",
                    latitude=17.3616,
                    longitude=78.4747,
                    resource_type="water",
                    address="Charminar, Hyderabad",
                    city="Hyderabad",
                    is_verified=True,
                    rating=3.9,
                    total_ratings=20,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Hussain Sagar Lake Restrooms",
                    description="Public facilities near Hussain Sagar Lake",
                    latitude=17.4239,
                    longitude=78.4738,
                    resource_type="washroom",
                    address="Hussain Sagar, Hyderabad",
                    city="Hyderabad",
                    is_verified=True,
                    rating=4.0,
                    total_ratings=15,
                    submitted_by="Admin"
                ),
                
                # Lucknow
                Resource(
                    name="Bara Imambara Water Point",
                    description="Water facility at Bara Imambara complex",
                    latitude=26.8695,
                    longitude=80.9124,
                    resource_type="water",
                    address="Bara Imambara, Lucknow",
                    city="Lucknow",
                    is_verified=True,
                    rating=3.7,
                    total_ratings=14,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Hazratganj Public Restroom",
                    description="Clean public restrooms in Hazratganj market area",
                    latitude=26.8467,
                    longitude=80.9462,
                    resource_type="washroom",
                    address="Hazratganj, Lucknow",
                    city="Lucknow",
                    is_verified=True,
                    rating=3.6,
                    total_ratings=11,
                    submitted_by="Admin"
                )
            ]
            
            for resource in indian_resources:
                db.session.add(resource)
            db.session.commit()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
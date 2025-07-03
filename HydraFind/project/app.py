from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hydrafind.db'
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
    user_ip = db.Column(db.String(45))  # For basic duplicate prevention

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/resources')
def get_resources():
    resource_type = request.args.get('type', 'all')
    
    if resource_type == 'all':
        resources = Resource.query.all()
    else:
        resources = Resource.query.filter_by(resource_type=resource_type).all()
    
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
    
    resources_query = Resource.query
    
    if resource_type != 'all':
        resources_query = resources_query.filter_by(resource_type=resource_type)
    
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Add sample data if database is empty
        if Resource.query.count() == 0:
            sample_resources = [
                Resource(
                    name="Central Park Water Fountain",
                    description="Clean drinking water fountain near the main entrance",
                    latitude=40.7829,
                    longitude=-73.9654,
                    resource_type="water",
                    address="Central Park, New York, NY",
                    is_verified=True,
                    rating=4.5,
                    total_ratings=12,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Public Restroom - City Hall",
                    description="Clean public restrooms, wheelchair accessible",
                    latitude=40.7127,
                    longitude=-74.0059,
                    resource_type="washroom",
                    address="City Hall, New York, NY",
                    is_verified=True,
                    rating=4.0,
                    total_ratings=8,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Community Water Station",
                    description="Free water refill station, available 24/7",
                    latitude=40.7589,
                    longitude=-73.9851,
                    resource_type="water",
                    address="Times Square, New York, NY",
                    is_verified=True,
                    rating=4.2,
                    total_ratings=15,
                    submitted_by="Admin"
                ),
                Resource(
                    name="Bryant Park Facilities",
                    description="Clean restrooms and water fountains",
                    latitude=40.7536,
                    longitude=-73.9832,
                    resource_type="washroom",
                    address="Bryant Park, New York, NY",
                    is_verified=True,
                    rating=4.7,
                    total_ratings=20,
                    submitted_by="Admin"
                )
            ]
            
            for resource in sample_resources:
                db.session.add(resource)
            db.session.commit()
    
    app.run(debug=True, port=5000)
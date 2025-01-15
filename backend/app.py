from flask import Flask, request, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, send
from flask_cors import CORS

app = Flask(__name__, static_folder='frontend/build', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SECRET_KEY'] = 'mysecret'
db = SQLAlchemy(app)


CORS(app, resources={r"/*": {"origins": "*"}}) 

socketio = SocketIO(app, cors_allowed_origins="*")  

# Database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(200), nullable=False)


def add_default_users():
    if User.query.count() == 0:
        default_users = ['User 1', 'User 2', 'User 3']
        for username in default_users:
            user = User(username=username)
            db.session.add(user)
        db.session.commit()


@app.before_request
def before_request():
    add_default_users()


@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{'id': user.id, 'username': user.username} for user in users])


@app.route('/api/messages', methods=['POST'])
def post_message():
    try:
        data = request.json
        
        if not all(key in data for key in ['sender_id', 'receiver_id', 'content']):
            return jsonify({'error': 'Missing required fields'}), 400

        new_message = Message(
            sender_id=data['sender_id'],
            receiver_id=data['receiver_id'],
            content=data['content']
        )
        db.session.add(new_message)
        db.session.commit()
        return jsonify({'status': 'success'}), 201
    except Exception as e:
        print(f"Error: {e}")  
        return jsonify({'error': str(e)}), 500  


@socketio.on('message')
def handle_message(msg):
    try:
        
        if not all(key in msg for key in ['sender', 'receiver', 'content']):
            return jsonify({'error': 'Missing required fields'}), 400

        new_message = Message(
            sender_id=msg['sender'],
            receiver_id=msg['receiver'],
            content=msg['content']
        )
        db.session.add(new_message)
        db.session.commit()
        send(msg, broadcast=True) 
    except Exception as e:
        print(f"Error handling socket message: {e}")  

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

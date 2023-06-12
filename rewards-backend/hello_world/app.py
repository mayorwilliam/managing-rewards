import json
import jwt
from flask import Flask, jsonify, request, make_response

app = Flask(__name__)

# Define secret key for JWT token
SECRET_KEY = 'your-secret-key'

# Dummy rewards data
rewards = [
    {
        'id': 1,
        'name': 'Reward 1',
        'description': 'Description 1',
        'price': 10,
        'category': 'Category 1',
        'imageUrl': 'https://example.com/image1.jpg'
    },
    {
        'id': 2,
        'name': 'Reward 2',
        'description': 'Description 2',
        'price': 20,
        'category': 'Category 2',
        'imageUrl': 'https://example.com/image2.jpg'
    },
    {
        'id': 3,
        'name': 'Reward 3',
        'description': 'Description 3',
        'price': 30,
        'category': 'Category 3',
        'imageUrl': 'https://example.com/image3.jpg'
    }
]

def get_rewards(event, context):
    # Check if the request contains a valid JWT token in the Authorization header
    auth_header = event.get('headers', {}).get('Authorization')
    if not auth_header:
        return {'statusCode': 401, 'body': json.dumps({'message': 'Missing token'})}

    token = auth_header.split(' ')[-1]  # Extract the token from the Authorization header

    try:
        # Verify and decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return {'statusCode': 401, 'body': json.dumps({'message': 'Token expired'})}
    except jwt.InvalidTokenError:
        return {'statusCode': 401, 'body': json.dumps({'message': 'Invalid token'})}

    # Apply filters if provided
    name_filter = event.get('queryStringParameters', {}).get('name')
    category_filter = event.get('queryStringParameters', {}).get('category')
    price_filter = event.get('queryStringParameters', {}).get('price')

    filtered_rewards = rewards
    if name_filter:
        filtered_rewards = [reward for reward in filtered_rewards if name_filter.lower() in reward['name'].lower()]
    if category_filter:
        filtered_rewards = [reward for reward in filtered_rewards if category_filter.lower() in reward['category'].lower()]
    if price_filter:
        filtered_rewards = [reward for reward in filtered_rewards if reward['price'] == int(price_filter)]

    return {'statusCode': 200, 'body': json.dumps(filtered_rewards)}

def login(event, context):
    username = json.loads(event['body']).get('username')
    password = json.loads(event['body']).get('password')

    # Perform authentication and check if the credentials are valid
    if username == 'admin' and password == 'password':
        # Generate JWT token
        token = jwt.encode({'username': username}, SECRET_KEY, algorithm='HS256')
        response = {'message': 'Login successful'}
        response_headers = {'Set-Cookie': f'token={token}; HttpOnly'}
        return {'statusCode': 200, 'body': json.dumps(response), 'headers': response_headers}
    else:
        return {'statusCode': 401, 'body': json.dumps({'message': 'Invalid credentials'})}

# Define the AWS Lambda function handlers
app.lambda_route('/api/rewards')(get_rewards)
app.lambda_route('/api/login')(login)

if __name__ == '__main__':
    app.run()

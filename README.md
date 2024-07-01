# Real Time Chat Application

This is a real-time chat application built using the Django(DRF) (HTML, CSS, React, Django Rest framework) stack. The app uses WebSockets for real-time communication between clients and the server.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Technologies Used](#technologies-used)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication with JSON Web Tokens
- Real-time chat with WebSockets
- Create new chat rooms for Private message and Group message
- Send and receive messages in real time
- View the list of all users
- View the history of previous messages
- send files in chatroom
- user online or offline or typing message other user can see.
- user profile management.

## Prerequisites

#### Backend
    - Python == 3.11.7
    - Django == 4.0
### Frontend
    - node == 20.9.0
    - npm == 10.1.0
    - React

## Installation

 1. Clone the repository:

    ```sh
    git clone https://github.com/krishna2808/chat-app.git
    cd chat-app
    ```

  ### Frontend Installation
  
  2. Install the dependencies for both the frontend and backend:
  
      ```sh
      cd frontend && npm install
      npm start
      ```

  ### Backend Installation
  
  3. Install the dependencies for the backend:
  
      ```sh
      python3 -m venv venv 
      source venv/bin/activate #Linux (activated venv)
      cd backend 
      pip install -r requirements.txt
      python manage.py makemigrations 
      python manage.py migrate # note if it will not proper migration then makemigrations and migrate with manually app
      python manage.py runserver
      ```



3. Create a `.env` file in the `backend` directory and add the following environment variables:

    ```plaintext
    PORT=3000
    MONGO_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    ```

    Replace `<your-mongodb-uri>` and `<your-jwt-secret>` with your MongoDB URI and a secret key for JWT.

## Running the Application

1. Start the backend server:

    ```sh
    cd backend
    python manage.py runserver
    ```

2. In a separate terminal, start the frontend application:

    ```sh
    cd frontend
    npm start
    ```

3. Open your browser and navigate to `http://localhost:3000` to see the application in action.

## Technologies Used

- **Sqlite**:  Database for storing data
- **Django Rest Framework**: Drf framework for building REST APIs
- **React**: Library for building user interfaces
- **WebSockets channel**: Real-time communication between client and server
- **JWT**: Authentication using JSON Web Tokens


## Screenshots

Include some screenshots of your application here to showcase its features and UI.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

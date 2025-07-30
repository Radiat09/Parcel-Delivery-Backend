# Parcel-Delivery-Backend

## Project Overview

This repository contains the backend application for a parcel delivery service. It's built using TypeScript, Express.js, and Node.js, providing a robust and scalable foundation for managing parcel delivery operations.

## Key Features & Benefits

- **RESTful API:** Provides a set of APIs for managing parcels, users, and delivery routes.
- **TypeScript:** Ensures type safety and improves code maintainability.
- **Express.js:** Simplifies routing and middleware management.
- **Modular Design:** Organized project structure for easy navigation and modification.
- **Database Connectivity:** Integrates with MongoDB for persistent data storage.
- **Authentication and Authorization:** Includes user authentication and authorization features (though details are in progress, as indicated by the session secret).

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

- **Node.js:** (Version >= 16 recommended) - [https://nodejs.org/](https://nodejs.org/)
- **npm** (Node Package Manager) or **Yarn:** (usually installed with Node.js)
- **MongoDB:** A database instance for data storage. Can be a local instance or a cloud-based service like MongoDB Atlas.
- **TypeScript:** (installed as a dev dependency - see package.json).

## Installation & Setup Instructions

Follow these steps to set up the project:

1.  **Clone the Repository:**

    ```bash
    git clone <repository_url>
    cd Parcel-Delivery-Backend
    ```

2.  **Install Dependencies:**

    Using npm:

    ```bash
    npm install
    ```

    Using Yarn:

    ```bash
    yarn install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file (if one doesn't exist) or modify existing environment variables. The following environment variables are likely used (although specific variable names are not visible in the provided file snippets, adapt this section based on your actual implementation):

    ```
    PORT=3000 # or any available port
    DB_URL=mongodb://localhost:27017/parcel-delivery # Your MongoDB connection string
    SESSION_SECRET=YourSecreetKey # Change this for security!
    # Add any other necessary environment variables here
    ```

    **Important:** Replace `YourSecreetKey` with a strong, randomly generated secret key for session management.

4.  **Database Setup:**

    Ensure your MongoDB instance is running and accessible. Update the `DB_URL` in your `.env` file to point to your MongoDB database.

5.  **Build the Project:**

    ```bash
    npm run build
    ```

    This command compiles the TypeScript code into JavaScript.

6.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    This command starts the development server with live reloading, making development easier.

## Usage Examples & API Documentation

​### POST /user/register
Register a new user

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "address": "string"
}
```
Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```
Flow:
1. Validate required fields
2. Check email uniqueness
3. Hash password
4. Create user in database
5. Generate tokens
6. Return user data (excluding password)



### GET /user/all-users
Get all users (Admin only)

Headers:
Authorization: Bearer <token>

Query Params:
* role - Filter by role
* sort - Sorting (-createdAt for newest first)
* page - Pagination page
* limit - Items per page
* search - name, email, address, role

Response:
```json
{
  "success": true,
 "message": "User registered succesfully!"
  "data": [User],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### GET /user/:id
Update user

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "address": "string"
}
```
Response:
```json
{
  "success": true,
  "message": "User updated succesfully!",
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
  }
}
```
### POST /auth/login
 User login

**Request Body:**
```json
{
    "email":"email@example.com",
    "password":"A2b4@678"
}
```
Response:
```json
{
 "statusCode": 200,
    "success": true,
    "message": "User Logged In Successfully",
    "data": {
        "accessToken": T,
        "refreshToken": T,
        "user": {
            "_id": "68879ca67515bff8b87302dd",
            "name": "example",
            "email": "example@gmail.com",
            "role": "ADMIN",
            "isDeleted": false,
            "isActive": "ACTIVE",
            "isVerified": true,
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "super@gmail.com"
                }
            ],
            "createdAt": "2025-07-28T15:52:06.739Z",
            "updatedAt": "2025-07-28T15:52:06.739Z",
            "id": "3216ca67515bff8b87302dd"
        }
    }
}
```
### POST /auth/refresh-token
 Refresh token if token expired

**Request Body:**
```json
{
    "email":"email@example.com",
    "password":"A2b4@678"
}
```
Response:
```json
{
 "statusCode": 200,
    "success": true,
    "message": "Token refreshed Successfully",
    "data": {
        "accessToken": T,
        "refreshToken": T,
    }
}
```
### POST /auth/logout
 Refresh token if token expired

Response:
```json
{
 "statusCode": 200,
    "success": true,
    "message": "Logged out Successfully",
    "data":null
}
```
### POST /auth/reset-password
 Reset or change password
**Request Body:**
```json
{
    "oldPassword":"1223121AS12",
    "newPassword":"341131SQ@"
}
```
Response:
```json
{
 "statusCode": 200,
    "success": true,
    "message": "Logged out Successfully",
    "data":null
}
```
### POST /parcel/create
 Create a parcel to deliver
**Request Body:**
```json
    "sender": "6888ffa7d90d56f502191681",
    "receiver": {
        "name": "John Doe",
        "phone": "017********",
        "address": "Mohaammadpur, BD",
        "email": "example@gmail.com"
    },
    "packageDetails": {
        "type": "DOCUMENT",
        "weight": 0.2,
        "description": "Maritial contracts"
    },
    "fee": 12.99,
    "expectedDeliveryDate": "2026-09-15T00:00:00.000Z"
}
```
Response:
```json
{
    "statusCode": 201,
    "success": true,
    "message": "Parcel created succesfully!",
    "data": {
        "sender": "6888ffa7d90d56f502191681",
        "receiver": {
            "name": "John Doe",
            "phone": "017********",
            "address": "Mohaammadpur, BD",
            "email": "example@gmail.com"
        },
        "packageDetails": {
            "type": "DOCUMENT",
            "weight": 0.2,
            "description": "Mariti2al contracts"
        },
        "fee": 12.99,
        "currentStatus": "REQUESTED",
        "isBlocked": false,
        "expectedDeliveryDate": "2026-09-15T00:00:00.000Z",
        "_id": "688a64dda4496d1fbbaa4a6f",
        "statusLog": [
            {
                "status": "REQUESTED",
                "updatedBy": "6888ffa7d90d56f502191681",
                "note": "Parcel created",
                "createdAt": "2025-07-30T18:30:53.113Z",
                "_id": "688a64dda4496d1fbbaa4a71"
            }
        ],
        "createdAt": "2025-07-30T18:30:53.057Z",
        "updatedAt": "2025-07-30T18:30:53.057Z",
        "trackingId": "TRK-20250730-CNFB6U",
        "__v": 0
    }
}
```
### GET /parcel
 Get all parcel for admins and others, based on user role dirrefent data will be returned
Query Params:
* filter - Filter by any parcel field (packageDetails.type=FRAGILE)
* sort - Sorting (-createdAt for newest first)
* page - Pagination page
* limit - Items per page
* searchTerm - name, email, address, role
Response:
```json
{
    "statusCode": 201,
    "success": true,
    "message": "Parcel created succesfully!",
    "data": [{}]
}
```
### PATCH /parcel/:trkId
 Update parcel details by admins and others, based on user role dirrefent data will be affect
**Request Body:**
```json
 {
   "packageDetails":{
        "type":"FRAGILE"
    },
   "fee":20
}
```
Response:
```json
{
    "statusCode": 201,
    "success": true,
    "message": "Parcel created succesfully!",
    "data": [{}]
}
```
## Configuration Options

The application's behavior can be configured through environment variables. Here's a summary of key configuration options:

| Variable         | Description                           | Example                                     |
| :--------------- | :------------------------------------ | :------------------------------------------ |
| `PORT`           | The port on which the server listens. | `3000`                                      |
| `DB_URL`         | The MongoDB connection string.        | `mongodb://localhost:27017/parcel-delivery` |
| `SESSION_SECRET` | Secret key for express-session        | "YourSecreetKey"                            |

## Contributing Guidelines

We welcome contributions to this project! Here's how you can contribute:

1.  **Fork the repository:** Create your own fork of the repository.
2.  **Create a branch:** Create a new branch for your feature or bug fix.

    ```bash
    git checkout -b feature/my-new-feature
    ```

3.  **Make your changes:** Implement your changes and ensure the code is well-documented and tested.
4.  **Commit your changes:** Commit your changes with a clear and concise commit message.

    ```bash
    git commit -m "feat: Add new feature"
    ```

5.  **Push to your fork:** Push your changes to your forked repository.

    ```bash
    git push origin feature/my-new-feature
    ```

6.  **Create a pull request:** Submit a pull request to the main repository.

## License Information

License not specified in provided data.

## Acknowledgments

- Express.js: For providing a powerful and flexible web framework.
- TypeScript: For enabling type safety and improved code maintainability.
- Node.js: For providing a runtime environment for executing JavaScript code server-side.

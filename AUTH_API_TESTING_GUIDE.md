# Authentication API Testing Guide

## Register User

Endpoint:

POST /api/auth/register

Request Body:

```json
{
  "name": "Avani",
  "email": "avani@gmail.com",
  "password": "123456"
}
```

Expected Response:

```json
{
  "status": "success",
  "message": "User registered successfully"
}
```

---

## Login User

Endpoint:

POST /api/auth/login

Request Body:

```json
{
  "email": "avani@gmail.com",
  "password": "123456"
}
```

Expected Response:

```json
{
  "status": "success",
  "message": "Login successful",
  "token": "<JWT_TOKEN>"
}
```

---

## Protected Profile Route

Endpoint:

GET /api/auth/profile

Header:

Authorization: Bearer <JWT_TOKEN>

Expected Response:

```json
{
  "status": "success",
  "message": "Protected profile accessed successfully",
  "user": {
    "id": "...",
    "email": "..."
  }
}
```

---

## Error Case Testing

### Missing Token

Request:

GET /api/auth/profile

Expected Response:

```json
{
  "status": "error",
  "message": "Authorization header is required"
}
```

---

### Invalid Authorization Format

Header:

Authorization: wrongtoken123

Expected Response:

```json
{
  "status": "error",
  "message": "Invalid authorization format. Use Bearer token"
}
```

---

### Invalid Token

Header:

Authorization: Bearer wrongtoken123

Expected Response:

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

---

## Summary

This guide documents how to test the authentication APIs, including registration, login, JWT token generation, protected route access, and common authentication error cases.
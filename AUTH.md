# Authentication APIs

## Register User
POST /api/auth/register

Request:
```json
{
  "name": "Avani",
  "email": "avani@gmail.com",
  "password": "123456"
}
```

---

## Login User
POST /api/auth/login

Request:
```json
{
  "email": "avani@gmail.com",
  "password": "123456"
}
```

Response:
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "<JWT_TOKEN>"
}
```

---

## Profile Route
GET /api/auth/profile

Headers:
Authorization: Bearer <JWT_TOKEN>
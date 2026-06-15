# Authentication Testing

## Login API Testing

Endpoint:

POST /api/auth/login

Result:
- Login API was tested with valid credentials.
- Login request completed successfully.
- JWT token was generated successfully.

## JWT Token Generation

Result:
- JWT token is returned after successful login.
- Token is required to access protected routes.

## Protected Profile Route Testing

Endpoint:

GET /api/auth/profile

### Valid Token

Result:
- Request was allowed.
- Protected profile route was accessed successfully.

### Missing Token

Result:
- Request was denied.
- API returned an unauthorized response when no token was provided.

### Invalid Token

Result:
- Request was denied.
- API returned an invalid token response.

## Summary

The JWT authentication flow was tested successfully. Login, token generation, token verification, and protected route protection are working as expected.
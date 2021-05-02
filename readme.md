***JWT and refresh token

This is an example of authorization with JWT. An access token life time is set in the file .env for a short period of time (15s). The refresh token is stored in HttpOnly Cookie and after the expiration of the access token the route **/refresh** is used to get a new refresh token.


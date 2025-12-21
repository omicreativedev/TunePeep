package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/utils"
)

/* This file is a Gin middleware that protects API routes by validating JWT access tokens. It gets tokens from incoming requests, verifies their authenticity and expiration, and stores user claims in the request context. The middleware returns 401 Unauthorized responses for missing, invalid, or expired tokens. */

// Returns gin.HandlerFunc (which IS func(*gin.Context))
func AuthMiddleWare() gin.HandlerFunc {
	// This IS the gin.HandlerFunc being returned
	return func(c *gin.Context) {
		// Auth logic here
		// Get the JSON Web Token from GetAccessToken() in utils/tokenUtil.go, or the error if there's an error
		token, err := utils.GetAccessToken(c)

		// Check if there's an error while gtting tha token
		if err != nil { // If the error is not null
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()}) // Send 401 error with message
			c.Abort() // Abort the request
			return // Exit the function early
		}

		if token == "" { // If token is empty
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"}) // Send 401 error + text
			c.Abort() // Abort the request
			return // Exit the function early
		}

		// Send the token to utils/tokenUtil.go to verify and decode
		// Return as claims, or the error if there's an error
		claims, err := utils.ValidateToken(token)

		if err != nil { // If token is invalid or expired
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"}) // Send 401 error + text
			c.Abort() // Abort the request
			return // Exit the function early
		}

		// Store the UserID and Role in the request context (for use later)
		c.Set("userId", claims.UserId)
		c.Set("role", claims.Role)

		c.Next() // All checks passed. Proceed to the route handler
	}
}
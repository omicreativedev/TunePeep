package utils

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/database"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

/*
This file provides JWT token management and authentication validation.
It handles token generation, verification, database storage, and
retrieving authenticated user information from a request after token
validation to secure API endpoints and maintain user sessions.
*/

// JWT claims structure
type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserId    string
	jwt.RegisteredClaims
}

// Load JWT keys from environment
var SECRET_KEY string = os.Getenv("SECRET_KEY")
var SECRET_REFRESH_KEY string = os.Getenv("SECRET_REFRESH_KEY")

// Constants for token expiration
const (
	accessTokenExpiration  = 24 * time.Hour
	refreshTokenExpiration = 24 * 7 * time.Hour
	issuerName         = "TunePeep"
)

// createToken generates a single JWT token
func createToken(email, firstName, lastName, role, userId string, 
                 expiration time.Duration, secret string) (string, error) {
	claims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserId:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuerName,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
		},
	}
	
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// GenerateAllTokens creates new access and refresh tokens
func GenerateAllTokens(email, firstName, lastName, role, userId string) (string, string, error) {
	// Create access token
	signedToken, err := createToken(email, firstName, lastName, role, userId, 
		accessTokenExpiration, SECRET_KEY)
	if err != nil {
		return "", "", err
	}
	
	// Create refresh token
	signedRefreshToken, err := createToken(email, firstName, lastName, role, userId,
		refreshTokenExpiration, SECRET_REFRESH_KEY)
	if err != nil {
		return "", "", err
	}
	
	// Return both tokens
	return signedToken, signedRefreshToken, nil
}

// UpdateAllTokens stores tokens in database
func UpdateAllTokens(userId, token, refreshToken string, client *mongo.Client) (err error) {
	// Create timeout context
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	// Cleanup
	defer cancel()

	// Get current timestamp (simplified)
	updateAt := time.Now()

	// Prepare update data
	updateData := bson.M{
		"$set": bson.M{
			"token":         token,         // Set access token
			"refresh_token": refreshToken,  // Set refresh token
			"update_at":     updateAt,      // Set update timestamp
		},
	}

	// Get users collection
	var userCollection *mongo.Collection = database.OpenCollection("users", client)

	// Update user document
	_, err = userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, updateData)

	if err != nil {
		return err
	}
	return nil
}

// Reference: https://datatracker.ietf.org/doc/html/rfc6750

// Get token from cookie
func GetAccessToken(c *gin.Context) (string, error) {
	tokenString, err := c.Cookie("access_token")
	if err != nil {
		return "", err
	}

	// Return token string
	return tokenString, nil
}

// Validate JWT token with secret
func validateTokenHelper(tokenString string, secretKey string) (*SignedDetails, error) {
	claims := &SignedDetails{}
	
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	// Verify signing method
	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("invalid signing method")
	}

	// Check token expiration
	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

// ValidateToken verifies access token signature and expiration
func ValidateToken(tokenString string) (*SignedDetails, error) {
	return validateTokenHelper(tokenString, SECRET_KEY)
}

// GetFromContext extracts any value from Gin context with type safety
func GetFromContext(c *gin.Context, key string) (string, error) {
	value, exists := c.Get(key)
	
	if !exists {
		return "", errors.New(key + " does not exist in this context")
	}
	
	strValue, ok := value.(string)
	if !ok {
		return "", errors.New("Not able to return " + key)
	}
	
	return strValue, nil
}

// GetUserIdFromContext gets userId from Gin context
func GetUserIdFromContext(c *gin.Context) (string, error) {
	return GetFromContext(c, "userId")
}

// GetRoleFromContext gets role from Gin context
func GetRoleFromContext(c *gin.Context) (string, error) {
	return GetFromContext(c, "role")
}

// Verify refresh token signature expiration
func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {
	return validateTokenHelper(tokenString, SECRET_REFRESH_KEY)
}
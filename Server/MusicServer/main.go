package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/database"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/routes"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

/* This file is the main entry point for the TunePeep MusicServer API. It initializes a Gin web server with CORS configuration, establishes a MongoDB connection, and sets up both protected and unprotected routes. The server handles environment variable loading, database connectivity, and shutdown procedures on port 8080. */

func main() {
	// Initialize Gin router with middleware logger and recovery
	router := gin.Default()

	// Remove trailing slashes for consistency if needed (uncomment)
	// router.RemoveExtraSlash = true

	// c is the context from the incoming client which allows us
	// to call various functionalities on the c function handler method
	// This is a test endpoint to verify the server is running
	router.GET("/hello", func(c *gin.Context) { // Go to localhost http://localhost:8080/hello
		c.String(200, "Hello! We are online!") // http status 200 (success)
	})

	// Load environment variables from .env file
	// In production version, environmental variables are configured
	// in Reder/Vercel
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Unable to find .env file for main.go")
	}

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")

	var origins []string
	if allowedOrigins != "" {
		origins = strings.Split(allowedOrigins, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
			log.Println("Allowed Origin:", origins[i])
		}
	} else {
		// Change this for production from 8080 to the server port
		origins = []string{"http://localhost:8080"} 
		log.Println("Allowed Origin: http://localhost:8080")
	}

	config := cors.Config{}
	config.AllowOrigins = origins
	config.AllowMethods = []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length", "Set-Cookie"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))

	router.Use(gin.Logger())


	// Establish database connection
	// Moved from database_connection package
	var client *mongo.Client = database.Connect()

	// Verify database connection is actually alive
	if err := client.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to reach server: %v", err)
	}

	// Clean shutdown
	defer func() {
		err := client.Disconnect(context.Background())
		if err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()

	// Set up application routes
	// Unprotected routes (public access)
	routes.SetupUnProtectedRoutes(router, client)
	// Protected routes (require authentication)
	routes.SetupProtectedRoutes(router, client)
	
	// Start the HTTP server on port 8080
	// Server not working: this error message will display if 
	// the server fails to start. We want it to be 8080 for
	// Render.com but it can change
	if err := router.Run(":8080"); err != nil { // port 8080
		fmt.Println("Server failed, dude!", err)
	}
}
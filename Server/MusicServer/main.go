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
	"go.mongodb.org/mongo-driver/v2/mongo"

	// controller "github.com/omicreativedev/TunePeep/Server/MusicServer/controllers"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/database"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/routes"
)

func main() {
	// Initialize Gin router with middleware logger and recovery
	router := gin.Default()

	// Remove trailing slashes for consistency if needed (uncomment)
	// router.RemoveExtraSlash = true

	// Health check endpoint
	// c is the context from the incoming client which allows us to call various functionalities on the c function handler method
	// This is a test endpoint to verify the server is running
	router.GET("/hello", func(c *gin.Context) { // go to localhost http://localhost:8080/hello
		c.String(200, "Hello! We are online!") // http status 200 (success)
	})

	// Load environment variables from .env file
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Unable to find .env file for main")
	}

	 //----------------------------

	// change later
// router.Use(cors.New(cors.Config{
//         AllowOrigins:     []string{"http://localhost:8072", "http://localhost:3000", "http://localhost:5173"},
//         AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
//         AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
//         ExposeHeaders:    []string{"Content-Length"},
//         AllowCredentials: true,
//         MaxAge:           12 * time.Hour,
//     }))
allowedOrigins := os.Getenv("ALLOWED_ORIGINS")

	var origins []string
	if allowedOrigins != "" {
		origins = strings.Split(allowedOrigins, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
			log.Println("Allowed Origin:", origins[i])
		}
	} else {
		origins = []string{"http://localhost:8070"}
		log.Println("Allowed Origin: http://localhost:8070")
	}

	config := cors.Config{}
	config.AllowOrigins = origins
	config.AllowMethods = []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))


	//---------------------------
	router.Use(gin.Logger())


	// Establish database connection
	// Moved from database_connection package
	var client *mongo.Client = database.Connect()

	// Verify database connection is actually alive
	if err := client.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to reach server: %v", err)
	}

	// Defer database disconnection and ensure clean shutdown
	defer func() {
		err := client.Disconnect(context.Background())
		if err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()
	
	// end cors

	// Set up application routes
	// Unprotected routes (public access)
	routes.SetupUnProtectedRoutes(router, client)
	// Protected routes (require authentication)
	routes.SetupProtectedRoutes(router, client)
	
	// Moved to /routes package
	// router.GET("/music", controller.GetMusics())
	// router.GET("/music/:music_id", controller.GetMusic())
	// router.POST("/addmusic", controller.AddMusic())
	// router.POST("/register", controller.RegisterUser())
	// router.POST("/login", controller.LoginUser())

	// Start the HTTP server on port 8082
	// Server not working: this error message will display if the server fails to start
	if err := router.Run(":8080"); err != nil { // port 8080
		fmt.Println("Server failed, dude!", err)
	}
}
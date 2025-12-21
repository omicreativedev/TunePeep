package database

import (
	"fmt"
	"log"
	"os"

	// Reference: https://github.com/joho/godotenv
	"github.com/joho/godotenv" // To load environmental variables. Store the database connection string.
	// Reference: https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

/* This file manages the MongoDB connection. It provides functions to establish a database connection using environment variables and to open specific collections within the database. */

// Reference: https://www.mongodb.com/docs/drivers/go/current/usage-examples/connect/

func Connect() *mongo.Client {

	err := godotenv.Load(".env")

	if err != nil {
		log.Println("Warning: unable to fund .env file for database_connection")
	}

	MongoDb := os.Getenv("MONGODB_URI")

	if MongoDb == "" {
		log.Fatal("MONGODB_URI not set.")
	}

	fmt.Println("MongoDB URI: ", MongoDb)

	clientOptions := options.Client().ApplyURI(MongoDb)

	client, err := mongo.Connect(clientOptions)

	if err != nil {
		return nil
	}

	return client
}

 // Open specified collection in specified database
func OpenCollection(collectionName string, client *mongo.Client) *mongo.Collection {

	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file for database_connection")
	}

	databaseName := os.Getenv("DATABASE_NAME")

	fmt.Println("DATABASE_NAME: ", databaseName)

	collection := client.Database(databaseName).Collection(collectionName)

	if collection == nil {
		return nil
	}

	return collection
}

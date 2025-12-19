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

// Establish connection to MongoDB server
// Reference: https://www.mongodb.com/docs/drivers/go/current/usage-examples/connect/

// func DBInstance() *mongo.Client {
func Connect() *mongo.Client {
 
// func Connect() *mongo.Client { 

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

// var Client *mongo.Client = DBInstance()
// var Client *mongo.Client = Connect()

func OpenCollection(collectionName string, client *mongo.Client) *mongo.Collection {
 // Open specified collection in specified database
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file for database_connection")
	}

	databaseName := os.Getenv("DATABASE_NAME")

	fmt.Println("DATABASE_NAME: ", databaseName)

	//if Client == nil {
	//	log.Fatal("MongoDB client is not initialized")
	//}

	collection := client.Database(databaseName).Collection(collectionName)

	if collection == nil {
		return nil
	}

	return collection
}

package controllers

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/database"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/models"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/utils"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)



var validate = validator.New()

// Public function. Hook into web framework. Return function of type gin.HandlerFunc
// through the context object(c) passed to the function. Create http responses.
func GetMusics(client *mongo.Client) gin.HandlerFunc {
		return func(c *gin.Context){
			// c.JSON(200, gin.H{"message":"List of Albums"})
			ctx, cancel := context.WithTimeout(c, 100*time.Second)
			defer cancel()

			var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

			var musics []models.Music

			cursor, err := musicCollection.Find(ctx, bson.M{})

			if err !=nil{
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch music"})
			}

			defer cursor.Close(ctx)

			if err = cursor.All(ctx, &musics); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode music"})
			}
			c.JSON(http.StatusOK,musics)
		}
}


func GetMusic(client *mongo.Client) gin.HandlerFunc {

	return func(c *gin.Context){

			ctx, cancel := context.WithTimeout(c, 100*time.Second)
			defer cancel() // clean up if err

			musicID := c.Param("music_id")

			if musicID == ""{
								c.JSON(http.StatusBadRequest, gin.H{"error": "Spotify ID required"})
								return
			}
			var music  models.Music

			var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

			err := musicCollection.FindOne(ctx, bson.M{"music_id": musicID}).Decode(&music)
			
			if err != nil{
				c.JSON(http.StatusNotFound, gin.H{"error":"Album not found"})
				return
			}
			c.JSON(http.StatusOK, music)
	}

}


func AddMusic(client *mongo.Client) gin.HandlerFunc {
    return func(c *gin.Context){
        ctx, cancel := context.WithTimeout(c, 100*time.Second)
        defer cancel()

        var music models.Music
        
        // Bind JSON from request
        if err := c.ShouldBindJSON(&music); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON", "details": err.Error()})
            return
        }

        // Validate the populated music struct
        if err := validate.Struct(music); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error":"Validation failed", "details":err.Error()})
            return
        }
        var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

        result, err := musicCollection.InsertOne(ctx, music)
        if err != nil{
            c.JSON(http.StatusInternalServerError, gin.H{"error" : "Failed to add music"})
            return
        }
        c.JSON(http.StatusCreated, result)
    }
}

// Ranking System

// From: https://github.com/tmc/langchaingo/blob/main/examples/openai-completion-example/main.go

func AdminReviewUpdate(client *mongo.Client) gin.HandlerFunc{
	return func(c *gin.Context){


		// Start Admin Authorization -- from tokenUtil.go

		role, err := utils.GetRoleFromContext(c)
		if err != nil{
				c.JSON(http.StatusBadRequest, gin.H{"error":"Role not found in context"})
				return
		}

		if role != "ADMIN" {
				c.JSON(http.StatusUnauthorized, gin.H{"error":"User must be admin role"})
		return
		}

		musicId := c.Param("music_id")
		if musicId == ""{
		c.JSON(http.StatusBadRequest, gin.H{"error":"Spotify music Id required"})
		return
		}
		var req struct {
				AdminReview string `json:"admin_review"`
		}
		var resp struct {
				RankingName string `json:"ranking_name"`
				AdminReview string `json:"admin_review"`
		}
		if err := c.ShouldBind(&req); err !=nil{
				c.JSON(http.StatusBadRequest, gin.H{"error":"Invalid request"})
				return
		}
		sentiment, rankVal, err := GetReviewRanking(req.AdminReview, client, c)
		
		if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error getting review ranking"})
			return
		}

		filter := bson.M{"music_id": musicId}

		update := bson.M{
			"$set": bson.M{
				"admin_review": req.AdminReview,
				"ranking": bson.M{
					"ranking_value": rankVal,
					"ranking_name":  sentiment,
				},
			},
		}
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()
		
		var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

		result, err := musicCollection.UpdateOne(ctx, filter, update)

			if err != nil{
			c.JSON(http.StatusInternalServerError, gin.H{"error":"Error updating music"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error":"Music not found"})
			return
		}

		resp.RankingName = sentiment
		resp.AdminReview = req.AdminReview
		c.JSON(http.StatusOK, resp)

	}
}

func GetReviewRanking(admin_review string, client *mongo.Client, c *gin.Context)(string, int,error){
		rankings, err := GetRankings(client, c)

		if err != nil{
			return "", 0, err
		}

		sentimentDelimited := ""

		for _, ranking := range rankings {
			if ranking.RankingValue != 999 {
				sentimentDelimited = sentimentDelimited + ranking.RankingName + ","
			}
		}
		
		sentimentDelimited = strings.Trim(sentimentDelimited, ",")

		err = godotenv.Load(".env")

		if err != nil {
			log.Println("Warning: .env file not found for music_controller")
		}

		AiApiKey := os.Getenv("API_KEY")

		if AiApiKey == "" {
			return "", 0, errors.New("could not read API key")
		}

		llm, err := openai.New(openai.WithToken(AiApiKey))

		if err !=nil{
			return "", 0, err
		}

		base_prompt_template := os.Getenv("BASE_PROMPT_TEMPLATE")

		base_prompt := strings.Replace(base_prompt_template, "{rankings}", sentimentDelimited, 1)

		response, err := llm.Call(c, base_prompt+admin_review)

		if err != nil {
			return "", 0, err
		}

		rankVal := 0

		for _, ranking := range rankings {
			if ranking.RankingName == response {
				rankVal = ranking.RankingValue
				break
			}
		}

		return response, rankVal, nil

}

func GetRankings(client *mongo.Client, c *gin.Context)([]models.Ranking, error){
	
	var rankings []models.Ranking

	var ctx, cancel = context.WithTimeout(c, 100*time.Second)
	defer cancel()

	var rankingCollection *mongo.Collection = database.OpenCollection("rankings", client)

	cursor, err := rankingCollection.Find(ctx, bson.M{})

	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &rankings); err != nil {
		return nil, err
	}

	return rankings, nil
}

func GetRecommendedMusics(client *mongo.Client) gin.HandlerFunc{
    return func(c *gin.Context){

		 userId, err := utils.GetUserIdFromContext(c)

		 if err !=nil {
			c.JSON(http.StatusBadRequest, gin.H{"error":"userId not found in context"})
			return
		 }

		 favourite_genres, err := GetUsersFavouriteGenres(userId, client, c)

		 if err != nil{

			c.JSON(http.StatusInternalServerError, gin.H{"error":err.Error()})
			return
		 }
		 err = godotenv.Load(".env")
		 if err != nil{
			log.Println("Warning .env file not found for music_controller")
			}

			var recommendedMusicLimitVal int64 = 5	

			recommendedMusicLimitStr := os.Getenv("RECOMMENDED_MUSIC_LIMIT")
			
			if recommendedMusicLimitStr != ""{
				recommendedMusicLimitVal, _ = strconv.ParseInt(recommendedMusicLimitStr, 10, 64)
			}

			findOptions := options.Find()

			findOptions.SetSort(bson.D{{Key: "ranking.ranking_value", Value:1}})

			findOptions.SetLimit(recommendedMusicLimitVal)

			filter := bson.M{"genre.genre_name" : bson.M{"$in":favourite_genres}}

			var ctx, cancel = context.WithTimeout(c, 100*time.Second)
			defer cancel()

			var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

			cursor, err := musicCollection.Find(ctx,filter,findOptions)

			if err != nil{
				c.JSON(http.StatusInternalServerError, gin.H{"error":"error fetching recommended musics"})
				return
			}

			defer cursor.Close(ctx)

			var recommendedMusics []models.Music

			if err = cursor.All(ctx, &recommendedMusics); err != nil{
						c.JSON(http.StatusInternalServerError, gin.H{"error":err.Error()})
						return
			}

			c.JSON(http.StatusOK, recommendedMusics)
			
	 }
}

func GetUsersFavouriteGenres(userId string, client *mongo.Client, c *gin.Context)([]string, error){

		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		filter := bson.M{"user_id":userId}

		projection := bson.M{
		"favourite_genres.genre_name": 1,
		"_id":                         0,
		}

		opts := options.FindOne().SetProjection(projection)
		var result bson.M

		var userCollection *mongo.Collection = database.OpenCollection("users", client)

		err := userCollection.FindOne(ctx, filter,opts).Decode(&result)

		if err !=nil {
			if err == mongo.ErrNoDocuments {
				return []string{}, nil
			}
			return nil, err
		}

		favGenresArray, ok := result["favourite_genres"].(bson.A)

		if !ok {
			return []string{}, errors.New("unable to get favorite genres for user")
		}

		var genreNames []string

		for _, item := range favGenresArray {
			if genreMap, ok := item.(bson.D); ok {
				for _, elem := range genreMap {
					if elem.Key == "genre_name" {
						if name, ok := elem.Value.(string); ok {
							genreNames = append(genreNames, name)
						}
					}
				}
			}
		}

		return genreNames, nil

}

func GetGenres(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var genreCollection *mongo.Collection = database.OpenCollection("genres", client)

		cursor, err := genreCollection.Find(ctx, bson.D{})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching music genres"})
			return
		}
		defer cursor.Close(ctx)

		var genres []models.Genre
		if err := cursor.All(ctx, &genres); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, genres)

	}
}

// NEW

// EDIT

func EditMusic(client *mongo.Client) gin.HandlerFunc {
    return func(c *gin.Context){
        ctx, cancel := context.WithTimeout(c, 100*time.Second)
        defer cancel()

        musicID := c.Param("music_id")
        
        if musicID == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "music_id is required"})
            return
        }

        var updateData map[string]interface{}
        
        if err := c.ShouldBindJSON(&updateData); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
            return
        }

        // Define allowed fields that can be updated (including music_id)
        allowedFields := map[string]bool{
            "music_id":  true,
            "title":     true,
            "album_img": true,
            "youtube_id": true,
            "genre":     true,
        }

        // Filter updateData to only include allowed fields
        filteredUpdate := bson.M{}
        for key, value := range updateData {
            if allowedFields[key] {
                // Special validation for genre field
                if key == "genre" {
                    // Validate genre structure
                    validatedGenre, err := validateGenreField(value)
                    if err != nil {
                        c.JSON(http.StatusBadRequest, gin.H{
                            "error": "Invalid genre data",
                            "details": err.Error(),
                        })
                        return
                    }
                    filteredUpdate[key] = validatedGenre
                } else {
                    filteredUpdate[key] = value
                }
            }
        }

        // Prevent changing the autogenerated _id field only
        if _, exists := updateData["_id"]; exists {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change _id field"})
            return
        }

        // Also check for other potential autogenerated ID field names
        if _, exists := updateData["id"]; exists {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change id field"})
            return
        }

        // Prevent updating admin_review and ranking fields
        if _, exists := updateData["admin_review"]; exists {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change admin_review field. Use /updatereview/:music_id endpoint"})
            return
        }

        if _, exists := updateData["ranking"]; exists {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change ranking field. Use /updatereview/:music_id endpoint"})
            return
        }

        if len(filteredUpdate) == 0 {
            // Check if they tried to update disallowed fields
            if len(updateData) > 0 {
                var attemptedFields []string
                for key := range updateData {
                    attemptedFields = append(attemptedFields, key)
                }
                c.JSON(http.StatusBadRequest, gin.H{
                    "error": "No allowed fields provided for update",
                    "attempted_fields": attemptedFields,
                    "allowed_fields": []string{"music_id", "title", "album_img", "youtube_id", "genre"},
                })
                return
            }
            c.JSON(http.StatusBadRequest, gin.H{"error": "No fields provided for update"})
            return
        }

        var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

        // If music_id is being updated, we need to handle it specially
        var newMusicID string
        if newID, exists := filteredUpdate["music_id"]; exists {
            if idStr, ok := newID.(string); ok && idStr != "" {
                newMusicID = idStr
            } else {
                c.JSON(http.StatusBadRequest, gin.H{"error": "music_id must be a non-empty string"})
                return
            }
        }

        filter := bson.M{"music_id": musicID}
        update := bson.M{"$set": filteredUpdate}

        result, err := musicCollection.UpdateOne(ctx, filter, update)

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update music"})
            return
        }

        if result.MatchedCount == 0 {
            c.JSON(http.StatusNotFound, gin.H{"error": "Music not found"})
            return
        }

        // If music_id was changed, use the new ID to fetch the updated document
        var fetchFilter bson.M
        if newMusicID != "" {
            fetchFilter = bson.M{"music_id": newMusicID}
        } else {
            fetchFilter = filter
        }

        var updatedMusic models.Music
        err = musicCollection.FindOne(ctx, fetchFilter).Decode(&updatedMusic)
        
        if err != nil {
            c.JSON(http.StatusOK, gin.H{
                "message": "Music updated successfully",
                "matched_count": result.MatchedCount,
                "modified_count": result.ModifiedCount,
                "note": "Could not fetch updated document, but update was successful",
            })
            return
        }

        c.JSON(http.StatusOK, updatedMusic)
    }
}

// Helper function so we can validate the genre field
func validateGenreField(value interface{}) (interface{}, error) {
    // Check if it's an array/slice
    genresSlice, ok := value.([]interface{})
    if !ok {
        return nil, errors.New("genre must be an array")
    }

    validatedGenres := make([]map[string]interface{}, 0, len(genresSlice))
    
    for i, genreItem := range genresSlice {
        genreMap, ok := genreItem.(map[string]interface{})
        if !ok {
            return nil, fmt.Errorf("genre item %d must be an object", i)
        }

        validatedGenre := make(map[string]interface{})
        
        // Validate genre_name
        if genreName, exists := genreMap["genre_name"]; exists {
            if nameStr, ok := genreName.(string); ok && nameStr != "" {
                validatedGenre["genre_name"] = nameStr
            } else {
                return nil, fmt.Errorf("genre_name at index %d must be a non-empty string", i)
            }
        }
        
        // Validate genre_id - convert to number if it's a string, because of course I messed this up too many times
        if genreID, exists := genreMap["genre_id"]; exists {
            switch v := genreID.(type) {
            case string:
                // Try to convert string to integer
                if intVal, err := strconv.Atoi(v); err == nil {
                    validatedGenre["genre_id"] = intVal
                } else {
                    return nil, fmt.Errorf("genre_id at index %d must be a number (could not convert '%s')", i, v)
                }
            case float64:
                // JSON numbers come as float64 so convert to int
                validatedGenre["genre_id"] = int(v)
            case int:
                validatedGenre["genre_id"] = v
            default:
                return nil, fmt.Errorf("genre_id at index %d must be a number, got %T", i, v)
            }
        }
        
        if len(validatedGenre) > 0 {
            validatedGenres = append(validatedGenres, validatedGenre)
        }
    }
    
    return validatedGenres, nil
}

// DELETE

func DeleteMusic(client *mongo.Client) gin.HandlerFunc {
    return func(c *gin.Context){
        ctx, cancel := context.WithTimeout(c, 100*time.Second)
        defer cancel()

        musicID := c.Param("music_id")
        
        if musicID == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "music_id is required to delete an album"})
            return
        }

        var musicCollection *mongo.Collection = database.OpenCollection("musics", client)

        filter := bson.M{"music_id": musicID}

        var existingMusic models.Music
        err := musicCollection.FindOne(ctx, filter).Decode(&existingMusic)
        
        if err != nil {
            if err == mongo.ErrNoDocuments {
                c.JSON(http.StatusNotFound, gin.H{"error": "Album not found"})
                return
            }
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify album existence"})
            return
        }

        result, err := musicCollection.DeleteOne(ctx, filter)

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete album"})
            return
        }

        if result.DeletedCount == 0 {
            c.JSON(http.StatusNotFound, gin.H{"error": "Album not found"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "message": "Music deleted",
            "deleted_count": result.DeletedCount,
        })
    }
}
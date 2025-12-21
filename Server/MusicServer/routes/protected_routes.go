package routes

import (
	"github.com/gin-gonic/gin"
	controller "github.com/omicreativedev/TunePeep/Server/MusicServer/controllers"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

/* This file defines public API routes that require authentication. It maps HTTP endpoints to their corresponding controller functions. */

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleWare())

	router.GET("/music/:music_id", controller.GetMusic(client))
	router.POST("/addmusic", controller.AddMusic(client))
  router.GET("/recommendedmusic", controller.GetRecommendedMusics(client))
	router.PATCH("/updatereview/:music_id", controller.AdminReviewUpdate(client))
 // NEW
 	router.PATCH("/edit/:music_id", controller.EditMusic(client))
	router.DELETE("/delete/:music_id", controller.DeleteMusic(client))
}

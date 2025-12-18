package routes

import (
	"github.com/gin-gonic/gin"
	controller "github.com/omicreativedev/TunePeep/Server/MusicServer/controllers"
	"github.com/omicreativedev/TunePeep/Server/MusicServer/middleware"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleWare())

	router.GET("/music/:music_id", controller.GetMusic(client))
	router.POST("/addmusic", controller.AddMusic(client))
  router.GET("/recommendedmusic", controller.GetRecommendedMusics(client))
	router.PATCH("/updatereview/:music_id", controller.AdminReviewUpdate(client))
 // NEW
 	router.PATCH("/editmusic/:music_id", controller.EditMusic(client))
	router.DELETE("/deletemusic/:music_id", controller.DeleteMusic(client))
}

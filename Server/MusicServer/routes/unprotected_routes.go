package routes

import (
	"github.com/gin-gonic/gin"
	controller "github.com/omicreativedev/TunePeep/Server/MusicServer/controllers"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

/* This file defines public API routes that don't require authentication. It maps HTTP endpoints to their corresponding controller functions. */

func SetupUnProtectedRoutes(router *gin.Engine, client *mongo.Client) {

	router.GET("/musics", controller.GetMusics(client))
	router.POST("/register", controller.RegisterUser(client))
	router.POST("/login", controller.LoginUser(client))
	router.POST("/logout", controller.LogoutHandler(client))
	router.GET("/genres", controller.GetGenres(client))
	router.POST("/refresh", controller.RefreshTokenHandler(client))
}

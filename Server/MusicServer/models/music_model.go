package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

/* This file defines the music-related data structures. It contains the main Music model along with types for Genre and Ranking. These structs include BSON and JSON field mappings for MongoDB and API responses. */

type Genre struct {
	GenreID int `bson:"genre_id" json:"genre_id" validate:"required"`
	GenreName string `bson:"genre_name" json:"genre_name" validate:"required,min=2,max=100"`
}

type Ranking struct  {
	RankingValue int `bson:"ranking_value" json:"ranking_value" validate:"required"`
	RankingName string `bson:"ranking_name" json:"ranking_name" validate:"required"`
}

type Music struct {
	ID bson.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	MusicID string `bson:"music_id" json:"music_id" validate:"required"`
	Title string `bson:"title" json:"title" validate:"required,min=2,max=500"`
	AlbumImg string `bson:"album_img" json:"album_img" validate:"required,url"`
	YouTubeID string `bson:"youtube_id" json:"youtube_id" validate:"required"`
	Genre []Genre `bson:"genre" json:"genre" validate:"required,dive"`
	AdminReview string `bson:"admin_review" json:"admin_review" validate:"required"`
	Ranking Ranking `bson:"ranking" json:"ranking" validate:"required"`
}
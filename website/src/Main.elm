port module Main exposing (..)

import Navigation
import Json.Encode as Encode
import Json.Decode as Decode exposing ((:=))
import Components.Init exposing (init)
import Components.Messages exposing (Msg(..))
import Components.Model exposing (Model)
import Components.View exposing (view)
import Components.Update exposing (update)
import Models.Route as Route
import DefaultServices.Router as Router
import Subscriptions exposing (subscriptions)


{-| The entry point to the elm application. The navigation module allows us to
use the `urlUpdate` field so we can essentially subscribe to url changes. We
take in the cachedModel from localStorage as a flag.
-}
main : Program (Maybe Decode.Value)
main =
    Navigation.programWithFlags Router.parser
        { init = init
        , update = update
        , urlUpdate = Router.urlUpdate
        , subscriptions = subscriptions
        , view = view
        }

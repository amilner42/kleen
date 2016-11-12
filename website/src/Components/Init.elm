module Components.Init exposing (init)

import Json.Encode as Encode
import Json.Decode as Decode exposing ((:=))
import DefaultModel exposing (defaultModel)
import Models.Route as Route
import Components.Model exposing (Model, cacheDecoder)
import Components.Messages exposing (Msg)


{-| Base Component Init.
-}
init : Maybe Encode.Value -> Result String Route.Route -> ( Model, Cmd Msg )
init maybeEncodedCachedModel routeResult =
    let
        route =
            case routeResult of
                Ok aRoute ->
                    aRoute

                Err err ->
                    Route.MainView

        initialModel =
            case maybeEncodedCachedModel of
                Nothing ->
                    { defaultModel | route = route }

                Just encodedCachedModel ->
                    case (Decode.decodeValue cacheDecoder encodedCachedModel) of
                        Ok cachedModel ->
                            { cachedModel | route = route }

                        Err err ->
                            { defaultModel | route = route }
    in
        ( initialModel, Cmd.none )

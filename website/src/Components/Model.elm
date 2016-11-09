module Components.Model exposing (Model, cacheEncoder, cacheDecoder)

import Json.Encode as Encode
import Json.Decode as Decode exposing ((:=))
import Json.Decode.Pipeline exposing (decode, required, optional, hardcoded, nullable)
import Models.Route as Route


{-| Base Component Model.
-}
type alias Model =
    { route : Route.Route
    }


{-| Route cacheEncoder.
-}
cacheEncoder : Model -> Encode.Value
cacheEncoder record =
    Encode.object
        [ ( "route", Route.cacheEncoder record.route )
        ]


{-| Route cacheDecoder.
-}
cacheDecoder : Decode.Decoder Model
cacheDecoder =
    decode Model
        |> required "route" Route.cacheDecoder

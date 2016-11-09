module Components.Model exposing (Model, cacheEncoder, cacheDecoder)

import Json.Encode as Encode
import Json.Decode as Decode exposing ((:=))
import Json.Decode.Pipeline exposing (decode, required, optional, hardcoded, nullable)
import Models.Route as Route


{-| Base Component Model.
-}
type alias Model =
    { route : Route.Route
    , generatorInput : String
    , generatorOutput : String
    }


{-| Route cacheEncoder.
-}
cacheEncoder : Model -> Encode.Value
cacheEncoder record =
    Encode.object
        [ ( "route", Route.cacheEncoder record.route )
        , ( "generatorInput", Encode.string record.generatorInput )
        , ( "generatorOutput", Encode.string record.generatorOutput )
        ]


{-| Route cacheDecoder.
-}
cacheDecoder : Decode.Decoder Model
cacheDecoder =
    decode Model
        |> required "route" Route.cacheDecoder
        |> required "generatorInput" Decode.string
        |> required "generatorOutput" Decode.string

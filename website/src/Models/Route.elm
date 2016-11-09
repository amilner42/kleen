module Models.Route
    exposing
        ( Route(..)
        , cacheDecoder
        , cacheEncoder
        , defaultRoute
        , urlParsers
        , toUrl
        )

import Config
import UrlParser exposing (s)
import Json.Encode as Encode
import Json.Decode as Decode exposing ((:=))
import Json.Decode.Pipeline exposing (decode, required, optional, hardcoded, nullable)


{-| All of the app routes.
-}
type Route
    = MainView
    | TutorialView
    | GeneratorView


{-| Auto generated cacheDecoder.
-}
cacheDecoder : Decode.Decoder Route
cacheDecoder =
    let
        fromStringRoute string =
            case string of
                "MainView" ->
                    Decode.succeed MainView

                "TutorialView" ->
                    Decode.succeed TutorialView

                "GeneratorView" ->
                    Decode.succeed GeneratorView

                _ ->
                    Decode.fail ("Not valid pattern for decoder to Route. Pattern: " ++ (toString string))
    in
        Decode.string `Decode.andThen` fromStringRoute


{-| Auto generated cacheEncoder.
-}
cacheEncoder : Route -> Encode.Value
cacheEncoder =
    toString >> Encode.string


{-| The default route.
-}
defaultRoute : Route
defaultRoute =
    MainView


{-| The URL parsers for the router.
-}
urlParsers =
    [ UrlParser.format MainView (s "")
    , UrlParser.format TutorialView (s "tutorial")
    , UrlParser.format GeneratorView (s "generator")
    ]


{-| Converts a route to a url.
-}
toUrl : Route -> String
toUrl route =
    case route of
        MainView ->
            Config.baseUrl ++ "#"

        TutorialView ->
            Config.baseUrl ++ "#tutorial"

        GeneratorView ->
            Config.baseUrl ++ "#generator"

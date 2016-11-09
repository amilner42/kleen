module DefaultServices.Router exposing (..)

import String
import Navigation
import Config
import UrlParser
import Models.Route as Route
import Components.Model exposing (Model)
import DefaultServices.Util as Util
import DefaultServices.LocalStorage as LocalStorage


{-| Matchers for the urls.
-}
matchers : UrlParser.Parser (Route.Route -> a) a
matchers =
    UrlParser.oneOf Route.urlParsers


{-| The Parser, currently intakes routes prefixed by hash.
-}
hashParser : Navigation.Location -> Result String Route.Route
hashParser location =
    location.hash
        |> String.dropLeft 1
        |> UrlParser.parse identity matchers


{-| The Navigation Parser (requires the parser)
-}
parser : Navigation.Parser (Result String Route.Route)
parser =
    Navigation.makeParser hashParser


{-| Navigates to a given route.
-}
navigateTo : Route.Route -> Cmd msg
navigateTo route =
    Navigation.newUrl <| Route.toUrl <| route


{-| Updates the model `route` field when the route is updated. This function
handles the cases where the user is logged in and goes to an unauth-page like
welcome or where the user isn't logged in and goes to an auth-page. You simply
need to specify `routesNotNeedingAuth`, `defaultUnauthRoute`, and
`defaultAuthRoute` in your `Routes` model. It also handles users going to
routes that don't exist (just goes `back` to the route they were on before).
-}
urlUpdate : Result String Route.Route -> Model -> ( Model, Cmd msg )
urlUpdate routeResult model =
    case routeResult of
        Ok route ->
            let
                newModel =
                    { model | route = route }
            in
                ( newModel, LocalStorage.saveModel newModel )

        Err err ->
            ( model, Navigation.back 1 )

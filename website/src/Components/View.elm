module Components.View exposing (view)

import Html exposing (Html, div, text)
import Components.Messages exposing (Msg)
import Components.Model exposing (Model)
import DefaultServices.Util exposing (conditionalClasses, cssComponentNamespace)


{-| The topbar of the website.
-}
navBar : Html msg
navBar =
    div
        [ conditionalClasses
            [ ( True, "nav-bar" )
            ]
        ]
        [ text "Kleen" ]


{-| Base Component View.
-}
view : Model -> Html Msg
view model =
    cssComponentNamespace "base" Nothing <|
        div
            []
            [ navBar ]

module Components.View exposing (view)

import Html exposing (Html, span, div, text, a)
import Html.Attributes exposing (class, href)
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
        [ span
            [ conditionalClasses
                [ ( True, "nav-bar-selected" )
                ]
            ]
            [ text "Kleen" ]
        , div
            [ class "nav-bar-link-to-me-text" ]
            [ text "Created by "
            , a
                [ href "https://github.com/amilner42"
                , class "nav-bar-link-to-me-link"
                ]
                [ text "amilner42" ]
            ]
        ]


{-| Subbar beneath navbar.
-}
subBar : Html msg
subBar =
    div
        [ conditionalClasses
            [ ( True, "sub-bar" )
            ]
        ]
        [ div
            [ class "sub-bar-title" ]
            [ text "Runtime Validation" ]
        , div
            [ class "sub-bar-sub-title" ]
            [ text "Clean. Simple. Maintainable." ]
        ]


{-| Base Component View.
-}
view : Model -> Html Msg
view model =
    cssComponentNamespace "base" Nothing <|
        div
            []
            [ navBar
            , subBar
            ]

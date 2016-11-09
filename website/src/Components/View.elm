module Components.View exposing (view)

import Html exposing (Html, span, div, text, a, textarea)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (class, href, placeholder, value)
import Components.Messages exposing (Msg(..))
import Components.Model exposing (Model)
import Models.Route as Route
import DefaultServices.Util exposing (conditionalClasses, cssComponentNamespace)


{-| The topbar of the website.
-}
navBar : Route.Route -> Html Msg
navBar route =
    div
        [ conditionalClasses
            [ ( True, "nav-bar" )
            ]
        ]
        [ span
            [ conditionalClasses
                [ ( True, "nav-bar-head" )
                , ( route == Route.MainView, "nav-bar-selected" )
                ]
            , onClick <| SwitchView Route.MainView
            ]
            [ text "Kleen" ]
        , span
            [ conditionalClasses
                [ ( True, "nav-bar-item" )
                , ( route == Route.TutorialView, "nav-bar-selected" )
                ]
            , onClick <| SwitchView Route.TutorialView
            ]
            [ text "Tutorial" ]
        , span
            [ conditionalClasses
                [ ( True, "nav-bar-item" )
                , ( route == Route.GeneratorView, "nav-bar-selected" )
                ]
            , onClick <| SwitchView Route.GeneratorView
            ]
            [ text "Generator" ]
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


{-| The view for auto generating type validation structures.
-}
generatorView : Model -> Html Msg
generatorView model =
    div
        [ class "generator-view" ]
        [ div
            [ class "text-areas" ]
            [ textarea
                [ class "input-text-area"
                , placeholder "Enter Typescript Types"
                , onInput OnGeneratorInput
                , value model.generatorInput
                ]
                []
            , textarea
                [ class "output-text-area"
                , placeholder "Get Runtime Validation Structures"
                ]
                []
            ]
        ]


{-| The main view (or the "welcome" view, the root of the website.)
-}
mainView : Model -> Html Msg
mainView model =
    div
        []
        [ text "Development in progress..." ]


{-| The tutorial view for introducing new users.
-}
tutorialView : Model -> Html Msg
tutorialView model =
    div
        []
        [ text "Development in progress..." ]


{-| Base Component View.
-}
view : Model -> Html Msg
view model =
    let
        pageForRoute =
            case model.route of
                Route.MainView ->
                    mainView model

                Route.TutorialView ->
                    tutorialView model

                Route.GeneratorView ->
                    generatorView model
    in
        cssComponentNamespace "base" Nothing <|
            div
                []
                [ navBar model.route
                , subBar
                , pageForRoute
                ]

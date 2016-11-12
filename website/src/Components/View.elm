module Components.View exposing (view)

import Html exposing (Html, span, div, text, a, textarea)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (class, href, placeholder, value, spellcheck)
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
subBar : Route.Route -> Html msg
subBar route =
    case route of
        Route.MainView ->
            div
                [ conditionalClasses
                    [ ( True, "sub-bar" )
                    ]
                ]
                [ div
                    [ class "sub-bar-title" ]
                    [ text "Validate Everything" ]
                , div
                    [ class "sub-bar-sub-title" ]
                    [ text "Trust No One" ]
                ]

        Route.TutorialView ->
            div
                [ conditionalClasses
                    [ ( True, "sub-bar" )
                    ]
                ]
                [ div
                    [ class "sub-bar-title" ]
                    [ text "Document Everything" ]
                , div
                    [ class "sub-bar-sub-title" ]
                    [ text "No User Left Behind" ]
                ]

        Route.GeneratorView ->
            div
                [ conditionalClasses
                    [ ( True, "sub-bar" )
                    ]
                ]
                [ div
                    [ class "sub-bar-title" ]
                    [ text "Automate Everything" ]
                , div
                    [ class "sub-bar-sub-title" ]
                    [ text "Laziness Leads to Greatness" ]
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
                , spellcheck False
                , value model.generatorOutput
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
                , subBar model.route
                , pageForRoute
                ]

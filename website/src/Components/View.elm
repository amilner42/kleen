module Components.View exposing (view)

import Html exposing (Html, div, text)
import Components.Messages exposing (Msg)
import Components.Model exposing (Model)


{-| Base Component View.
-}
view : Model -> Html Msg
view model =
    div
        []
        [ text "Hello World" ]

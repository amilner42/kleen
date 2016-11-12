module DefaultServices.Util exposing (..)

import Json.Encode as Encode
import Json.Decode as Decode exposing ((:=))
import Html exposing (Html, div, i, text)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)
import Html.App
import String
import Char


{-| Useful for encoding, turns maybes into nulls / there actual value.
-}
justValueOrNull : (a -> Encode.Value) -> Maybe a -> Encode.Value
justValueOrNull somethingToEncodeValue maybeSomething =
    case maybeSomething of
        Nothing ->
            Encode.null

        Just something ->
            somethingToEncodeValue something


{-| Result or ...
-}
resultOr : Result a b -> b -> b
resultOr result default =
    case result of
        Ok valueB ->
            valueB

        Err valueA ->
            default


{-| Creates a css namespace around some html
-}
cssNamespace : String -> Html msg -> Html msg
cssNamespace classNames html =
    div [ class classNames ]
        [ html ]


{-| Pass the component name such as "home" or "some-name". Returns a css
namespace for that component such as "home-component" wrapped in a div with
class name `home-component-wrapper`.
-}
cssComponentNamespace : String -> Maybe (String) -> Html msg -> Html msg
cssComponentNamespace componentName additionalClasses html =
    let
        className =
            componentName ++ "-component"

        wrapperClassName =
            className ++ "-wrapper"

        classes =
            case additionalClasses of
                Nothing ->
                    className

                Just extraClasses ->
                    className ++ " " ++ extraClasses
    in
        cssNamespace
            wrapperClassName
            (cssNamespace classes html)


{-| Returns true if `a` is nothing.
-}
isNothing : Maybe a -> Bool
isNothing maybeValue =
    case maybeValue of
        Nothing ->
            True

        Just something ->
            False


{-| Returns true if `a` is not nothing.
-}
isNotNothing : Maybe a -> Bool
isNotNothing maybeValue =
    not <| isNothing <| maybeValue


{-| Returns `baseClasses` if `boolean` is False, otherwise returns `baseClasses`
with `additionalClasses`. Basic helper for conditionally adding classes.
-}
conditionalClasses : List ( Bool, String ) -> Html.Attribute msg
conditionalClasses listOfPotentialClasses =
    let
        listOfClassesAsString =
            listOfPotentialClasses
                |> List.foldl
                    (\( attachClass, className ) classes ->
                        if attachClass then
                            classes ++ className ++ " "
                        else
                            classes
                    )
                    ""
    in
        class listOfClassesAsString


{-| Helper for encoding a list, works well with `justValueOrNull`.
-}
encodeList : (a -> Encode.Value) -> List a -> Encode.Value
encodeList encoder listOfA =
    Encode.list <| List.map encoder listOfA


{-| Turn a string into a record using a decoder.
-}
fromJsonString : Decode.Decoder a -> String -> Result String a
fromJsonString decoder encodedString =
    Decode.decodeString decoder encodedString


{-| Turn a record into a string using an encoder.
-}
toJsonString : (a -> Encode.Value) -> a -> String
toJsonString encoder record =
    Encode.encode 0 (encoder record)


{-| Capatilize the first letter of every word.
-}
upperCaseFirstChars : String -> String
upperCaseFirstChars string =
    let
        upperFirstChar word =
            case String.uncons word of
                Nothing ->
                    ""

                Just ( head, tail ) ->
                    String.append (String.fromChar (Char.toUpper head)) tail
    in
        String.join " " <| List.map upperFirstChar <| String.words string


{-| Using `identifyThing` as a basis for figuring out equality, updates all
instances of `thing` in `listOfThing`, if no instances of `thing` were in
`listOfThing`, adds `thing` to the list.
Convenient when working with an empty list where you are either adding/updating
elements. Eg.
    [] --> [ {value: old, id: 1 } ] --> [ { value: new, id: 1}]
-}
addOrUpdateList : List a -> a -> (a -> b) -> List a
addOrUpdateList listOfThing thing identifyThing =
    let
        updatedListOfThing =
            updateList
                listOfThing
                thing
                identifyThing
    in
        if updatedListOfThing == listOfThing then
            -- Didnt update the list, item wasn't in list.
            thing :: listOfThing
        else
            updatedListOfThing


{-| Refer to `addOrUpdateList`, this is the same except it doesn't add it to the
list if it wasn't in the list before, it simply returns the same unchanged list.
-}
updateList : List a -> a -> (a -> b) -> List a
updateList listOfThing thing identifyThing =
    let
        identifiedThing =
            identifyThing thing
    in
        List.map
            (\aThing ->
                if identifyThing aThing == identifiedThing then
                    thing
                else
                    aThing
            )
            listOfThing


{-| Basic wrapper for adding a google icon.
-}
googleIcon : String -> String -> Html msg
googleIcon name extraClasses =
    i
        [ class <| "material-icons" ++ " " ++ extraClasses ]
        [ text name ]


{-| Basic wrapper for adding a google icon which emits events onClick.
-}
actionGoogleIcon : String -> String -> msg -> Html msg
actionGoogleIcon name extraClasses actionMsg =
    i
        [ class <| "material-icons" ++ " " ++ extraClasses
        , onClick <| actionMsg
        ]
        [ text name ]


{-| Copy of Html.App.map, for readibility.
-}
nestHtml : (a -> msg) -> Html a -> Html msg
nestHtml tagger nestedHtml =
    Html.App.map tagger nestedHtml


{-| Creates an absolute box around some html.
-}
absoluteBox : Html msg -> Html msg
absoluteBox html =
    div
        [ style
            [ ( "position", "absolute" ) ]
        ]
        [ html ]


{-| Creates a relative box around some html.
-}
relativeBox : Html msg -> Html msg
relativeBox html =
    div
        [ style
            [ ( "position", "relative" ) ]
        ]
        [ html ]

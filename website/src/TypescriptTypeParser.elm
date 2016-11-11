module TypescriptTypeParser exposing (parseTypes)

import Combine
    exposing
        ( Parser
        , parse
        , string
        , regex
        , many
        , braces
        , andThen
        , choice
        , fail
        , succeed
        , optional
        , between
        , rec
        )
import Combine.Infix exposing (..)
import String


{-| Primitive Structure.
-}
type PrimitiveType
    = BooleanType
    | StringType
    | NumberType


{-| The typescript structures we allow (from `kleen`). The first string is the
name of the structure, because structures may reference each other, and the
2nd param is what's needed to define that structures type.
-}
type TypeStructure
    = PrimitiveStructure String PrimitiveType
    | ArrayStructure String TypeStructureContent
    | ObjectStructure String (List TypeStructure)
    | UnionStructure String (List TypeStructure)


{-| The content is what's required to build a type.
-}
type TypeStructureContent
    = PrimitiveContent PrimitiveType
    | ArrayContent TypeStructureContent
    | ObjectContent (List TypeStructure)
    | UnionContent (List TypeStructure)


{-| Parser for any form of whitespace.
-}
whitespace : Parser String
whitespace =
    rec
        (\() ->
            regex "[ \t\x0D\n]*"
        )


{-| Parses a name, at least 1 char of a-Z letters.
-}
nameParser : Parser String
nameParser =
    rec
        (\() ->
            regex "[a-zA-Z]+"
        )


{-| Parses a primtive.
-}
parsePrimitive : Parser PrimitiveType
parsePrimitive =
    rec
        (\() ->
            choice
                [ string "string"
                , string "number"
                , string "boolean"
                ]
                `andThen`
                    (\primitiveType ->
                        case primitiveType of
                            "string" ->
                                succeed StringType

                            "number" ->
                                succeed NumberType

                            "boolean" ->
                                succeed BooleanType

                            _ ->
                                fail [ "That's not a primtive" ]
                    )
        )


{-| Parses the
-}
typeNameParser : Parser String
typeNameParser =
    rec
        (\() ->
            string "type"
                *> whitespace
                *> nameParser
                <* whitespace
        )


{-| Parses a primitive type into a `TypeStructureContent`.
-}
primitiveValueParser : Parser TypeStructureContent
primitiveValueParser =
    rec
        (\() ->
            (succeed PrimitiveContent)
                <*> parsePrimitive
        )


{-| -}
parseArray : Parser TypeStructureContent
parseArray =
    rec
        (\() ->
            -- This will catch arrays of primitives, arrays of someName, but not
            -- arrarys of objects / arrays of union types...Do to lang bugs, its
            -- a work in progress for figuring out a convenient "hack".
            whitespace
                *> regex "[a-zA-Z]*"
                <* whitespace
                <* string "[]"
                `andThen`
                    (\charactersBeforeArrayBrackets ->
                        case (parse typeValueParser charactersBeforeArrayBrackets) of
                            ( Ok results, _ ) ->
                                succeed results

                            ( Err err, _ ) ->
                                fail [ "Not a valid type prior to array brackets." ]
                    )
        )


{-| Parses a arrayType.
-}
arrayValueParser : Parser TypeStructureContent
arrayValueParser =
    rec
        (\() ->
            ArrayContent
                <$> parseArray
        )


{-| Parses the
-}
interfaceValueParser : Parser TypeStructureContent
interfaceValueParser =
    rec
        (\() ->
            (succeed ObjectContent)
                <*> interfaceJSONBlockParser
        )


typeValueParser : Parser TypeStructureContent
typeValueParser =
    rec
        (\() ->
            arrayValueParser
                <|> primitiveValueParser
        )


nameAndContentToStructure : String -> TypeStructureContent -> TypeStructure
nameAndContentToStructure name content =
    case content of
        PrimitiveContent primitiveContent ->
            PrimitiveStructure name primitiveContent

        ArrayContent arrayContent ->
            ArrayStructure name arrayContent

        ObjectContent objectContent ->
            ObjectStructure name objectContent

        UnionContent unionContent ->
            UnionStructure name unionContent


{-| A `type` (typescript type) parser.
-}
typeParser : Parser TypeStructure
typeParser =
    rec
        (\() ->
            ((succeed nameAndContentToStructure)
                <*> (typeNameParser <* string "=" <* whitespace)
                <*> typeValueParser
                <* whitespace
                <* string ";"
                <* whitespace
            )
        )


{-| The parser for typescript types.
-}
typescriptTypeParser : Parser (List TypeStructure)
typescriptTypeParser =
    rec
        (\() ->
            many <|
                whitespace
                    *> interfaceParser
                    <* whitespace
        )


{-| Parses the typescript from the input and returns the output in `kleen`
format, or an error if the parser detected issues with the input.
-}
parseTypes : String -> Result String String
parseTypes input =
    case parse typescriptTypeParser input of
        ( Ok results, _ ) ->
            Ok <| String.join "\n\n" (List.map typeStructureToKleen results)

        ( Err ms, cx ) ->
            Err ("parse error: " ++ (toString ms) ++ ", " ++ (toString cx))


{-| Parses the part of the typescript interface between the braces. Input must
include the braces.
-}
interfaceJSONBlockParser : Parser (List TypeStructure)
interfaceJSONBlockParser =
    let
        getPropertyName =
            nameParser
                <* string ":"
                <* whitespace

        getPropertyTypeStructure =
            typeValueParser
                <* whitespace
                <* (string ";" <|> string ",")
                <* whitespace

        getSingleProperty =
            (succeed nameAndContentToStructure)
                <*> getPropertyName
                <*> getPropertyTypeStructure
    in
        rec
            (\() ->
                braces <|
                    whitespace
                        *> many getSingleProperty
                        <* whitespace
            )


{-| Parsses the name from an interface, then consumes all spaces after the name,
ideally stopping at an open brace for the `interfaceJSONBlockParser`.
-}
interfaceNameParser : Parser String
interfaceNameParser =
    rec
        (\() ->
            string "interface"
                *> whitespace
                *> nameParser
                <* whitespace
        )


{-| Parses a typescript interface into a `TypeStructure`.
-}
interfaceParser : Parser TypeStructure
interfaceParser =
    rec
        (\() ->
            (succeed ObjectStructure)
                <*> interfaceNameParser
                <*> interfaceJSONBlockParser
        )


{-| Converts a type structure to a string.
-}
typeStructureToKleen : TypeStructure -> String
typeStructureToKleen ts =
    case ts of
        PrimitiveStructure name _ ->
            name

        ObjectStructure name _ ->
            name

        ArrayStructure name _ ->
            name

        UnionStructure name _ ->
            name

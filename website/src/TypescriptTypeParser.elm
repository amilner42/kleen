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
        , end
        , optional
        , between
        , rec
        , sepBy1
        )
import Combine.Infix exposing (..)
import String
import Formatting as F exposing ((<>))
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

NOTE: A `ReferenceStructure` is simply a type referencing another type.
-}
type TypeStructure
    = PrimitiveStructure String PrimitiveType
    | ArrayStructure String TypeStructureContent
    | ObjectStructure String (List TypeStructure)
    | UnionStructure String (List TypeStructureContent)
    | ReferenceStructure String String


{-| The content is what's required to build a type.
-}
type TypeStructureContent
    = PrimitiveContent PrimitiveType
    | ArrayContent TypeStructureContent
    | ObjectContent (List TypeStructure)
    | UnionContent (List TypeStructureContent)
    | ReferenceContent String


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
            regex "[a-zA-Z_\\$]+"
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


{-| Parses a reference type, making sure the name is not the name of a
primitive type. Does not check for the user using names that avoid with TS
keywords, that's the user's responsibility.
-}
parseReference : Parser String
parseReference =
    rec
        (\() ->
            nameParser
                `andThen`
                    (\name ->
                        if List.member name [ "string", "boolean", "number" ] then
                            fail [ "Reference name cannot be a primitive" ]
                        else
                            succeed name
                    )
        )


{-| Parses a reference into a `TypeStructureContent`.
-}
referenceValueParser : Parser TypeStructureContent
referenceValueParser =
    rec
        (\() ->
            (succeed ReferenceContent)
                <*> parseReference
        )


{-| Parses the `name` of the top level `type`.
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


{-| Parses the "value" of an interface, the part between the braces.
-}
interfaceValueParser : Parser TypeStructureContent
interfaceValueParser =
    rec
        (\() ->
            (succeed ObjectContent)
                <*> interfaceJSONBlockParser
        )


{-| Parses the "value" of a type, the part after the `=`.
-}
typeValueParser : Parser TypeStructureContent
typeValueParser =
    rec
        (\() ->
            (\listOfTypes ->
                let
                    typesWithArraysParsed =
                        List.map
                            (\( typeContent, capturedArrayBrackets ) ->
                                -- Handling multiple array brackets in this foldl.
                                List.foldl
                                    (\arrayBrackets previousTypeContent ->
                                        ArrayContent previousTypeContent
                                    )
                                    typeContent
                                    capturedArrayBrackets
                            )
                            listOfTypes

                    numberOfTypes =
                        List.length typesWithArraysParsed

                    impossibleCase =
                        UnionContent []
                in
                    if numberOfTypes == 0 then
                        impossibleCase
                    else if numberOfTypes == 1 then
                        case List.head typesWithArraysParsed of
                            Nothing ->
                                impossibleCase

                            Just singleType ->
                                singleType
                    else
                        UnionContent typesWithArraysParsed
            )
                <$> (sepBy1
                        (whitespace *> (string "|") <* whitespace)
                        ((succeed (,))
                            <*> (referenceValueParser
                                    <|> interfaceValueParser
                                    <|> primitiveValueParser
                                )
                            <*> (many (whitespace *> string "[]"))
                        )
                    )
        )


{-| Given a name and a content, returns the appropriate TypeStructure.
-}
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

        ReferenceContent referencing ->
            ReferenceStructure name referencing


{-| A `type` (typescript type) parser. This is one of the two things allowed
at the top level (`interfaceParser` covers the other case).
-}
typeParser : Parser TypeStructure
typeParser =
    rec
        (\() ->
            ((succeed nameAndContentToStructure)
                <*> (typeNameParser <* string "=" <* whitespace)
                <*> typeValueParser
                <* whitespace
                <* (optional "" (string ";"))
                <* whitespace
            )
        )


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
                <* whitespace
                <* (optional "" (string ";"))
                <* whitespace
        )


{-| The parser for typescript types, the only public-facing method from this
library. At the top level we can only expect `many` interfaces or types defined
hence that's exactly what this parser looks for.
-}
typescriptTypeParser : Parser (List TypeStructure)
typescriptTypeParser =
    rec
        (\() ->
            (many <|
                whitespace
                    *> (interfaceParser <|> typeParser)
                    <* whitespace
            )
                <* end
        )


{-| Parses the typescript from the input and returns the output in `kleen`
format, or an error if the parser detected issues with the input.
-}
parseTypes : String -> Result String String
parseTypes input =
    case parse typescriptTypeParser input of
        ( Ok results, _ ) ->
            Ok <|
                String.join
                    "\n\n"
                    (List.map
                        typeStructureToKleen
                        results
                    )

        ( Err ms, cx ) ->
            Err ("parse error: " ++ (toString ms) ++ ", " ++ (toString cx))


{-| Gets the name of a type structure.
-}
getNameFromTypeStructure : TypeStructure -> String
getNameFromTypeStructure typeStructure =
    case typeStructure of
        PrimitiveStructure name _ ->
            name

        ObjectStructure name _ ->
            name

        ArrayStructure name _ ->
            name

        UnionStructure name _ ->
            name

        ReferenceStructure name _ ->
            name


{-| Converts a type structure (our AST from parsing) to a string which will be
the JSON Kleen structure, that way you can copy paste this and bam you have
runtime validation.
-}
typeStructureToKleen : TypeStructure -> String
typeStructureToKleen ts =
    let
        {- A single newline, used for readibility. -}
        newLine =
            F.s "\n"

        {- A single tab. -}
        tab =
            F.s "    "

        tabString =
            "    "

        quotedString =
            F.s "\"" <> F.string <> F.s "\""

        {- Creates a tab-chain `numberOfTabs` long. -}
        tabChain numberOfTabs =
            List.repeat numberOfTabs tab
                |> List.foldl
                    (\aTab tabChain ->
                        tabChain <> aTab
                    )
                    (F.s "")

        tabStringChain numberOfTabs =
            List.repeat numberOfTabs tabString
                |> String.join ""

        {- Eg. Turns interface named "bla" to "blaSchema". -}
        referenceNamePostFix =
            "Schema"

        {- Internal print structure, doesn't worry about the name of top level
           objets (so it can be nested) and also keeps an accumulator handy
           for keeping track of the current tab level.
        -}
        printStructure tabLevel ts =
            let
                indent0 =
                    tabChain <| tabLevel

                indent1 =
                    tabChain <| tabLevel + 1

                indent2 =
                    tabChain <| tabLevel + 2
            in
                case ts of
                    PrimitiveStructure name primitiveType ->
                        let
                            primitiveStructurePrinter =
                                (F.s "{" <> newLine)
                                    <> (indent1 <> F.s "kindOfType: kleen.kindOfType.primitive," <> newLine)
                                    <> (indent1 <> F.s "kindOfPrimitive: " <> (F.premap primitiveTypeToString F.string) <> newLine)
                                    <> (indent0 <> F.s "}")

                            primitiveTypeToString primitiveType =
                                case primitiveType of
                                    BooleanType ->
                                        "kleen.kindOfPrimitive.boolean"

                                    NumberType ->
                                        "kleen.kindOfPrimitive.number"

                                    StringType ->
                                        "kleen.kindOfPrimitive.string"
                        in
                            F.print primitiveStructurePrinter primitiveType

                    ObjectStructure name listOfStructures ->
                        let
                            objectStructurePrinter =
                                (F.s "{" <> newLine)
                                    <> (indent1 <> F.s "kindOfType: kleen.kindOfType.object," <> newLine)
                                    <> (indent1 <> F.s "properties: {" <> newLine)
                                    <> (F.premap objectPropertiesToString F.string <> newLine)
                                    <> (indent1 <> F.s "}" <> newLine)
                                    <> (indent0 <> F.s "}")

                            propertyToString propertyTypeStructure =
                                let
                                    name =
                                        getNameFromTypeStructure propertyTypeStructure

                                    propertyPrinter =
                                        indent2 <> quotedString <> F.s ": " <> F.string <> F.s ","
                                in
                                    F.print propertyPrinter name (printStructure (tabLevel + 2) propertyTypeStructure)

                            objectPropertiesToString =
                                (List.map propertyToString) >> String.join "\n"
                        in
                            F.print objectStructurePrinter listOfStructures

                    ArrayStructure name typeStructureContent ->
                        let
                            {- We need the `typeStructure` for recursion even though
                               the name won't be used.
                            -}
                            typeStructure =
                                nameAndContentToStructure name typeStructureContent

                            arrayStructurePrinter =
                                (F.s "{" <> newLine)
                                    <> (indent1 <> F.s "kindOfType: kleen.kindOfType.array," <> newLine)
                                    <> (indent1 <> F.s "elementType: " <> F.premap (printStructure <| tabLevel + 1) F.string <> newLine)
                                    <> (indent0 <> F.s "}")
                        in
                            F.print arrayStructurePrinter typeStructure

                    UnionStructure name typeStructureContents ->
                        let
                            typeStructureToString ts =
                                (tabStringChain (tabLevel + 2)) ++ (printStructure (tabLevel + 2) ts) ++ ",\n"

                            typeStructureContentsToString =
                                (List.map ((nameAndContentToStructure "") >> typeStructureToString))
                                    >> String.join ""

                            unionStructurePrinter =
                                (F.s "{" <> newLine)
                                    <> (indent1 <> F.s "kindOfType: kleen.kindOfType.union" <> newLine)
                                    <> (indent1 <> F.s "types: [" <> newLine)
                                    <> (F.premap typeStructureContentsToString F.string)
                                    <> (indent1 <> F.s "]" <> newLine)
                                    <> (indent0 <> F.s "}")
                        in
                            F.print unionStructurePrinter typeStructureContents

                    ReferenceStructure name referenceName ->
                        referenceName ++ referenceNamePostFix
    in
        "const " ++ (getNameFromTypeStructure ts) ++ referenceNamePostFix ++ " = " ++ (printStructure 0 ts) ++ ";"

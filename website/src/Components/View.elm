module Components.View exposing (view)

import Html exposing (Html, span, div, text, a, textarea, li, ul, ol, p, h3, a)
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (class, href, placeholder, value, spellcheck)
import Components.Messages exposing (Msg(..))
import Components.Model exposing (Model)
import Models.Route as Route
import DefaultServices.Util exposing (conditionalClasses, cssComponentNamespace)
import Markdown exposing (toHtml)


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
            [ a
                [ href "https://github.com/amilner42"
                , class "nav-bar-link-to-me-link"
                ]
                [ text "Follow me on Github" ]
            , div
                []
                []
            , a
                [ class "nav-bar-link-to-code"
                , href "https://github.com/amilner42/kleen"
                ]
                [ text "Star Project" ]
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
    let
        codeBlock code =
            toHtml
                [ class "code-block" ]
                ("```typescript\n" ++ code ++ "\n```")
    in
        div
            [ class "tutorial-view" ]
            [ div
                [ class "tutorial-view-hide-scroll" ]
                [ div
                    [ class "tutorial-body" ]
                    [ text """Ok let's get straight to it, all the code snippets assume
                that you have this at the top of your file:
                """
                    , codeBlock
                        """import * as kleen from "kleen";
                    """
                    , text """It's a strongly typed package so you should have typings
                working out of the box (and these typings will always be up to date
                with the code, they come from the code). Let's start with the basics
                and get ourselves a string.
                """
                    , codeBlock """const stringSchema: kleen.primitiveSchema = {
    primitiveType: kleen.kindOfPrimitive.string
}
                    """
                    , text """Simple enough. An important thing to note is that
because we don't hate ourselves stringSchema really is a string, not null or
undefined. If we wanted to allow our data to be null/undefined then we would:
"""
                    , codeBlock
                        """const stringOrNotSchema: kleen.primitiveSchema = {
    primitiveType: kleen.kindOfPrimitive.string,
    nullAllowed: true,
    undefinedAllowed: true
}
                    """
                    , text """Ok but how would we actually use these structures
                we've created? You silly...this library only exposes one
                method, what did you think we were going to do?!
                """
                    , codeBlock
                        """kleen.validModel(stringSchema)("asdf")
.then(() => {
  // In this case, it will be valid.
})
.catch((error) => {
  // `error` will be thrown by `validModel`, it will either be a default error
  // from kleen or some custom error you have attached. In this case, it will
  // not go the catch because "asdf" is a valid against the string schema.
});
                    """
                    , text """You may be confused at this point for one of 2 reasons:
                """
                    , ol
                        []
                        [ li
                            []
                            [ text "Why are there double parenthesis on the function call" ]
                        , li
                            []
                            [ text "Why is it async? (.then and .catch)" ]
                        ]
                    ]
                , text """One thing at a time...no need to be confused about the
                double parenthesis, that's simply because the function is
                curried. You call it one parameter at a time, which gives you
                the benefit of being able to succintly create schema validators:
                """
                , codeBlock
                    """const aValidString = kleen.validModel(stringSchema);

// And you can call it later with the remaining param:

aValidString("someString"); // Yes
aValidString(undefined);    // No
                """
                , text """Ok what about the then-catch-block, what was up with that?
            Well schema validation is async, in fact, async is a core part of
            the design, so all the async is handled for you behind the scenes!
            We'll get back to this later when we talk about restrictions. For
            now let's focus on schemas, we saw above we defined a
            primitiveSchema. What other schemas can we define?
            """
                , codeBlock
                    """kleen.primitiveSchema // a primitive
kleen.objectSchema    // Good old regular { ... }
kleen.arraySchema     // Can't forget about [...]
kleen.unionSchema     // And lastly union types!
                """
                , text """These 4 building blocks compose how we describe our data.
            If you got the epiphany that this maps over to typescript, that's
            because it does. One of the core ideas behind this library is to
            take the typescript compile times guarantees and extend them to
            runtime. So if we wanted to create an object with two properties,
            both strings, we would do:"""
                , codeBlock
                    """const basicUserSchema: kleen.objectSchema = {
    objectProperties: {
      email: stringSchema, // remember we defined `stringSchema` above
      password: stringSchema
    }
}
                """
                , text """ Of course sub properties could be object themselves, in
            fact they could be any of the 4 possible schemas listed above; the
            schemas are our building blocks.

            Here is an example of an array model, this is an array at root
            level, not nested in an object (same as we did above with the
            primitive, types do not need to be nested in an object, think about
            it the same way as the typescript `type`).
            """
                , codeBlock
                    """const arrayOfUsersSchema: kleen.arraySchema = {
    arrayElementType: {
      objectProperties: {
        "somePropertyName": {
          primitiveType: kleen.kindOfPrimitive.number
        }
      }
    }
}

const validArray1 = [];
const validArray2 = [{ somePropertyName: 434}]

const invalidArray1 = undefined;
const invalidArray2 = [undefined];
const invalidArray3 = [ { somePropertyName: true }];
const invalidArray4 = [ { somePropertyName: 43, extraProperty: "uhoh" }];
const invalidArray5 = [ { }];
                """
                , text "Ok, so the only thing you haven't seen me use is a `unionSchema`."
                , codeBlock
                    """const numberOrBoolSchema: kleen.unionSchema = {
    unionTypes: [
        {
            primitiveType: kleen.kindOfPrimitive.number
        },
        {
            primitiveType: kleen.kindOfPrimitive.boolean
        }
    ]
}

// Easy as that, you just specify all the `unionTypes`. In the case
// above both `5` and `true` would be valid models. A neat thing about union
// types is that we will to validate the models all at the same time (remember
// all validation is async) and if any succeed we short circuit to that
// success case. All this async ordering is done for you, you don't need to
// worry about it at all.
                """
                , text """Well there you go, you now know how to validate basically
            any structure, you could now extend your typescript compile time
            guarantees to runtime validation. In fact if you head over to the
            generator, you could do that automatically, you give the generator
            types/interfaces and it spits out the kleen schemas for you!
            Remember a core idea of this library is to be a thin layer over
            typescript.
            """
                , p
                    []
                    [ text """
                But hold your horses captain, there's more. What if we don't only
                care that the type is correct, but also some restrictions are met,
                perhaps the passwod has to be longer than 85 characters?
                """
                    ]
                , codeBlock
                    """const userWithPasswordRestrictionSchema: objectSchema = {
    objectProperties: {
        email: {
            primitiveType: kleen.kindOfPrimitive.string
        },
        password: {
            primitiveType: kleen.kindOfPrimitive.string,
            // To "fail" a restriction, all you have to do is return a
            // rejected promise, if you are writing sync code (like below)
            // then you use `Promise.reject` to create the rejected promise.
            // If you are writing an async restriction, then just make sure
            // it rejects on failure.
            restriction: (password: string)  => {
                if(password.length <= 85) {
                    return Promise.reject(
                    // We can reject with anything we want, string/object,
                    // this is what we will be given when `validModel`
                    // rejects (the `error` in the catch block).
                    );
                }
            }
        }
    }
}
                """
                , text """ Well there you go, now our users hate us as much as we
            hate them. An important thing to note is that we didn't have to
            check that `password` was a string and that it wasn't null/undefined
            inside our restriction, our type checking is always performed first
            and only on type-check-success are our restrictions run. We ar
            separating type-validation from data-validation, this is another
            core concept of this library.
            """
                , p
                    []
                    [ text """Another important thing to realize is that
                restrictions can be placed at any level. In the example above,
                we could have gotten an identical schema but with the
                restriction placed one level higher, let me show you:
                """ ]
                , codeBlock
                    """// CODE SMELL: restriction should be placed on password field.
const userWithPasswordRestrictionsSchema = {
    objectProperties: {
        "email": {
            primitiveType: kleen.kindOfPrimitive.string
        },
        "password": {
            primitiveType: kleen.kindOfPrimitive.string
        }
    },
    restriction: (user: {email: string, password: string} => {
        if(user.password.length <= 85) {
            return Promise.reject("some error here");
        }
    });
};
                """
                , text """That being said, just because we can put restrictions at
            the highest level, doesn't mean we should. In fact, we should place
            restrictions at the most specific possible level, in the password
            case above all we need is the password so we should attach it to
            the password field. This is helpful because then when we see
            restrictions attached at specific levels we know they are at that
            level because they require information from that level (eg. if
            we see a restriction on the user like we did above, it should be
            using both the email and password field, otherwise it should have
            been at a more specific level).
            """
                , p
                    []
                    [ text """Ok hypothetically let's say we had another restriction
                on the top level of the user, perhaps forcing that the password
                be the same name as the user (ya...real secure...). It would
                look like:
                """
                    ]
                , codeBlock
                    """ // Demonstrating order of sub-restrictions
const userWithPasswordRestrictionsSchema = {
    objectProperties: {
        "email": {
            primitiveType: kleen.kindOfPrimitive.string
        },
        "password": {
            primitiveType: kleen.kindOfPrimitive.string
        }
    },
    restriction: (user: {email: string, password: string} => {
        // Password is guaranteed to be at least 85 chars.
        if(user.password != user.email) {
            return Promise.reject("password and email not equal");
        }
    });
};
            """
                , text """In this case, once the outermost restriction is run is it
            possible that the password is less than 85 characters? No! This is
            another important thing to understand, not only is the type
            guaranteed to be correct when a restriction is run, it's also
            guaranteed that all sub-restrictions have been run and have passed.
            This should give you a good idea of the order of model validation
            and the way all the async tasks are chained together.
            """
                , p
                    []
                    [ text """ Ok so you understand restrictions and schemas, at
                this point you can not only map over all the compile-time type
                validation from typescript, you can also add your data
                validation to the schema. Custom errors are allowed with
                restrictions, but are we missing anything? Any keeners in the
                room? No...what does that say about the average user of this
                library...despicable. Moving on...it may be helpful for us to
                throw custom errors on type failure as well, how would we do
                that? Easy:
                """
                    ]
                , codeBlock """const stringSchema: kleen.primitiveSchema = {
    primitiveType: kleen.kindOfPrimitive.string,
    typeFailureError: "banana" /* anything you want */
}

// Example
kleen.validModel(stringSchema)(5)
.then(() => {
    // Won't go to this branch
})
.catch((error) => {
    // error will be "banana" in this case because there was a type failure!
})
                """
                , text """ Ok so that pretty much sums everything up! Pat yourself
            on the back, you just learnt a full new library. Ok enough, you're
            embarrasing yourself. Seriously stop it. Ok let's go summarize the
            concepts.
            """
                , h3
                    []
                    [ text "Summary" ]
                , text "validModel guarantees the following:"
                , ul
                    []
                    [ li
                        []
                        [ text "There are no extra properties on objects in your model." ]
                    , li
                        []
                        [ text "There are no missing properties on objects in your model." ]
                    , li
                        []
                        [ text "Your model has the correct type." ]
                    , li
                        []
                        [ text "Your model passes all restrictions." ]
                    ]
                , text "In terms of how validModel works we know the following:"
                , ul
                    []
                    [ li
                        []
                        [ text """Valid model only runs restrictions after the type
                    is confirmed to be correct."""
                        ]
                    , li
                        []
                        [ text """ Valid model only runs restrictions after
                    sub-restrictions are met.""" ]
                    ]
                , div
                    [ class "tutorial-end" ]
                    [ text "THE END" ]
                , p
                    []
                    [ text """And that's pretty much it! If you enjoy this library or the
                tutorial or the code generator, please go and star the project (or
                follow me on github). I'd really appreciate it and it helps me
                continue working on 100% open source projects! Thanks!
                """ ]
                , a
                    [ href "https://github.com/amilner42" ]
                    [ text "Follow me on Github" ]
                , a
                    [ href "https://github.com/amilner42/kleen"
                    , class "tutorial-star-link"
                    ]
                    [ text "Star the project" ]
                ]
            ]


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

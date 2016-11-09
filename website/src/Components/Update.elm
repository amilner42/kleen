module Components.Update exposing (update, updateCacheIf)

import Components.Messages exposing (Msg(..))
import Components.Model exposing (Model)
import DefaultServices.LocalStorage as LocalStorage


{-| Base Component Update.
-}
update : Msg -> Model -> ( Model, Cmd Msg )
update =
    updateCacheIf True


{-| Sometimes we don't want to save to the cache, for example when the website
originally loads if we save to cache we end up loading what we saved (the
default model) instead of what was in their before.
-}
updateCacheIf : Bool -> Msg -> Model -> ( Model, Cmd Msg )
updateCacheIf shouldCache msg model =
    let
        todo =
            ( model, Cmd.none )

        ( newModel, newCmd ) =
            case msg of
                NoOp ->
                    todo

                OnLoadModelFromLocalStorageFailure err ->
                    todo

                OnLoadModelFromLocalStorageSuccess model ->
                    ( model, Cmd.none )
    in
        if shouldCache then
            ( newModel
            , Cmd.batch
                [ newCmd
                , LocalStorage.saveModel newModel
                ]
            )
        else
            ( newModel, newCmd )

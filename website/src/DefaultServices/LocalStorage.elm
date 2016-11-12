module DefaultServices.LocalStorage exposing (saveModel, onLoadModel, loadModel)

import Ports
import Components.Model exposing (Model, cacheEncoder, cacheDecoder)
import Components.Messages exposing (Msg(..))
import DefaultServices.Util as Util


{-| Saves the model to localStorage using the port.
-}
saveModel : Model -> Cmd msg
saveModel model =
    Ports.saveModelToLocalStorage <| cacheEncoder <| model


{-| Will be used for the port subscription.
-}
onLoadModel : String -> Msg
onLoadModel modelAsStringFromStorage =
    case Util.fromJsonString cacheDecoder modelAsStringFromStorage of
        Ok model ->
            OnLoadModelFromLocalStorageSuccess model

        Err error ->
            OnLoadModelFromLocalStorageFailure error


{-| Triggers the model to be loaded from local storage
-}
loadModel : () -> Cmd Msg
loadModel =
    Ports.loadModelFromLocalStorage

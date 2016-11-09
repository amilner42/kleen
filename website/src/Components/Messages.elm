module Components.Messages exposing (..)

import Http
import Components.Model as BaseModel


{-| Base Componenet Msg.
-}
type Msg
    = NoOp
    | OnLoadModelFromLocalStorageSuccess BaseModel.Model
    | OnLoadModelFromLocalStorageFailure String

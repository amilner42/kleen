module Components.Messages exposing (..)

import Http
import Components.Model as BaseModel
import Models.Route as Route


{-| Base Componenet Msg.
-}
type Msg
    = NoOp
    | OnLoadModelFromLocalStorageSuccess BaseModel.Model
    | OnLoadModelFromLocalStorageFailure String
    | SwitchView Route.Route
    | OnGeneratorInput String

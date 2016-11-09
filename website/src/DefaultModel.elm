module DefaultModel exposing (defaultModel)

import Components.Model as Model
import Models.Route as Route


{-| The default model.
-}
defaultModel : Model.Model
defaultModel =
    { route = Route.MainView
    , generatorInput = ""
    , generatorOutput = ""
    }

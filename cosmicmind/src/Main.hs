{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
import qualified Data.Map as Map
import Control.Monad.Trans
import Data.Aeson (FromJSON)
import Data.List (isInfixOf)
import Data.Char (toLower, toUpper)
import GHC.Generics (Generic)
import Network.HTTP.Types.Status (created201, expectationFailed417)
import Web.Scotty
import System.Random

data ChatMsg = ChatMsg { text :: String
                       , username :: Integer
                       , display_name :: String
                       } deriving (Show, Generic)

instance FromJSON ChatMsg

botName = "cosmicmind"

respond :: String -> String -> ActionM()
respond user question = do
  answer <- liftIO cosmicmindSays
  json $ Map.fromList ([ ("text", sayAnswer user question answer)
                       , ("name", capitalize botName)] :: [(String, String)])
  where
    capitalize :: String -> String
    capitalize inp = (toUpper (head inp)):(tail inp)

    cosmicmindSays :: IO Bool
    cosmicmindSays = do
      r <- randomIO :: IO Double
      return(r > 0.5)

    sayAnswer :: String -> String -> Bool -> String
    sayAnswer user question answer =
      user ++ ", oтвет на ваш вопрос \"" ++ question ++ "\": " ++
      (if answer then "Да" else "Нет") ++ "."


main = scotty 8080 $ do
  get "/info" $ do
    let
      info ::[(String, String)]
      info = [ ("author","Scorpil")
             , ("info", "Answers all questions.")]
    json $ Map.fromList info

  get "/event" $ do
    t <- jsonData
    let
      question = Main.text t
      user = Main.display_name t
    if isInteresting question
      then status created201 >> respond user question
      else status expectationFailed417
    where
      isInteresting :: String -> Bool
      isInteresting question =
        (botName `isInfixOf` (map toLower question)) && (last question) == '?'

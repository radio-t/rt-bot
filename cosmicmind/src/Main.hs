{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
import qualified Data.Map as Map
import Control.Monad.Trans
import Data.Aeson (FromJSON, ToJSON)
import Data.List (isInfixOf)
import Data.Char (toLower, toUpper)
import GHC.Generics (Generic)
import Network.HTTP.Types.Status (created201, expectationFailed417)
import Web.Scotty
import System.Random

data ChatMsg = ChatMsg { text :: String
                       , username :: String
                       , display_name :: String
                       } deriving (Show, Generic)

data Info = Info { author :: String
                 , info :: String
                 , commands :: [String]
                 } deriving (Show, Generic)

instance FromJSON ChatMsg
instance ToJSON Info

botName :: String
botName = "Cosmicmind"

respond :: String -> String -> ActionM()
respond user question = do
  answer <- liftIO cosmicmindSays
  json $ Map.fromList ([ ("text", sayAnswer user question answer)
                       , ("name", botName)] :: [(String, String)])
  where
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
      info :: Info
      info = Info { Main.author = "Scorpil"
                  , Main.info = "Answers all questions."
                  , Main.commands = [botName ++ " [any question here]?"] }
    json info

  post "/event" $ do
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
        ((map toLower botName) `isInfixOf` (map toLower question)) && (last question) == '?'

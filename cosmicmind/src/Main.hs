{-# LANGUAGE OverloadedStrings #-}
import qualified Data.Map as Map
import Web.Scotty
import Data.Monoid (mconcat)

main = scotty 8080 $ do
  get "/info" $ do
    json (Map.fromList info)
    where
      info ::[(String, String)]
      info = [
        ("author","Scorpil"),
        ("info", "Answers all questions.")]


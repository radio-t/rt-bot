{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Lib
    ( libMain
    ) where

-- import Data.Array
import Control.Exception
import Control.Monad
import Data.Aeson
import Data.Aeson.Lens
import qualified Data.ByteString.Lazy.Char8 as LB
import Data.Monoid
import qualified Data.Text as T
import qualified Data.Text.Read as T
import qualified Data.Text.Lazy as LT
import Control.Lens hiding ((.=))
import Network.HTTP.Client (newManager, parseRequest, httpLbs)
import Network.HTTP.Client.TLS (tlsManagerSettings)
import Network.HTTP.Simple (getResponseStatusCode, getResponseBody)
import Text.Regex
import Text.Regex.Base


currencyCodes :: [T.Text]
currencyCodes = ["RUB", "USD", "EUR"]


-- fetchXrates :: T.Text -> T.Text -> IO (Maybe (T.Text, Double))
-- fetchXrates from to = catch (fetch from to) $ \(_ :: SomeException) -> return Nothing
--     where
--         fetch :: T.Text -> T.Text -> IO (Maybe (T.Text, Double))
--         fetch from to = do
--             request <- parseRequest link
--             response <- newManager tlsManagerSettings >>= httpLbs request
--             case getResponseStatusCode response of
--                 200 -> return . parse $ getResponseBody response
--                 _   -> return Nothing
--
--         link :: String
--         link = T.unpack $ "https://query.yahooapis.com/v1/public/yql?q=select+*+from+yahoo.finance.xchange+where+pair+=+%22" <> from <> to <> "%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback="
--
--         parse :: LB.ByteString -> Maybe (T.Text, Double)
--         parse json = do
--             let v = decode json ^. key "query" . key "results" . key "rate" :: Maybe Value
--             name <- v ^. key "Name" . asText
--             rate <- v ^. key "Rate" . asText >>= either (const Nothing) Just . T.double >>= Just . fst
--             case name of
--                 "N/A" -> Nothing
--                 _     -> return (name, rate)

fetchXrates :: T.Text -> T.Text -> IO (Maybe (T.Text, Double))
fetchXrates from to = fetch from to --catch (fetch from to) $ \(_ :: SomeException) -> return Nothing
    where
        fetch :: T.Text -> T.Text -> IO (Maybe (T.Text, Double))
        fetch from to = do
            request <- parseRequest link
            response <- newManager tlsManagerSettings >>= httpLbs request
            case getResponseStatusCode response of
                200 -> do
                    let a = getResponseBody response
--                    putStrLn $ show a
                    putStrLn "1"
                    let r = mkRegex "^.+CBR_XML_Daily_Ru\\((.+)\\);$"
                    putStrLn "2"
                    let b = matchAllText r (LB.unpack a :: String)
--                    let b = decode a :: Maybe Value
                    putStrLn "3"
                    putStrLn $ show (head b)
                    putStrLn "4"
                    putStrLn $ show (b)
                    return $ Just (T.pack "", 1.0)
                _   -> return Nothing

        link :: String
        link = "https://www.cbr-xml-daily.ru/daily_jsonp.js"

        parse :: LB.ByteString -> Maybe (T.Text, Double)
        parse json = do
            let v = decode json ^. key "query" . key "results" . key "rate" :: Maybe Value
            name <- v ^. key "Name" . asText
            rate <- v ^. key "Rate" . asText >>= either (const Nothing) Just . T.double >>= Just . fst
            case name of
                "N/A" -> Nothing
                _     -> return (name, rate)



libMain :: IO ()
libMain = do
    let r = mkRegex "^([0-9]+) ([A-Z]+) (в|in) ([A-Z]+)$"
    let a = matchAllText r ("peach punch" :: String)
    v <- fetchXrates "MYR" "RUB"
    case v of
        Just (name, rate) -> do
            putStrLn $ T.unpack name
            putStrLn $ show rate

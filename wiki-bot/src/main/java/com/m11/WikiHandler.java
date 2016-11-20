package com.m11;

import org.json.JSONArray;

import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;

public class WikiHandler {
    public String getWikiUrl(String msg) throws Exception {
        msg = msg.replace("wiki", "").trim();

        if (msg.isEmpty()){
            return "";
        }

        String url = "https://ru.wikipedia.org/w/api.php?action=opensearch&search=" + URLEncoder.encode(msg , "UTF-8") +"&prop=info&format=json&inprop=url";
        return url;
    }

    public String send(String url) throws IOException {
        if (url.isEmpty() || url == null){
            return "";
        }

        URL obj = new URL(url);

        HttpsURLConnection httpsURLConnection = (HttpsURLConnection) obj.openConnection();
        httpsURLConnection.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(
                new InputStreamReader(httpsURLConnection.getInputStream()));
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        JSONArray jsonArray = new JSONArray(response.toString());
        Object links = jsonArray.get(3);
        if (links.toString().equals("[]")){
            return "";
        }

        return ((JSONArray) links).get(0).toString();
    }
}

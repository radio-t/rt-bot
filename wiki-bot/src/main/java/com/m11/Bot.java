package com.m11;

public class Bot {
    public String text;

    public String username;

    public String display_name;

    public Bot() {}

    public String getText() {
        return text;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplay_name() {
        return display_name;
    }

    @Override
    public String toString() {
        return "Bot{" +
                "text='" + text + '\'' +
                ", username='" + username + '\'' +
                ", display_name='" + display_name + '\'' +
                '}';
    }

}

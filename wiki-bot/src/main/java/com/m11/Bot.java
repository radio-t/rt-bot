package com.m11;

public class Bot {
    private final String text;

    private  final String botName;

    public Bot(String text, String botName) {
        this.text = text;
        this.botName = botName;
    }

    public String getText() {
        return text;
    }

    public String getBotName() {
        return botName;
    }

    @Override
    public String toString() {
        return "Bot{" +
                "text='" + text + '\'' +
                ", botName='" + botName + '\'' +
                '}';
    }
}

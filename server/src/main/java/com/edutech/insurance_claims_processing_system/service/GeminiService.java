package com.edutech.insurance_claims_processing_system.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateText(String userText) {
        try {
            // ✅ Gemini REST generateContent endpoint
            // POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
            // API key header: x-goog-api-key
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

            String requestBody = "{\n" +
                    "  \"contents\": [\n" +
                    "    {\n" +
                    "      \"parts\": [\n" +
                    "        { \"text\": " + objectMapper.writeValueAsString(userText) + " }\n" +
                    "      ]\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                return "Gemini API error: " + response.statusCode() + " - " + response.body();
            }

            // ✅ Extract: candidates[0].content.parts[0].text
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            return textNode.isMissingNode() ? response.body() : textNode.asText();

        } catch (Exception e) {
            return "Error calling Gemini: " + e.getMessage();
        }
    }
}
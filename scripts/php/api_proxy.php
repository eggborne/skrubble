<?php
  include("config.php");

  $url = "https://api.openai.com/v1/chat/completions";
  
  $data = json_decode(file_get_contents("php://input"), true);
  $word = $data["word"] ?? '';

  if (empty($word)) {
    echo json_encode(["error" => "Invalid word"]);
    exit();
  }

  $postData = json_encode([
    "model" => "gpt-3.5-turbo",
    "messages" => [
      [
        "role" => "user",
        "content" => "Invent a creative phrase-like definition for" . $word
      ]
    ],
    "max_tokens" => 64,
    "temperature" => 0,
  ]);

  $options = [
    "http" => [
      "method" => "POST",
      "header" => "Content-Type: application/json\r\n" .
                  "Authorization: Bearer " . $OPEN_API_KEY . "\r\n" .
                  "Content-Length: " . strlen($postData),
      "content" => $postData
    ]
  ];

  $context = stream_context_create($options);
  $result = @file_get_contents($url, false, $context);

  if ($result === FALSE) {
    echo json_encode(["error" => "API request failed"]);
    exit();
  }

  echo $result;

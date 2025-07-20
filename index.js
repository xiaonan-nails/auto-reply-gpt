{
  "version": "v2",
  "flow": {
    "name": "ChatGPT Auto Reply (GPT-4o)",
    "description": "",
    "type": "flow",
    "start_step_id": "start",
    "steps": [
      {
        "id": "start",
        "type": "send_message",
        "name": "Trigger",
        "messages": [
          {
            "type": "text",
            "text": "請稍候，我正在處理您的問題 🤖..."
          }
        ],
        "actions": [
          {
            "action": "perform_actions",
            "actions": [
              {
                "action": "send_http_request",
                "url": "https://auto-reply-gpt.onrender.com",
                "method": "POST",
                "headers": {
                  "Content-Type": "application/json"
                },
                "body": "{\n  \"user_id\": \"{{user.id}}\",\n  \"message\": \"{{last_text_message}}\"\n}",
                "timeout": 15,
                "response_mapping": {
                  "type": "json",
                  "mapping": {
                    "reply": "response"
                  }
                }
              }
            ]
          }
        ],
        "next_step_id": "reply"
      },
      {
        "id": "reply",
        "type": "send_message",
        "name": "Reply",
        "messages": [
          {
            "type": "text",
            "text": "{{reply}}"
          }
        ],
        "actions": [],
        "next_step_id": null
      }
    ]
  }
}

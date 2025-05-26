import json
json_string ='''
{
  "quiz": [
    {
      "question": "According to the reference materials, what is one way AI can revolutionize event promotion?",
      "options": {
        "a": "By generating engaging content for social media, posters, and email campaigns.",
        "b": "By manually distributing tasks among committee members.",
        "c": "By increasing manual workload for event organizers.",
        "d": "By ignoring audience engagement on social media."
      },
      "answer": "a"
    }
  ]
}
'''

# Convert JSON string to Python dictionary
data = json.loads(json_string)
print(data)
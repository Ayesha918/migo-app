# test_groq.py
from groq import Groq
from decouple import config

client = Groq(api_key=config('GROQ_API_KEY'))

response = client.chat.completions.create(
    model="qwen/qwen3.6-27b",
    messages=[
        {"role": "user", "content": "Say hello in one short sentence."}
    ]
)

print(response.choices[0].message.content)
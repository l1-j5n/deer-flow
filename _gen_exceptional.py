import os

target = r"D:\03_AITOOL\deer-flow\frontend\src\app\workspace\graph-exceptional-field-theory\page.tsx"

# Read base64 content from data file
import base64
with open(r"D:\03_AITOOL\deer-flow\_exceptional_data.b64", "r") as f:
    b64 = f.read().strip()
content = base64.b64decode(b64).decode("utf-8")
with open(target, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Written {len(content)} bytes to {target}")
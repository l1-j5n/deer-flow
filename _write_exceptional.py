import os

target = r"D:_AITOOL\deer-flowrontend\srcpp\workspace\graph-exceptional-field-theory\page.tsx"

# Read the base64 data from companion file
import base64
with open(r"D:_AITOOL\deer-flow\_exceptional_b64.txt", "r") as f:
    b64data = f.read().strip()

content = base64.b64decode(b64data).decode("utf-8")
with open(target, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Written {len(content)} bytes to {target}")

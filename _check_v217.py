import pathlib, os
PY = pathlib.Path(os.path.join(os.getcwd(), "backend", "app", "gateway", "routers", "knowledge_graph.py"))
src = PY.read_text(encoding="utf-8")
print(f"File has {src.count(chr(10)) + 1} lines")
marker = "# End of v1.216 - Graph Neural Architecture Search v4 Engine"
print(f"Marker found: {marker in src}")

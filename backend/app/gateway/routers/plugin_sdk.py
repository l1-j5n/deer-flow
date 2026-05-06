"""Plugin SDK REST API Router.

Provides endpoints for validating plugin manifests and generating plugin scaffolds.
This enables browser-mode access to plugin development features.

Endpoints
---------
POST  /api/electron/plugin-sdk/validate - validate a plugin manifest
POST  /api/electron/plugin-sdk/scaffold - generate plugin scaffold
GET   /api/electron/plugin-sdk/templates - list available templates
"""

from __future__ import annotations

import json
import logging
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/plugin-sdk", tags=["plugin-sdk"])

# ── Pydantic models ───────────────────────────────────────────────────


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class ScaffoldOptions(BaseModel):
    language: str = "typescript"
    includeTests: bool = True
    includeDocs: bool = True


class ScaffoldResult(BaseModel):
    ok: bool
    message: str
    files: dict[str, str] = Field(default_factory=dict)


class PluginManifestInput(BaseModel):
    id: str = ""
    name: str = ""
    version: str = ""
    description: str = ""
    author: str = ""
    license: str = "MIT"
    permissions: list[str] = Field(default_factory=list)
    hooks: list[str] = Field(default_factory=list)
    dependencies: dict[str, str] = Field(default_factory=dict)
    entry: str = "index.js"
    minPlatformVersion: str = "2.0.0"

    model_config = {"extra": "allow"}


# ── Validation logic ─────────────────────────────────────────────────


def validate_manifest_fields(manifest: dict) -> tuple[list[str], list[str]]:
    """Validate required fields in a plugin manifest."""
    errors: list[str] = []
    warnings: list[str] = []

    required = ["id", "name", "version", "description", "author", "entry"]
    for field in required:
        if not manifest.get(field):
            errors.append(f"Missing required field: {field}")

    # Validate ID format
    plugin_id = manifest.get("id", "")
    if plugin_id and not plugin_id.replace(".", "").replace("-", "").isalnum():
        errors.append("Plugin ID must contain only letters, numbers, dots, and hyphens")

    # Validate version format
    version = manifest.get("version", "")
    if version:
        parts = version.split(".")
        if len(parts) != 3 or not all(p.isdigit() for p in parts):
            errors.append("Version must be in semver format (e.g., 1.0.0)")

    # Validate permissions
    valid_permissions = {
        "filesystem.read",
        "filesystem.write",
        "network.http",
        "network.websocket",
        "shell.execute",
    }
    for perm in manifest.get("permissions", []):
        if perm not in valid_permissions:
            warnings.append(f"Unknown permission: {perm}")

    # Validate hooks
    valid_hooks = {
        "message:preprocess",
        "message:postprocess",
        "tool:preinvoke",
        "tool:postexec",
        "session:startup",
        "session:shutdown",
    }
    for hook in manifest.get("hooks", []):
        if hook not in valid_hooks:
            warnings.append(f"Unknown hook: {hook}")

    return errors, warnings


def validate_manifest(manifest: dict) -> ValidationResult:
    """Validate a plugin manifest."""
    errors, warnings = validate_manifest_fields(manifest)

    # Check for empty manifest
    if not any(manifest.values()):
        errors.append("Manifest cannot be empty")

    valid = len(errors) == 0
    return ValidationResult(valid=valid, errors=errors, warnings=warnings)


# ── Scaffold generation ─────────────────────────────────────────────


def generate_scaffold_files(
    manifest: dict, language: str, include_tests: bool, include_docs: bool
) -> dict[str, str]:
    """Generate scaffold files for a plugin."""
    files: dict[str, str] = {}
    plugin_id = manifest.get("id", "my-plugin").replace("-", "_")
    plugin_name = manifest.get("name", "My Plugin")
    entry = manifest.get("entry", "index.js")

    # package.json
    files["package.json"] = json.dumps(
        {
            "name": manifest.get("id", "my-plugin"),
            "version": manifest.get("version", "1.0.0"),
            "description": manifest.get("description", ""),
            "author": manifest.get("author", ""),
            "license": manifest.get("license", "MIT"),
            "main": entry,
            "scripts": {
                "build": "tsc build",
                "test": "jest",
            },
            "dependencies": {},
            "devDependencies": {
                "typescript": "^5.0.0",
                "@types/node": "^20.0.0",
            },
        },
        indent=2,
    )

    # tsconfig.json (for TypeScript)
    if language == "typescript":
        files["tsconfig.json"] = json.dumps(
            {
                "compilerOptions": {
                    "target": "ES2020",
                    "module": "commonjs",
                    "outDir": "./dist",
                    "rootDir": "./src",
                    "strict": True,
                    "esModuleInterop": True,
                },
                "include": ["src/**/*"],
            },
            indent=2,
        )

    # Main entry file
    ext = ".ts" if language == "typescript" else ".js"
    files[entry] = f"""/**
 * {plugin_name} Plugin
 * Generated by DeerFlow Plugin SDK
 */

export function activate(context) {{
    console.log("{plugin_name} activated");
    // Register hooks, commands, etc.
}}

export function deactivate(context) {{
    console.log("{plugin_name} deactivated");
}}
"""

    # Type definitions
    if language == "typescript":
        files["src/types.ts"] = f"""/**
 * Types for {plugin_name}
 */

export interface PluginContext {{
    registerCommand(id: string, handler: Function): void;
    registerHook(hook: string, handler: Function): void;
    getConfig(): Record<string, any>;
}}
"""

    # Test file
    if include_tests:
        test_ext = ".test.ts" if language == "typescript" else ".test.js"
        files[f"tests/plugin{test_ext}"] = f"""/**
 * Tests for {plugin_name}
 */

describe("{plugin_name}", () => {{
    test("should activate", () => {{
        expect(true).toBe(true);
    }});
}});
"""

    # README
    if include_docs:
        files["README.md"] = f"""# {plugin_name}

{manifest.get("description", "")}

## Installation

```bash
npm install
npm run build
```

## Usage

Enable this plugin in the Plugin Manager.

## Permissions

{', '.join(manifest.get('permissions', [])) if manifest.get('permissions') else 'None'}

## Hooks

{', '.join(manifest.get('hooks', [])) if manifest.get('hooks') else 'None'}
"""

    return files


# ── API endpoints ─────────────────────────────────────────────────────────


@router.post("/validate", response_model=ValidationResult)
async def validate_manifest_endpoint(manifest: PluginManifestInput):
    """Validate a plugin manifest."""
    return validate_manifest(manifest.model_dump(exclude_none=True))


@router.post("/scaffold", response_model=ScaffoldResult)
async def generate_scaffold(manifest: PluginManifestInput, options: ScaffoldOptions):
    """Generate a plugin scaffold."""
    manifest_dict = manifest.model_dump(exclude_none=True)
    files = generate_scaffold_files(
        manifest_dict,
        options.language,
        options.includeTests,
        options.includeDocs,
    )

    if not files:
        return ScaffoldResult(
            ok=False, message="Failed to generate scaffold files", files={}
        )

    return ScaffoldResult(
        ok=True,
        message=f"Successfully generated {len(files)} files",
        files=files,
    )


@router.get("/templates")
async def list_templates():
    """List available scaffold templates."""
    return {
        "templates": [
            {
                "id": "basic-typescript",
                "name": "Basic TypeScript Plugin",
                "description": "Simple plugin with TypeScript",
                "language": "typescript",
            },
            {
                "id": "basic-javascript",
                "name": "Basic JavaScript Plugin",
                "description": "Simple plugin with JavaScript",
                "language": "javascript",
            },
            {
                "id": "advanced",
                "name": "Advanced Plugin",
                "description": "Plugin with tests and documentation",
                "language": "typescript",
            },
        ]
    }
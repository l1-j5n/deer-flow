"""Embedding provider abstraction for Knowledge Base semantic search.

Detects available embedding providers (OpenAI, Anthropic via Voyage, etc.),
computes text embeddings for chunk-level semantic search, and exposes a
status endpoint consumed by the frontend.

The embedding provider is auto-detected from environment variables and
config.yaml; falls back gracefully to None when no API keys are configured.
"""

from __future__ import annotations

import asyncio
import base64
import logging
import os
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# Global singleton — set by _init_embedding_provider(), used by knowledge_base.py
_embedding_provider: Optional[EmbeddingProvider] = None
_provider_lock = asyncio.Lock()


def get_embedding_provider() -> Optional[EmbeddingProvider]:
    """Return the initialized embedding provider, or None."""
    return _embedding_provider


async def init_embedding_provider() -> Optional[EmbeddingProvider]:
    """Initialize the best available embedding provider.

    Detection order: OpenAI > Anthropic/Voyage > None (TF-IDF only fallback).
    """
    global _embedding_provider

    async with _provider_lock:
        if _embedding_provider is not None:
            return _embedding_provider

        # ── Try OpenAI ─────────────────────────────────────────────────
        api_key = _resolve_openai_key()
        if api_key:
            try:
                _embedding_provider = OpenAIEmbeddingProvider(api_key)
                logger.info("Embedding provider initialized: openai (text-embedding-3-small, 1536d)")
                return _embedding_provider
            except Exception as exc:
                logger.warning("Failed to initialize OpenAI embedding provider: %s", exc)
        else:
            logger.debug("No OpenAI API key found for embeddings")

        # ── Future: Anthropic/Voyage, local models ──────────────────────
        logger.info("No embedding provider available — semantic search will use TF-IDF only")
        _embedding_provider = None
        return None


# ── Provider interface ────────────────────────────────────────────────


class EmbeddingProvider:
    """Abstract base for embedding providers."""

    name: str = "unknown"
    model: str = "unknown"
    dimension: int = 0

    async def embed(self, texts: list[str]) -> Optional[list[list[float]]]:
        """Compute embeddings for a batch of texts.

        Returns a list of vectors (each is list[float]), or None on failure.
        """
        raise NotImplementedError

    def is_available(self) -> bool:
        """Whether this provider can compute embeddings."""
        return False

    def status_dict(self) -> dict:
        return {
            "provider": self.name,
            "model": self.model,
            "dimension": self.dimension,
            "available": self.is_available(),
        }


# ── OpenAI provider ───────────────────────────────────────────────────


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """OpenAI text-embedding-3-small provider (1536 dimensions)."""

    name = "openai"
    model = "text-embedding-3-small"
    dimension = 1536
    _max_batch = 20  # OpenAI embedding API batch limit (practical)

    def __init__(self, api_key: str, model: str = "text-embedding-3-small"):
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("openai package is required for OpenAI embeddings")

        self._client = AsyncOpenAI(api_key=api_key)
        self.model = model
        # dimension stays 1536 for text-embedding-3-small

    def is_available(self) -> bool:
        return self._client is not None

    async def embed(self, texts: list[str]) -> Optional[list[list[float]]]:
        """Compute embeddings in batches of max 20."""
        if not texts:
            return []

        all_vectors: list[list[float]] = []

        for i in range(0, len(texts), self._max_batch):
            batch = texts[i : i + self._max_batch]
            try:
                import time
                t0 = time.time()
                resp = await self._client.embeddings.create(
                    model=self.model,
                    input=batch,
                )
                vectors = [d.embedding for d in resp.data]
                all_vectors.extend(vectors)
                elapsed = (time.time() - t0) * 1000
                if i > 0:
                    logger.debug(
                        "Embedded batch %d-%d/%d (%d chunks, %.0fms)",
                        i, i + len(batch), len(texts), len(batch), elapsed,
                    )
                else:
                    logger.info(
                        "Embedded first batch (%d chunks, %.0fms) — total %d",
                        len(batch), elapsed, len(texts),
                    )
            except Exception as exc:
                logger.error("OpenAI embedding API error (batch %d-%d): %s", i, i + len(batch), exc)
                return None  # partial failure = full failure for consistency

        logger.info("Computed %d embeddings in %d batches", len(texts), (len(texts) + self._max_batch - 1) // self._max_batch)
        return all_vectors


# ── Key resolution ────────────────────────────────────────────────────


def _resolve_openai_key() -> Optional[str]:
    """Resolve OpenAI API key from environment or config.yaml."""
    # 1. Direct env var
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key

    # 2. Scan config.yaml models for an OpenAI model's api_key
    try:
        from deerflow.config.app_config import get_app_config
        cfg = get_app_config()
        models = cfg.get("models", [])
        if isinstance(models, list):
            for m in models:
                if not isinstance(m, dict):
                    continue
                provider = m.get("use", "")
                if "openai" in str(provider).lower():
                    k = m.get("api_key", "")
                    if isinstance(k, str) and k.strip() and not k.startswith("$"):
                        return k.strip()
                    # If it's an env var reference like $OPENAI_API_KEY, try it
                    if isinstance(k, str) and k.startswith("$"):
                        env_name = k[1:]
                        env_val = os.environ.get(env_name, "").strip()
                        if env_val:
                            return env_val
    except Exception:
        logger.debug("Could not resolve OpenAI key from config.yaml", exc_info=True)

    return None


# ── Vector serialization helpers ──────────────────────────────────────


def encode_vectors(vectors: list[list[float]]) -> str:
    """Encode a list of vectors into a base64 string for JSON storage.

    Uses float32 to save space: 4 bytes per dimension.
    Also stores dimension and count as a 4-byte header.
    """
    if not vectors or not vectors[0]:
        return ""
    dtype = np.float32
    dim = len(vectors[0])
    count = len(vectors)
    # Pack: 2 x int32 header (dim, count) + float32 data
    header = np.array([dim, count], dtype=np.int32)
    data = np.array(vectors, dtype=dtype).ravel()
    packed = np.concatenate([header.view(dtype), data])
    return base64.b64encode(packed.tobytes()).decode("ascii")


def decode_vectors(b64_str: str) -> tuple[int, int, list[list[float]]]:
    """Decode a base64-encoded vector block.

    Returns: (dimension, count, vectors_list)
    """
    if not b64_str:
        return 0, 0, []
    raw = base64.b64decode(b64_str)
    header = np.frombuffer(raw[:8], dtype=np.int32)  # [dim, count]
    dim, count = int(header[0]), int(header[1])
    data = np.frombuffer(raw[8:], dtype=np.float32)
    vectors = data.reshape(count, dim).tolist()
    return dim, count, vectors


def compute_similarity(query_vec: list[float], chunk_vectors: np.ndarray) -> np.ndarray:
    """Compute cosine similarity between query vector and chunk vectors.

    chunk_vectors: shape (N, D) numpy array of float32
    Returns: shape (N,) similarity scores
    """
    q = np.array(query_vec, dtype=np.float32)
    if chunk_vectors.size == 0:
        return np.array([])

    # Normalize
    q_norm = q / (np.linalg.norm(q) + 1e-10)
    c_norms = np.linalg.norm(chunk_vectors, axis=1) + 1e-10
    c_normalized = chunk_vectors / c_norms[:, np.newaxis]

    return np.dot(c_normalized, q_norm)


async def get_embedding_status() -> dict:
    """Return current embedding provider status."""
    global _embedding_provider

    if _embedding_provider is None:
        await init_embedding_provider()

    if _embedding_provider is None:
        return {
            "provider": "none",
            "model": "N/A",
            "dimension": 0,
            "available": False,
            "message": "No embedding provider configured. Set OPENAI_API_KEY to enable semantic search.",
        }

    return _embedding_provider.status_dict()

# DeerFlow Agent Platform - Knowledge Base

## Architecture Overview
- **Platform**: Electron + Next.js 16 + React 19 + TypeScript 5.8 + Tailwind CSS 4 + shadcn/ui
- **Backend**: FastAPI + LangGraph (Python 3.12+)
- **Pattern**: Layered physics-themed modules, each with 6 enums × 6 values = 36 values, 7 endpoints
- **API Prefix**: `/graph/<module-name>/`
- **Backend File**: `backend/app/gateway/routers/knowledge_graph.py` (grows via append scripts)
- **Frontend Workspace**: `frontend/src/app/workspace/`

## Physics Theme Progression

| Layer | Version | Module | Engine Name | Year |
|-------|---------|--------|-------------|------|
| 60 | v1.308.0 | graph-quantum-opt | Quantum Optimization Engine | 2026 |
| 61 | v1.309.0 | graph-quantum-field-theory | Quantum Field Theory Engine | 2026 |
| 62 | v1.310.0 | graph-exceptional-field-theory | Exceptional Field Theory Engine | 2026 |
| 63 | v1.311.0 | graph-holographic-renormalization | Holographic Renormalization Engine | 2026 |
| 64 | v1.312.0 | graph-quantum-error-correction | Quantum Error Correction Engine | 2026 |
| 65 | v1.313.0 | graph-quantum-gravity | Quantum Gravity Engine | 2026 |
| **66** | **v1.314.0** | **graph-string-theory-unification** | **String Theory Unification Engine** | **2026** |
| **67** | **v1.315.0** | **graph-quantum-information-spacetime** | **Quantum Information Spacetime Engine** | **2026** |

## Current Layer: 67 — Quantum Information Spacetime Engine (v1.315.0)

### Enums (6 × 6 = 36 values)
1. `ItFromQubit315`: spacetime_emergence, entanglement_geometry, quantum_causal_set, holographic_screen, quantum_graphity, ai_it_from_qubit
2. `TensorNetworkSpacetime315`: mera_network, random_tensor, perfect_tensor, multi_scale_entanglement, holographic_code, ai_tensor_network
3. `QuantumErrorCorrectionGravity315`: ads_cft_code, ryu_takayanagi_code, entanglement_wedge_code, petz_recovery, complementary_reconstruction, ai_qec_gravity
4. `SachdevYeKitaev315`: syk_model, sachdev_ye, colored_syk, complex_syk, jackiw_teitelboim, ai_syk
5. `QuantumComplexityGeometry315`: circuit_complexity, nielsen_geometry, complexity_action, complexity_volume, complexity_spacetime, ai_complexity
6. `EinsteinRosenBridge315`: traversable_erb, ertpr_conjecture, quantum_wormhole, eternal_blackhole, multi_boundary, ai_erb

### Endpoints (7)
1. POST `/graph/quantum-information-spacetime/it-from-qubit` — It from Qubit
2. POST `/graph/quantum-information-spacetime/tensor-network-spacetime` — Tensor Network Spacetime
3. POST `/graph/quantum-information-spacetime/quantum-error-correction-gravity` — QEC Gravity
4. POST `/graph/quantum-information-spacetime/sachdev-ye-kitaev` — Sachdev-Ye-Kitaev
5. POST `/graph/quantum-information-spacetime/quantum-complexity-geometry` — Quantum Complexity Geometry
6. POST `/graph/quantum-information-spacetime/einstein-rosen-bridge` — Einstein-Rosen Bridge
7. GET `/graph/quantum-information-spacetime/overview` — Layer overview

### Physics Bridges (L66 → L67)
- 弦世界面路径积分Z=∫D[X]e^{-S_P} → 量子信息处理: 量子线路复杂性C(ρ)
- AdS/CFT体边界对偶Φ(x,z)↔O(x) → AdS/CFT IS QEC: 径向嵌套H_k⊂H_{k+1} = 码子空间
- Ryu-Takayanagi S=Area(γ_A)/(4G_N) → 张量网络实现: MERA/RTN/HaPPY码 → 离散全息对应
- SYK最大混沌λ_L=2πT → AdS₂ JT引力: Schwarzian作用量S=-C∫du{f(u),u} → 低T有效理论
- ER=EPR猜想 → 量子虫洞: 双迹形变V=-t∫(ψ_Lψ_R) → Gao-Jafferis-Wall可穿越ERB
- 全息码子空间 → 量子复杂性几何: CV=V(γ)/(G_Nℓ), CA=S_WdW/(πℏ), 复杂性第二定律

### Files
- Backend: `_v1315_append.py`
- Frontend: `frontend/src/app/workspace/graph-quantum-information-spacetime/page.tsx`

## Next Candidate
**Layer 68 — Quantum Thermodynamic Spacetime Engine**: 全息热力学/黑洞热力学/量子统计引力/熵力引力/热时间假说/纠缠热力学

## Development Pattern
Each layer follows this sequence:
1. Design 6 enums × 6 values around a physics theme
2. Create backend append script `_v13XX_append.py` with enums, Pydantic models, 7 endpoints
3. Create frontend page `workspace/graph-<module>/page.tsx` with 7 tabs
4. Update `iteration-progress.md` with layer details
5. Update this knowledge base

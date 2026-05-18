#!/usr/bin/env python3
"""Generate frontend pages for Layers 101-104"""
import os

def gen_page(layer, version, title, desc_cn, prefix, tabs):
    enums_code = ''
    for tab in tabs:
        enums_code += f"const {tab['enum_name']} = [\n"
        for v, l in tab['values']:
            enums_code += f'  {{ value: "{v}", label: "{l}" }},\n'
        enums_code += '];\n\n'

    state_code = ''
    for tab in tabs:
        sn = tab['state']
        state_code += f'  const [{sn}Type, set{sn.capitalize()}Type] = useState("{tab["values"][0][0]}");\n'
        for p in tab['params']:
            state_code += f'  const [{sn}{p["name"]}, set{sn.capitalize()}{p["name"]}] = useState("{p["default"]}");\n'

    tab_triggers = '<TabsTrigger value="overview">Overview</TabsTrigger>\n'
    for tab in tabs:
        tab_triggers += f'<TabsTrigger value="{tab["id"]}">{tab["label_cn"]}</TabsTrigger>\n'

    overview_tab = f'''
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>{title} 概览</CardTitle><CardDescription>{desc_cn} — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={{fetchOverview}} disabled={{loading}}>{{loading ? "加载中..." : "获取概览"}}</Button>
            {{overview && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card><CardHeader className="pb-2"><CardDescription>枚举数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{{overview.enum_count}}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>端点数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{{overview.endpoint_count}}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>配置空间</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{{overview.config_space.toLocaleString()}}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>缓存命中</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{{Object.values(overview.cache_stats).reduce((a: number, b: number) => a + b, 0)}}</div></CardContent></Card>
            </div>)}}
            {{result && <JsonBlock data={{result}} />}}
          </CardContent></Card>
        </TabsContent>'''

    feature_tabs = ''
    for tab in tabs:
        sn = tab['state']
        inputs = f'<div className="space-y-2"><Label>类型</Label><Select value={{{sn}Type}} onValueChange={{set{sn.capitalize()}Type}}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{{{tab["enum_name"]}.map((t) => <SelectItem key={{t.value}} value={{t.value}}>{{t.label}}</SelectItem>)}}</SelectContent></Select></div>\n'
        for p in tab['params']:
            inputs += f'<div className="space-y-2"><Label>{p["label"]}</Label><Input type="number" value={{{sn}{p["name"]}}} onChange={{(e) => set{sn.capitalize()}{p["name"]}(e.target.value)}} {p.get("props","")} /></div>\n'
        params_dict = ', '.join([f'{tab["param_key"]}: {sn}Type'] + [f'{p["param_key"]}: {sn}{p["name"]}' for p in tab['params']])
        feature_tabs += f'''
        <TabsContent value="{tab['id']}">
          <Card><CardHeader><CardTitle>{tab["label_cn"]} ({tab["title_en"]})</CardTitle><CardDescription>{tab["desc"]}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{inputs}</div>
            <Button onClick={{() => postEndpoint("/graph/{prefix}/{tab['endpoint']}", {{{params_dict}}})}} disabled={{loading}}>{{loading ? "计算中..." : "{tab["button_text"]}"}}</Button>
            {{result && <JsonBlock data={{result}} />}}
          </CardContent></Card>
        </TabsContent>'''

    cname = title.replace(" ", "").replace("Quantum", "Quantum").replace("Engine", "Engine")
    return f'''"use client";

import {{ useState }} from "react";
import {{
  Card, CardContent, CardDescription, CardHeader, CardTitle,
}} from "@/components/ui/card";
import {{ Tabs, TabsContent, TabsList, TabsTrigger }} from "@/components/ui/tabs";
import {{ Badge }} from "@/components/ui/badge";
import {{ Button }} from "@/components/ui/button";
import {{
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
}} from "@/components/ui/select";
import {{ Input }} from "@/components/ui/input";
import {{ Label }} from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

interface OverviewData {{
  layer: number; version: string; engine: str; description: string;
  enums: Record<string, string[]>; enum_count: number;
  endpoints: {{ method: string; path: string; desc: string }}[];
  endpoint_count: number; config_space: number; cache_stats: Record<string, number>;
}}

{enums_code}
function JsonBlock({{ data }}: {{ data: unknown }}) {{
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{{JSON.stringify(data, null, 2)}}</pre>);
}}

export default function {cname}Page() {{
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
{state_code}
  async function fetchOverview() {{
    setLoading(true);
    try {{ const res = await fetch(`${{API_BASE}}/graph/{prefix}/overview`); const data = await res.json(); setOverview(data); setResult(data); }}
    catch (e) {{ setResult({{ error: String(e) }}); }} finally {{ setLoading(false); }}
  }}
  async function postEndpoint(path: string, params: Record<string, string>) {{
    setLoading(true); setResult(null);
    try {{ const qs = new URLSearchParams(params).toString(); const res = await fetch(`${{API_BASE}}${{path}}?${{qs}}`, {{ method: "POST" }}); setResult(await res.json()); }}
    catch (e) {{ setResult({{ error: String(e) }}); }} finally {{ setLoading(false); }}
  }}

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{desc_cn}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{version}</Badge>
          <Badge variant="secondary">Layer {layer}</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          {tab_triggers}
        </TabsList>
        {overview_tab}
        {feature_tabs}
      </Tabs>
    </div>
  );
}}
'''

BASE = "D:/03_AITOOL/deer-flow/frontend/src/app/workspace"

pages = [
    {
        'file': f'{BASE}/graph-quantum-programming-language/page.tsx',
        'layer': 101, 'version': 'v1.349.0', 'title': 'Quantum Programming Language Engine',
        'desc_cn': 'Layer 101 — 量子IR / 电路DSL / 类型系统 / 编译器优化 / 运行时 / 调试器',
        'prefix': 'quantum-programming-language',
        'tabs': [
            {'id':'ir','label_cn':'量子IR','title_en':'Quantum IR','desc':'OpenQASM/Quil/QIR-LLVM/Blackbird/Braket','endpoint':'quantum-ir','button_text':'IR编译','param_key':'ir_type',
             'enum_name':'IR_TYPES','state':'ir',
             'values':[('openqasm_ir','OpenQASM'),('quil_ir','Quil'),('qir_llvm','QIR-LLVM'),('blackbird_ir','Blackbird'),('braket_ir','Braket'),('ai_unified_ir','AI')],
             'params':[{'name':'Size','default':'100','label':'电路规模','param_key':'circuit_size','props':'min={1}'},{'name':'OptLevel','default':'2','label':'优化级别','param_key':'optimization_level','props':'min={0} max={3}'}]},
            {'id':'dsl','label_cn':'电路DSL','title_en':'Circuit DSL','desc':'Gate/Pulse/Measurement/Hybrid/Variational','endpoint':'circuit-dsl','button_text':'DSL分析','param_key':'dsl_type',
             'enum_name':'DSL_TYPES','state':'dsl',
             'values':[('gate_based_dsl','Gate-Based'),('pulse_level_dsl','Pulse'),('measurement_dsl','Measurement'),('hybrid_classical_dsl','Hybrid'),('variational_dsl','Variational'),('ai_dsl_synthesis','AI')],
             'params':[{'name':'Ops','default':'500','label':'操作数','param_key':'num_operations','props':'min={1}'},{'name':'AbsLevel','default':'3','label':'抽象层级','param_key':'abstraction_level','props':'min={1} max={5}'}]},
            {'id':'type','label_cn':'类型系统','title_en':'Type System','desc':'Linear/Dependent/Session/Effect/Resource','endpoint':'quantum-type-system','button_text':'类型检查','param_key':'type_system',
             'enum_name':'TYPE_TYPES','state':'type',
             'values':[('linear_type','Linear'),('dependent_type','Dependent'),('session_type','Session'),('effect_type','Effect'),('resource_type','Resource'),('ai_type_inference','AI')],
             'params':[{'name':'Complexity','default':'10','label':'电路复杂度','param_key':'circuit_complexity','props':'min={1}'},{'name':'Qubits','default':'50','label':'比特数','param_key':'num_qubits','props':'min={1}'}]},
            {'id':'compiler','label_cn':'编译优化','title_en':'Compiler Pass','desc':'ConstantFold/DeadGate/Commutative/Rotation/Template','endpoint':'compiler-pass','button_text':'编译分析','param_key':'pass_type',
             'enum_name':'COMPILER_TYPES','state':'compiler',
             'values':[('constant_fold','Const Fold'),('dead_gate_elim','Dead Gate'),('commutative_merge','Commutative'),('rotation_merge','Rotation'),('template_rewrite','Template'),('ai_pass_schedule','AI')],
             'params':[{'name':'Depth','default':'1000','label':'电路深度','param_key':'circuit_depth','props':'min={1}'},{'name':'Gates','default':'5000','label':'门数量','param_key':'gate_count','props':'min={1}'}]},
            {'id':'runtime','label_cn':'运行时','title_en':'Quantum Runtime','desc':'Sync/Async/Batch/Streaming/EventDriven','endpoint':'quantum-runtime','button_text':'运行时分析','param_key':'runtime_type',
             'enum_name':'RT_TYPES','state':'runtime',
             'values':[('synchronous_rt','Synchronous'),('asynchronous_rt','Asynchronous'),('batch_runtime','Batch'),('streaming_rt','Streaming'),('event_driven_rt','Event-Driven'),('ai_runtime_adapt','AI')],
             'params':[{'name':'Shots','default':'10000','label':'最大shots','param_key':'max_shots','props':'min={1}'},{'name':'Timeout','default':'300.0','label':'超时(秒)','param_key':'timeout_sec','props':'step={10}'}]},
            {'id':'debug','label_cn':'调试器','title_en':'Quantum Debug','desc':'Tomography/Inspector/Breakpoint/Trace/Assertion','endpoint':'quantum-debug','button_text':'调试分析','param_key':'debug_type',
             'enum_name':'DEBUG_TYPES','state':'debug',
             'values':[('state_tomography_dbg','Tomography'),('circuit_inspector','Inspector'),('breakpoint_quantum','Breakpoint'),('trace_execution','Trace'),('assertion_quantum','Assertion'),('ai_debug_assist','AI')],
             'params':[{'name':'Qubits','default':'20','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Depth','default':'100','label':'电路深度','param_key':'circuit_depth','props':'min={1}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-sdk-framework/page.tsx',
        'layer': 102, 'version': 'v1.350.0', 'title': 'Quantum SDK Framework Engine',
        'desc_cn': 'Layer 102 — Qiskit集成 / Cirq集成 / PennyLane集成 / OpenQASM / 混合SDK / 基准测试',
        'prefix': 'quantum-sdk-framework',
        'tabs': [
            {'id':'qiskit','label_cn':'Qiskit','title_en':'Qiskit Integration','desc':'Aer/IBM/Nature/Finance/ML','endpoint':'qiskit-integration','button_text':'Qiskit分析','param_key':'integration_type',
             'enum_name':'QISKIT_TYPES','state':'qiskit',
             'values':[('qiskit_aer','Aer'),('qiskit_ibm','IBM Quantum'),('qiskit_nature','Nature'),('qiskit_finance','Finance'),('qiskit_ml','QML'),('ai_qiskit_wrap','AI')],
             'params':[{'name':'Qubits','default':'27','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Shots','default':'1024','label':'Shots','param_key':'shots','props':'min={1}'}]},
            {'id':'cirq','label_cn':'Cirq','title_en':'Cirq Integration','desc':'Simulator/Google/IonQ/Pasqal/AQT','endpoint':'cirq-integration','button_text':'Cirq分析','param_key':'integration_type',
             'enum_name':'CIRQ_TYPES','state':'cirq',
             'values':[('cirq_simulator','Simulator'),('cirq_google','Google'),('cirq_ionq','IonQ'),('cirq_pasqal','Pasqal'),('cirq_aqt','AQT'),('ai_cirq_wrap','AI')],
             'params':[{'name':'Qubits','default':'50','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Depth','default':'100','label':'电路深度','param_key':'circuit_depth','props':'min={1}'}]},
            {'id':'pennylane','label_cn':'PennyLane','title_en':'PennyLane Integration','desc':'Default/Lightning/TF/Torch/JAX','endpoint':'pennylane-integration','button_text':'PennyLane分析','param_key':'integration_type',
             'enum_name':'PL_TYPES','state':'pennylane',
             'values':[('pennylane_default','Default'),('pennylane_lightning','Lightning'),('pennylane_tf','TensorFlow'),('pennylane_torch','PyTorch'),('pennylane_jax','JAX'),('ai_pennylane_wrap','AI')],
             'params':[{'name':'Layers','default':'4','label':'层数','param_key':'num_layers','props':'min={1}'},{'name':'Params','default':'100','label':'参数数','param_key':'num_params','props':'min={1}'}]},
            {'id':'qasm','label_cn':'OpenQASM','title_en':'OpenQASM Support','desc':'v2/v3 Parser/Exporter/Validator/Transpiler','endpoint':'openqasm-support','button_text':'QASM分析','param_key':'qasm_type',
             'enum_name':'QASM_TYPES','state':'qasm',
             'values':[('qasm2_parser','QASM2 Parser'),('qasm3_parser','QASM3 Parser'),('qasm_exporter','Exporter'),('qasm_validator','Validator'),('qasm_transpiler','Transpiler'),('ai_qasm_synthesis','AI')],
             'params':[{'name':'Size','default':'200','label':'电路规模','param_key':'circuit_size','props':'min={1}'},{'name':'Version','default':'3','label':'QASM版本','param_key':'qasm_version','props':'min={2} max={3}'}]},
            {'id':'hybrid','label_cn':'混合SDK','title_en':'Hybrid SDK','desc':'VQE/QAOA/Variational/QML/NISQ','endpoint':'hybrid-sdk','button_text':'混合分析','param_key':'hybrid_type',
             'enum_name':'HYBRID_TYPES','state':'hybrid',
             'values':[('variational_sdk','Variational'),('qaoa_sdk','QAOA'),('vqe_sdk','VQE'),('quantum_ml_sdk','QML'),('nisq_sdk','NISQ'),('ai_hybrid_orchestrator','AI')],
             'params':[{'name':'Classical','default':'10','label':'经典资源','param_key':'classical_resources','props':'min={1}'},{'name':'Quantum','default':'20','label':'量子资源','param_key':'quantum_resources','props':'min={1}'}]},
            {'id':'bench','label_cn':'基准测试','title_en':'SDK Benchmark','desc':'Circuit/Simulator/Hardware/Transpiler/E2E','endpoint':'sdk-benchmark','button_text':'基准分析','param_key':'bench_type',
             'enum_name':'BENCH_TYPES','state':'bench',
             'values':[('circuit_bench','Circuit'),('simulator_bench','Simulator'),('hardware_bench','Hardware'),('transpiler_bench','Transpiler'),('end_to_end_bench','E2E'),('ai_benchmark_suite','AI')],
             'params':[{'name':'Trials','default':'100','label':'试验次数','param_key':'num_trials','props':'min={1}'},{'name':'Size','default':'10','label':'问题规模','param_key':'problem_size','props':'min={1}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-simulator/page.tsx',
        'layer': 103, 'version': 'v1.351.0', 'title': 'Quantum Simulator Engine',
        'desc_cn': 'Layer 103 — 状态向量 / 密度矩阵 / 张量网络 / Clifford / 稳定子 / MPS',
        'prefix': 'quantum-simulator',
        'tabs': [
            {'id':'sv','label_cn':'状态向量','title_en':'State Vector Sim','desc':'Exact/Sparse/GPU/Distributed/Chunked','endpoint':'state-vector-sim','button_text':'SV仿真','param_key':'sim_type',
             'enum_name':'SV_TYPES','state':'sv',
             'values':[('exact_sv','Exact'),('sparse_sv','Sparse'),('gpu_accel_sv','GPU'),('distributed_sv','Distributed'),('chunked_sv','Chunked'),('ai_adaptive_sv','AI')],
             'params':[{'name':'Qubits','default':'30','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Depth','default':'200','label':'电路深度','param_key':'circuit_depth','props':'min={1}'}]},
            {'id':'dm','label_cn':'密度矩阵','title_en':'Density Matrix Sim','desc':'Full/Kraus/Superop/Stochastic/MonteCarlo','endpoint':'density-matrix-sim','button_text':'DM仿真','param_key':'sim_type',
             'enum_name':'DM_TYPES','state':'dm',
             'values':[('full_dm','Full DM'),('kraus_dm','Kraus'),('superop_dm','Superop'),('stochastic_dm','Stochastic'),('monte_carlo_dm','Monte Carlo'),('ai_noise_dm','AI')],
             'params':[{'name':'Qubits','default':'15','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Noise','default':'depolarizing','label':'噪声模型','param_key':'noise_model','props':''}]},
            {'id':'tn','label_cn':'张量网络','title_en':'Tensor Network Sim','desc':'MPS/MPO/TTN/PEPS/Cotengra','endpoint':'tensor-network-sim','button_text':'TN仿真','param_key':'sim_type',
             'enum_name':'TN_TYPES','state':'tn',
             'values':[('mps_sim','MPS'),('mpo_sim','MPO'),('ttn_sim','TTN'),('peps_sim','PEPS'),('cotengra_sim','Cotengra'),('ai_contraction','AI')],
             'params':[{'name':'Qubits','default':'100','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Bond','default':'64','label':'键维度','param_key':'bond_dimension','props':'min={2}'}]},
            {'id':'clifford','label_cn':'Clifford','title_en':'Clifford Sim','desc':'CHP/Tableaux/GraphState/CNOT-H/T','endpoint':'clifford-sim','button_text':'Clifford仿真','param_key':'sim_type',
             'enum_name':'CF_TYPES','state':'clifford',
             'values':[('stabilizer_chp','CHP'),('tableaux_sim','Tableaux'),('graph_state_sim','Graph State'),('cnot_hadamard_sim','CNOT-H'),('clifford_t_sim','Clifford+T'),('ai_clifford','AI')],
             'params':[{'name':'Qubits','default':'1000','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Gates','default':'5000','label':'门数','param_key':'num_gates','props':'min={1}'}]},
            {'id':'stabilizer','label_cn':'稳定子','title_en':'Stabilizer Sim','desc':'CHP/Stim/PyMatching/GF2/CSS','endpoint':'stabilizer-sim','button_text':'稳定子仿真','param_key':'sim_type',
             'enum_name':'SB_TYPES','state':'stabilizer',
             'values':[('chp_engine','CHP'),('Stim_engine','Stim'),('pymatching_sim','PyMatching'),('gf2_stabilizer','GF2'),('css_code_sim','CSS'),('ai_stabilizer','AI')],
             'params':[{'name':'Distance','default':'11','label':'码距','param_key':'code_distance','props':'min={3}'},{'name':'Rounds','default':'10','label':'轮数','param_key':'num_rounds','props':'min={1}'}]},
            {'id':'mps','label_cn':'MPS','title_en':'MPS Simulator','desc':'Exact/TEBD/TDVP/DMRG/Finite','endpoint':'mps-simulator','button_text':'MPS仿真','param_key':'sim_type',
             'enum_name':'MPS_TYPES','state':'mps',
             'values':[('mps_exact','Exact'),('mps_tebd','TEBD'),('mps_tdvp','TDVP'),('mps_dmrg','DMRG'),('mps_finite','Finite'),('ai_mps_bond','AI')],
             'params':[{'name':'Qubits','default':'50','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'BondDim','default':'32','label':'键维度','param_key':'bond_dim','props':'min={2}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-application-ecosystem/page.tsx',
        'layer': 104, 'version': 'v1.352.0', 'title': 'Quantum Application Ecosystem Engine',
        'desc_cn': 'Layer 104 — 量子金融 / 药物发现 / 物流优化 / 能源优化 / 气候建模 / 材料发现',
        'prefix': 'quantum-application-ecosystem',
        'tabs': [
            {'id':'finance','label_cn':'量子金融','title_en':'Quantum Finance','desc':'Portfolio/Risk/Options/Fraud/Credit','endpoint':'quantum-finance','button_text':'金融分析','param_key':'app_type',
             'enum_name':'FIN_TYPES','state':'finance',
             'values':[('portfolio_opt','Portfolio'),('risk_analysis','Risk'),('option_pricing','Options'),('fraud_detection','Fraud'),('credit_scoring','Credit'),('ai_quant_finance','AI')],
             'params':[{'name':'Assets','default':'50','label':'资产数','param_key':'num_assets','props':'min={1}'},{'name':'Horizon','default':'252','label':'时间(天)','param_key':'time_horizon_days','props':'min={1}'}]},
            {'id':'drug','label_cn':'药物发现','title_en':'Quantum Drug Discovery','desc':'Molecular/Protein/Interaction/Binding/ADME','endpoint':'quantum-drug','button_text':'药物分析','param_key':'app_type',
             'enum_name':'DRUG_TYPES','state':'drug',
             'values':[('molecular_sim','Molecular'),('protein_fold','Protein'),('drug_interaction','Interaction'),('binding_affinity','Binding'),('adme_prediction','ADME'),('ai_drug_discovery','AI')],
             'params':[{'name':'Size','default':'50','label':'分子大小','param_key':'molecule_size','props':'min={1}'},{'name':'Target','default':'brca1','label':'靶蛋白','param_key':'target_protein','props':''}]},
            {'id':'logistics','label_cn':'物流优化','title_en':'Quantum Logistics','desc':'VRP/SupplyChain/Warehouse/Scheduling/Network','endpoint':'quantum-logistics','button_text':'物流分析','param_key':'app_type',
             'enum_name':'LOG_TYPES','state':'logistics',
             'values':[('vehicle_routing','VRP'),('supply_chain','Supply Chain'),('warehouse_opt','Warehouse'),('scheduling_opt','Scheduling'),('network_flow','Network'),('ai_logistics_opt','AI')],
             'params':[{'name':'Nodes','default':'100','label':'节点数','param_key':'num_nodes','props':'min={1}'},{'name':'Constraints','default':'20','label':'约束数','param_key':'constraints','props':'min={1}'}]},
            {'id':'energy','label_cn':'能源优化','title_en':'Quantum Energy','desc':'Grid/Battery/Solar/Carbon/Fusion','endpoint':'quantum-energy','button_text':'能源分析','param_key':'app_type',
             'enum_name':'ENR_TYPES','state':'energy',
             'values':[('grid_optimization','Grid'),('battery_design','Battery'),('solar_material','Solar'),('carbon_capture','Carbon'),('fusion_control','Fusion'),('ai_energy_opt','AI')],
             'params':[{'name':'Size','default':'500','label':'系统规模','param_key':'system_size','props':'min={1}'},{'name':'Efficiency','default':'0.95','label':'效率目标','param_key':'efficiency_target','props':'step={0.01}'}]},
            {'id':'climate','label_cn':'气候建模','title_en':'Quantum Climate','desc':'Weather/Ocean/Carbon/Ice/Atmosphere','endpoint':'quantum-climate','button_text':'气候分析','param_key':'app_type',
             'enum_name':'CLI_TYPES','state':'climate',
             'values':[('weather_pred','Weather'),('ocean_model','Ocean'),('carbon_cycle','Carbon'),('ice_sheet_model','Ice Sheet'),('atmospheric_sim','Atmosphere'),('ai_climate_model','AI')],
             'params':[{'name':'Grid','default':'100','label':'网格分辨率','param_key':'grid_resolution','props':'min={10}'},{'name':'Forecast','default':'30','label':'预报天数','param_key':'forecast_days','props':'min={1}'}]},
            {'id':'materials','label_cn':'材料发现','title_en':'Quantum Materials','desc':'Superconductor/Catalyst/Semi/Polymer/Magnetic','endpoint':'quantum-materials','button_text':'材料分析','param_key':'app_type',
             'enum_name':'MAT_TYPES','state':'materials',
             'values':[('superconductor','Superconductor'),('catalyst_design','Catalyst'),('semiconductor','Semiconductor'),('polymer_design','Polymer'),('magnetic_material','Magnetic'),('ai_material_discovery','AI')],
             'params':[{'name':'Atoms','default':'200','label':'原子数','param_key':'num_atoms','props':'min={1}'},{'name':'Temp','default':'300.0','label':'温度(K)','param_key':'temperature_k','props':'step={10}'}]},
        ]
    }
]

for p in pages:
    fpath = p.pop('file')
    code = gen_page(**p)
    os.makedirs(os.path.dirname(fpath), exist_ok=True)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Written: {fpath} ({len(code)} chars, ~{code.count(chr(10))+1} lines)")

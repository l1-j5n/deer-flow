#!/usr/bin/env python3
"""Generate frontend pages for Layers 97-100"""
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
        'file': f'{BASE}/graph-quantum-hardware-compiler/page.tsx',
        'layer': 97, 'version': 'v1.345.0', 'title': 'Quantum Hardware Compiler Engine',
        'desc_cn': 'Layer 97 — 门分解 / 脉冲优化 / 拓扑映射 / 校准引擎 / 电路优化 / 资源估计',
        'prefix': 'quantum-hardware-compiler',
        'tabs': [
            {'id':'gate','label_cn':'门分解','title_en':'Gate Decomposition','desc':'Solovay-Kitaev/Cartan/Qiskit/T-par/Matroid','endpoint':'gate-decomposition','button_text':'门分解','param_key':'decomp_type',
             'enum_name':'GATE_TYPES','state':'gate',
             'values':[('solovay_kitaev','Solovay-Kitaev'),('cartan_decomposition','Cartan'),('qiskit_transpile','Qiskit'),('t_par_synthesis','T-par'),('matroid_partition','Matroid'),('ai_gate_decompose','AI')],
             'params':[{'name':'GateSet','default':'clifford_t','label':'目标门集','param_key':'target_gate_set','props':''},{'name':'Approx','default':'0.99','label':'近似度','param_key':'approximation_degree','props':'step={0.01}'}]},
            {'id':'pulse','label_cn':'脉冲优化','title_en':'Pulse Optimization','desc':'GRAPE/DCRAB/Optimal Control/Custom/DRAG','endpoint':'pulse-optimization','button_text':'脉冲优化','param_key':'pulse_type',
             'enum_name':'PULSE_TYPES','state':'pulse',
             'values':[('grape_pulse','GRAPE'),('dcrab_optimization','DCRAB'),('optimal_control','Optimal Ctrl'),('qiskit_pulse_custom','Qiskit Pulse'),('derivative_removal','DRAG'),('ai_pulse_optimize','AI')],
             'params':[{'name':'Duration','default':'40.0','label':'脉冲时长(ns)','param_key':'pulse_duration_ns','props':'step={1}'},{'name':'Fidelity','default':'0.999','label':'保真度目标','param_key':'fidelity_target','props':'step={0.001}'}]},
            {'id':'topology','label_cn':'拓扑映射','title_en':'Topology Mapping','desc':'SABRE/Lookahead/Stochastic/Noise/Crosstalk','endpoint':'topology-mapping','button_text':'拓扑映射','param_key':'topo_type',
             'enum_name':'TOPO_TYPES','state':'topology',
             'values':[('sabre_routing','SABRE'),('lookahead_swap','Lookahead'),('stochastic_swap','Stochastic'),('noise_adaptive_map','Noise-Adaptive'),('crosstalk_aware','Crosstalk'),('ai_topology_map','AI')],
             'params':[{'name':'Qubits','default':'27','label':'量子比特数','param_key':'qubit_count','props':'min={1}'},{'name':'Conn','default':'3','label':'连接度','param_key':'connectivity_degree','props':'min={1}'}]},
            {'id':'calib','label_cn':'校准引擎','title_en':'Calibration Engine','desc':'RB/Tomography/Gate Set/Benchmark/XEB','endpoint':'calibration-engine','button_text':'校准','param_key':'cal_type',
             'enum_name':'CAL_TYPES','state':'calib',
             'values':[('rb_calibration','RB'),('tomography_cal','Tomography'),('gate_set_tomography','GST'),('randomized_benchmark','RB Std'),('cross_entropy_cal','XEB'),('ai_calibration','AI')],
             'params':[{'name':'Qubits','default':'127','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Rounds','default':'100','label':'校准轮数','param_key':'calibration_rounds','props':'min={1}'}]},
            {'id':'circuit','label_cn':'电路优化','title_en':'Circuit Optimization','desc':'Commutative/Peephole/Template/Consolidate','endpoint':'circuit-optimization','button_text':'电路优化','param_key':'opt_type',
             'enum_name':'OPT_TYPES','state':'circuit',
             'values':[('commutative_cancellation','Commutative'),('peephole_opt','Peephole'),('template_matching','Template'),('consolidate_blocks','Consolidate'),('depth_optimization','Depth'),('ai_circuit_opt','AI')],
             'params':[{'name':'Depth','default':'1000','label':'电路深度','param_key':'circuit_depth','props':'min={1}'},{'name':'Level','default':'3','label':'优化级别','param_key':'optimization_level','props':'min={0} max={3}'}]},
            {'id':'resource','label_cn':'资源估计','title_en':'Resource Estimation','desc':'Gate Count/T-Factory/Space-Time/Clifford-T','endpoint':'resource-estimation','button_text':'资源估计','param_key':'est_type',
             'enum_name':'EST_TYPES','state':'resource',
             'values':[('gate_count_est','Gate Count'),('t_factory_est','T-Factory'),('space_time_volume','Space-Time'),('clifford_t_cost','Clifford-T'),('logical_qubit_cost','Logical Qubit'),('ai_resource_est','AI')],
             'params':[{'name':'Size','default':'10000','label':'算法规模','param_key':'algorithm_size','props':'min={1}'},{'name':'Error','default':'0.001','label':'误差预算','param_key':'error_budget','props':'step={0.0001}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-error-correction-code/page.tsx',
        'layer': 98, 'version': 'v1.346.0', 'title': 'Quantum Error Correction Code Engine',
        'desc_cn': 'Layer 98 — 表面码 / 颜色码 / LDPC码 / 容错阈值 / 解码器 / 逻辑操作',
        'prefix': 'quantum-error-correction-code',
        'tabs': [
            {'id':'surface','label_cn':'表面码','title_en':'Surface Code','desc':'Planar/Toric/Rotated/XZZX/Subsystem','endpoint':'surface-code','button_text':'表面码','param_key':'surface_type',
             'enum_name':'SURF_TYPES','state':'surface',
             'values':[('planar_surface','Planar'),('toric_surface','Toric'),('rotated_surface','Rotated'),('xzzx_surface','XZZX'),('subsystem_surface','Subsystem'),('ai_surface_code','AI')],
             'params':[{'name':'Distance','default':'17','label':'码距','param_key':'code_distance','props':'min={3}'},{'name':'ErrorRate','default':'0.001','label':'物理错误率','param_key':'physical_error_rate','props':'step={0.0001}'}]},
            {'id':'color','label_cn':'颜色码','title_en':'Color Code','desc':'Triangular/Hexagonal/4-8-8/Steane/Bombin','endpoint':'color-code','button_text':'颜色码','param_key':'color_type',
             'enum_name':'COLOR_TYPES','state':'color',
             'values':[('triangular_color','Triangular'),('hexagonal_color','Hexagonal'),('4_8_8_color','4-8-8'),('steane_color','Steane'),('bombin_color','Bombin'),('ai_color_code','AI')],
             'params':[{'name':'Distance','default':'11','label':'码距','param_key':'code_distance','props':'min={3}'},{'name':'Stab','default':'6','label':'稳定子权重','param_key':'stabilizer_weight','props':'min={4}'}]},
            {'id':'ldpc','label_cn':'LDPC码','title_en':'LDPC Code','desc':'Tanner/Hypergraph/Chain/Expander/Lifted','endpoint':'ldpc-code','button_text':'LDPC分析','param_key':'ldpc_type',
             'enum_name':'LDPC_TYPES','state':'ldpc',
             'values':[('tanner_ldpc','Tanner'),('hypergraph_ldpc','Hypergraph'),('quantum_ldpc_chain','Chain'),('expander_ldpc','Expander'),('lifted_ldpc','Lifted'),('ai_ldpc_code','AI')],
             'params':[{'name':'Block','default':'1000','label':'块长度','param_key':'block_length','props':'min={10}'},{'name':'Rate','default':'0.5','label':'码率','param_key':'rate','props':'step={0.01} min={0.1} max={0.9}'}]},
            {'id':'threshold','label_cn':'容错阈值','title_en':'Fault-Tolerant Threshold','desc':'Independent/Correlated/Circuit/Phenomenological','endpoint':'fault-tolerant-threshold','button_text':'阈值分析','param_key':'threshold_type',
             'enum_name':'THRESH_TYPES','state':'threshold',
             'values':[('independent_threshold','Independent'),('correlated_threshold','Correlated'),('circuit_level_threshold','Circuit'),('phenomenological','Phenomenological'),('code_capacity_threshold','Code Cap.'),('ai_threshold_model','AI')],
             'params':[{'name':'Noise','default':'depolarizing','label':'噪声模型','param_key':'noise_model','props':''},{'name':'Range','default':'50','label':'码距范围','param_key':'code_distance_range','props':'min={3}'}]},
            {'id':'decoder','label_cn':'解码器','title_en':'Decoder Engine','desc':'MWPM/BP/Neural/Tensor/Union-Find','endpoint':'decoder-engine','button_text':'解码分析','param_key':'decoder_type',
             'enum_name':'DEC_TYPES','state':'decoder',
             'values':[('mwpm_decoder','MWPM'),('belief_propagation','BP'),('neural_decoder','Neural'),('tensor_network_dec','Tensor Net'),('union_find_decoder','Union-Find'),('ai_decoder','AI')],
             'params':[{'name':'Rounds','default':'10','label':'syndrome轮数','param_key':'syndrome_rounds','props':'min={1}'},{'name':'Distance','default':'15','label':'码距','param_key':'code_distance','props':'min={3}'}]},
            {'id':'logical','label_cn':'逻辑操作','title_en':'Logical Operation','desc':'Transversal/Lattice/Code Switch/Magic/Flag','endpoint':'logical-operation','button_text':'逻辑操作','param_key':'logical_type',
             'enum_name':'LOGIC_TYPES','state':'logical',
             'values':[('transversal_gate','Transversal'),('lattice_surgery','Lattice'),('code_switching','Code Switch'),('magic_state_distill','Magic State'),('flag_fault_tolerance','Flag'),('ai_logical_op','AI')],
             'params':[{'name':'Gate','default':'toffoli','label':'目标门','param_key':'target_gate','props':''},{'name':'Budget','default':'0.0001','label':'误差预算','param_key':'error_budget','props':'step={0.00001}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-chip-design/page.tsx',
        'layer': 99, 'version': 'v1.347.0', 'title': 'Quantum Chip Design Engine',
        'desc_cn': 'Layer 99 — 超导比特 / 离子阱 / 光子比特 / 拓扑比特 / 低温控制 / 芯片架构',
        'prefix': 'quantum-chip-design',
        'tabs': [
            {'id':'sc','label_cn':'超导比特','title_en':'Superconducting Qubit','desc':'Transmon/Xmon/Flux/Phase/C-Shunt','endpoint':'superconducting-qubit','button_text':'超导设计','param_key':'sc_type',
             'enum_name':'SC_TYPES','state':'sc',
             'values':[('transmon_qubit','Transmon'),('xmon_qubit','Xmon'),('flux_qubit','Flux'),('phase_qubit','Phase'),('cshunt_flux','C-Shunt'),('ai_superconducting','AI')],
             'params':[{'name':'Freq','default':'5.0','label':'频率(GHz)','param_key':'qubit_frequency_ghz','props':'step={0.1}'},{'name':'Anharm','default':'-300.0','label':'非谐性(MHz)','param_key':'anharmonicity_mhz','props':'step={10}'}]},
            {'id':'ion','label_cn':'离子阱','title_en':'Ion Trap Qubit','desc':'Surface/Paul/Linear/Penning/Junction','endpoint':'ion-trap-qubit','button_text':'离子阱设计','param_key':'ion_type',
             'enum_name':'ION_TYPES','state':'ion',
             'values':[('surface_trap','Surface'),('paul_trap','Paul'),('linear_trap','Linear'),('penning_trap','Penning'),('junction_trap','Junction'),('ai_ion_trap','AI')],
             'params':[{'name':'Species','default':'yb171','label':'离子种类','param_key':'ion_species','props':''},{'name':'Ions','default':'32','label':'离子数','param_key':'num_ions','props':'min={1}'}]},
            {'id':'photonic','label_cn':'光子比特','title_en':'Photonic Qubit','desc':'Dual-Rail/Time-Bin/GV/Squeezed/Waveguide','endpoint':'photonic-qubit','button_text':'光子设计','param_key':'photonic_type',
             'enum_name':'PH_TYPES','state':'photonic',
             'values':[('dual_rail','Dual-Rail'),('time_bin','Time-Bin'),('gv_kernel','Gottesman-Knill'),('squeezed_light','Squeezed'),('waveguide_qubit','Waveguide'),('ai_photonic','AI')],
             'params':[{'name':'Wavelength','default':'1550.0','label':'波长(nm)','param_key':'wavelength_nm','props':'step={1}'},{'name':'Loss','default':'0.1','label':'损耗(dB/cm)','param_key':'loss_db_per_cm','props':'step={0.01}'}]},
            {'id':'topo','label_cn':'拓扑比特','title_en':'Topological Qubit','desc':'Majorana/Anyon/FQH/Insulator/Weyl','endpoint':'topological-qubit','button_text':'拓扑设计','param_key':'topo_type',
             'enum_name':'TOPO_TYPES','state':'topo',
             'values':[('majorana_wire','Majorana'),('anyon_braid','Anyon'),('fractional_qh','FQH'),('topological_insulator','TI'),('weyl_semimetal','Weyl'),('ai_topological','AI')],
             'params':[{'name':'Gap','default':'0.1','label':'拓扑能隙(meV)','param_key':'gap_mev','props':'step={0.01}'},{'name':'Wire','default':'500.0','label':'纳米线长度(nm)','param_key':'nanowire_length_nm','props':'step={10}'}]},
            {'id':'cryo','label_cn':'低温控制','title_en':'Cryogenic Control','desc':'Cryo-CMOS/SFQ/Cryo-FPGA/MUX/Paramp','endpoint':'cryogenic-control','button_text':'低温分析','param_key':'cryo_type',
             'enum_name':'CRYO_TYPES','state':'cryo',
             'values':[('cryo_cmos','Cryo-CMOS'),('sfq_control','SFQ'),('cryo_fpga','Cryo-FPGA'),('mux_readout','MUX Readout'),('parametric_amp','Paramp'),('ai_cryo_control','AI')],
             'params':[{'name':'Temp','default':'15.0','label':'温度(mK)','param_key':'temperature_mk','props':'step={1}'},{'name':'Channels','default':'128','label':'通道数','param_key':'num_channels','props':'min={1}'}]},
            {'id':'arch','label_cn':'芯片架构','title_en':'Chip Architecture','desc':'Monolithic/Flip-Chip/MCM/Interposer/Optical','endpoint':'chip-architecture','button_text':'架构设计','param_key':'arch_type',
             'enum_name':'ARCH_TYPES','state':'arch',
             'values':[('monolithic_2d','Monolithic 2D'),('flip_chip_3d','Flip-Chip 3D'),('multi_chip_module','MCM'),('silicon_interposer','Interposer'),('optical_interconnect','Optical'),('ai_chip_arch','AI')],
             'params':[{'name':'Qubits','default':'1000','label':'量子比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Yield','default':'95.0','label':'良率目标(%)','param_key':'yield_target_pct','props':'step={1}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-cloud-infrastructure/page.tsx',
        'layer': 100, 'version': 'v1.348.0', 'title': 'Quantum Cloud Infrastructure Engine',
        'desc_cn': 'Layer 100 — 量子调度 / 虚拟化 / 多租户 / 作业编排 / 监控 / API网关',
        'prefix': 'quantum-cloud-infrastructure',
        'tabs': [
            {'id':'sched','label_cn':'量子调度','title_en':'Quantum Scheduler','desc':'Fair-Share/Priority/Backfill/Reservation/Deadline','endpoint':'quantum-scheduler','button_text':'调度分析','param_key':'sched_type',
             'enum_name':'SCHED_TYPES','state':'sched',
             'values':[('fair_share_sched','Fair-Share'),('priority_queue_sched','Priority'),('backfill_sched','Backfill'),('reservation_sched','Reservation'),('deadline_sched','Deadline'),('ai_quantum_sched','AI')],
             'params':[{'name':'QPUs','default':'4','label':'QPU数量','param_key':'num_qpus','props':'min={1}'},{'name':'Queue','default':'1000','label':'最大队列深度','param_key':'max_queue_depth','props':'min={10}'}]},
            {'id':'virt','label_cn':'虚拟化','title_en':'Virtualization Layer','desc':'Slicing/Partition/Multiplex/Hybrid/Dynamic','endpoint':'virtualization-layer','button_text':'虚拟化分析','param_key':'virt_type',
             'enum_name':'VIRT_TYPES','state':'virt',
             'values':[('circuit_slicing','Circuit Slicing'),('qubit_partition','Qubit Partition'),('time_multiplex','Time-Mux'),('hybrid_partition','Hybrid'),('dynamic_allocation','Dynamic'),('ai_virtualization','AI')],
             'params':[{'name':'Qubits','default':'127','label':'总比特数','param_key':'total_qubits','props':'min={1}'},{'name':'Tenants','default':'5','label':'租户数','param_key':'num_tenants','props':'min={1}'}]},
            {'id':'tenant','label_cn':'多租户','title_en':'Multi-Tenant Access','desc':'RBAC/Quota/Priority/Spot/Dedicated','endpoint':'multi-tenant-access','button_text':'租户管理','param_key':'access_type',
             'enum_name':'TENANT_TYPES','state':'tenant',
             'values':[('role_based_access','RBAC'),('quota_based_access','Quota'),('priority_tier_access','Priority Tier'),('spot_instance_access','Spot'),('dedicated_hw_access','Dedicated'),('ai_tenant_access','AI')],
             'params':[{'name':'Users','default':'100','label':'用户数','param_key':'num_users','props':'min={1}'},{'name':'Hours','default':'24.0','label':'QPU时/天','param_key':'qpu_hours_per_day','props':'step={0.5}'}]},
            {'id':'job','label_cn':'作业编排','title_en':'Job Orchestration','desc':'DAG/Workflow/Pipeline/Batch/Streaming','endpoint':'job-orchestration','button_text':'编排分析','param_key':'orch_type',
             'enum_name':'JOB_TYPES','state':'job',
             'values':[('dag_scheduler','DAG'),('workflow_engine','Workflow'),('pipeline_manager','Pipeline'),('batch_processor','Batch'),('streaming_quantum','Streaming'),('ai_orchestration','AI')],
             'params':[{'name':'Concurrent','default':'50','label':'最大并发','param_key':'max_concurrent_jobs','props':'min={1}'},{'name':'Depth','default':'1000','label':'平均电路深度','param_key':'avg_circuit_depth','props':'min={1}'}]},
            {'id':'monitor','label_cn':'监控','title_en':'Monitoring','desc':'Hardware/Job/Cost/Dashboard/Alerting','endpoint':'monitoring-observability','button_text':'监控分析','param_key':'monitor_type',
             'enum_name':'MON_TYPES','state':'monitor',
             'values':[('hardware_monitor','Hardware'),('job_analytics','Job Analytics'),('cost_tracker','Cost'),('performance_dashboard','Dashboard'),('alerting_system','Alerting'),('ai_monitoring','AI')],
             'params':[{'name':'Interval','default':'1.0','label':'监控间隔(s)','param_key':'monitoring_interval_s','props':'step={0.1}'},{'name':'Retention','default':'90','label':'保留天数','param_key':'retention_days','props':'min={1}'}]},
            {'id':'apigw','label_cn':'API网关','title_en':'API Gateway','desc':'REST/gRPC/WebSocket/GraphQL/SDK','endpoint':'quantum-api-gateway','button_text':'网关分析','param_key':'gateway_type',
             'enum_name':'GW_TYPES','state':'apigw',
             'values':[('rest_api_quantum','REST'),('grpc_quantum','gRPC'),('websocket_stream','WebSocket'),('graphql_quantum','GraphQL'),('sdk_interface','SDK'),('api_gateway','Gateway')],
             'params':[{'name':'RateLimit','default':'1000','label':'限速(次/分)','param_key':'rate_limit_per_min','props':'min={10}'},{'name':'Latency','default':'50.0','label':'延迟目标(ms)','param_key':'avg_latency_target_ms','props':'step={1}'}]},
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

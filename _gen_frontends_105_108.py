#!/usr/bin/env python3
"""Generate frontend pages for Layers 105-108"""
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

    cname = title.replace(" ", "").replace("Engine", "Engine")
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
        'file': f'{BASE}/graph-quantum-network-communication/page.tsx',
        'layer': 105, 'version': 'v1.353.0', 'title': 'Quantum Network Communication Engine',
        'desc_cn': 'Layer 105 — 量子密钥分发 / 量子中继器 / 纠缠交换 / 量子信道 / 量子路由 / 网络拓扑',
        'prefix': 'quantum-network-communication',
        'tabs': [
            {'id':'qkd','label_cn':'密钥分发','title_en':'QKD Protocol','desc':'BB84/E91/B92/SARG04/CV-QKD','endpoint':'quantum-key-distribution','button_text':'QKD分析','param_key':'protocol',
             'enum_name':'QKD_TYPES','state':'qkd',
             'values':[('bb84','BB84'),('e91','E91'),('b92','B92'),('sargo04','SARG04'),('cv_qkd','CV-QKD'),('ai_qkd_protocol','AI')],
             'params':[{'name':'KeyLen','default':'256','label':'密钥长度(bits)','param_key':'key_length_bits','props':'min={1}'},{'name':'Distance','default':'100.0','label':'距离(km)','param_key':'distance_km','props':'step={10}'}]},
            {'id':'repeater','label_cn':'量子中继器','title_en':'Quantum Repeater','desc':'OneWay/TwoWay/Memory/AllPhotonic/NLC','endpoint':'quantum-repeater','button_text':'中继分析','param_key':'repeater_type',
             'enum_name':'RP_TYPES','state':'repeater',
             'values':[('one_way_repeater','One-Way'),('two_way_repeater','Two-Way'),('memory_repeater','Memory'),('all_photonic_repeater','All-Photonic'),('nlc_repeater','NLC'),('ai_repeater_design','AI')],
             'params':[{'name':'Count','default':'5','label':'中继器数','param_key':'num_repeaters','props':'min={1}'},{'name':'Segment','default':'50.0','label':'段长(km)','param_key':'segment_length_km','props':'step={10}'}]},
            {'id':'swap','label_cn':'纠缠交换','title_en':'Entanglement Swap','desc':'Bell/GHZ/Cascaded/Nested/Multiplexed','endpoint':'entanglement-swap','button_text':'交换分析','param_key':'swap_type',
             'enum_name':'SW_TYPES','state':'swap',
             'values':[('bell_swap','Bell'),('ghz_swap','GHZ'),('cascaded_swap','Cascaded'),('nested_swap','Nested'),('multiplexed_swap','Multiplexed'),('ai_swap_schedule','AI')],
             'params':[{'name':'Nodes','default':'10','label':'节点数','param_key':'num_nodes','props':'min={2}'},{'name':'Fidelity','default':'0.9','label':'目标保真度','param_key':'target_fidelity','props':'step={0.01} min={0} max={1}'}]},
            {'id':'channel','label_cn':'量子信道','title_en':'Quantum Channel','desc':'Fiber/FreeSpace/Satellite/Underwater/Waveguide','endpoint':'quantum-channel','button_text':'信道分析','param_key':'channel_type',
             'enum_name':'CH_TYPES','state':'channel',
             'values':[('fiber_channel','Fiber'),('free_space_channel','Free-Space'),('satellite_channel','Satellite'),('underwater_channel','Underwater'),('waveguide_channel','Waveguide'),('ai_channel_model','AI')],
             'params':[{'name':'Distance','default':'200.0','label':'距离(km)','param_key':'distance_km','props':'step={10}'},{'name':'Wavelength','default':'1550.0','label':'波长(nm)','param_key':'wavelength_nm','props':'step={10}'}]},
            {'id':'router','label_cn':'量子路由','title_en':'Quantum Router','desc':'Shortest/Entanglement/Fidelity/Multipath/Adaptive','endpoint':'quantum-router','button_text':'路由分析','param_key':'routing_type',
             'enum_name':'RT_TYPES','state':'router',
             'values':[('shortest_path_route','Shortest'),('entanglement_route','Entanglement'),('fidelity_route','Fidelity'),('multipath_route','Multipath'),('adaptive_route','Adaptive'),('ai_routing_policy','AI')],
             'params':[{'name':'Nodes','default':'20','label':'节点数','param_key':'num_nodes','props':'min={2}'},{'name':'Load','default':'100','label':'流量负载','param_key':'traffic_load','props':'min={1}'}]},
            {'id':'topology','label_cn':'网络拓扑','title_en':'Network Topology','desc':'Star/Ring/Mesh/Hierarchical/DTN','endpoint':'network-topology','button_text':'拓扑分析','param_key':'topology_type',
             'enum_name':'TP_TYPES','state':'topology',
             'values':[('star_topology','Star'),('ring_topology','Ring'),('mesh_topology','Mesh'),('hierarchical_topo','Hierarchical'),('dtn_topology','DTN'),('ai_topology_opt','AI')],
             'params':[{'name':'Nodes','default':'50','label':'节点数','param_key':'num_nodes','props':'min={3}'},{'name':'Conn','default':'4','label':'连接度','param_key':'connectivity','props':'min={1}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-cryptography-security/page.tsx',
        'layer': 106, 'version': 'v1.354.0', 'title': 'Quantum Cryptography Security Engine',
        'desc_cn': 'Layer 106 — 后量子密码 / 量子随机数 / 量子签名 / 安全协议 / 量子防火墙 / 安全审计',
        'prefix': 'quantum-cryptography-security',
        'tabs': [
            {'id':'pqc','label_cn':'后量子密码','title_en':'Post-Quantum Crypto','desc':'Kyber/BIKE/SPHINCS+/SIDH/Rainbow','endpoint':'post-quantum-crypto','button_text':'PQC分析','param_key':'scheme',
             'enum_name':'PQC_TYPES','state':'pqc',
             'values':[('lattice_kyber','Kyber'),('code_bike','BIKE'),('merkle_sphincs','SPHINCS+'),('isogeny_sidh','SIDH'),('multivariate_rainbow','Rainbow'),('ai_pqc_selector','AI')],
             'params':[{'name':'Level','default':'128','label':'安全级别(bits)','param_key':'security_level','props':'min={64}'},{'name':'KeySize','default':'1024','label':'密钥大小(B)','param_key':'key_size_bytes','props':'min={100}'}]},
            {'id':'qrng','label_cn':'量子随机数','title_en':'Quantum RNG','desc':'Vacuum/Phase/TimeBin/LaserChaos/Entanglement','endpoint':'quantum-random','button_text':'QRNG分析','param_key':'source_type',
             'enum_name':'QRNG_TYPES','state':'qrng',
             'values':[('vacuum_qrng','Vacuum'),('phase_qrng','Phase'),('time_bin_qrng','Time-Bin'),('laser_chaos_qrng','Laser Chaos'),('entanglement_qrng','Entanglement'),('ai_qrng_source','AI')],
             'params':[{'name':'Rate','default':'100.0','label':'速率(Mbps)','param_key':'bit_rate_mbps','props':'step={10}'},{'name':'Entropy','default':'0.999','label':'熵质量','param_key':'entropy_quality','props':'step={0.001}'}]},
            {'id':'sig','label_cn':'量子签名','title_en':'Quantum Signature','desc':'Gottesman-Chuang/Lamport/Hash/Trapdoor/Blind','endpoint':'quantum-signature','button_text':'签名分析','param_key':'sig_type',
             'enum_name':'SIG_TYPES','state':'sig',
             'values':[('gottesman_chuang','Gottesman-Chuang'),('lamport_quantum','Lamport'),('hash_quantum_sig','Hash'),('trapdoor_quantum','Trapdoor'),('blind_quantum_sig','Blind'),('ai_quantum_sig','AI')],
             'params':[{'name':'MsgSize','default':'10','label':'消息大小(KB)','param_key':'message_size_kb','props':'min={1}'},{'name':'Sigs','default':'1000','label':'签名数','param_key':'num_signatures','props':'min={1}'}]},
            {'id':'proto','label_cn':'安全协议','title_en':'Security Protocol','desc':'TLS/VPN/ZKP/SecretShare/Oblivious','endpoint':'quantum-protocol','button_text':'协议分析','param_key':'protocol_type',
             'enum_name':'PROTO_TYPES','state':'proto',
             'values':[('quantum_tls','Q-TLS'),('quantum_vpn','Q-VPN'),('quantum_zkp','Q-ZKP'),('quantum_secret_share','Secret Share'),('quantum_oblivious','Oblivious'),('ai_protocol_design','AI')],
             'params':[{'name':'Parties','default':'2','label':'参与方数','param_key':'num_parties','props':'min={2}'},{'name':'Param','default':'256','label':'安全参数','param_key':'security_param','props':'min={128}'}]},
            {'id':'fw','label_cn':'量子防火墙','title_en':'Quantum Firewall','desc':'Intercept/Coherence/Clone/Entanglement/Channel','endpoint':'quantum-firewall','button_text':'防火墙分析','param_key':'firewall_type',
             'enum_name':'FW_TYPES','state':'fw',
             'values':[('intercept_detect','Intercept'),('coherence_monitor','Coherence'),('clone_detection','Clone'),('entanglement_verify','Entanglement'),('channel_integrity','Channel'),('ai_threat_detect','AI')],
             'params':[{'name':'Rate','default':'10.0','label':'信道速率(Mbps)','param_key':'channel_rate_mbps','props':'step={1}'},{'name':'Sensitivity','default':'0.99','label':'灵敏度','param_key':'sensitivity','props':'step={0.01}'}]},
            {'id':'audit','label_cn':'安全审计','title_en':'Security Audit','desc':'KeyLifecycle/Compliance/VulnScan/Penetration/NIST','endpoint':'quantum-audit','button_text':'审计分析','param_key':'audit_type',
             'enum_name':'AUDIT_TYPES','state':'audit',
             'values':[('key_lifecycle_audit','Key Lifecycle'),('protocol_compliance','Compliance'),('vulnerability_scan','Vuln Scan'),('penetration_quantum','Penetration'),('compliance_nist','NIST'),('ai_audit_engine','AI')],
             'params':[{'name':'Size','default':'100','label':'系统规模','param_key':'system_size','props':'min={1}'},{'name':'Depth','default':'3','label':'审计深度','param_key':'audit_depth','props':'min={1} max={5}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-internet-protocol/page.tsx',
        'layer': 107, 'version': 'v1.355.0', 'title': 'Quantum Internet Protocol Engine',
        'desc_cn': 'Layer 107 — 量子传输层 / 量子DNS / 路由协议 / 链路层 / 应用层 / 量子SDN',
        'prefix': 'quantum-internet-protocol',
        'tabs': [
            {'id':'transport','label_cn':'传输层','title_en':'Quantum Transport','desc':'Reliable/Unreliable/Stream/Datagram/Multicast','endpoint':'quantum-transport','button_text':'传输分析','param_key':'transport_type',
             'enum_name':'TP_TYPES','state':'transport',
             'values':[('qtp_reliable','Reliable'),('qtp_unreliable','Unreliable'),('qtp_stream','Stream'),('qtp_datagram','Datagram'),('qtp_multicast','Multicast'),('ai_transport_select','AI')],
             'params':[{'name':'BW','default':'100.0','label':'带宽(Mbps)','param_key':'bandwidth_mbps','props':'step={10}'},{'name':'Latency','default':'10.0','label':'延迟(ms)','param_key':'latency_target_ms','props':'step={1}'}]},
            {'id':'dns','label_cn':'量子DNS','title_en':'Quantum DNS','desc':'Classical/Quantum/Hybrid/Entangled/Anonymous','endpoint':'quantum-dns','button_text':'DNS分析','param_key':'dns_type',
             'enum_name':'DNS_TYPES','state':'dns',
             'values':[('qdns_classical','Classical'),('qdns_quantum','Quantum'),('qdns_hybrid','Hybrid'),('qdns_entangled','Entangled'),('qdns_anonymous','Anonymous'),('ai_dns_resolve','AI')],
             'params':[{'name':'QPS','default':'1000','label':'查询率(QPS)','param_key':'query_rate_per_sec','props':'min={1}'},{'name':'Records','default':'10000','label':'记录数','param_key':'record_count','props':'min={100}'}]},
            {'id':'routing','label_cn':'路由协议','title_en':'Routing Protocol','desc':'QOSPF/QBGP/QRIP/QMPLS/QSegment','endpoint':'quantum-routing-protocol','button_text':'路由分析','param_key':'protocol',
             'enum_name':'ROUTE_TYPES','state':'routing',
             'values':[('qospf','QOSPF'),('qbgp','QBGP'),('qrip','QRIP'),('qmpls','QMPLS'),('qsegment','QSegment'),('ai_route_protocol','AI')],
             'params':[{'name':'AS','default':'50','label':'AS数量','param_key':'num_as','props':'min={1}'},{'name':'TableSize','default':'10000','label':'路由表大小','param_key':'route_table_size','props':'min={100}'}]},
            {'id':'link','label_cn':'链路层','title_en':'Link Layer','desc':'Entanglement/Heralded/Swap/Purification/Multiplexed','endpoint':'quantum-link-layer','button_text':'链路分析','param_key':'link_type',
             'enum_name':'LINK_TYPES','state':'link',
             'values':[('entanglement_ll','Entanglement'),('heralded_ll','Heralded'),('swap_ll','Swap'),('purification_ll','Purification'),('multiplexed_ll','Multiplexed'),('ai_link_manage','AI')],
             'params':[{'name':'Distance','default':'100.0','label':'链路距离(km)','param_key':'link_distance_km','props':'step={10}'},{'name':'Fidelity','default':'0.95','label':'保真度','param_key':'fidelity_target','props':'step={0.01}'}]},
            {'id':'app','label_cn':'应用层','title_en':'App Layer','desc':'QRPC/QFTP/QSMTP/QHTTP/QWebSocket','endpoint':'quantum-app-layer','button_text':'应用分析','param_key':'app_type',
             'enum_name':'APP_TYPES','state':'app',
             'values':[('qrpc','QRPC'),('qftp','QFTP'),('qsmtp','QSMTP'),('qhttp','QHTTP'),('qwebsocket','QWebSocket'),('ai_app_protocol','AI')],
             'params':[{'name':'Rate','default':'1000','label':'请求率(rps)','param_key':'request_rate','props':'min={1}'},{'name':'Payload','default':'100','label':'负载(KB)','param_key':'payload_size_kb','props':'min={1}'}]},
            {'id':'sdn','label_cn':'量子SDN','title_en':'Quantum SDN','desc':'OpenFlow/Controller/Slicing/FlowTable/Orchestration','endpoint':'quantum-sdn','button_text':'SDN分析','param_key':'sdn_type',
             'enum_name':'SDN_TYPES','state':'sdn',
             'values':[('openflow_quantum','OpenFlow-Q'),('sdn_controller_q','Controller'),('network_slice_q','Slicing'),('flow_table_q','Flow Table'),('sdn_orchestration_q','Orchestration'),('ai_sdn_policy','AI')],
             'params':[{'name':'Switches','default':'100','label':'交换机数','param_key':'num_switches','props':'min={1}'},{'name':'Flows','default':'50000','label':'流表项数','param_key':'flow_entries','props':'min={100}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-sensing-metrology/page.tsx',
        'layer': 108, 'version': 'v1.356.0', 'title': 'Quantum Sensing Metrology Engine',
        'desc_cn': 'Layer 108 — 量子时钟 / 量子磁力计 / 量子重力仪 / 量子成像 / 量子雷达 / 量子导航',
        'prefix': 'quantum-sensing-metrology',
        'tabs': [
            {'id':'clock','label_cn':'量子时钟','title_en':'Quantum Clock','desc':'OpticalLattice/IonTrap/HMaser/CsFountain/Nuclear','endpoint':'quantum-clock','button_text':'时钟分析','param_key':'clock_type',
             'enum_name':'CLK_TYPES','state':'clock',
             'values':[('optical_lattice_clock','Optical Lattice'),('ion_trap_clock','Ion Trap'),('hydrogen_maser','H-Maser'),('cs_fountain','Cs Fountain'),('nuclear_clock','Nuclear'),('ai_clock_stabilize','AI')],
             'params':[{'name':'Stability','default':'1e-18','label':'稳定度目标','param_key':'stability_target','props':'step={1e-19}'},{'name':'Time','default':'1.0','label':'积分时间(s)','param_key':'integration_time_s','props':'step={0.1}'}]},
            {'id':'mag','label_cn':'磁力计','title_en':'Quantum Magnetometer','desc':'NV-Center/Atomic/SQUID/OPM/Hall','endpoint':'quantum-magnetometer','button_text':'磁力分析','param_key':'sensor_type',
             'enum_name':'MAG_TYPES','state':'mag',
             'values':[('nv_center','NV-Center'),('atomic_magnetometer','Atomic'),('squid_magnetometer','SQUID'),('opm_magnetometer','OPM'),('hall_quantum','Hall'),('ai_magnetometer','AI')],
             'params':[{'name':'Sensitivity','default':'1e-15','label':'灵敏度(T)','param_key':'sensitivity_ft','props':'step={1e-16}'},{'name':'BW','default':'1000.0','label':'带宽(Hz)','param_key':'bandwidth_hz','props':'step={100}'}]},
            {'id':'grav','label_cn':'重力仪','title_en':'Quantum Gravimeter','desc':'AtomInterferometer/Bloch/DualSpecies/Bragg/Raman','endpoint':'quantum-gravimeter','button_text':'重力分析','param_key':'grav_type',
             'enum_name':'GRAV_TYPES','state':'grav',
             'values':[('atom_interferometer','Atom Intf.'),('bloch_oscillation','Bloch'),('dual_species_grav','Dual Species'),('bragg_interferometer','Bragg'),('raman_interferometer','Raman'),('ai_gravity_map','AI')],
             'params':[{'name':'Res','default':'1.0','label':'分辨率(μGal)','param_key':'resolution_ugal','props':'step={0.1}'},{'name':'Time','default':'10.0','label':'测量时间(s)','param_key':'measurement_time_s','props':'step={1}'}]},
            {'id':'img','label_cn':'量子成像','title_en':'Quantum Imaging','desc':'Ghost/SubRayleigh/LiDAR/Holography/Compressive','endpoint':'quantum-imaging','button_text':'成像分析','param_key':'imaging_type',
             'enum_name':'IMG_TYPES','state':'img',
             'values':[('ghost_imaging','Ghost'),('sub_rayleigh','Sub-Rayleigh'),('quantum_lidar','Q-LiDAR'),('quantum_holography','Holography'),('compressive_imaging','Compressive'),('ai_image_enhance','AI')],
             'params':[{'name':'Res','default':'10.0','label':'分辨率(nm)','param_key':'resolution_nm','props':'step={1}'},{'name':'FOV','default':'5.0','label':'视场(mm)','param_key':'field_of_view_mm','props':'step={0.5}'}]},
            {'id':'radar','label_cn':'量子雷达','title_en':'Quantum Radar','desc':'Illumination/Entangled/Ghost/MF/SQI','endpoint':'quantum-radar','button_text':'雷达分析','param_key':'radar_type',
             'enum_name':'RADAR_TYPES','state':'radar',
             'values':[('quantum_illumination','Illumination'),('entangled_radar','Entangled'),('ghost_radar','Ghost'),('quantum_mf_radar','MF'),('sqi_radar','SQI'),('ai_radar_process','AI')],
             'params':[{'name':'Range','default':'100.0','label':'目标距离(km)','param_key':'target_range_km','props':'step={10}'},{'name':'SNR','default':'6.0','label':'SNR提升(dB)','param_key':'snr_improvement_db','props':'step={0.5}'}]},
            {'id':'nav','label_cn':'量子导航','title_en':'Quantum Navigation','desc':'Inertial/Gyroscope/GPS-Alt/AtomIntf/Compass','endpoint':'quantum-navigation','button_text':'导航分析','param_key':'nav_type',
             'enum_name':'NAV_TYPES','state':'nav',
             'values':[('quantum_inertial','Inertial'),('quantum_gyroscope','Gyroscope'),('quantum_gps_alt','GPS-Alt'),('atom_interfero_nav','Atom Intf.'),('quantum_compass','Compass'),('ai_nav_fusion','AI')],
             'params':[{'name':'Acc','default':'0.01','label':'精度目标(m)','param_key':'accuracy_target_m','props':'step={0.001}'},{'name':'Drift','default':'0.001','label':'漂移(°/hr)','param_key':'drift_rate_deg_per_hr','props':'step={0.0001}'}]},
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

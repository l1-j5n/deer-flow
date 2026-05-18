#!/usr/bin/env python3
"""Generate frontend pages for Layers 109-112"""
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
        'file': f'{BASE}/graph-quantum-federated-learning/page.tsx',
        'layer': 109, 'version': 'v1.357.0', 'title': 'Quantum Federated Learning Engine',
        'desc_cn': 'Layer 109 — 联邦聚合 / 隐私保护 / 通信优化 / 异构融合 / 拜占庭容错 / 去中心化',
        'prefix': 'quantum-federated-learning',
        'tabs': [
            {'id':'agg','label_cn':'联邦聚合','title_en':'Fed Aggregation','desc':'FedAvg/FedProx/Dynamic/Scaffold/Median','endpoint':'fed-aggregation','button_text':'聚合分析','param_key':'agg_type',
             'enum_name':'AGG_TYPES','state':'agg',
             'values':[('qfed_avg','Q-FedAvg'),('qfed_prox','Q-FedProx'),('qfed_dynamic','Dynamic'),('qfed_scaffold','Scaffold'),('qfed_median','Median'),('ai_fed_aggregator','AI')],
             'params':[{'name':'Clients','default':'100','label':'客户端数','param_key':'num_clients','props':'min={1}'},{'name':'Rounds','default':'50','label':'通信轮数','param_key':'rounds','props':'min={1}'}]},
            {'id':'privacy','label_cn':'隐私保护','title_en':'Privacy Preserving','desc':'DP/SMC/HE/TEE/DP-SMC','endpoint':'privacy-preserving','button_text':'隐私分析','param_key':'privacy_type',
             'enum_name':'PRIV_TYPES','state':'privacy',
             'values':[('quantum_dp','Q-DP'),('quantum_smc','Q-SMC'),('quantum_he','Q-HE'),('quantum_tee','Q-TEE'),('quantum_dp_smc','DP-SMC'),('ai_privacy_selector','AI')],
             'params':[{'name':'Epsilon','default':'1.0','label':'隐私预算(ε)','param_key':'epsilon','props':'step={0.1}'},{'name':'Parties','default':'10','label':'参与方数','param_key':'num_parties','props':'min={2}'}]},
            {'id':'comm','label_cn':'通信优化','title_en':'Comm Optimize','desc':'GradientCompress/Distill/Async/Hierarchical/Sparse','endpoint':'comm-optimize','button_text':'通信分析','param_key':'comm_type',
             'enum_name':'COMM_TYPES','state':'comm',
             'values':[('gradient_compress','Grad Compress'),('model_distillation','Distillation'),('async_comm','Async'),('hierarchical_comm','Hierarchical'),('sparse_gradient','Sparse'),('ai_comm_scheduler','AI')],
             'params':[{'name':'BW','default':'100.0','label':'带宽(Mbps)','param_key':'bandwidth_mbps','props':'step={10}'},{'name':'Rounds','default':'100','label':'轮数','param_key':'num_rounds','props':'min={1}'}]},
            {'id':'hetero','label_cn':'异构融合','title_en':'Heterogeneous Fed','desc':'ModelFusion/KnowledgeDistill/FeatureAlign/Transfer','endpoint':'heterogeneous-fed','button_text':'异构分析','param_key':'hetero_type',
             'enum_name':'HETERO_TYPES','state':'hetero',
             'values':[('model_fusion','Model Fusion'),('knowledge_distill_fed','Know. Distill'),('feature_alignment','Feature Align'),('data_valuation','Data Value'),('transfer_fed','Transfer'),('ai_hetero_fusion','AI')],
             'params':[{'name':'Domains','default':'5','label':'域数量','param_key':'num_domains','props':'min={2}'},{'name':'Variance','default':'0.3','label':'最大方差','param_key':'max_model_variance','props':'step={0.05}'}]},
            {'id':'byzantine','label_cn':'拜占庭容错','title_en':'Byzantine Defense','desc':'Krum/TrimmedMean/Zeno/FLTrust/Spectre','endpoint':'byzantine-fed','button_text':'容错分析','param_key':'defense_type',
             'enum_name':'BZ_TYPES','state':'byzantine',
             'values':[('krum_defense','Krum'),('trimmed_mean','Trimmed Mean'),('zeno_defense','Zeno'),('fltrust','FLTrust'),('spectre_defense','Spectre'),('ai_byzantine_detect','AI')],
             'params':[{'name':'Malicious','default':'20.0','label':'恶意比例(%)','param_key':'num_malicious_pct','props':'step={5}'},{'name':'Clients','default':'50','label':'客户端数','param_key':'num_clients','props':'min={5}'}]},
            {'id':'decentral','label_cn':'去中心化','title_en':'Decentralized Fed','desc':'Gossip/Blockchain/Mesh/Ring/Swarm','endpoint':'decentralized-fed','button_text':'去中心化分析','param_key':'decentral_type',
             'enum_name':'DC_TYPES','state':'decentral',
             'values':[('gossip_fed','Gossip'),('blockchain_fed','Blockchain'),('mesh_fed','Mesh'),('ring_allreduce','Ring'),('swarm_fed','Swarm'),('ai_decentral_orchestrator','AI')],
             'params':[{'name':'Nodes','default':'200','label':'节点数','param_key':'num_nodes','props':'min={3}'},{'name':'Diameter','default':'10','label':'网络直径','param_key':'network_diameter','props':'min={1}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-generative-model/page.tsx',
        'layer': 110, 'version': 'v1.358.0', 'title': 'Quantum Generative Model Engine',
        'desc_cn': 'Layer 110 — 量子GAN / 量子VAE / 量子扩散 / 量子流 / 量子Transformer / Born机',
        'prefix': 'quantum-generative-model',
        'tabs': [
            {'id':'gan','label_cn':'量子GAN','title_en':'Quantum GAN','desc':'Circuit/Hybrid/Patch/Conditional/Style','endpoint':'quantum-gan','button_text':'GAN分析','param_key':'gan_type',
             'enum_name':'GAN_TYPES','state':'gan',
             'values':[('qgan_circuit','Circuit'),('hybrid_qgan','Hybrid'),('patch_qgan','Patch'),('conditional_qgan','Conditional'),('style_qgan','Style'),('ai_qgan_arch','AI')],
             'params':[{'name':'Latent','default':'8','label':'潜在维度','param_key':'latent_dim','props':'min={1}'},{'name':'Qubits','default':'16','label':'量子比特数','param_key':'num_qubits','props':'min={1}'}]},
            {'id':'vae','label_cn':'量子VAE','title_en':'Quantum VAE','desc':'Circuit/Hybrid/Beta/VQ/Hierarchical','endpoint':'quantum-vae','button_text':'VAE分析','param_key':'vae_type',
             'enum_name':'VAE_TYPES','state':'vae',
             'values':[('qvae_circuit','Circuit'),('hybrid_qvae','Hybrid'),('beta_qvae','Beta'),('vq_qvae','VQ'),('hierarchical_qvae','Hierarchical'),('ai_qvae_design','AI')],
             'params':[{'name':'Latent','default':'4','label':'潜在维度','param_key':'latent_dim','props':'min={1}'},{'name':'Layers','default':'6','label':'层数','param_key':'num_layers','props':'min={1}'}]},
            {'id':'diffusion','label_cn':'量子扩散','title_en':'Quantum Diffusion','desc':'Forward/Reverse/ScoreMatch/Denoise/Guided','endpoint':'quantum-diffusion','button_text':'扩散分析','param_key':'diffusion_type',
             'enum_name':'DIFF_TYPES','state':'diffusion',
             'values':[('q_diffusion_forward','Forward'),('q_diffusion_reverse','Reverse'),('q_score_matching','Score Match'),('q_denoise','Denoise'),('q_guided_diffusion','Guided'),('ai_diffusion_ctrl','AI')],
             'params':[{'name':'Steps','default':'1000','label':'时间步数','param_key':'num_timesteps','props':'min={10}'},{'name':'Schedule','default':'cosine','label':'噪声调度','param_key':'noise_schedule','props':''}]},
            {'id':'flow','label_cn':'量子流','title_en':'Quantum Flow','desc':'Affine/Sylvester/Planar/Radial/Coupling','endpoint':'quantum-flow','button_text':'流分析','param_key':'flow_type',
             'enum_name':'FLOW_TYPES','state':'flow',
             'values':[('q_affine_flow','Affine'),('q_sylvester_flow','Sylvester'),('q_planar_flow','Planar'),('q_radial_flow','Radial'),('q_coupling_flow','Coupling'),('ai_flow_arch','AI')],
             'params':[{'name':'Flows','default':'10','label':'流层数','param_key':'num_flows','props':'min={1}'},{'name':'Qubits','default':'8','label':'比特数','param_key':'num_qubits','props':'min={1}'}]},
            {'id':'transformer','label_cn':'Q-Transformer','title_en':'Quantum Transformer','desc':'SelfAttn/CrossAttn/FFN/PosEnc/LayerNorm','endpoint':'quantum-transformer','button_text':'Transformer分析','param_key':'transformer_type',
             'enum_name':'TR_TYPES','state':'transformer',
             'values':[('q_self_attention','Self-Attn'),('q_cross_attention','Cross-Attn'),('q_feedforward','FFN'),('q_positional_enc','Pos Enc'),('q_layer_norm','Layer Norm'),('ai_transformer_block','AI')],
             'params':[{'name':'SeqLen','default':'128','label':'序列长度','param_key':'seq_length','props':'min={1}'},{'name':'Heads','default':'4','label':'注意力头数','param_key':'num_heads','props':'min={1}'}]},
            {'id':'born','label_cn':'Born机','title_en':'Quantum Born Machine','desc':'Trivial/Tensor/Entangled/Adversarial/Hierarchical','endpoint':'quantum-born','button_text':'Born分析','param_key':'born_type',
             'enum_name':'BORN_TYPES','state':'born',
             'values':[('born_trivial','Trivial'),('born_tensor','Tensor'),('born_entangled','Entangled'),('born_adversarial','Adversarial'),('born_hierarchical','Hierarchical'),('ai_born_generator','AI')],
             'params':[{'name':'Qubits','default':'12','label':'比特数','param_key':'num_qubits','props':'min={1}'},{'name':'Layers','default':'8','label':'层数','param_key':'num_layers','props':'min={1}'}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-reinforcement-learning/page.tsx',
        'layer': 111, 'version': 'v1.359.0', 'title': 'Quantum Reinforcement Learning Engine',
        'desc_cn': 'Layer 111 — 策略梯度 / Q学习 / Actor-Critic / MDP / 多智能体 / 奖励塑形',
        'prefix': 'quantum-reinforcement-learning',
        'tabs': [
            {'id':'pg','label_cn':'策略梯度','title_en':'Policy Gradient','desc':'REINFORCE/PPO/A3C/TRPO/SAC','endpoint':'quantum-policy-gradient','button_text':'策略分析','param_key':'policy_type',
             'enum_name':'PG_TYPES','state':'pg',
             'values':[('q_reinforce','Q-REINFORCE'),('q_ppo','Q-PPO'),('q_a3c','Q-A3C'),('q_trpo','Q-TRPO'),('q_sac','Q-SAC'),('ai_policy_grad','AI')],
             'params':[{'name':'Actions','default':'10','label':'动作空间','param_key':'num_actions','props':'min={2}'},{'name':'State','default':'64','label':'状态维度','param_key':'state_dim','props':'min={1}'}]},
            {'id':'ql','label_cn':'Q学习','title_en':'Q-Learning','desc':'DQN/Double/Dueling/C51/QR-DQN','endpoint':'quantum-q-learning','button_text':'Q分析','param_key':'ql_type',
             'enum_name':'QL_TYPES','state':'ql',
             'values':[('q_dqn','Q-DQN'),('q_double_dqn','Double'),('q_dueling_dqn','Dueling'),('q_c51','C51'),('q_qrdqn','QR-DQN'),('ai_qlearning','AI')],
             'params':[{'name':'States','default':'1000','label':'状态空间','param_key':'state_space','props':'min={10}'},{'name':'Actions','default':'10','label':'动作空间','param_key':'action_space','props':'min={2}'}]},
            {'id':'ac','label_cn':'Actor-Critic','title_en':'Actor-Critic','desc':'A2C/SAC/TD3/PPO/IMPALA','endpoint':'quantum-actor-critic','button_text':'AC分析','param_key':'ac_type',
             'enum_name':'AC_TYPES','state':'ac',
             'values':[('q_a2c','Q-A2C'),('q_sac_ac','Q-SAC'),('q_td3','Q-TD3'),('q_ppo_ac','Q-PPO'),('q_impala','Q-IMPALA'),('ai_actor_critic','AI')],
             'params':[{'name':'Envs','default':'16','label':'环境数','param_key':'num_envs','props':'min={1}'},{'name':'Traj','default':'2048','label':'轨迹长度','param_key':'traj_length','props':'min={100}'}]},
            {'id':'mdp','label_cn':'MDP','title_en':'Quantum MDP','desc':'POMDP/QMDP/Belief/Partially/Decoherence','endpoint':'quantum-mdp','button_text':'MDP分析','param_key':'mdp_type',
             'enum_name':'MDP_TYPES','state':'mdp',
             'values':[('pomdp','POMDP'),('quantum_mdp','QMDP'),('belief_mdp','Belief'),('partially_quantum','Partial Q'),('decoherence_mdp','Decoherence'),('ai_mdp_solver','AI')],
             'params':[{'name':'States','default':'500','label':'状态数','param_key':'num_states','props':'min={10}'},{'name':'Horizon','default':'100','label':'决策时域','param_key':'horizon','props':'min={1}'}]},
            {'id':'ma','label_cn':'多智能体','title_en':'Multi-Agent RL','desc':'QMIX/MADDPG/CommNet/TarMAC/FAC','endpoint':'quantum-multi-agent','button_text':'多智能体分析','param_key':'ma_type',
             'enum_name':'MA_TYPES','state':'ma',
             'values':[('q_qmix','Q-QMIX'),('q_maddpg','Q-MADDPG'),('q_commnet','Q-CommNet'),('q_tarmac','Q-TarMAC'),('q_facmaddpg','Q-FAC'),('ai_multi_agent','AI')],
             'params':[{'name':'Agents','default':'5','label':'智能体数','param_key':'num_agents','props':'min={2}'},{'name':'Joints','default':'32','label':'联合动作','param_key':'joint_action_space','props':'min={2}'}]},
            {'id':'reward','label_cn':'奖励塑形','title_en':'Reward Shaping','desc':'Potential/Curiosity/Hindsight/Intrinsic/Q-Advantage','endpoint':'quantum-reward','button_text':'奖励分析','param_key':'reward_type',
             'enum_name':'RW_TYPES','state':'reward',
             'values':[('potential_reward','Potential'),('curiosity_driven','Curiosity'),('hindsight_reward','Hindsight'),('intrinsic_reward','Intrinsic'),('quantum_advantage_reward','Q-Advantage'),('ai_reward_design','AI')],
             'params':[{'name':'Length','default':'1000','label':'回合长度','param_key':'episode_length','props':'min={10}'},{'name':'Sparse','default':'true','label':'稀疏奖励','param_key':'sparse_reward','props':''}]},
        ]
    },
    {
        'file': f'{BASE}/graph-quantum-autonomous-agent/page.tsx',
        'layer': 112, 'version': 'v1.360.0', 'title': 'Quantum Autonomous Agent Engine',
        'desc_cn': 'Layer 112 — 量子决策 / 量子规划 / 量子推理 / 感知融合 / 自主学习 / 世界模型',
        'prefix': 'quantum-autonomous-agent',
        'tabs': [
            {'id':'decision','label_cn':'量子决策','title_en':'Quantum Decision','desc':'Utility/Bayesian/Prospect/GameTheory/Markov','endpoint':'quantum-decision','button_text':'决策分析','param_key':'decision_type',
             'enum_name':'DC_TYPES','state':'decision',
             'values':[('q_utility','Utility'),('q_bayesian','Bayesian'),('q_prospect','Prospect'),('q_game_theory','Game Theory'),('q_markov_decision','Markov'),('ai_decision_engine','AI')],
             'params':[{'name':'Alts','default':'10','label':'备选方案数','param_key':'num_alternatives','props':'min={2}'},{'name':'Uncertainty','default':'0.3','label':'不确定性','param_key':'uncertainty_level','props':'step={0.05}'}]},
            {'id':'planning','label_cn':'量子规划','title_en':'Quantum Planning','desc':'Goal/Hierarchical/TaskDecomp/Contingency/Temporal','endpoint':'quantum-planning','button_text':'规划分析','param_key':'planning_type',
             'enum_name':'PL_TYPES','state':'planning',
             'values':[('q_goal_planning','Goal'),('q_hierarchical','Hierarchical'),('q_task_decomp','Task Decomp'),('q_contingency','Contingency'),('q_temporal_planning','Temporal'),('ai_planning_orchestrator','AI')],
             'params':[{'name':'Horizon','default':'50','label':'规划步数','param_key':'horizon_steps','props':'min={1}'},{'name':'Constraints','default':'10','label':'约束数','param_key':'num_constraints','props':'min={0}'}]},
            {'id':'reasoning','label_cn':'量子推理','title_en':'Quantum Reasoning','desc':'Deductive/Inductive/Abductive/Analogical/Causal','endpoint':'quantum-reasoning','button_text':'推理分析','param_key':'reasoning_type',
             'enum_name':'RS_TYPES','state':'reasoning',
             'values':[('q_deductive','Deductive'),('q_inductive','Inductive'),('q_abductive','Abductive'),('q_analogical','Analogical'),('q_causal','Causal'),('ai_reasoning_chain','AI')],
             'params':[{'name':'Facts','default':'1000','label':'知识事实数','param_key':'knowledge_facts','props':'min={10}'},{'name':'Depth','default':'5','label':'推理深度','param_key':'inference_depth','props':'min={1}'}]},
            {'id':'perception','label_cn':'感知融合','title_en':'Perception Fusion','desc':'Sensor/MultiModal/Attention/Belief/State','endpoint':'quantum-perception','button_text':'感知分析','param_key':'perception_type',
             'enum_name':'PC_TYPES','state':'perception',
             'values':[('sensor_fusion_q','Sensor'),('multi_modal_q','Multi-Modal'),('attention_fusion_q','Attention'),('belief_update_q','Belief'),('state_estimation_q','State'),('ai_perception_fusion','AI')],
             'params':[{'name':'Sensors','default':'8','label':'传感器数','param_key':'num_sensors','props':'min={1}'},{'name':'Dim','default':'256','label':'融合维度','param_key':'fusion_dim','props':'min={16}'}]},
            {'id':'learning','label_cn':'自主学习','title_en':'Self-Learning','desc':'Meta/Curriculum/SelfPlay/Evolution/Lifelong','endpoint':'quantum-self-learning','button_text':'学习分析','param_key':'learning_type',
             'enum_name':'SL_TYPES','state':'learning',
             'values':[('meta_q_learning','Meta-Learn'),('curriculum_q','Curriculum'),('self_play_q','Self-Play'),('evolution_q','Evolution'),('lifelong_q','Lifelong'),('ai_self_improve','AI')],
             'params':[{'name':'Tasks','default':'20','label':'任务数','param_key':'num_tasks','props':'min={1}'},{'name':'Adapt','default':'100','label':'适应步数','param_key':'adaptation_steps','props':'min={1}'}]},
            {'id':'world','label_cn':'世界模型','title_en':'World Model','desc':'Transition/Reward/Dynamics/Latent/Imagination','endpoint':'quantum-world-model','button_text':'世界模型分析','param_key':'model_type',
             'enum_name':'WM_TYPES','state':'world',
             'values':[('transition_model_q','Transition'),('reward_model_q','Reward'),('dynamics_model_q','Dynamics'),('latent_world_q','Latent'),('imagination_q','Imagination'),('ai_world_predictor','AI')],
             'params':[{'name':'State','default':'128','label':'状态维度','param_key':'state_dim','props':'min={1}'},{'name':'Action','default':'16','label':'动作维度','param_key':'action_dim','props':'min={1}'}]},
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

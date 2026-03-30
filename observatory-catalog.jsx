import { useState, useEffect, useRef, useCallback } from "react";

const font = `Calibri, "Noto Sans", "Segoe UI", system-ui, -apple-system, sans-serif`;
const mono = `"SF Mono", "Fira Code", "Courier New", monospace`;

const LU = { red: "#EF3340", gray: "#54565A" };
const C = {
  page:"#EFEFED", white:"#FFFFFF", card:"#FAFAF8", surface:"#E8E8E5",
  header:"#1A1A1A", ink:"#1A1A1A", soft:"#383838", mid:"#606060",
  muted:"#909090", faint:"#C0C0BC",
  line:"#D0D0CC", lineL:"#E4E4E0", lineH:"#909088",
  ok:"#1E5C32",  okBg:"#EDF5F0",  okBd:"#8ABAA0",
  warn:"#6B4800", warnBg:"#F8F3E8", warnBd:"#C8A84C",
  bad:"#6B1C10",  badBg:"#F5EDEB",  badBd:"#C09088",
};

/* ── Current user (mocked — will be IP-resolved via X-User-Email header) ── */
const CURRENT_USER = {
  email: "nadine@idm.lu",
  name:  "Nadine Hess",
  org:   "Institut du développement municipal",
  prov:  "mailto:nadine@idm.lu",
};

/* ── Asset types ── */
const ASSET_TYPES = [
  { id:"all", label:"All assets" }, { id:"source", label:"Sources" },
  { id:"output", label:"Outputs" }, { id:"dashboard", label:"Dashboards" },
  { id:"pipeline", label:"Pipelines" }, { id:"geodata", label:"Geodata" },
];

const freshCfg = d => d<=7
  ? {label:"Current",c:C.ok,  bg:C.okBg,  bd:C.okBd}
  : d<=30
  ? {label:"Ageing", c:C.warn,bg:C.warnBg,bd:C.warnBd}
  : {label:"Outdated",c:C.bad, bg:C.badBg, bd:C.badBd};

const actMeta = {
  reception:{label:"Reception",symbol:"↓"},
  delivery: {label:"Delivery", symbol:"↑"},
  pipeline: {label:"Pipeline", symbol:"⚙"},
  manual:   {label:"Manual",   symbol:"✎"},
  dashboard:{label:"Dashboard",symbol:"▣"},
};

/* ── Query states ── */
const QUERY_STATES = {
  draft:       {label:"Draft",       color:C.warn, bg:C.warnBg, bd:C.warnBd},
  saved:       {label:"Saved",       color:C.ok,   bg:C.okBg,   bd:C.okBd},
  archived:    {label:"Archived",    color:C.muted,bg:C.surface,bd:C.lineL},
  implemented: {label:"Implemented", color:"#1A4A7A",bg:"#EEF2FA",bd:"#B0C4E8"},
};

/* ── DATA ── */
const DATASETS = [
  /* External sources */
  {id:"DS-001",name:"MobiScout Count Data",     source:"Canton ZH", sourceId:"AC-001",assetType:"source",   lastReceived:3,  hasCsvw:true, outputs:5, description:"Automated pedestrian and cyclist counts at 48 monitoring stations across the canton.", tags:["counts","pedestrian","cycling"],   updated:"2025-03-18"},
  {id:"DS-002",name:"NPVM Demand Matrix",        source:"ARE",       sourceId:"AC-002",assetType:"source",   lastReceived:18, hasCsvw:true, outputs:3, description:"National passenger transport demand matrix with origin-destination pairs.",             tags:["demand","OD","national"],          updated:"2025-03-03"},
  {id:"DS-003",name:"SBB Passenger Flows",       source:"SBB",       sourceId:"AC-004",assetType:"source",   lastReceived:42, hasCsvw:false,outputs:7, description:"Station entry and exit counts from the SBB Railnet monitoring system.",                tags:["rail","passengers"],                updated:"2025-02-07"},
  {id:"DS-004",name:"Accident Register ASTRA",   source:"ASTRA",     sourceId:"AC-003",assetType:"source",   lastReceived:6,  hasCsvw:true, outputs:2, description:"Road accident records including severity, location and conditions.",                   tags:["safety","accidents"],               updated:"2025-03-15"},
  {id:"DS-005",name:"MIV Traffic Counts A1–4", source:"ASTRA",  sourceId:"AC-003",assetType:"source",   lastReceived:1,  hasCsvw:true, outputs:4, description:"Motorised individual traffic loop detector data for national motorway network.",       tags:["counts","MIV","motorway"],          updated:"2025-03-20"},
  {id:"DS-006",name:"Cycling Routes, Canton BS", source:"Canton BS", sourceId:"AC-005",assetType:"geodata",  lastReceived:90, hasCsvw:false,outputs:1, description:"Planned and existing cycling route network in GIS format.",                            tags:["cycling","network","GIS"],          updated:"2024-12-20"},
  /* Intermediate (bronze/silver) */
  {id:"DS-010",name:"MobiScout Bronze",          source:"IDM",       sourceId:"AC-008",assetType:"output",   lastReceived:3,  hasCsvw:true, outputs:2, description:"Raw MobiScout ingestion layer: validated, typed, partitioned by date.",               tags:["bronze","counts"],                  updated:"2025-03-18",pipelineId:"PL-003"},
  {id:"DS-011",name:"MobiScout Silver",          source:"IDM",       sourceId:"AC-008",assetType:"output",   lastReceived:3,  hasCsvw:true, outputs:1, description:"Cleaned MobiScout layer: outliers removed, gaps imputed.",                            tags:["silver","counts"],                  updated:"2025-03-18",pipelineId:"PL-004"},
  {id:"DS-012",name:"Traffic Reference Zones",   source:"IDM",       sourceId:"AC-007",assetType:"geodata",  lastReceived:120,hasCsvw:true, outputs:3, description:"Canonical zone reference file for joining counts with administrative boundaries.",     tags:["reference","geodata","zones"],      updated:"2024-11-20"},
  /* Gold / outputs */
  {id:"DS-007",name:"Modal Split ZH 2025–Q1",source:"IDM",     sourceId:"AC-008",assetType:"output",   lastReceived:5,  hasCsvw:true, outputs:0, description:"Quarterly modal split aggregation derived from MobiScout silver layer.",              tags:["modal-split","output"],             updated:"2025-03-17",pipelineId:"PL-001"},
  {id:"DS-008",name:"Motorway Live Dashboard",   source:"IDM",       sourceId:"AC-008",assetType:"dashboard",lastReceived:1,  hasCsvw:false,outputs:0, description:"Live traffic monitoring dashboard refreshed nightly from ASTRA loop detector data.",   tags:["dashboard","motorway","live"],      updated:"2025-03-20",pipelineId:"PL-002"},
  {id:"DS-009",name:"Modal Split Pipeline",      source:"IDM",       sourceId:"AC-008",assetType:"pipeline", lastReceived:1,  hasCsvw:false,outputs:1, description:"Automated Airflow pipeline aggregating monthly modal split from MobiScout counts.",    tags:["pipeline","modal-split","airflow"], updated:"2025-03-20"},
];

const ACTORS = [
  {id:"AC-001",name:"Canton ZH",                 type:"external",receptions:12,deliveries:0, role:"Data Provider"},
  {id:"AC-002",name:"ARE — Federal Roads Office", type:"external",receptions:4, deliveries:2, role:"Provider & Recipient"},
  {id:"AC-003",name:"ASTRA",                      type:"external",receptions:8, deliveries:0, role:"Data Provider"},
  {id:"AC-004",name:"SBB Swiss Federal Railways", type:"external",receptions:6, deliveries:1, role:"Provider & Recipient"},
  {id:"AC-005",name:"Canton BS",                  type:"external",receptions:2, deliveries:0, role:"Data Provider"},
  {id:"AC-006",name:"Nadine Hess",                type:"internal",receptions:0, deliveries:14,role:"Data Analyst"},
  {id:"AC-007",name:"Thomas Brun",                type:"internal",receptions:0, deliveries:9, role:"Data Engineer"},
  {id:"AC-008",name:"Airflow Pipeline System",    type:"internal",receptions:0, deliveries:31,role:"Automated System"},
];

/* Activities carry full PROV-O fields:
   inputs[], outputs[] (arrays — supports joins),
   plan (DAG name or query ref), dagRun (execution id)        */
const ACTIVITIES = [
  {id:"EV-001",date:"2025-03-18",type:"reception",actorId:"AC-001",actor:"Canton ZH",
    inputs:[],outputs:["MobiScout Count Data"],plan:null,dagRun:null,
    description:"Monthly count data delivery received via secure SFTP transfer.",tags:[]},
  {id:"EV-002",date:"2025-03-18",type:"pipeline", actorId:"AC-008",actor:"Airflow Pipeline System",
    inputs:["MobiScout Count Data"],outputs:["MobiScout Bronze"],
    plan:"DAG mobiscout-ingest-daily",dagRun:"run_20250318T0312Z",
    description:"Raw ingestion: validation, type casting, date partitioning.",tags:[]},
  {id:"EV-003",date:"2025-03-18",type:"pipeline", actorId:"AC-008",actor:"Airflow Pipeline System",
    inputs:["MobiScout Bronze"],outputs:["MobiScout Silver"],
    plan:"DAG mobiscout-clean-daily",dagRun:"run_20250318T0445Z",
    description:"Cleaning pass: outlier removal, gap imputation, QA flags applied.",tags:[]},
  {id:"EV-004",date:"2025-03-17",type:"pipeline", actorId:"AC-008",actor:"Airflow Pipeline System",
    inputs:["MobiScout Silver","Traffic Reference Zones"],outputs:["Modal Split ZH 2025–Q1"],
    plan:"DAG modal-split-monthly",dagRun:"run_20250317T0100Z",
    description:"Monthly modal split aggregation joined with zone reference file.",tags:["mobility-planning"]},
  {id:"EV-005",date:"2025-03-15",type:"delivery",  actorId:"AC-002",actor:"ARE — Federal Roads Office",
    inputs:["Modal Split ZH 2025–Q1"],outputs:[],plan:null,dagRun:null,
    description:"Quarterly modal split report delivered for national monitoring programme.",tags:["mobility-planning"]},
  {id:"EV-006",date:"2025-03-12",type:"manual",    actorId:"AC-006",actor:"Nadine Hess",
    inputs:["NPVM Demand Matrix"],outputs:["OD Analysis Report Q1"],plan:"Q-002",dagRun:null,
    description:"Ad-hoc OD analysis produced for cantonal feasibility study.",tags:[]},
  {id:"EV-007",date:"2025-03-10",type:"dashboard", actorId:"AC-008",actor:"Airflow Pipeline System",
    inputs:["MIV Traffic Counts A1–4"],outputs:["Motorway Live Dashboard"],
    plan:"DAG motorway-dashboard-nightly",dagRun:"run_20250310T0215Z",
    description:"Nightly automated refresh of the motorway traffic monitoring dashboard.",tags:[]},
  {id:"EV-008",date:"2025-03-05",type:"reception", actorId:"AC-003",actor:"ASTRA",
    inputs:[],outputs:["Accident Register ASTRA"],plan:null,dagRun:null,
    description:"Annual accident register update received from ASTRA open data portal.",tags:[]},
  {id:"EV-009",date:"2025-02-28",type:"delivery",  actorId:"AC-004",actor:"SBB Swiss Federal Railways",
    inputs:["SBB Passenger Flows"],outputs:[],plan:null,dagRun:null,
    description:"Aggregated station flow analysis delivered for timetable planning process.",tags:["mobility-planning"]},
  /* Reception activities for remaining source datasets */
  {id:"EV-010",date:"2025-03-03",type:"reception",actorId:"AC-002",actor:"ARE — Federal Roads Office",
    inputs:[],outputs:["NPVM Demand Matrix"],plan:"OTX",dagRun:null,
    description:"Annual NPVM demand matrix update received from ARE open data platform.",tags:[]},
  {id:"EV-011",date:"2025-02-07",type:"reception",actorId:"AC-004",actor:"SBB Swiss Federal Railways",
    inputs:[],outputs:["SBB Passenger Flows"],plan:"MFT",dagRun:null,
    description:"Monthly SBB passenger flow data received via automated MFT transfer.",tags:[]},
  {id:"EV-012",date:"2025-03-20",type:"reception",actorId:"AC-003",actor:"ASTRA",
    inputs:[],outputs:["MIV Traffic Counts A1–4"],plan:"MFT",dagRun:null,
    description:"Daily motorway loop detector counts received via ASTRA MFT gateway.",tags:[]},
  {id:"EV-013",date:"2024-12-20",type:"reception",actorId:"AC-005",actor:"Canton BS",
    inputs:[],outputs:["Cycling Routes, Canton BS"],plan:"Email",dagRun:null,
    description:"GIS cycling route network received from Canton BS planning office.",tags:[]},
  {id:"EV-014",date:"2024-11-20",type:"reception",actorId:"AC-007",actor:"Thomas Brun",
    inputs:[],outputs:["Traffic Reference Zones"],plan:"Manual",dagRun:null,
    description:"Canonical traffic zone reference file created and registered by Thomas Brun.",tags:[]},
];

/* ── Graph traversal helpers — walk the activity graph to find true leaf nodes ──
   findUpstreamLeaves: recurse upstream past all intermediaries to reach
     datasets with assetType "source" or "geodata" (the original data).
   findDownstreamLeaves: recurse downstream past all intermediaries to reach
     terminal consumers — deliveries, dashboards, or datasets with no
     further downstream activities.
─────────────────────────────────────────────────────────────────────────── */
function findUpstreamLeaves(dsName, visited=new Set()) {
  if (visited.has(dsName)) return [];
  visited.add(dsName);
  const ds = DATASETS.find(d => d.name === dsName);
  if (ds && (ds.assetType === "source" || ds.assetType === "geodata")) return [ds];
  const producingActs = ACTIVITIES.filter(a => a.outputs.includes(dsName));
  if (producingActs.length === 0) return ds ? [ds] : [];
  const leaves = [];
  for (const act of producingActs) {
    for (const inp of act.inputs) {
      leaves.push(...findUpstreamLeaves(inp, new Set(visited)));
    }
  }
  return [...new Map(leaves.map(d=>[d.id,d])).values()];
}

function findDownstreamLeaves(dsName, visited=new Set()) {
  if (visited.has(dsName)) return {datasets:[],deliveries:[]};
  visited.add(dsName);
  const consumingActs = ACTIVITIES.filter(a => a.inputs.includes(dsName));
  if (consumingActs.length === 0) {
    const ds = DATASETS.find(d => d.name === dsName);
    return {datasets: ds ? [ds] : [], deliveries:[]};
  }
  const datasets = [], deliveries = [];
  for (const act of consumingActs) {
    if (act.type === "delivery" || act.outputs.length === 0) {
      deliveries.push(act);
    } else {
      for (const out of act.outputs) {
        const further = ACTIVITIES.filter(a => a.inputs.includes(out));
        if (further.length === 0 || further.every(a => a.type === "delivery")) {
          const outDs = DATASETS.find(d => d.name === out);
          if (outDs) datasets.push(outDs);
          further.filter(a=>a.type==="delivery").forEach(a=>deliveries.push(a));
        } else {
          const r = findDownstreamLeaves(out, new Set(visited));
          datasets.push(...r.datasets);
          deliveries.push(...r.deliveries);
        }
      }
    }
  }
  return {
    datasets: [...new Map(datasets.map(d=>[d.id,d])).values()],
    deliveries: [...new Map(deliveries.map(a=>[a.id,a])).values()],
  };
}

const SCHEMA_FIELDS = [
  {field:"station_id",  type:"VARCHAR",  nullable:false,description:"Unique station identifier (QGIS feature ID)"},
  {field:"timestamp",   type:"TIMESTAMP",nullable:false,description:"Observation start time (ISO 8601, Europe/Zurich)"},
  {field:"direction",   type:"VARCHAR",  nullable:false,description:"Flow direction: IN / OUT / BOTH"},
  {field:"mode",        type:"VARCHAR",  nullable:false,description:"Transport mode: PED / BIKE / ESCOOTER"},
  {field:"count",       type:"INTEGER",  nullable:false,description:"Observed passage count within interval"},
  {field:"quality_flag",type:"VARCHAR",  nullable:true, description:"QA classification: OK / IMPUTED / SUSPECT"},
  {field:"source_file", type:"VARCHAR",  nullable:false,description:"Origin filename from SFTP delivery"},
];

const MOCK_RESULTS = [
  {station_id:"ZH-048",mode:"BIKE",    total:18340},
  {station_id:"ZH-012",mode:"PED",     total:15920},
  {station_id:"ZH-031",mode:"BIKE",    total:14200},
  {station_id:"ZH-048",mode:"PED",     total:13780},
  {station_id:"ZH-019",mode:"ESCOOTER",total:4320},
];

/* ── Initial query library (mock saved queries) ── */
const INITIAL_QUERIES = [
  {
    id:"Q-001", name:"Monthly modal split by station",
    sql:`SELECT  station_id,\n        mode,\n        SUM(count) AS total\nFROM    ds_001\nWHERE   date_trunc('month', timestamp) = '2025-03-01'\nGROUP BY station_id, mode\nORDER BY total DESC\nLIMIT   50;`,
    description:"Aggregates MobiScout counts by station and mode for a given month.",
    state:"implemented", pipelineId:"PL-001",
    author:CURRENT_USER.email, authorName:CURRENT_USER.name,
    datasets:["DS-001"], created:"2025-02-10", updated:"2025-03-17",
  },
  {
    id:"Q-002", name:"Accident severity distribution",
    sql:`SELECT  severity,\n        COUNT(*) AS n,\n        ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(), 1) AS pct\nFROM    ds_004\nGROUP BY severity\nORDER BY n DESC;`,
    description:"Distribution of accident severity classifications in the ASTRA register.",
    state:"saved",
    author:"thomas@idm.lu", authorName:"Thomas Brun",
    datasets:["DS-004"], created:"2025-01-22", updated:"2025-01-22",
  },
  {
    id:"Q-003", name:"Motorway peak hour counts",
    sql:`SELECT  road_id,\n        EXTRACT(HOUR FROM timestamp) AS hour,\n        AVG(count) AS avg_vehicles\nFROM    ds_005\nWHERE   EXTRACT(DOW FROM timestamp) BETWEEN 1 AND 5\nGROUP BY road_id, hour\nORDER BY road_id, hour;`,
    description:"Average weekday vehicle counts per hour and road section.",
    state:"saved",
    author:CURRENT_USER.email, authorName:CURRENT_USER.name,
    datasets:["DS-005"], created:"2025-03-01", updated:"2025-03-01",
  },
  {
    id:"Q-004", name:"SBB flows quick check",
    sql:`SELECT * FROM ds_003 LIMIT 100;`,
    description:"",
    state:"draft",
    author:CURRENT_USER.email, authorName:CURRENT_USER.name,
    datasets:["DS-003"], created:"2025-03-18", updated:"2025-03-18",
  },
  {
    id:"Q-005", name:"Old OD matrix exploration",
    sql:`SELECT origin_zone, destination_zone, trips\nFROM ds_002\nWHERE mode = 'car'\nORDER BY trips DESC\nLIMIT 20;`,
    description:"Exploratory query from January — superseded by pipeline.",
    state:"archived",
    author:"thomas@idm.lu", authorName:"Thomas Brun",
    datasets:["DS-002"], created:"2025-01-05", updated:"2025-01-05",
  },
];

/* ── Pipelines ── */
const PIPELINES = [
  {id:"PL-001", name:"Modal Split Monthly",    queryId:"Q-001", outputDataset:"DS-007", schedule:"Monthly",  status:"active"},
  {id:"PL-002", name:"Motorway Dashboard Refresh", queryId:null, outputDataset:"DS-008", schedule:"Nightly", status:"active"},
];

function useIsMobile() {
  const [m,setM] = useState(window.innerWidth<680);
  useEffect(()=>{
    const h=()=>setM(window.innerWidth<680);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  return m;
}

/* ══════════════════════════════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════════════════════════════ */

const InlineTag = ({children,ok,warn}) => {
  const c=ok?C.ok:warn?C.warn:C.muted;
  const bd=ok?C.okBd:warn?C.warnBd:C.lineL;
  return <span style={{fontFamily:font,fontSize:11,fontWeight:500,color:c,
    border:`1px solid ${bd}`,padding:"1px 6px",display:"inline-block",
    whiteSpace:"nowrap",lineHeight:"16px"}}>{children}</span>;
};

const TypeBadge = ({type}) => {
  const cfg={
    source:   {label:"Source",   color:"#1A4A7A",bg:"#EEF2FA"},
    output:   {label:"Output",   color:"#1E5C32",bg:"#EDF5F0"},
    dashboard:{label:"Dashboard",color:"#5C3A00",bg:"#FBF4E6"},
    pipeline: {label:"Pipeline", color:"#4A2A6A",bg:"#F3EEF9"},
    geodata:  {label:"Geodata",  color:"#1A5050",bg:"#EEF5F5"},
  }[type]||{label:type,color:C.mid,bg:C.surface};
  return <span style={{fontFamily:font,fontSize:11,fontWeight:600,
    letterSpacing:"0.04em",textTransform:"uppercase",color:cfg.color,
    background:cfg.bg,padding:"2px 7px",display:"inline-block",
    whiteSpace:"nowrap",lineHeight:"16px"}}>{cfg.label}</span>;
};

const StateBadge = ({state}) => {
  const s=QUERY_STATES[state]||QUERY_STATES.draft;
  return <span style={{fontFamily:font,fontSize:11,fontWeight:600,
    letterSpacing:"0.04em",textTransform:"uppercase",color:s.color,
    background:s.bg,border:`1px solid ${s.bd}`,padding:"2px 7px",
    display:"inline-block",whiteSpace:"nowrap",lineHeight:"16px"}}>{s.label}</span>;
};

const Notice = ({type="info",title,children}) => {
  const bd={info:C.lineH,warning:C.warnBd,danger:C.badBd,ok:C.okBd}[type];
  const tc={info:C.mid,  warning:C.warn,  danger:C.bad,  ok:C.ok  }[type];
  return <div style={{borderLeft:`3px solid ${bd}`,paddingLeft:14,marginBottom:20}}>
    {title&&<div style={{fontFamily:font,fontSize:13,fontWeight:600,
      color:tc,marginBottom:3}}>{title}</div>}
    <div style={{fontFamily:font,fontSize:13,color:C.soft,lineHeight:1.6}}>
      {children}</div>
  </div>;
};

const Eyebrow = ({children,style={}}) => (
  <div style={{fontFamily:font,fontSize:11,fontWeight:700,letterSpacing:"0.12em",
    textTransform:"uppercase",color:C.muted,marginBottom:10,marginTop:24,...style}}>
    {children}</div>
);

const PageTitle = ({section,title,sub,right}) => (
  <div style={{marginBottom:24,paddingBottom:14,borderBottom:`1px solid ${C.line}`}}>
    {section&&<div style={{fontFamily:font,fontSize:11,fontWeight:700,
      letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,marginBottom:6}}>
      {section}</div>}
    <div style={{display:"flex",justifyContent:"space-between",
      alignItems:"flex-end",gap:14,flexWrap:"wrap"}}>
      <div>
        <h1 style={{fontFamily:font,fontSize:22,fontWeight:700,color:C.ink,
          margin:"0 0 3px 0",letterSpacing:"-0.01em"}}>{title}</h1>
        {sub&&<div style={{fontFamily:font,fontSize:13,color:C.muted}}>{sub}</div>}
      </div>
      {right}
    </div>
  </div>
);

const TypeFilter = ({value,onChange}) => (
  <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`1px solid ${C.line}`,
    overflowX:"auto",scrollbarWidth:"none"}}>
    {ASSET_TYPES.map(t=>{
      const active=value===t.id;
      return <button key={t.id} onClick={()=>onChange(t.id)} style={{
        background:"none",border:"none",
        borderBottom:active?`2px solid ${C.ink}`:"2px solid transparent",
        color:active?C.ink:C.muted,fontFamily:font,fontSize:13,
        fontWeight:active?600:400,padding:"8px 16px 8px 0",
        marginRight:4,marginBottom:-1,cursor:"pointer",
        whiteSpace:"nowrap",flexShrink:0}}>
        {t.label}</button>;
    })}
  </div>
);

const Tabs = ({tabs,active,onChange}) => (
  <div style={{display:"flex",borderBottom:`1px solid ${C.line}`,
    marginBottom:22,overflowX:"auto",scrollbarWidth:"none"}}>
    {tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{
      background:"none",border:"none",
      borderBottom:active===t.id?`2px solid ${C.ink}`:"2px solid transparent",
      color:active===t.id?C.ink:C.muted,padding:"9px 20px 9px 0",
      marginRight:4,marginBottom:-1,cursor:"pointer",fontFamily:font,
      fontSize:13,fontWeight:active===t.id?600:400,
      whiteSpace:"nowrap",flexShrink:0}}>{t.label}</button>)}
  </div>
);

const Stat = ({n,label}) => (
  <div style={{padding:"16px 28px 16px 0",borderRight:`1px solid ${C.lineL}`,marginRight:28}}>
    <div style={{fontFamily:font,fontSize:38,fontWeight:700,color:C.ink,lineHeight:1,
      letterSpacing:"-0.03em",fontVariantNumeric:"tabular-nums",marginBottom:5}}>{n}</div>
    <div style={{fontFamily:font,fontSize:11,fontWeight:700,letterSpacing:"0.1em",
      textTransform:"uppercase",color:C.muted}}>{label}</div>
  </div>
);

const SchemaTable = ({fields}) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",minWidth:480,fontFamily:font}}>
      <thead>
        <tr style={{borderBottom:`2px solid ${C.line}`}}>
          {["Field","Type","Nullable","Description"].map(h=>(
            <th key={h} style={{padding:"8px 14px 8px 0",textAlign:"left",fontSize:11,
              fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",
              color:C.muted}}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {fields.map(r=>(
          <tr key={r.field} style={{borderBottom:`1px solid ${C.lineL}`}}>
            <td style={{padding:"9px 14px 9px 0",fontFamily:mono,fontSize:12,
              fontWeight:600,color:C.ink}}>{r.field}</td>
            <td style={{padding:"9px 14px 9px 0",fontFamily:mono,fontSize:11,
              color:C.mid}}>{r.type}</td>
            <td style={{padding:"9px 14px 9px 0",fontSize:12,fontWeight:600,
              color:r.nullable?C.warn:C.faint}}>{r.nullable?"Yes":"—"}</td>
            <td style={{padding:"9px 0",fontSize:12,color:C.mid,
              lineHeight:1.5}}>{r.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DatasetEntry = ({ds,onClick,onOpenSql}) => {
  const f=freshCfg(ds.lastReceived);
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"grid",gridTemplateColumns:"10px 1fr",gap:"0 18px",
        marginBottom:6,cursor:"pointer"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:18}}>
        <div style={{width:9,height:9,borderRadius:"50%",background:f.c,
          flexShrink:0,boxShadow:`0 0 0 2px ${f.bg}`}}/>
        <div style={{width:1,flex:1,background:C.lineL,marginTop:6}}/>
      </div>
      <div onClick={onClick}
        style={{background:hov?C.white:C.card,border:`1px solid ${hov?C.lineH:C.line}`,
          borderLeft:`3px solid ${hov?f.c:C.lineL}`,padding:"14px 16px 14px 18px",
          transition:"background 0.12s,border-color 0.12s"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
          <span style={{fontFamily:mono,fontSize:11,color:C.muted}}>{ds.id}</span>
          <span style={{fontFamily:font,fontSize:11,fontWeight:600,letterSpacing:"0.05em",
            textTransform:"uppercase",color:C.muted}}>{ds.source}</span>
          <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>{ds.updated}</span>
          <TypeBadge type={ds.assetType}/>
          <span style={{fontFamily:font,fontSize:11,fontWeight:600,color:f.c}}>{f.label}</span>
        </div>
        <div style={{fontFamily:font,fontSize:16,fontWeight:700,color:C.ink,
          marginBottom:5,letterSpacing:"-0.01em",lineHeight:1.3}}>{ds.name}</div>
        <div style={{fontFamily:font,fontSize:13,color:C.mid,lineHeight:1.65,
          marginBottom:10}}>{ds.description}</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",
          paddingTop:10,borderTop:`1px solid ${C.lineL}`}}>
          {ds.hasCsvw?<InlineTag ok>Schema</InlineTag>:<InlineTag warn>No schema</InlineTag>}
          <span style={{fontFamily:font,fontSize:11,color:C.faint}}>
            {ds.outputs} output{ds.outputs!==1?"s":""}</span>
          {ds.tags.map(t=>(
            <span key={t} style={{fontFamily:font,fontSize:11,color:C.faint}}>{t}</span>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
            {ds.hasCsvw&&onOpenSql&&(
              <button onClick={e=>{e.stopPropagation();onOpenSql(ds);}}
                style={{background:"none",border:`1px solid ${C.line}`,
                  fontFamily:font,fontSize:11,fontWeight:600,color:C.mid,
                  padding:"2px 8px",cursor:"pointer"}}>
                Open in SQL ⌕</button>
            )}
            <span style={{fontFamily:font,fontSize:12,fontWeight:600,color:C.mid}}>
              View →</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityEntry = ({ev,last,onDataset}) => {
  const a=actMeta[ev.type]||{label:ev.type,symbol:"·"};
  return (
    <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:"0 16px",
      padding:"14px 0",borderBottom:last?"none":`1px solid ${C.lineL}`}}>
      <div style={{paddingTop:2}}>
        <div style={{fontFamily:mono,fontSize:10,color:C.muted,lineHeight:1.4}}>{ev.date}</div>
        <div style={{fontFamily:font,fontSize:14,color:C.faint,marginTop:5,lineHeight:1}}>
          {a.symbol}</div>
      </div>
      <div>
        <div style={{fontFamily:font,fontSize:12,fontWeight:600,color:C.mid,marginBottom:4,
          display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <span>{a.label}</span>
          {ev.tags.includes("mobility-planning")&&(
            <span style={{fontWeight:400,fontStyle:"italic",color:C.warn}}>legal mandate</span>
          )}
        </div>
        <div style={{fontFamily:font,fontSize:13,color:C.soft,lineHeight:1.6,marginBottom:5}}>
          {ev.description}</div>
        <div style={{fontFamily:font,fontSize:12,color:C.muted}}>
          {ev.actor}
          {ev.inputs?.length>0&&ev.inputs.map((inp,i)=>(
            <span key={i}> · <em style={{cursor:onDataset?"pointer":"default"}}
              onClick={()=>{if(!onDataset)return;const ds=DATASETS.find(d=>d.name===inp);if(ds)onDataset(ds.id);}}>
              from: {inp}</em></span>
          ))}
          {ev.outputs?.filter(o=>o).map((out,i)=>(
            <span key={i}> · <em style={{cursor:onDataset?"pointer":"default"}}
              onClick={()=>{if(!onDataset)return;const ds=DATASETS.find(d=>d.name===out);if(ds)onDataset(ds.id);}}>
              to: {out}</em></span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   GLOBAL SEARCH
══════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════
   REGISTER ASSET WIZARD
   Modal, four steps, same visual language as the rest of the app.

   Step 1 — Entry type
     Upload file / Paste S3 URL / Qlik dashboard URL

   Step 2 — Basic metadata
     Name, description, tags

   Step 3 — Provenance (varies by path)
     Bronze/silver/gold → mock Airflow extraction → confirm
     Outputs bucket + Derived → pick upstream datasets
     Outputs bucket + Received → reception details
     Qlik → pick served datasets + audience

   Step 4 — Review & register
     Summary of what will be created
══════════════════════════════════════════════════════════════════════ */

/* Mock Airflow extraction — returns after a short simulated delay */
const mockAirflowExtract = (url) => new Promise(resolve => {
  setTimeout(() => resolve({
    dagId:      "modal-split-monthly",
    dagRun:     "run_20250320T0100Z",
    upstreams:  ["MobiScout Silver", "Traffic Reference Zones"],
    upstreamIds:["DS-011", "DS-012"],
    schedule:   "Monthly",
    lastRun:    "2025-03-20",
  }), 1400);
});

const S3_BUCKETS = {
  bronze:  "s3://odm-bronze/",
  silver:  "s3://odm-silver/",
  gold:    "s3://odm-gold/",
  outputs: "s3://odm-outputs/",
};

function classifyS3Url(url) {
  if (!url) return null;
  if (url.startsWith(S3_BUCKETS.bronze)) return "bronze";
  if (url.startsWith(S3_BUCKETS.silver)) return "silver";
  if (url.startsWith(S3_BUCKETS.gold))   return "gold";
  if (url.startsWith(S3_BUCKETS.outputs)) return "outputs";
  if (url.startsWith("s3://"))            return "s3-other";
  return null;
}

const RegisterWizard = ({ onClose, onRegister, mobile }) => {
  const [step, setStep]           = useState(1);
  const [entryType, setEntryType] = useState(null); // "upload"|"s3"|"qlik"
  const [s3Url, setS3Url]         = useState("");
  const [qlikUrl, setQlikUrl]     = useState("");
  const [bucket, setBucket]       = useState(null);
  const [outputsPath, setOutputsPath] = useState(null); // "derived"|"received"
  const [airflowData, setAirflowData] = useState(null);
  const [extracting, setExtracting]   = useState(false);

  // Step 2 — basic metadata
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags]               = useState("");

  // Step 3 — provenance specifics
  const [upstreams, setUpstreams]     = useState([]); // selected dataset ids
  const [receptionActor, setReceptionActor] = useState("");
  const [receptionChannel, setReceptionChannel] = useState("MFT");
  const [servedDatasets, setServedDatasets]   = useState([]);
  const [audience, setAudience]       = useState("");

  const [errors, setErrors]           = useState({});

  const inputStyle = {
    fontFamily:font, fontSize:13, color:C.ink,
    background:C.white, border:`1px solid ${C.line}`,
    borderBottom:`2px solid ${C.lineH}`,
    padding:"6px 10px", outline:"none",
    width:"100%", boxSizing:"border-box",
  };

  const Label = ({children, required}) => (
    <div style={{fontFamily:font,fontSize:11,fontWeight:700,
      letterSpacing:"0.09em",textTransform:"uppercase",
      color:C.muted,marginBottom:5}}>
      {children}{required&&<span style={{color:C.bad}}> *</span>}
    </div>
  );
  const FieldWrap = ({children,style={}}) => (
    <div style={{marginBottom:14,...style}}>{children}</div>
  );
  const Err = ({field}) => errors[field]
    ? <div style={{fontFamily:font,fontSize:12,color:C.bad,marginTop:3}}>
        {errors[field]}</div>
    : null;

  /* ── Bucket badge ── */
  const BucketBadge = ({b}) => {
    const cfg = {
      bronze:   {label:"Bronze",  color:"#7A4A1A", bg:"#FBF0E6"},
      silver:   {label:"Silver",  color:"#4A4A5A", bg:"#F0F0F5"},
      gold:     {label:"Gold",    color:"#6A5A00", bg:"#FAF5E0"},
      outputs:  {label:"Outputs", color:C.ok,      bg:C.okBg  },
      "s3-other":{label:"S3",     color:C.mid,     bg:C.surface},
    }[b]||{label:b,color:C.mid,bg:C.surface};
    return (
      <span style={{fontFamily:font,fontSize:11,fontWeight:700,
        letterSpacing:"0.06em",textTransform:"uppercase",
        color:cfg.color,background:cfg.bg,
        padding:"2px 8px",display:"inline-block"}}>
        {cfg.label}
      </span>
    );
  };

  /* ── Step 1: entry type selection ── */
  const EntryTypeCard = ({id,title,sub}) => (
    <div onClick={()=>setEntryType(id)}
      style={{padding:"16px 18px",border:`1px solid ${entryType===id?C.lineH:C.line}`,
        borderLeft:`3px solid ${entryType===id?C.ink:C.lineL}`,
        background:entryType===id?C.card:C.white,
        cursor:"pointer",marginBottom:8,transition:"all 0.1s"}}
      onMouseEnter={e=>e.currentTarget.style.background=C.card}
      onMouseLeave={e=>e.currentTarget.style.background=entryType===id?C.card:C.white}>
      <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink,marginBottom:3}}>
        {title}</div>
      <div style={{fontFamily:font,fontSize:12,color:C.muted}}>{sub}</div>
    </div>
  );

  /* ── Step 1 submit: classify URL, maybe trigger Airflow ── */
  const handleStep1Next = async () => {
    if (!entryType) { setErrors({entry:"Please select an entry type."}); return; }
    if (entryType === "s3" && !s3Url.trim()) {
      setErrors({s3:"Please enter an S3 URL."}); return;
    }
    if (entryType === "qlik" && !qlikUrl.trim()) {
      setErrors({qlik:"Please enter a Qlik dashboard URL."}); return;
    }
    setErrors({});

    if (entryType === "s3" || entryType === "upload") {
      const url = entryType === "upload" ? "s3://odm-outputs/upload_tmp.parquet" : s3Url;
      const b = classifyS3Url(url);
      setBucket(b);
      if (b === "bronze" || b === "silver" || b === "gold") {
        setStep(2);
      } else {
        setStep(2); // outputs or unknown — ask provenance path later
      }
    } else {
      setStep(2);
    }
  };

  /* ── Step 2 submit ── */
  const handleStep2Next = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(3);

    // If bronze/silver/gold, trigger mock Airflow extraction
    if ((bucket==="bronze"||bucket==="silver"||bucket==="gold") && !airflowData) {
      setExtracting(true);
      mockAirflowExtract(s3Url).then(data => {
        setAirflowData(data);
        setUpstreams(data.upstreamIds);
        setExtracting(false);
      });
    }
  };

  /* ── Step 3 submit ── */
  const handleStep3Next = () => {
    const e = {};
    if (entryType==="qlik" && servedDatasets.length===0)
      e.served = "Select at least one dataset this dashboard serves.";
    if (bucket==="outputs" && outputsPath==="received" && !receptionActor.trim())
      e.actor = "Source organisation is required.";
    if (bucket==="outputs" && !outputsPath)
      e.path = "Please select how this dataset came to exist.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(4);
  };

  /* ── Build the summary for step 4 ── */
  const buildSummary = () => {
    const assetType = entryType==="qlik" ? "dashboard"
      : bucket==="outputs" && outputsPath==="received" ? "source"
      : "output";

    const provType = entryType==="qlik" ? "Dashboard"
      : (bucket==="bronze"||bucket==="silver"||bucket==="gold") ? "Transformation"
      : outputsPath==="received" ? "Reception"
      : outputsPath==="scratch"  ? "Manual (from scratch)"
      : "Transformation";

    return { assetType, provType };
  };

  const { assetType, provType } = step===4 ? buildSummary() : {};

  const STEPS = ["Entry","Metadata","Provenance","Review"];
  const totalSteps = 4;

  /* ── Dataset multi-select helper ── */
  /* ── Dataset search + multi-select widget ────────────────────────────────
     Type to filter. Results shown as a dropdown list. Click to add.
     Selected items shown as removable tags below the input.
     Can optionally restrict to a subset of datasets (pool).
  ─────────────────────────────────────────────────────────────────────── */
  const DatasetSearch = ({selected, onChange, pool=DATASETS, placeholder="Search datasets…"}) => {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);

    const filtered = q.trim().length < 1
      ? pool.slice(0, 8)
      : pool.filter(d =>
          d.name.toLowerCase().includes(q.toLowerCase()) ||
          d.id.toLowerCase().includes(q.toLowerCase()) ||
          d.source.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 10);

    const add = (id) => {
      if (!selected.includes(id)) onChange([...selected, id]);
      setQ("");
      setOpen(false);
      inputRef.current?.focus();
    };
    const remove = (id) => onChange(selected.filter(x => x !== id));

    return (
      <div>
        {/* Selected tags */}
        {selected.length > 0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
            {selected.map(id => {
              const ds = DATASETS.find(d => d.id === id);
              if (!ds) return null;
              return (
                <div key={id} style={{display:"flex",alignItems:"center",gap:6,
                  background:C.card,border:`1px solid ${C.lineH}`,
                  borderLeft:`3px solid ${C.ink}`,
                  padding:"4px 8px 4px 10px"}}>
                  <div>
                    <div style={{fontFamily:font,fontSize:12,fontWeight:600,
                      color:C.ink}}>{ds.name}</div>
                    <div style={{fontFamily:mono,fontSize:10,color:C.muted}}>{ds.id}</div>
                  </div>
                  <button onClick={()=>remove(id)}
                    style={{background:"none",border:"none",cursor:"pointer",
                      color:C.muted,fontSize:15,lineHeight:1,padding:"0 2px",
                      fontFamily:font}}>×</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Search input */}
        <div style={{position:"relative"}}>
          <input
            ref={inputRef}
            value={q}
            onChange={e=>{setQ(e.target.value);setOpen(true);}}
            onFocus={()=>setOpen(true)}
            onBlur={()=>setTimeout(()=>setOpen(false),150)}
            placeholder={placeholder}
            style={{fontFamily:font,fontSize:13,color:C.ink,
              background:C.white,border:`1px solid ${C.line}`,
              borderBottom:`2px solid ${C.lineH}`,
              padding:"6px 10px",outline:"none",
              width:"100%",boxSizing:"border-box"}}
          />

          {/* Dropdown results */}
          {open && filtered.length > 0 && (
            <div style={{position:"absolute",top:"100%",left:0,right:0,
              background:C.white,border:`1px solid ${C.lineH}`,
              borderTop:"none",zIndex:50,
              maxHeight:220,overflowY:"auto",
              boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
              {filtered.map(ds => {
                const already = selected.includes(ds.id);
                return (
                  <div key={ds.id}
                    onMouseDown={()=>!already&&add(ds.id)}
                    style={{padding:"9px 12px",cursor:already?"default":"pointer",
                      background:already?C.surface:C.white,
                      borderBottom:`1px solid ${C.lineL}`,
                      display:"flex",alignItems:"center",gap:10}}
                    onMouseEnter={e=>{if(!already)e.currentTarget.style.background=C.card;}}
                    onMouseLeave={e=>{if(!already)e.currentTarget.style.background=C.white;}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:font,fontSize:13,
                        fontWeight:600,color:already?C.muted:C.ink}}>
                        {ds.name}</div>
                      <div style={{fontFamily:font,fontSize:11,color:C.muted}}>
                        {ds.id} · {ds.source}</div>
                    </div>
                    <TypeBadge type={ds.assetType}/>
                    {already&&<span style={{fontFamily:font,fontSize:11,
                      color:C.faint}}>added</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {q.trim().length===0&&filtered.length===0&&(
          <div style={{fontFamily:font,fontSize:12,color:C.faint,marginTop:6}}>
            No datasets found.</div>
        )}
      </div>
    );
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:998,
      background:"rgba(26,26,26,0.5)",
      display:"flex",alignItems:"flex-start",
      justifyContent:"center",paddingTop:60,overflowY:"auto"}}
      onClick={onClose}>
      <div style={{background:C.white,width:"100%",maxWidth:560,
        margin:"0 16px 60px",
        boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}
        onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`3px solid ${LU.red}`,
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:font,fontSize:11,fontWeight:700,
              letterSpacing:"0.12em",textTransform:"uppercase",
              color:C.muted,marginBottom:3}}>Register asset</div>
            <div style={{fontFamily:font,fontSize:17,fontWeight:700,color:C.ink}}>
              {STEPS[step-1]}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",
            cursor:"pointer",fontFamily:font,fontSize:22,color:C.muted,
            lineHeight:1,padding:"0 4px"}}>×</button>
        </div>

        {/* Progress bar */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.line}`}}>
          {STEPS.map((s,i)=>{
            const done = i+1 < step;
            const active = i+1 === step;
            return (
              <div key={s} style={{flex:1,padding:"8px 0",textAlign:"center",
                borderBottom:active?`2px solid ${C.ink}`:"2px solid transparent",
                background:done?C.surface:"transparent"}}>
                <span style={{fontFamily:font,fontSize:11,fontWeight:active?700:400,
                  letterSpacing:"0.08em",textTransform:"uppercase",
                  color:done?C.ok:active?C.ink:C.faint}}>
                  {done?"✓ ":""}{s}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div style={{padding:"22px 20px"}}>

          {/* ── Step 1: Entry type ── */}
          {step===1&&<>
            {errors.entry&&<Notice type="danger">{errors.entry}</Notice>}
            <EntryTypeCard id="upload" title="Upload a file"
              sub="Upload a file directly — it will be stored in S3 and registered as an asset."/>
            <EntryTypeCard id="s3" title="Paste an S3 URL"
              sub="Register an existing file already in S3 (bronze, silver, gold, or outputs bucket)."/>
            <EntryTypeCard id="qlik" title="Qlik dashboard URL"
              sub="Register a Qlik dashboard as a data service in the catalogue."/>

            {entryType==="s3"&&(
              <FieldWrap style={{marginTop:14}}>
                <Label>S3 URL</Label>
                <input value={s3Url} onChange={e=>setS3Url(e.target.value)}
                  placeholder="s3://odm-gold/modal-split/2025-q1.parquet"
                  style={inputStyle}/>
                <Err field="s3"/>
                {s3Url&&classifyS3Url(s3Url)&&(
                  <div style={{marginTop:6,display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:font,fontSize:12,color:C.muted}}>Bucket:</span>
                    <BucketBadge b={classifyS3Url(s3Url)}/>
                    {(classifyS3Url(s3Url)==="bronze"||classifyS3Url(s3Url)==="silver"||classifyS3Url(s3Url)==="gold")&&(
                      <span style={{fontFamily:font,fontSize:12,color:C.ok}}>
                        Airflow metadata will be extracted automatically</span>
                    )}
                  </div>
                )}
              </FieldWrap>
            )}
            {entryType==="qlik"&&(
              <FieldWrap style={{marginTop:14}}>
                <Label>Qlik dashboard URL</Label>
                <input value={qlikUrl} onChange={e=>setQlikUrl(e.target.value)}
                  placeholder="https://qlik.idm.lu/sense/app/abc123/sheet/def456"
                  style={inputStyle}/>
                <Err field="qlik"/>
              </FieldWrap>
            )}
            {entryType==="upload"&&(
              <div style={{marginTop:14,padding:"20px",
                border:`2px dashed ${C.lineH}`,textAlign:"center"}}>
                <div style={{fontFamily:font,fontSize:13,color:C.muted,marginBottom:8}}>
                  Drop a file here or click to browse</div>
                <button style={{background:"none",border:`1px solid ${C.line}`,
                  borderBottom:`2px solid ${C.lineH}`,fontFamily:font,
                  fontSize:12,fontWeight:600,color:C.mid,
                  padding:"5px 14px",cursor:"pointer"}}>
                  Browse…</button>
                <div style={{fontFamily:font,fontSize:11,color:C.faint,marginTop:8}}>
                  File will be uploaded to s3://odm-outputs/</div>
              </div>
            )}
          </>}

          {/* ── Step 2: Basic metadata ── */}
          {step===2&&<>
            <FieldWrap>
              <Label required>Name</Label>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="e.g. Modal Split ZH 2025–Q2"
                style={inputStyle}/>
              <Err field="name"/>
            </FieldWrap>
            <FieldWrap>
              <Label>Description</Label>
              <textarea value={description}
                onChange={e=>setDescription(e.target.value)}
                rows={3} placeholder="What is this dataset? What does it contain?"
                style={{...inputStyle,resize:"vertical",lineHeight:1.5}}/>
            </FieldWrap>
            <FieldWrap>
              <Label>Tags</Label>
              <input value={tags} onChange={e=>setTags(e.target.value)}
                placeholder="Comma-separated — e.g. modal-split, cycling, ZH"
                style={inputStyle}/>
            </FieldWrap>
            {bucket&&(
              <div style={{display:"flex",alignItems:"center",gap:8,
                padding:"10px 14px",background:C.surface,
                borderLeft:`3px solid ${C.lineH}`}}>
                <span style={{fontFamily:font,fontSize:12,color:C.muted}}>Bucket:</span>
                <BucketBadge b={bucket}/>
              </div>
            )}
          </>}

          {/* ── Step 3: Provenance ── */}
          {step===3&&<>

            {/* Bronze / silver / gold → Airflow extraction */}
            {(bucket==="bronze"||bucket==="silver"||bucket==="gold")&&(
              <>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,
                  lineHeight:1.6,marginBottom:16}}>
                  Extracting provenance from Airflow logs for this{" "}
                  <BucketBadge b={bucket}/> asset…
                </div>
                {extracting&&(
                  <div style={{padding:"20px",textAlign:"center",
                    border:`1px solid ${C.line}`}}>
                    <div style={{fontFamily:font,fontSize:13,color:C.muted}}>
                      Querying Airflow API…</div>
                    <div style={{marginTop:10,height:3,background:C.lineL,overflow:"hidden"}}>
                      <div style={{height:"100%",width:"60%",background:C.ink,
                        animation:"none"}}/>
                    </div>
                  </div>
                )}
                {airflowData&&!extracting&&(
                  <div style={{border:`1px solid ${C.okBd}`,
                    borderLeft:`3px solid ${C.ok}`,
                    background:C.okBg,padding:"14px 18px"}}>
                    <div style={{fontFamily:font,fontSize:12,fontWeight:700,
                      letterSpacing:"0.08em",textTransform:"uppercase",
                      color:C.ok,marginBottom:10}}>
                      Extracted from Airflow</div>
                    {[
                      ["DAG", airflowData.dagId],
                      ["Run ID", airflowData.dagRun],
                      ["Schedule", airflowData.schedule],
                      ["Last run", airflowData.lastRun],
                    ].map(([k,v])=>(
                      <div key={k} style={{display:"flex",gap:12,marginBottom:5,
                        alignItems:"baseline"}}>
                        <span style={{fontFamily:font,fontSize:10,fontWeight:700,
                          letterSpacing:"0.1em",textTransform:"uppercase",
                          color:C.ok,opacity:0.7,width:60,flexShrink:0}}>{k}</span>
                        <span style={{fontFamily:mono,fontSize:12,color:C.ink}}>
                          {v}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10,paddingTop:10,
                      borderTop:`1px solid ${C.okBd}`}}>
                      <div style={{fontFamily:font,fontSize:10,fontWeight:700,
                        letterSpacing:"0.1em",textTransform:"uppercase",
                        color:C.ok,opacity:0.7,marginBottom:6}}>
                        Upstream dependencies</div>
                      {airflowData.upstreams.map((u,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"baseline",
                          gap:8,marginBottom:3}}>
                          <span style={{fontFamily:font,fontSize:10,fontWeight:700,
                            letterSpacing:"0.06em",textTransform:"uppercase",
                            color:C.warn}}>in</span>
                          <span style={{fontFamily:font,fontSize:13,
                            fontWeight:600,color:C.ink}}>{u}</span>
                          <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>
                            {airflowData.upstreamIds[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:10,fontFamily:font,fontSize:12,color:C.soft}}>
                      Please confirm these are correct before proceeding.
                      You can adjust in the Provenance tab after registration.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Outputs bucket → ask derived or received */}
            {bucket==="outputs"&&!outputsPath&&(
              <>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,
                  lineHeight:1.6,marginBottom:16}}>
                  How did this dataset come to exist?
                </div>
                {[
                  {id:"derived",  title:"We derived this",
                   sub:"This was produced from other ODM datasets — a transformation, query, or manual analysis."},
                  {id:"scratch",  title:"We created this from scratch",
                   sub:"This was authored independently — a reference file, a document, or an original dataset with no ODM upstream."},
                  {id:"received", title:"We received this",
                   sub:"Someone delivered this to us from outside — it is a new source arriving in our outputs bucket."},
                ].map(opt=>(
                  <div key={opt.id} onClick={()=>setOutputsPath(opt.id)}
                    style={{padding:"14px 16px",marginBottom:8,cursor:"pointer",
                      border:`1px solid ${outputsPath===opt.id?C.lineH:C.line}`,
                      borderLeft:`3px solid ${outputsPath===opt.id?C.ink:C.lineL}`,
                      background:outputsPath===opt.id?C.card:C.white}}>
                    <div style={{fontFamily:font,fontSize:14,fontWeight:600,
                      color:C.ink,marginBottom:3}}>{opt.title}</div>
                    <div style={{fontFamily:font,fontSize:12,color:C.muted}}>
                      {opt.sub}</div>
                  </div>
                ))}
              </>
            )}

            {/* Outputs + derived → dataset search widget */}
            {bucket==="outputs"&&outputsPath==="derived"&&(
              <>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,
                  lineHeight:1.6,marginBottom:14}}>
                  Search for the ODM datasets this was derived from.
                  Leave empty if no upstream datasets apply.
                </div>
                <DatasetSearch
                  selected={upstreams}
                  onChange={setUpstreams}
                  placeholder="Search by name, ID or source…"
                />
                {upstreams.length===0&&(
                  <div style={{fontFamily:font,fontSize:12,color:C.muted,marginTop:8,
                    borderLeft:`3px solid ${C.lineL}`,paddingLeft:10}}>
                    No upstream datasets selected. This derivation will be recorded
                    as a manual creation with no tracked lineage.
                  </div>
                )}
              </>
            )}

            {/* Outputs + scratch → no upstream, just confirm */}
            {bucket==="outputs"&&outputsPath==="scratch"&&(
              <div style={{padding:"16px 18px",background:C.surface,
                borderLeft:`3px solid ${C.lineL}`}}>
                <div style={{fontFamily:font,fontSize:13,fontWeight:600,
                  color:C.ink,marginBottom:6}}>
                  Created from scratch
                </div>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,lineHeight:1.6}}>
                  This dataset will be registered as an original creation
                  by <strong>{CURRENT_USER.name}</strong> with no upstream
                  ODM dependencies. A Manual activity will be recorded
                  as its provenance origin.
                </div>
              </div>
            )}

            {/* Outputs + received → reception details */}
            {bucket==="outputs"&&outputsPath==="received"&&(
              <>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,
                  lineHeight:1.6,marginBottom:14}}>
                  Record the reception details for this external delivery:
                </div>
                <FieldWrap>
                  <Label required>Source organisation</Label>
                  <input value={receptionActor}
                    onChange={e=>setReceptionActor(e.target.value)}
                    placeholder="e.g. Statec, MDDI, Canton GE"
                    style={inputStyle}/>
                  <Err field="actor"/>
                </FieldWrap>
                <FieldWrap>
                  <Label>Channel</Label>
                  <select value={receptionChannel}
                    onChange={e=>setReceptionChannel(e.target.value)}
                    style={{...inputStyle,cursor:"pointer"}}>
                    {ODM_CHANNELS.map(ch=>(
                      <option key={ch.id} value={ch.id}>{ch.label}</option>
                    ))}
                  </select>
                </FieldWrap>
              </>
            )}

            {/* Qlik dashboard */}
            {entryType==="qlik"&&(
              <>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,
                  lineHeight:1.6,marginBottom:14}}>
                  Which ODM datasets does this dashboard serve?
                </div>
                <DatasetSearch
                  selected={servedDatasets}
                  onChange={setServedDatasets}
                  placeholder="Search datasets served by this dashboard…"
                />
                <Err field="served"/>
                <FieldWrap style={{marginTop:14}}>
                  <Label>Intended audience</Label>
                  <input value={audience} onChange={e=>setAudience(e.target.value)}
                    placeholder="e.g. IDM internal, ARE, public"
                    style={inputStyle}/>
                </FieldWrap>
              </>
            )}
          </>}

          {/* ── Step 4: Review ── */}
          {step===4&&(()=>{
            const tagList = tags.split(",").map(t=>t.trim()).filter(Boolean);
            const upstreamDs = upstreams.map(id=>DATASETS.find(d=>d.id===id)).filter(Boolean);
            const servedDs   = servedDatasets.map(id=>DATASETS.find(d=>d.id===id)).filter(Boolean);

            const Section = ({title,children}) => (
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:font,fontSize:11,fontWeight:700,
                  letterSpacing:"0.1em",textTransform:"uppercase",
                  color:C.muted,marginBottom:8,
                  paddingBottom:6,borderBottom:`1px solid ${C.lineL}`}}>
                  {title}</div>
                {children}
              </div>
            );
            const Row = ({label,value}) => (
              <div style={{display:"flex",gap:12,marginBottom:5,alignItems:"baseline"}}>
                <span style={{fontFamily:font,fontSize:11,fontWeight:700,
                  letterSpacing:"0.08em",textTransform:"uppercase",
                  color:C.muted,width:90,flexShrink:0}}>{label}</span>
                <span style={{fontFamily:font,fontSize:13,color:C.ink}}>{value}</span>
              </div>
            );

            return (
              <div>
                <Section title="Asset">
                  <Row label="Name"       value={name}/>
                  <Row label="Type"       value={assetType}/>
                  {description&&<Row label="Description" value={description}/>}
                  {tagList.length>0&&(
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                      {tagList.map(t=>(
                        <span key={t} style={{fontFamily:font,fontSize:11,
                          color:C.mid,background:C.surface,
                          border:`1px solid ${C.lineL}`,padding:"1px 6px"}}>{t}</span>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title={`Provenance · ${provType}`}>
                  {provType==="Transformation"&&airflowData&&(
                    <>
                      <Row label="DAG"    value={airflowData.dagId}/>
                      <Row label="Run"    value={airflowData.dagRun}/>
                      {upstreamDs.map(u=>(
                        <Row key={u.id} label="Upstream" value={`${u.name} (${u.id})`}/>
                      ))}
                    </>
                  )}
                  {provType==="Transformation"&&!airflowData&&upstreamDs.map(u=>(
                    <Row key={u.id} label="Upstream" value={`${u.name} (${u.id})`}/>
                  ))}
                  {provType==="Reception"&&(
                    <>
                      <Row label="From"    value={receptionActor}/>
                      <Row label="Channel" value={receptionChannel}/>
                    </>
                  )}
                  {provType==="Dashboard"&&(
                    <>
                      {servedDs.map(d=>(
                        <Row key={d.id} label="Serves" value={`${d.name} (${d.id})`}/>
                      ))}
                      {audience&&<Row label="Audience" value={audience}/>}
                      <Row label="URL" value={qlikUrl}/>
                    </>
                  )}
                </Section>

                <Notice type="info">
                  This will create a new dataset record and a {provType} activity
                  in the catalogue. You can edit all fields after registration.
                </Notice>
              </div>
            );
          })()}

        </div>

        {/* Footer nav */}
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.line}`,
          display:"flex",justifyContent:"space-between",alignItems:"center",
          background:C.surface}}>
          <div>
            {step>1&&(
              <button onClick={()=>{
                /* Reset path-specific state when stepping back into step 3 */
                if(step===4) { /* nothing to reset */ }
                if(step===3) { setOutputsPath(null); setUpstreams([]); setServedDatasets([]); }
                setStep(s=>s-1);
              }}
                style={{background:"none",border:`1px solid ${C.line}`,
                  borderBottom:`2px solid ${C.lineH}`,
                  fontFamily:font,fontSize:12,fontWeight:500,
                  color:C.muted,padding:"5px 14px",cursor:"pointer"}}>
                ← Back
              </button>
            )}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontFamily:font,fontSize:11,color:C.faint}}>
              Step {step} of {totalSteps}
            </span>
            {step<4 ? (
              <button
                onClick={step===1?handleStep1Next:step===2?handleStep2Next:handleStep3Next}
                disabled={extracting}
                style={{background:extracting?C.surface:C.ink,
                  border:"none",color:extracting?C.muted:C.white,
                  fontFamily:font,fontSize:12,fontWeight:600,
                  padding:"6px 18px",cursor:extracting?"default":"pointer"}}>
                {extracting?"Extracting…":"Continue →"}
              </button>
            ) : (
              <button onClick={()=>{onRegister&&onRegister({name,description,tags,assetType,provType});onClose();}}
                style={{background:LU.red,border:"none",color:C.white,
                  fontFamily:font,fontSize:12,fontWeight:600,
                  padding:"6px 18px",cursor:"pointer"}}>
                Register asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobalSearch = ({onNavigate,onClose,queries}) => {
  const [q,setQ]=useState("");
  const inputRef=useRef(null);
  useEffect(()=>{inputRef.current?.focus();},[]);
  const ql=q.toLowerCase().trim();
  const dsRes=ql.length<2?[]:DATASETS.filter(d=>
    d.name.toLowerCase().includes(ql)||d.source.toLowerCase().includes(ql)||
    d.tags.some(t=>t.toLowerCase().includes(ql))||d.id.toLowerCase().includes(ql));
  const acRes=ql.length<2?[]:ACTORS.filter(a=>
    a.name.toLowerCase().includes(ql)||a.role.toLowerCase().includes(ql)||a.id.toLowerCase().includes(ql));
  const qRes=ql.length<2?[]:queries.filter(q=>
    q.name.toLowerCase().includes(ql)||q.description.toLowerCase().includes(ql)||
    q.sql.toLowerCase().includes(ql)||q.authorName.toLowerCase().includes(ql)||
    q.datasets.some(d=>{const ds=DATASETS.find(x=>x.id===d);return ds&&ds.name.toLowerCase().includes(ql);})).slice(0,4);
  const empty=ql.length>=2&&dsRes.length===0&&acRes.length===0&&qRes.length===0;

  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(26,26,26,0.55)",
      display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:80}}
      onClick={onClose}>
      <div style={{background:C.white,width:"100%",maxWidth:580,margin:"0 16px",
        boxShadow:"0 8px 32px rgba(0,0,0,0.18)",maxHeight:"70vh",
        display:"flex",flexDirection:"column"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",
          borderBottom:`1px solid ${C.line}`}}>
          <span style={{fontFamily:font,fontSize:17,color:C.faint}}>⌕</span>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search datasets, actors, queries…"
            style={{flex:1,fontFamily:font,fontSize:15,color:C.ink,
              border:"none",outline:"none",background:"none"}}/>
          {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",
            cursor:"pointer",fontFamily:font,fontSize:12,color:C.muted,padding:0}}>
            Clear</button>}
          <button onClick={onClose} style={{background:"none",border:"none",
            cursor:"pointer",fontFamily:font,fontSize:12,color:C.muted,padding:0}}>
            Esc</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {ql.length<2&&<div style={{padding:"20px 18px",fontFamily:font,fontSize:13,
            color:C.muted,textAlign:"center"}}>Type at least 2 characters to search</div>}
          {empty&&<div style={{padding:"20px 18px",fontFamily:font,fontSize:13,
            color:C.muted,textAlign:"center"}}>No results for "{q}"</div>}
          {dsRes.length>0&&<>
            <div style={{padding:"10px 18px 4px",fontFamily:font,fontSize:10,fontWeight:700,
              letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,background:C.surface}}>
              Data Assets</div>
            {dsRes.map(ds=>{const f=freshCfg(ds.lastReceived);return(
              <div key={ds.id} onClick={()=>{onNavigate("dataset",ds.id);onClose();}}
                style={{padding:"10px 18px",cursor:"pointer",borderBottom:`1px solid ${C.lineL}`,
                  display:"flex",alignItems:"center",gap:12}}
                onMouseEnter={e=>e.currentTarget.style.background=C.card}
                onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <span style={{width:7,height:7,borderRadius:"50%",background:f.c,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink}}>{ds.name}</div>
                  <div style={{fontFamily:font,fontSize:12,color:C.muted}}>{ds.source} · <TypeBadge type={ds.assetType}/></div>
                </div>
                <span style={{fontFamily:mono,fontSize:11,color:C.faint,flexShrink:0}}>{ds.id}</span>
              </div>
            );})}
          </>}
          {acRes.length>0&&<>
            <div style={{padding:"10px 18px 4px",fontFamily:font,fontSize:10,fontWeight:700,
              letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,background:C.surface}}>
              Actors</div>
            {acRes.map(ac=>(
              <div key={ac.id} onClick={()=>{onNavigate("actor",ac.id);onClose();}}
                style={{padding:"10px 18px",cursor:"pointer",borderBottom:`1px solid ${C.lineL}`,
                  display:"flex",alignItems:"center",gap:12}}
                onMouseEnter={e=>e.currentTarget.style.background=C.card}
                onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <span style={{fontFamily:font,fontSize:13,color:C.faint,width:16,textAlign:"center"}}>
                  {ac.type==="internal"?"◎":"○"}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink}}>{ac.name}</div>
                  <div style={{fontFamily:font,fontSize:12,color:C.muted}}>{ac.role}</div>
                </div>
                <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>{ac.id}</span>
              </div>
            ))}
          </>}
          {qRes.length>0&&<>
            <div style={{padding:"10px 18px 4px",fontFamily:font,fontSize:10,fontWeight:700,
              letterSpacing:"0.12em",textTransform:"uppercase",color:C.muted,background:C.surface}}>
              Saved Queries</div>
            {qRes.map(q=>(
              <div key={q.id} onClick={()=>{onNavigate("query",q.id);onClose();}}
                style={{padding:"10px 18px",cursor:"pointer",borderBottom:`1px solid ${C.lineL}`,
                  display:"flex",alignItems:"center",gap:12}}
                onMouseEnter={e=>e.currentTarget.style.background=C.card}
                onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <span style={{fontFamily:font,fontSize:13,color:C.faint}}>⌕</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink}}>{q.name}</div>
                  <div style={{fontFamily:font,fontSize:12,color:C.muted}}>
                    {q.authorName} · <StateBadge state={q.state}/></div>
                </div>
                <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>{q.id}</span>
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   SQL BOTTOM DRAWER
   Design matches the rest of the app — warm off-white, ink/grey palette,
   same font, same border conventions. No dark terminal aesthetic.

   Three height states:
   - collapsed: 36px tab strip only
   - half: editor fills the drawer, no results (run → full page)
   - full: entire viewport minus header, shows editor + full results table

   The file/schema panel is gone. Instead a small "View dataset →" link
   navigates you to the dataset detail page for schema lookup.
   Results open full-page when you run — no cramped inline view.
══════════════════════════════════════════════════════════════════════ */
const DRAWER_COLLAPSED = "collapsed";
const DRAWER_HALF      = "half";
const DRAWER_FULL      = "full";

/* Drawer button — matches app control style */
const DrawerBtn = ({children, onClick, primary=false, style={}}) => (
  <button onClick={onClick} style={{
    background: primary ? C.ink : C.white,
    border: `1px solid ${primary ? C.ink : C.line}`,
    borderBottom: `1px solid ${primary ? C.ink : C.lineH}`,
    color: primary ? C.white : C.mid,
    fontFamily:font, fontSize:11, fontWeight:600,
    padding:"3px 10px", cursor:"pointer", whiteSpace:"nowrap",
    ...style,
  }}>{children}</button>
);

const SqlDrawer = ({drawerState, setDrawerState, activeQuery, setActiveQuery,
  queries, setQueries, onNavigateDataset}) => {

  const [sql, setSql]           = useState(activeQuery?.sql || "-- Start writing SQL\n");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [hasResults, setHasResults] = useState(false);

  /* The dataset this query targets (for the "View dataset" link) */
  const activeDs = activeQuery?.datasets?.[0]
    ? DATASETS.find(d => d.id === activeQuery.datasets[0])
    : null;

  /* Sync when active query changes from outside */
  useEffect(() => {
    if (activeQuery) {
      setSql(activeQuery.sql);
      setHasResults(false);
      setDrawerState(DRAWER_HALF);
    }
  }, [activeQuery?.id]);

  const heights = {
    [DRAWER_COLLAPSED]: 36,
    [DRAWER_HALF]:      Math.min(300, window.innerHeight * 0.35),
    [DRAWER_FULL]:      window.innerHeight - 116,
  };
  const h = heights[drawerState];

  const handleRun = () => {
    setHasResults(true);
    setDrawerState(DRAWER_FULL);
  };

  const handleSave = () => {
    const now = new Date().toISOString().slice(0, 10);
    if (activeQuery && activeQuery.state !== "saved" && activeQuery.state !== "implemented") {
      const updated = { ...activeQuery, name:saveName||activeQuery.name,
        description:saveDesc, sql, state:"saved", updated:now };
      setQueries(qs => qs.map(q => q.id === updated.id ? updated : q));
      setActiveQuery(updated);
    } else {
      const newQ = {
        id: `Q-${String(queries.length + 1).padStart(3,"0")}`,
        name: saveName || "Untitled query",
        description: saveDesc, sql, state:"saved",
        author: CURRENT_USER.email, authorName: CURRENT_USER.name,
        datasets: activeDs ? [activeDs.id] : [],
        created: now, updated: now, pipelineId: null,
      };
      setQueries(qs => [...qs, newQ]);
      setActiveQuery(newQ);
    }
    setShowSaveForm(false);
    setSaveName(""); setSaveDesc("");
  };

  const handleNew = () => {
    setActiveQuery(null);
    setSql("-- New query\n");
    setHasResults(false);
    setDrawerState(DRAWER_HALF);
  };

  const isDirty   = activeQuery && sql !== activeQuery.sql;
  const queryName = activeQuery
    ? (activeQuery.name + (isDirty ? " *" : ""))
    : (sql.trim().length > 3 ? "Unsaved query" : "SQL Workbench");

  /* ── Split: editor height vs results height in FULL mode ── */
  const editorH  = drawerState === DRAWER_FULL ? Math.floor(h * 0.42) : h - 36;
  const resultsH = drawerState === DRAWER_FULL ? h - editorH - 36 - 1 : 0;

  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:200,
      height:h, transition:"height 0.2s ease",
      display:"flex", flexDirection:"column",
      background:C.white,
      borderTop:`2px solid ${LU.red}`,
      boxShadow:"0 -2px 16px rgba(0,0,0,0.10)",
    }}>

      {/* ── Tab / toolbar strip ── */}
      <div style={{
        height:36, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 16px",
        borderBottom: drawerState !== DRAWER_COLLAPSED
          ? `1px solid ${C.line}` : "none",
        background: C.surface,
        cursor:"pointer",
      }}
        onClick={() => setDrawerState(s =>
          s === DRAWER_COLLAPSED ? DRAWER_HALF : DRAWER_COLLAPSED)}>

        {/* Left: SQL label + query name + state */}
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <span style={{fontFamily:font, fontSize:11, fontWeight:700,
            letterSpacing:"0.12em", textTransform:"uppercase",
            color:LU.red}}>SQL</span>
          <span style={{fontFamily:mono, fontSize:12, color:C.mid}}>
            {queryName}</span>
          {activeQuery && <StateBadge state={activeQuery.state}/>}
          {activeDs && drawerState !== DRAWER_COLLAPSED && (
            <button
              onClick={e => { e.stopPropagation(); onNavigateDataset(activeDs.id); }}
              style={{background:"none", border:"none", cursor:"pointer",
                fontFamily:font, fontSize:11, color:C.muted,
                textDecoration:"underline", padding:0}}>
              View {activeDs.id} →
            </button>
          )}
        </div>

        {/* Right: controls */}
        <div style={{display:"flex", alignItems:"center", gap:6}}
          onClick={e => e.stopPropagation()}>
          {drawerState !== DRAWER_COLLAPSED && <>
            <DrawerBtn onClick={handleNew}>+ New</DrawerBtn>
            <DrawerBtn onClick={() => setShowSaveForm(s => !s)}>
              {activeQuery?.state === "saved" || activeQuery?.state === "implemented"
                ? "Fork & save" : "Save"}
            </DrawerBtn>
            <DrawerBtn primary onClick={handleRun}>▶ Run</DrawerBtn>
            <DrawerBtn onClick={() => setDrawerState(s =>
              s === DRAWER_FULL ? DRAWER_HALF : DRAWER_FULL)}>
              {drawerState === DRAWER_FULL ? "↓" : "↑"}
            </DrawerBtn>
          </>}
          <DrawerBtn onClick={() => setDrawerState(s =>
            s === DRAWER_COLLAPSED ? DRAWER_HALF : DRAWER_COLLAPSED)}>
            {drawerState === DRAWER_COLLAPSED ? "▲" : "▼"}
          </DrawerBtn>
        </div>
      </div>

      {drawerState !== DRAWER_COLLAPSED && (
        <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden"}}>

          {/* Save form — matches app input style */}
          {showSaveForm && (
            <div style={{background:C.card, padding:"10px 16px",
              borderBottom:`1px solid ${C.line}`,
              display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
              <input value={saveName} onChange={e => setSaveName(e.target.value)}
                placeholder="Query name…"
                style={{fontFamily:font, fontSize:13, color:C.ink,
                  background:C.white, border:`1px solid ${C.line}`,
                  borderBottom:`2px solid ${C.lineH}`,
                  padding:"5px 10px", outline:"none", flex:"1 1 180px"}}/>
              <input value={saveDesc} onChange={e => setSaveDesc(e.target.value)}
                placeholder="Description (optional)…"
                style={{fontFamily:font, fontSize:13, color:C.ink,
                  background:C.white, border:`1px solid ${C.line}`,
                  borderBottom:`2px solid ${C.lineH}`,
                  padding:"5px 10px", outline:"none", flex:"2 1 240px"}}/>
              <DrawerBtn primary onClick={handleSave}>Save</DrawerBtn>
              <DrawerBtn onClick={() => setShowSaveForm(false)}>Cancel</DrawerBtn>
            </div>
          )}

          {/* SQL editor — clean, white, same font */}
          <textarea value={sql} onChange={e => setSql(e.target.value)}
            style={{
              display:"block", width:"100%", height:editorH,
              flexShrink:0,
              background:C.page,
              border:"none",
              borderBottom:`1px solid ${C.line}`,
              color:C.ink, fontFamily:mono, fontSize:13,
              padding:"14px 18px", resize:"none", outline:"none",
              lineHeight:1.9, boxSizing:"border-box",
            }}/>

          {/* Results — only visible in FULL mode */}
          {drawerState === DRAWER_FULL && hasResults && (
            <div style={{flex:1, overflowY:"auto", overflowX:"auto",
              background:C.white}}>
              {/* Results header */}
              <div style={{padding:"10px 18px 8px",
                borderBottom:`1px solid ${C.line}`,
                display:"flex", justifyContent:"space-between",
                alignItems:"center", position:"sticky", top:0,
                background:C.white, zIndex:1}}>
                <Eyebrow style={{margin:0}}>Query results</Eyebrow>
                <span style={{fontFamily:font, fontSize:11,
                  fontWeight:600, color:C.ok}}>
                  {MOCK_RESULTS.length} rows · 0.12 s
                </span>
              </div>
              {/* Results table — same style as schema table */}
              <div style={{padding:"0 18px 24px"}}>
                <table style={{width:"100%", borderCollapse:"collapse",
                  fontFamily:font, fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:`2px solid ${C.line}`}}>
                      {Object.keys(MOCK_RESULTS[0]).map(k => (
                        <th key={k} style={{padding:"8px 14px 8px 0",
                          textAlign:"left", fontSize:11, fontWeight:700,
                          letterSpacing:"0.1em", textTransform:"uppercase",
                          color:C.muted}}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_RESULTS.map((row, i) => (
                      <tr key={i} style={{borderBottom:`1px solid ${C.lineL}`}}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} style={{padding:"9px 14px 9px 0",
                            fontFamily:typeof v==="number"?mono:font,
                            fontWeight:typeof v==="number"?600:400,
                            color:C.ink}}>
                            {typeof v==="number"?v.toLocaleString():v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Prompt to run if no results yet */}
          {drawerState === DRAWER_FULL && !hasResults && (
            <div style={{flex:1, display:"flex", alignItems:"center",
              justifyContent:"center", background:C.white}}>
              <span style={{fontFamily:font, fontSize:13, color:C.faint}}>
                Press Run to execute the query</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   QUERY LIBRARY PAGE
   Registry aesthetic. Each entry: name, author, state, linked datasets,
   description, date. Click → opens in drawer.
   Search: name, author, table, column, description.
   Filters: state, author, linked dataset.
══════════════════════════════════════════════════════════════════════ */
const QueryLibrary = ({queries,setQueries,onOpenQuery,mobile}) => {
  const [q,setQ] = useState("");
  const [stateFilter,setStateFilter] = useState("all");
  const [authorFilter,setAuthorFilter] = useState("all");

  const states = ["all","draft","saved","implemented","archived"];
  const authors = ["all",...new Set(queries.map(q=>q.authorName))];

  let list = queries.filter(q=>stateFilter==="all"||q.state===stateFilter);
  list = list.filter(q=>authorFilter==="all"||q.authorName===authorFilter);
  if(q.trim().length>1){
    const ql=q.toLowerCase();
    list = list.filter(query=>
      query.name.toLowerCase().includes(ql)||
      query.description.toLowerCase().includes(ql)||
      query.sql.toLowerCase().includes(ql)||
      query.authorName.toLowerCase().includes(ql)||
      query.datasets.some(id=>{
        const ds=DATASETS.find(d=>d.id===id);
        return ds&&(ds.name.toLowerCase().includes(ql)||
          ds.id.toLowerCase().includes(ql)||
          SCHEMA_FIELDS.some(f=>f.field.toLowerCase().includes(ql)));
      })
    );
  }
  /* Hide archived by default unless explicitly filtered */
  if(stateFilter==="all") list=list.filter(q=>q.state!=="archived");

  return (
    <div>
      <PageTitle section="Query Library · DuckDB WASM" title="Saved Queries"
        sub={`${queries.filter(q=>q.state!=="archived").length} queries · ${queries.filter(q=>q.state==="draft").length} drafts`}
        right={
          <input value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search by name, author, table, column…"
            style={{fontFamily:font,fontSize:13,color:C.ink,background:C.white,
              border:`1px solid ${C.line}`,borderBottom:`2px solid ${C.lineH}`,
              padding:"6px 10px",outline:"none",width:mobile?"100%":240}}/>
        }/>

      {/* Filter strip */}
      <div style={{display:"flex",gap:12,marginBottom:20,
        flexWrap:"wrap",alignItems:"center"}}>
        {/* State filter */}
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.line}`,
          overflowX:"auto",scrollbarWidth:"none"}}>
          {states.map(s=>{
            const active=stateFilter===s;
            const label=s==="all"?"All states":QUERY_STATES[s]?.label||s;
            return <button key={s} onClick={()=>setStateFilter(s)} style={{
              background:"none",border:"none",
              borderBottom:active?`2px solid ${C.ink}`:"2px solid transparent",
              color:active?C.ink:C.muted,fontFamily:font,fontSize:13,
              fontWeight:active?600:400,padding:"7px 14px 7px 0",
              marginRight:4,marginBottom:-1,cursor:"pointer",whiteSpace:"nowrap",
              flexShrink:0}}>{label}</button>;
          })}
        </div>
        {/* Author filter */}
        <select value={authorFilter} onChange={e=>setAuthorFilter(e.target.value)}
          style={{fontFamily:font,fontSize:13,color:C.ink,background:C.white,
            border:`1px solid ${C.line}`,borderBottom:`2px solid ${C.lineH}`,
            padding:"5px 8px",outline:"none",cursor:"pointer"}}>
          {authors.map(a=>(
            <option key={a} value={a}>{a==="all"?"All authors":a}</option>
          ))}
        </select>
      </div>

      {/* Query entries */}
      {list.length===0
        ?<Notice type="info">No queries match this filter. {stateFilter==="all"&&
            <span>Archived queries are hidden — set filter to "Archived" to view them.</span>}</Notice>
        :list.map((query,i,arr)=>{
          const linkedDs=query.datasets.map(id=>DATASETS.find(d=>d.id===id)).filter(Boolean);
          const pipeline=PIPELINES.find(p=>p.id===query.pipelineId);
          return (
            <div key={query.id}
              onClick={()=>onOpenQuery(query)}
              style={{display:"grid",gridTemplateColumns:"10px 1fr",gap:"0 18px",
                marginBottom:6,cursor:"pointer"}}
              onMouseEnter={e=>{const el=e.currentTarget.querySelector(".qcard");if(el)el.style.background=C.white;}}
              onMouseLeave={e=>{const el=e.currentTarget.querySelector(".qcard");if(el)el.style.background=C.card;}}>
              {/* Left thread — accent colour by state */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:18}}>
                <div style={{width:9,height:9,borderRadius:"50%",flexShrink:0,
                  background:QUERY_STATES[query.state]?.color||C.muted,
                  boxShadow:`0 0 0 2px ${QUERY_STATES[query.state]?.bg||C.surface}`}}/>
                <div style={{width:1,flex:1,background:C.lineL,marginTop:6}}/>
              </div>
              <div className="qcard" style={{background:C.card,border:`1px solid ${C.line}`,
                borderLeft:`3px solid ${QUERY_STATES[query.state]?.color||C.lineL}`,
                padding:"14px 16px 14px 18px",transition:"background 0.12s"}}>
                {/* Reference line */}
                <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                  <span style={{fontFamily:mono,fontSize:11,color:C.muted}}>{query.id}</span>
                  <span style={{fontFamily:font,fontSize:11,color:C.muted}}>{query.authorName}</span>
                  <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>{query.updated}</span>
                  <StateBadge state={query.state}/>
                  {pipeline&&<span style={{fontFamily:font,fontSize:11,fontWeight:600,
                    color:"#1A4A7A",background:"#EEF2FA",padding:"2px 7px"}}>
                    ⚙ {pipeline.name}</span>}
                </div>
                {/* Name */}
                <div style={{fontFamily:font,fontSize:16,fontWeight:700,color:C.ink,
                  marginBottom:5,letterSpacing:"-0.01em",lineHeight:1.3}}>{query.name}</div>
                {/* Description */}
                {query.description&&<div style={{fontFamily:font,fontSize:13,color:C.mid,
                  lineHeight:1.65,marginBottom:8}}>{query.description}</div>}
                {/* SQL preview */}
                <div style={{fontFamily:mono,fontSize:11,color:C.muted,
                  lineHeight:1.5,marginBottom:10,
                  overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",
                  background:C.surface,padding:"6px 10px"}}>
                  {query.sql.split("\n")[0]}
                </div>
                {/* Footer */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",
                  paddingTop:10,borderTop:`1px solid ${C.lineL}`}}>
                  {linkedDs.map(ds=>(
                    <span key={ds.id} style={{fontFamily:font,fontSize:11,color:C.faint}}>
                      {ds.id} · {ds.name}</span>
                  ))}
                  <span style={{marginLeft:"auto",fontFamily:font,fontSize:12,
                    fontWeight:600,color:C.mid}}>Open in SQL →</span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   PAGES — Overview, Datasets, DatasetDetail, Actors, ActorDetail
══════════════════════════════════════════════════════════════════════ */

function Overview({mobile,onNavigate}) {
  const stale=DATASETS.filter(d=>d.lastReceived>30);
  const ageing=DATASETS.filter(d=>d.lastReceived>7&&d.lastReceived<=30);
  const del=ACTIVITIES.filter(a=>a.type==="delivery").length;
  const mand=ACTIVITIES.filter(a=>a.tags.includes("mobility-planning")).length;
  return (
    <div>
      <PageTitle section="Data Catalogue · Operations" title="Observatory Overview"
        sub={`Reference date: ${new Date().toLocaleDateString("en-GB",
          {day:"2-digit",month:"long",year:"numeric"})}`}/>
      {stale.length>0&&<Notice type="danger"
        title={`${stale.length} source${stale.length>1?"s":""} require attention`}>
        {stale.map(d=>d.name).join("; ")} — last received more than 30 days ago.
      </Notice>}
      {!stale.length&&ageing.length>0&&<Notice type="warning">
        {ageing.map(d=>d.name).join("; ")} — approaching 30 days since last receipt.
      </Notice>}
      <div style={{display:"flex",flexWrap:"wrap",paddingBottom:4,
        borderBottom:`1px solid ${C.line}`,marginBottom:32}}>
        <Stat n={DATASETS.length} label="Registered assets"/>
        <Stat n={stale.length}    label="Outdated sources"/>
        <Stat n={del}             label="Deliveries made"/>
        <Stat n={mand}            label="Mandate activities"/>
      </div>
      <div style={{display:"grid",
        gridTemplateColumns:mobile?"1fr":"1.5fr 1fr",gap:48}}>
        <div>
          <Eyebrow style={{marginTop:0}}>Source freshness</Eyebrow>
          {DATASETS.filter(d=>d.assetType==="source"||d.assetType==="geodata")
            .map((ds,i,arr)=>{
              const f=freshCfg(ds.lastReceived);
              return (
                <div key={ds.id} onClick={()=>onNavigate("dataset",ds.id)}
                  style={{display:"flex",alignItems:"baseline",gap:12,
                    padding:"10px 0",cursor:"pointer",
                    borderBottom:i<arr.length-1?`1px solid ${C.lineL}`:"none"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:f.c,
                    flexShrink:0,display:"inline-block",position:"relative",top:1}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{fontFamily:font,fontSize:13,fontWeight:600,color:C.ink}}>
                      {ds.name}</span>
                    <span style={{fontFamily:font,fontSize:12,color:C.muted,marginLeft:8}}>
                      {ds.source}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                    <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>{ds.updated}</span>
                    <span style={{fontFamily:font,fontSize:12,fontWeight:500,color:f.c}}>
                      {f.label}</span>
                  </div>
                </div>
              );
            })}
        </div>
        <div>
          <Eyebrow style={{marginTop:0}}>Recent activity</Eyebrow>
          {ACTIVITIES.slice(0,5).map((ev,i)=>(
            <ActivityEntry key={ev.id} ev={ev} last={i===4}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Saved filter presets (in-memory, would persist to PostgREST) ── */
const FILTER_PRESETS = [
  {id:"P-001", name:"Stale sources",
   filters:{assetTypes:["source","geodata"],freshness:["outdated","ageing"],
     sources:[],agents:[],hasSchema:null,mandate:null,bucket:null}},
  {id:"P-002", name:"Mandate outputs",
   filters:{assetTypes:["output","dashboard"],freshness:[],
     sources:[],agents:[],hasSchema:null,mandate:true,bucket:null}},
];

/* Derive filterable facets from the dataset catalogue */
const ALL_SOURCES  = [...new Set(DATASETS.map(d=>d.source))].sort();
const ALL_AGENTS   = [...new Set(ACTIVITIES.map(a=>a.actor))].sort();
const ALL_BUCKETS  = ["bronze","silver","gold","outputs"];
const FRESHNESS_OPTS = [{id:"current",label:"Current"},
  {id:"ageing",label:"Ageing"},{id:"outdated",label:"Outdated"}];

const EMPTY_FILTERS = {
  assetTypes:[], sources:[], agents:[], freshness:[],
  hasSchema:null, mandate:null, bucket:null,
};

function DatasetsPage({mobile,onSelect,onOpenSql,onRegister}) {
  const [q,setQ]               = useState("");
  const [panelOpen,setPanelOpen]= useState(false);
  const [filters,setFilters]    = useState(EMPTY_FILTERS);
  const [presets,setPresets]    = useState(FILTER_PRESETS);
  const [savePresetName,setSavePresetName] = useState("");
  const [showSavePreset,setShowSavePreset] = useState(false);

  /* ── Apply all filters ── */
  let list = DATASETS.filter(d => {
    const ql = q.toLowerCase();
    if (ql && !d.name.toLowerCase().includes(ql) &&
               !d.source.toLowerCase().includes(ql) &&
               !d.id.toLowerCase().includes(ql) &&
               !d.tags.some(t=>t.toLowerCase().includes(ql))) return false;
    if (filters.assetTypes.length && !filters.assetTypes.includes(d.assetType)) return false;
    if (filters.sources.length && !filters.sources.includes(d.source)) return false;
    if (filters.hasSchema !== null && d.hasCsvw !== filters.hasSchema) return false;
    if (filters.mandate === true) {
      const hasMandateAct = ACTIVITIES.some(a =>
        (a.inputs.includes(d.name)||a.outputs.includes(d.name)) &&
        a.tags.includes("mobility-planning"));
      if (!hasMandateAct) return false;
    }
    if (filters.freshness.length) {
      const f = freshCfg(d.lastReceived).label.toLowerCase();
      if (!filters.freshness.includes(f)) return false;
    }
    if (filters.agents.length) {
      const dsActs = ACTIVITIES.filter(a =>
        a.inputs.includes(d.name)||a.outputs.includes(d.name));
      if (!dsActs.some(a => filters.agents.includes(a.actor))) return false;
    }
    return true;
  });

  /* ── Count active filter dimensions ── */
  const activeCount = [
    filters.assetTypes.length,
    filters.sources.length,
    filters.agents.length,
    filters.freshness.length,
    filters.hasSchema!==null?1:0,
    filters.mandate!==null?1:0,
    filters.bucket!==null?1:0,
  ].reduce((a,b)=>a+b,0);

  /* ── Facet counts (for display) ── */
  const countFor = (fn) => DATASETS.filter(fn).length;

  /* ── Toggle a multi-value filter ── */
  const toggle = (key, val) => setFilters(f => ({
    ...f,
    [key]: f[key].includes(val)
      ? f[key].filter(x=>x!==val)
      : [...f[key], val],
  }));

  /* ── Active filter tags ── */
  const activeTags = [
    ...filters.assetTypes.map(v=>({key:"assetTypes",val:v,label:`Type: ${v}`})),
    ...filters.sources.map(v=>({key:"sources",val:v,label:`Source: ${v}`})),
    ...filters.agents.map(v=>({key:"agents",val:v,label:`Agent: ${v}`})),
    ...filters.freshness.map(v=>({key:"freshness",val:v,label:`Freshness: ${v}`})),
    ...(filters.hasSchema!==null?[{key:"hasSchema",val:null,
      label:filters.hasSchema?"Has schema":"No schema"}]:[]),
    ...(filters.mandate?[{key:"mandate",val:null,label:"Mandate only"}]:[]),
    ...(filters.bucket?[{key:"bucket",val:null,label:`Bucket: ${filters.bucket}`}]:[]),
  ];

  const removeTag = tag => {
    if (tag.val !== null) toggle(tag.key, tag.val);
    else setFilters(f=>({...f,[tag.key]:null}));
  };

  /* ── Filter panel section heading ── */
  const PanelSection = ({title,children}) => (
    <div style={{marginBottom:18}}>
      <div style={{fontFamily:font,fontSize:10,fontWeight:700,
        letterSpacing:"0.12em",textTransform:"uppercase",
        color:C.muted,marginBottom:8,paddingBottom:5,
        borderBottom:`1px solid ${C.lineL}`}}>{title}</div>
      {children}
    </div>
  );

  /* ── Checkbox row with count ── */
  const CheckRow = ({label,checked,onChange,count}) => (
    <div onClick={onChange}
      style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",
        cursor:"pointer",userSelect:"none"}}
      onMouseEnter={e=>e.currentTarget.style.background="#F2F2EF"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{width:12,height:12,flexShrink:0,
        border:`1px solid ${checked?C.ink:C.lineH}`,
        background:checked?C.ink:"transparent",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        {checked&&<span style={{color:C.white,fontSize:10,lineHeight:1}}>✓</span>}
      </div>
      <span style={{fontFamily:font,fontSize:13,color:checked?C.ink:C.soft,
        flex:1,fontWeight:checked?600:400}}>{label}</span>
      {count!==undefined&&(
        <span style={{fontFamily:mono,fontSize:11,color:C.faint}}>{count}</span>
      )}
    </div>
  );

  /* ── Multi-select dropdown ──────────────────────────────────────────────
     For longer lists. Type to filter options. Selected items shown as
     removable tags. Counts shown next to each option.
  ────────────────────────────────────────────────────────────────────── */
  const MultiSelectDropdown = ({options, selected, onToggle, placeholder="Search…"}) => {
    const [q, setQ]       = useState("");
    const [open, setOpen] = useState(false);
    const filtered = q.trim()
      ? options.filter(o=>o.label.toLowerCase().includes(q.toLowerCase()))
      : options;
    return (
      <div style={{position:"relative"}}>
        {/* Selected tags */}
        {selected.length>0&&(
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
            {selected.map(val=>{
              const opt = options.find(o=>o.value===val);
              return (
                <span key={val} style={{display:"inline-flex",alignItems:"center",
                  gap:4,background:C.card,border:`1px solid ${C.lineH}`,
                  padding:"2px 6px 2px 8px",fontFamily:font,fontSize:11,color:C.ink}}>
                  {opt?.label||val}
                  <button onClick={()=>onToggle(val)}
                    style={{background:"none",border:"none",cursor:"pointer",
                      color:C.muted,fontSize:13,lineHeight:1,
                      padding:0,fontFamily:font}}>×</button>
                </span>
              );
            })}
          </div>
        )}
        {/* Trigger input */}
        <input value={q}
          onChange={e=>{setQ(e.target.value);setOpen(true);}}
          onFocus={()=>setOpen(true)}
          onBlur={()=>setTimeout(()=>setOpen(false),150)}
          placeholder={selected.length>0?"Add more…":placeholder}
          style={{fontFamily:font,fontSize:12,color:C.ink,
            background:C.white,border:`1px solid ${C.line}`,
            borderBottom:`2px solid ${C.lineH}`,
            padding:"5px 8px",outline:"none",
            width:"100%",boxSizing:"border-box"}}/>
        {/* Dropdown */}
        {open&&filtered.length>0&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,
            background:C.white,border:`1px solid ${C.lineH}`,
            borderTop:"none",zIndex:50,
            maxHeight:180,overflowY:"auto",
            boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            {filtered.map(opt=>{
              const on = selected.includes(opt.value);
              return (
                <div key={opt.value}
                  onMouseDown={()=>{onToggle(opt.value);setQ("");}}
                  style={{display:"flex",alignItems:"center",gap:8,
                    padding:"7px 10px",cursor:"pointer",
                    background:on?C.surface:C.white,
                    borderBottom:`1px solid ${C.lineL}`}}
                  onMouseEnter={e=>{if(!on)e.currentTarget.style.background=C.card;}}
                  onMouseLeave={e=>{if(!on)e.currentTarget.style.background=on?C.surface:C.white;}}>
                  <div style={{width:11,height:11,flexShrink:0,
                    border:`1px solid ${on?C.ink:C.lineH}`,
                    background:on?C.ink:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {on&&<span style={{color:C.white,fontSize:8,lineHeight:1}}>✓</span>}
                  </div>
                  <span style={{fontFamily:font,fontSize:12,flex:1,
                    color:on?C.muted:C.ink,fontWeight:on?400:400}}>{opt.label}</span>
                  {opt.count!==undefined&&(
                    <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>
                      {opt.count}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const staleN = list.filter(d=>d.lastReceived>30).length;

  return (
    <div>
      {/* ── Page title + controls row ── */}
      <PageTitle section="Data Catalogue · DCAT-AP" title="Data Assets"
        sub={`${list.length} of ${DATASETS.length} assets`}
        right={
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Search…"
              style={{fontFamily:font,fontSize:13,color:C.ink,
                background:C.white,border:`1px solid ${C.line}`,
                borderBottom:`2px solid ${C.lineH}`,
                padding:"6px 10px",outline:"none",width:160}}/>
            <button onClick={()=>setPanelOpen(p=>!p)}
              style={{background:panelOpen||activeCount>0?C.ink:C.white,
                border:`1px solid ${panelOpen||activeCount>0?C.ink:C.line}`,
                borderBottom:`1px solid ${panelOpen||activeCount>0?C.ink:C.lineH}`,
                color:panelOpen||activeCount>0?C.white:C.mid,
                fontFamily:font,fontSize:12,fontWeight:600,
                padding:"6px 12px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span>Filter</span>
              {activeCount>0&&(
                <span style={{background:LU.red,color:C.white,
                  fontFamily:font,fontSize:10,fontWeight:700,
                  padding:"1px 5px",borderRadius:"50%"}}>
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        }/>

      {/* ── Active filter tags strip ── */}
      {activeTags.length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",
          marginBottom:14,alignItems:"center"}}>
          {activeTags.map((tag,i)=>(
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:5,
              fontFamily:font,fontSize:12,color:C.ink,
              background:C.card,border:`1px solid ${C.lineH}`,
              padding:"3px 8px"}}>
              {tag.label}
              <button onClick={()=>removeTag(tag)}
                style={{background:"none",border:"none",cursor:"pointer",
                  color:C.muted,fontSize:14,lineHeight:1,padding:0,
                  fontFamily:font}}>×</button>
            </span>
          ))}
          <button onClick={()=>setFilters(EMPTY_FILTERS)}
            style={{background:"none",border:"none",cursor:"pointer",
              fontFamily:font,fontSize:12,color:C.muted,padding:"3px 0",
              textDecoration:"underline"}}>
            Clear all
          </button>
        </div>
      )}

      {/* ── Layout: filter panel + results ── */}
      <div style={{display:"grid",
        gridTemplateColumns:panelOpen&&!mobile?"240px 1fr":"1fr",
        gap:28,alignItems:"start"}}>

        {/* ── Filter panel ── */}
        {panelOpen&&(
          <div style={{background:C.white,border:`1px solid ${C.line}`,
            padding:"18px 16px",position:mobile?"relative":"sticky",top:mobile?0:20}}>

            {/* Presets */}
            <PanelSection title="Saved filters">
              {presets.map(p=>(
                <div key={p.id}
                  onClick={()=>setFilters(p.filters)}
                  style={{display:"flex",alignItems:"center",gap:8,
                    padding:"5px 0",cursor:"pointer",userSelect:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#F2F2EF"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontFamily:font,fontSize:12,color:C.mid,
                    flex:1}}>{p.name}</span>
                  <span style={{fontFamily:font,fontSize:11,color:C.faint}}>
                    Apply →</span>
                </div>
              ))}
              {showSavePreset?(
                <div style={{marginTop:8,display:"flex",gap:6}}>
                  <input value={savePresetName}
                    onChange={e=>setSavePresetName(e.target.value)}
                    placeholder="Preset name…"
                    autoFocus
                    style={{fontFamily:font,fontSize:12,color:C.ink,
                      background:C.white,border:`1px solid ${C.line}`,
                      borderBottom:`2px solid ${C.lineH}`,
                      padding:"4px 8px",outline:"none",flex:1}}/>
                  <button onClick={()=>{
                    if(savePresetName.trim()){
                      setPresets(ps=>[...ps,{
                        id:`P-${String(ps.length+1).padStart(3,"0")}`,
                        name:savePresetName.trim(),
                        filters:{...filters},
                      }]);
                    }
                    setSavePresetName("");setShowSavePreset(false);
                  }} style={{background:C.ink,border:"none",color:C.white,
                    fontFamily:font,fontSize:11,fontWeight:600,
                    padding:"4px 8px",cursor:"pointer"}}>Save</button>
                </div>
              ):(
                <button onClick={()=>setShowSavePreset(true)}
                  style={{background:"none",border:"none",cursor:"pointer",
                    fontFamily:font,fontSize:12,color:C.muted,
                    padding:"5px 0",textDecoration:"underline",
                    display:"block",marginTop:4}}>
                  + Save current filters
                </button>
              )}
            </PanelSection>

            {/* Asset type */}
            <PanelSection title="Asset type">
              {ASSET_TYPES.filter(t=>t.id!=="all").map(t=>(
                <CheckRow key={t.id} label={t.label}
                  checked={filters.assetTypes.includes(t.id)}
                  onChange={()=>toggle("assetTypes",t.id)}
                  count={countFor(d=>d.assetType===t.id)}/>
              ))}
            </PanelSection>

            {/* Freshness */}
            <PanelSection title="Freshness">
              {FRESHNESS_OPTS.map(f=>(
                <CheckRow key={f.id} label={f.label}
                  checked={filters.freshness.includes(f.id)}
                  onChange={()=>toggle("freshness",f.id)}
                  count={countFor(d=>freshCfg(d.lastReceived).label.toLowerCase()===f.id)}/>
              ))}
            </PanelSection>

            {/* Source — dropdown (list can grow) */}
            <PanelSection title="Source">
              <MultiSelectDropdown
                options={ALL_SOURCES.map(s=>({
                  value:s, label:s,
                  count:countFor(d=>d.source===s),
                }))}
                selected={filters.sources}
                onToggle={v=>toggle("sources",v)}
                placeholder="Search sources…"
              />
            </PanelSection>

            {/* Agent — dropdown */}
            <PanelSection title="Producing agent">
              <MultiSelectDropdown
                options={ALL_AGENTS.map(a=>({
                  value:a, label:a,
                  count:countFor(d=>ACTIVITIES.some(ev=>
                    ev.outputs.includes(d.name)&&ev.actor===a)),
                }))}
                selected={filters.agents}
                onToggle={v=>toggle("agents",v)}
                placeholder="Search agents…"
              />
            </PanelSection>

            {/* Schema */}
            <PanelSection title="Schema">
              <CheckRow label="Has schema (CSVW)"
                checked={filters.hasSchema===true}
                onChange={()=>setFilters(f=>({...f,
                  hasSchema:f.hasSchema===true?null:true}))}
                count={countFor(d=>d.hasCsvw)}/>
              <CheckRow label="No schema defined"
                checked={filters.hasSchema===false}
                onChange={()=>setFilters(f=>({...f,
                  hasSchema:f.hasSchema===false?null:false}))}
                count={countFor(d=>!d.hasCsvw)}/>
            </PanelSection>

            {/* Mandate */}
            <PanelSection title="Legal mandate">
              <CheckRow label="Mobility-planning mandate"
                checked={filters.mandate===true}
                onChange={()=>setFilters(f=>({...f,
                  mandate:f.mandate===true?null:true}))}
                count={countFor(d=>ACTIVITIES.some(a=>
                  (a.inputs.includes(d.name)||a.outputs.includes(d.name))&&
                  a.tags.includes("mobility-planning")))}/>
            </PanelSection>

            {/* Storage bucket */}
            <PanelSection title="Storage location">
              {ALL_BUCKETS.map(b=>(
                <CheckRow key={b} label={`s3://odm-${b}/`}
                  checked={filters.bucket===b}
                  onChange={()=>setFilters(f=>({...f,
                    bucket:f.bucket===b?null:b}))}/>
              ))}
            </PanelSection>

            <button onClick={()=>setFilters(EMPTY_FILTERS)}
              style={{background:"none",border:`1px solid ${C.line}`,
                borderBottom:`2px solid ${C.lineH}`,
                fontFamily:font,fontSize:12,fontWeight:500,
                color:C.muted,padding:"5px 12px",cursor:"pointer",
                width:"100%",marginTop:4}}>
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Results ── */}
        <div>
          {/* Register button */}
          <div style={{marginBottom:14}}>
            <button onClick={onRegister}
              style={{background:C.ink,border:"none",color:C.white,
                fontFamily:font,fontSize:12,fontWeight:600,
                padding:"7px 16px",cursor:"pointer"}}>
              + Register asset
            </button>
          </div>

          {staleN>0&&(
            <Notice type="danger">
              {staleN} asset{staleN>1?"s":""} in this view have not been
              refreshed in over 30 days.
            </Notice>
          )}

          {list.length===0
            ?<Notice type="info">
              No assets match{activeCount>0?" these filters":""}.
              {activeCount>0&&<span> <button onClick={()=>setFilters(EMPTY_FILTERS)}
                style={{background:"none",border:"none",cursor:"pointer",
                  fontFamily:font,fontSize:13,color:C.mid,
                  textDecoration:"underline",padding:0}}>
                Clear filters</button></span>}
            </Notice>
            :list.map(ds=>(
              <DatasetEntry key={ds.id} ds={ds} onClick={()=>onSelect(ds)}
                onOpenSql={onOpenSql}/>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ── In-memory dissemination store ── */
const DISSEMINATIONS_STORE = [
  {id:"DIS-001",datasetId:"DS-007",date:"2025-03-15",channel:"MFT",
   recipient:"ARE — Federal Roads Office",recipientId:"AC-002",
   answeredQuestion:"Is modal split in ZH shifting toward cycling post-2020?",
   description:"Quarterly modal split report delivered for national monitoring.",
   tags:["mobility-planning","modal-split"],author:"nadine@idm.lu",authorName:"Nadine Hess"},
  {id:"DIS-002",datasetId:"DS-007",date:"2025-01-10",channel:"Email",
   recipient:"Canton ZH — Planning Office",recipientId:null,
   answeredQuestion:"What share of trips in ZH are made by active modes?",
   description:"Ad-hoc response ahead of cantonal transport plan revision.",
   tags:["active-modes","cantonal-planning"],author:"nadine@idm.lu",authorName:"Nadine Hess"},
];

const ODM_CHANNELS = [
  {id:"MFT",label:"MFT — Automated transfer"},
  {id:"OTX",label:"OTX — Manual transfer"},
  {id:"Email",label:"Email"},
  {id:"Dashboard",label:"Dashboard"},
  {id:"API",label:"API / direct query"},
  {id:"Publication",label:"Report / publication"},
];

function DatasetDetail({ds,mobile,onBack,onActor,onOpenSql,queries}) {
  const [tab,setTab]=useState("info");
  const [editing,setEditing]=useState(false);
  const [editForm,setEditForm]=useState({
    name:ds.name, description:ds.description,
    source:ds.source, tags:ds.tags.join(", "),
  });
  const handleEditSave = () => {
    /* In production: PATCH /datasets?id=eq.{ds.id} via PostgREST */
    Object.assign(ds, {
      name: editForm.name.trim()||ds.name,
      description: editForm.description.trim(),
      source: editForm.source.trim()||ds.source,
      tags: editForm.tags.split(",").map(t=>t.trim()).filter(Boolean),
    });
    setEditing(false);
  };
  const f=freshCfg(ds.lastReceived);
  const acts=ACTIVITIES.filter(a=>a.inputs?.includes(ds.name)||a.outputs?.includes(ds.name));
  const pipeline=ds.pipelineId?PIPELINES.find(p=>p.id===ds.pipelineId):null;
  const pipelineQuery=pipeline?.queryId?queries.find(q=>q.id===pipeline.queryId):null;

  /* Dissemination form */
  const [disseminations,setDisseminations]=useState(
    DISSEMINATIONS_STORE.filter(d=>d.datasetId===ds.id)
  );
  const [showDissForm,setShowDissForm]=useState(false);
  const emptyForm={channel:"MFT",recipient:"",answeredQuestion:"",description:"",tags:""};
  const [dissForm,setDissForm]=useState(emptyForm);
  const [dissErr,setDissErr]=useState("");

  const handleDissSubmit=()=>{
    if(!dissForm.answeredQuestion.trim()){setDissErr("'What question did this answer?' is required.");return;}
    if(!dissForm.recipient.trim()){setDissErr("Recipient is required.");return;}
    const d={
      id:`DIS-${String(disseminations.length+1).padStart(3,"0")}`,
      datasetId:ds.id, date:new Date().toISOString().slice(0,10),
      channel:dissForm.channel, recipient:dissForm.recipient, recipientId:null,
      answeredQuestion:dissForm.answeredQuestion, description:dissForm.description,
      tags:dissForm.tags.split(",").map(t=>t.trim()).filter(Boolean),
      author:CURRENT_USER.email, authorName:CURRENT_USER.name,
    };
    setDisseminations(prev=>[d,...prev]);
    setShowDissForm(false); setDissForm(emptyForm); setDissErr("");
  };
  return (
    <div>
      <div style={{fontFamily:font,fontSize:12,color:C.muted,marginBottom:18,
        display:"flex",alignItems:"center",gap:6}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",
          fontFamily:font,fontSize:12,fontWeight:600,color:C.mid,padding:0}}>
          Data Assets</button>
        <span>›</span>
        <span style={{fontFamily:mono,fontSize:11}}>{ds.id}</span>
        <span>›</span>
        <span style={{color:C.ink}}>{ds.name}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"10px 1fr",gap:"0 18px",marginBottom:24}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:14}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:f.c,
            flexShrink:0,boxShadow:`0 0 0 2px ${f.bg}`}}/>
          <div style={{width:1,flex:1,background:C.lineL,marginTop:6}}/>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.line}`,
          borderLeft:`3px solid ${f.c}`,padding:"16px 20px"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:mono,fontSize:11,color:C.muted}}>{ds.id}</span>
            <button onClick={()=>ds.sourceId&&onActor(ds.sourceId)}
              style={{background:"none",border:"none",cursor:"pointer",fontFamily:font,
                fontSize:11,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",
                color:C.mid,textDecoration:"underline",padding:0}}>
              {ds.source}</button>
            <TypeBadge type={ds.assetType}/>
            <span style={{fontFamily:font,fontSize:11,fontWeight:600,color:f.c}}>{f.label}</span>
            {ds.hasCsvw?<InlineTag ok>Schema</InlineTag>:<InlineTag warn>No schema</InlineTag>}
            {pipeline&&<span style={{fontFamily:font,fontSize:11,fontWeight:600,
              color:"#1A4A7A",background:"#EEF2FA",padding:"2px 7px"}}>
              ⚙ {pipeline.name}</span>}
          </div>
          <h1 style={{fontFamily:font,fontSize:mobile?20:22,fontWeight:700,color:C.ink,
            margin:"0 0 8px 0",letterSpacing:"-0.015em",lineHeight:1.2}}>{ds.name}</h1>
          <p style={{fontFamily:font,fontSize:14,color:C.mid,
            margin:"0 0 12px 0",lineHeight:1.7,maxWidth:560}}>{ds.description}</p>
          {/* Pipeline → query link */}
          {pipelineQuery&&(
            <div style={{marginBottom:12,padding:"10px 14px",
              background:C.surface,borderLeft:`3px solid #1A4A7A`,
              display:"flex",alignItems:"center",gap:12,justifyContent:"space-between",
              flexWrap:"wrap"}}>
              <div>
                <div style={{fontFamily:font,fontSize:11,fontWeight:700,
                  letterSpacing:"0.08em",textTransform:"uppercase",
                  color:"#1A4A7A",marginBottom:3}}>
                  Created by pipeline · {pipeline.name}</div>
                <div style={{fontFamily:font,fontSize:13,color:C.soft}}>
                  Query: <em>{pipelineQuery.name}</em></div>
              </div>
              <button onClick={()=>onOpenSql(null,pipelineQuery)}
                style={{background:"none",border:`1px solid ${C.line}`,
                  fontFamily:font,fontSize:11,fontWeight:600,color:C.mid,
                  padding:"3px 10px",cursor:"pointer",whiteSpace:"nowrap"}}>
                Open query in SQL ⌕</button>
            </div>
          )}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {ds.tags.map(t=>(
              <span key={t} style={{fontFamily:font,fontSize:11,color:C.faint}}>{t}</span>
            ))}
            <div style={{marginLeft:"auto",display:"flex",gap:12,alignItems:"center"}}>
              {ds.hasCsvw&&<button onClick={()=>onOpenSql(ds)}
                style={{background:"none",border:`1px solid ${C.line}`,
                  fontFamily:font,fontSize:12,fontWeight:600,color:C.mid,
                  padding:"4px 12px",cursor:"pointer"}}>
                Open in SQL ⌕</button>}
              {!mobile&&<div style={{display:"flex",gap:28}}>
                {[["Outputs",ds.outputs],["Activities",acts.length]].map(([l,v])=>(
                  <div key={l} style={{textAlign:"right"}}>
                    <div style={{fontFamily:font,fontSize:22,fontWeight:700,color:C.ink,
                      lineHeight:1,letterSpacing:"-0.02em"}}>{v}</div>
                    <div style={{fontFamily:font,fontSize:10,fontWeight:700,
                      letterSpacing:"0.1em",textTransform:"uppercase",
                      color:C.muted,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>}
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={[{id:"info",label:"Information"},{id:"schema",label:"Schema"},
        {id:"lineage",label:"Lineage"},{id:"provenance",label:"Provenance"}]}
        active={tab} onChange={setTab}/>

      {tab==="info"&&(()=>{
        /* Editable fields: name, description, source, tags.
           Read-only: id, assetType, lastReceived, outputs, schema.
           Edit button flips to inline form; Save PATCHes PostgREST. */
        const inputStyle = {
          fontFamily:font, fontSize:14, color:C.ink,
          background:C.white, border:`1px solid ${C.line}`,
          borderBottom:`2px solid ${C.lineH}`,
          padding:"5px 8px", outline:"none",
          width:"100%", boxSizing:"border-box",
        };
        const FieldLabel = ({children}) => (
          <div style={{fontFamily:font,fontSize:11,fontWeight:700,
            letterSpacing:"0.09em",textTransform:"uppercase",
            color:C.muted,marginBottom:5}}>{children}</div>
        );
        const FieldVal = ({children}) => (
          <div style={{fontFamily:font,fontSize:14,color:C.ink,fontWeight:500}}>
            {children}</div>
        );
        const Cell = ({children,span=false}) => (
          <div style={{padding:"12px 0",borderBottom:`1px solid ${C.lineL}`,
            paddingRight:28,gridColumn:span?"1 / -1":undefined}}>
            {children}
          </div>
        );

        return (
          <div>
            {/* Edit / Save / Cancel controls */}
            <div style={{display:"flex",justifyContent:"flex-end",
              gap:8,marginBottom:16}}>
              {!editing ? (
                <button onClick={()=>setEditing(true)}
                  style={{background:"none",border:`1px solid ${C.line}`,
                    borderBottom:`2px solid ${C.lineH}`,
                    fontFamily:font,fontSize:12,fontWeight:600,
                    color:C.mid,padding:"5px 14px",cursor:"pointer"}}>
                  Edit
                </button>
              ) : (
                <>
                  <button onClick={()=>{setEditing(false);setEditForm({
                      name:ds.name,description:ds.description,
                      source:ds.source,tags:ds.tags.join(", "),
                    });}}
                    style={{background:"none",border:`1px solid ${C.line}`,
                      borderBottom:`2px solid ${C.lineH}`,
                      fontFamily:font,fontSize:12,fontWeight:500,
                      color:C.muted,padding:"5px 14px",cursor:"pointer"}}>
                    Cancel
                  </button>
                  <button onClick={handleEditSave}
                    style={{background:C.ink,border:"none",color:C.white,
                      fontFamily:font,fontSize:12,fontWeight:600,
                      padding:"5px 14px",cursor:"pointer"}}>
                    Save
                  </button>
                </>
              )}
            </div>

            <div style={{display:"grid",
              gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:0}}>

              {/* Editable: name */}
              <Cell span>
                <FieldLabel>Name</FieldLabel>
                {editing
                  ? <input value={editForm.name}
                      onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}
                      style={inputStyle}/>
                  : <FieldVal>{ds.name}</FieldVal>
                }
              </Cell>

              {/* Editable: description */}
              <Cell span>
                <FieldLabel>Description</FieldLabel>
                {editing
                  ? <textarea value={editForm.description} rows={3}
                      onChange={e=>setEditForm(f=>({...f,description:e.target.value}))}
                      style={{...inputStyle,resize:"vertical",lineHeight:1.5}}/>
                  : <FieldVal>{ds.description}</FieldVal>
                }
              </Cell>

              {/* Editable: source */}
              <Cell>
                <FieldLabel>Source organisation</FieldLabel>
                {editing
                  ? <input value={editForm.source}
                      onChange={e=>setEditForm(f=>({...f,source:e.target.value}))}
                      style={inputStyle}/>
                  : <FieldVal>{ds.source}</FieldVal>
                }
              </Cell>

              {/* Editable: tags */}
              <Cell>
                <FieldLabel>Tags</FieldLabel>
                {editing
                  ? <input value={editForm.tags}
                      onChange={e=>setEditForm(f=>({...f,tags:e.target.value}))}
                      placeholder="Comma-separated"
                      style={inputStyle}/>
                  : <FieldVal>{ds.tags.join(", ")||<span style={{color:C.faint}}>—</span>}</FieldVal>
                }
              </Cell>

              {/* Read-only fields */}
              {[
                ["Dataset identifier", ds.id],
                ["Asset type",         ds.assetType],
                ["Last received",      `${ds.updated} (${ds.lastReceived}d ago)`],
                ["Derived outputs",    `${ds.outputs} registered`],
                ["Schema (CSVW)",      ds.hasCsvw?"Available":"Not defined"],
              ].map(([k,v])=>(
                <Cell key={k}>
                  <FieldLabel>{k}</FieldLabel>
                  <FieldVal>
                    <span style={{color:editing?C.muted:C.ink}}>{v}</span>
                    {editing&&<span style={{fontFamily:font,fontSize:11,
                      color:C.faint,marginLeft:6}}>read-only</span>}
                  </FieldVal>
                </Cell>
              ))}
            </div>
          </div>
        );
      })()}
      {tab==="schema"&&(
        ds.hasCsvw?(
          <>
            <SchemaTable fields={SCHEMA_FIELDS}/>
            <div style={{marginTop:16}}>
              <button onClick={()=>onOpenSql(ds)} style={{background:C.ink,border:"none",
                color:C.white,padding:"8px 20px",cursor:"pointer",
                fontFamily:font,fontSize:13,fontWeight:600}}>
                Open in SQL Workbench ⌕</button>
            </div>
          </>
        ):<Notice type="warning" title="Schema not defined">No CSVW schema defined for this asset.</Notice>
      )}
      {tab==="lineage"&&(()=>{
        /* ── LINEAGE: compressed summary of provenance ──────────────────────
           Walks the full activity graph to find TRUE LEAVES only:

           UPSTREAM:  walk backward through all generation activities until
                      we reach datasets with no recorded upstream activity
                      (assetType "source" or "geodata", or untracked external).
                      Skips all bronze/silver intermediaries.

           DOWNSTREAM: two kinds of leaf, visually distinct:
             • Registered terminal datasets (dashboards, outputs with no
               further consumers) — clickable, navigate to that dataset
             • Delivery activities with no registered output — show recipient
               + answered question inline (nothing to navigate to)
             Also includes manually recorded disseminations from this session.
        ─────────────────────────────────────────────────────────────────── */
        const upLeaves = findUpstreamLeaves(ds.name, new Set());
        const {datasets:downDs, deliveries:downDel} =
          findDownstreamLeaves(ds.name, new Set());

        /* ── Upstream: source dataset row ── */
        const SourceRow = ({d, onNav}) => {
          const f = freshCfg(d.lastReceived);
          const isSelf = d.id === ds.id;
          return (
            <div onClick={onNav}
              style={{display:"flex",alignItems:"center",gap:12,
                padding:"13px 0",borderBottom:`1px solid ${C.lineL}`,
                cursor:onNav?"pointer":"default",
                background:"transparent",transition:"background 0.1s"}}
              onMouseEnter={e=>{if(onNav)e.currentTarget.style.background="#F2F2EF";}}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {/* Freshness dot */}
              <span style={{width:8,height:8,borderRadius:"50%",
                background:f.c,flexShrink:0,
                boxShadow:`0 0 0 2px ${f.bg}`}}/>
              <TypeBadge type={d.assetType}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:font,fontSize:14,fontWeight:600,
                  color:isSelf?C.muted:C.ink}}>
                  {d.name}
                  {isSelf&&<span style={{fontFamily:font,fontSize:11,
                    color:C.faint,marginLeft:8,fontWeight:400}}>this dataset</span>}
                </div>
                <div style={{fontFamily:font,fontSize:12,color:C.muted,marginTop:1}}>
                  {d.source} · {d.id} · last received {d.updated}
                </div>
              </div>
              <span style={{fontFamily:font,fontSize:12,fontWeight:500,
                color:f.c,flexShrink:0}}>{f.label}</span>
              {onNav&&<span style={{fontFamily:font,fontSize:12,fontWeight:600,
                color:C.mid,flexShrink:0,marginLeft:4}}>View →</span>}
            </div>
          );
        };

        /* ── Downstream: registered terminal dataset row ── */
        const TerminalRow = ({d, onNav}) => {
          const f = freshCfg(d.lastReceived);
          return (
            <div onClick={onNav}
              style={{display:"flex",alignItems:"center",gap:12,
                padding:"13px 0",borderBottom:`1px solid ${C.lineL}`,
                cursor:onNav?"pointer":"default",transition:"background 0.1s"}}
              onMouseEnter={e=>{if(onNav)e.currentTarget.style.background="#F2F2EF";}}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{width:8,height:8,borderRadius:"50%",
                background:f.c,flexShrink:0,
                boxShadow:`0 0 0 2px ${f.bg}`}}/>
              <TypeBadge type={d.assetType}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink}}>
                  {d.name}</div>
                <div style={{fontFamily:font,fontSize:12,color:C.muted,marginTop:1}}>
                  {d.id} · {f.label}
                </div>
              </div>
              {onNav&&<span style={{fontFamily:font,fontSize:12,fontWeight:600,
                color:C.mid,flexShrink:0}}>View →</span>}
            </div>
          );
        };

        /* ── Downstream: delivery with no registered output ── */
        const DeliveryLeafRow = ({ev}) => {
          /* Find answered question from recorded disseminations if available */
          const recorded = DISSEMINATIONS_STORE.find(d=>
            d.datasetId===ds.id && d.recipient===ev.actor &&
            Math.abs(new Date(d.date)-new Date(ev.date)) < 7*86400*1000
          );
          return (
            <div style={{display:"flex",gap:14,padding:"13px 0",
              borderBottom:`1px solid ${C.lineL}`,alignItems:"flex-start"}}>
              {/* Amber dot — delivery/dissemination */}
              <span style={{width:8,height:8,borderRadius:"50%",marginTop:4,
                background:C.warn,flexShrink:0,
                boxShadow:`0 0 0 2px ${C.warnBg}`}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink}}>
                  {ev.actor}</div>
                {/* Answered question — shown if recorded, otherwise description */}
                {(recorded?.answeredQuestion||ev.description)&&(
                  <div style={{fontFamily:font,fontSize:13,color:C.mid,
                    marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>
                    "{recorded?.answeredQuestion||ev.description}"</div>
                )}
                <div style={{fontFamily:font,fontSize:11,color:C.muted,marginTop:3,
                  display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span>{ev.date}</span>
                  {ev.tags.includes("mobility-planning")&&(
                    <span style={{color:C.warn}}>legal mandate</span>
                  )}
                  <span style={{fontFamily:mono}}>{ev.id}</span>
                </div>
              </div>
            </div>
          );
        };

        /* ── Downstream: manually recorded dissemination ── */
        const DissLeafRow = ({d}) => (
          <div style={{display:"flex",gap:14,padding:"13px 0",
            borderBottom:`1px solid ${C.lineL}`,alignItems:"flex-start"}}>
            <span style={{width:8,height:8,borderRadius:"50%",marginTop:4,
              background:C.warn,flexShrink:0,
              boxShadow:`0 0 0 2px ${C.warnBg}`}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:font,fontSize:14,fontWeight:600,color:C.ink}}>
                {d.recipient}</div>
              <div style={{fontFamily:font,fontSize:13,color:C.mid,
                marginTop:3,lineHeight:1.5,fontStyle:"italic"}}>
                "{d.answeredQuestion}"</div>
              <div style={{fontFamily:font,fontSize:11,color:C.muted,marginTop:3,
                display:"flex",gap:8,flexWrap:"wrap"}}>
                <span>{d.date}</span>
                <span>{ODM_CHANNELS.find(c=>c.id===d.channel)?.label||d.channel}</span>
                {d.tags.map(t=>(
                  <span key={t} style={{background:C.surface,
                    border:`1px solid ${C.lineL}`,padding:"0 5px"}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        );

        const isSelf = upLeaves.length===1 && upLeaves[0].id===ds.id;
        const totalDown = downDs.length + downDel.length + disseminations.length;

        return (
          <div>

            {/* ── Upstream leaves ── */}
            {isSelf ? (
              <div style={{borderLeft:`4px solid ${C.ok}`,
                background:C.okBg,border:`1px solid ${C.okBd}`,
                padding:"14px 18px",marginBottom:24}}>
                <div style={{fontFamily:font,fontSize:12,fontWeight:700,
                  letterSpacing:"0.08em",textTransform:"uppercase",
                  color:C.ok,marginBottom:6}}>Primary source</div>
                <div style={{fontFamily:font,fontSize:13,color:C.soft,lineHeight:1.6}}>
                  This dataset has no upstream ODM dependencies. It arrived via
                  a Reception from <strong>{ds.source}</strong> and is the origin
                  point of its lineage chain. Freshness is in the header above.
                </div>
              </div>
            ) : (
              <>
                <Eyebrow style={{marginTop:0}}>
                  Original sources·{upLeaves.length} source{upLeaves.length!==1?"s":""}
                </Eyebrow>
                {upLeaves.length===0&&(
                  <Notice type="info">No upstream sources recorded.</Notice>
                )}
                {upLeaves.map(u=>(
                  <SourceRow key={u.id} d={u} onNav={null}/>
                ))}
              </>
            )}

            {/* ── Downstream leaves ── */}
            <Eyebrow>
              Final consumers · {totalDown===0 ? "none recorded"
                : `${totalDown} downstream`}
            </Eyebrow>

            {totalDown===0 && (
              <Notice type="info">
                No downstream consumers recorded. This dataset has not yet
                been used in a delivery or downstream derivation.
              </Notice>
            )}

            {/* Registered terminal datasets — clickable */}
            {downDs.map(d => <TerminalRow key={d.id} d={d} onNav={null}/>)}

            {/* PROV-O delivery activities — with answered question if available */}
            {downDel.map(ev => <DeliveryLeafRow key={ev.id} ev={ev}/>)}

            {/* Manually recorded disseminations from this session */}
            {disseminations.map(d => <DissLeafRow key={d.id} d={d}/>)}

          </div>
        );
      })()}

      {tab==="provenance"&&(()=>{
        /* ── PROVENANCE TAB ─────────────────────────────────────────────
           Structured event log. Three sections, in fixed order:

           1. ORIGIN — the single activity that created this dataset.
              Reception  → makes it a source (data arrived from outside)
              Derivation → makes it a derived asset (ODM transformed data)
              Displayed as a prominent header card, not a list item.

           2. TECHNICAL REUSES — Transformations that used this dataset
              as input. Each produced downstream ODM datasets.
              May lead to business meaning further downstream.

           3. BUSINESS REUSES — Disseminations that used this dataset.
              Each directly created value: answered a question, delivered
              to a recipient. Includes the "Record dissemination" form.
        ─────────────────────────────────────────────────────────────────*/

        /* Classify each activity */
        const classify = ev => {
          if (ev.type === "reception") return "reception";
          if (ev.type === "delivery")  return "dissemination";
          if (ev.outputs.filter(o=>o).length === 0) return "dissemination";
          return "transformation";
        };

        /* The origin activity: produced this dataset as output */
        const originAct = ACTIVITIES
          .find(a => a.outputs.includes(ds.name));

        /* All activities that used this dataset as input */
        const usages = ACTIVITIES
          .filter(a => a.inputs.includes(ds.name))
          .sort((a,b) => a.date.localeCompare(b.date));

        const technicalUses  = usages.filter(a => classify(a) === "transformation");
        const businessUses   = usages.filter(a => classify(a) === "dissemination");

        /* ── Shared atoms ── */
        const Sub = ({children}) => (
          <div style={{fontFamily:font,fontSize:10,fontWeight:700,
            letterSpacing:"0.1em",textTransform:"uppercase",
            color:C.muted,marginBottom:5}}>{children}</div>
        );
        const VDiv = () => (
          <div style={{width:1,background:C.lineL,flexShrink:0,
            margin:"0 18px",alignSelf:"stretch"}}/>
        );
        const inputStyle = {
          fontFamily:font,fontSize:13,color:C.ink,background:C.white,
          border:`1px solid ${C.line}`,borderBottom:`2px solid ${C.lineH}`,
          padding:"6px 10px",outline:"none",width:"100%",boxSizing:"border-box",
        };
        const Field = ({label,required,error,children}) => (
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:font,fontSize:11,fontWeight:700,
              letterSpacing:"0.09em",textTransform:"uppercase",
              color:error?C.bad:C.muted,marginBottom:4}}>
              {label}{required&&<span style={{color:C.bad}}> *</span>}
            </div>
            {children}
          </div>
        );

        /* ── Origin card ─────────────────────────────────────────────────
           Visually prominent — this card explains what the dataset IS.
           Reception: shows source + agent + channel
           Derivation: shows input datasets + agent + plan/DAG
        ────────────────────────────────────────────────────────────────── */
        const OriginCard = ({ev}) => {
          const isReception = classify(ev) === "reception";
          const borderColor = isReception ? C.ok : "#1A4A7A";
          const bgColor     = isReception ? C.okBg : "#EEF2FA";
          const labelColor  = isReception ? C.ok   : "#1A4A7A";
          const typeLabel   = isReception ? "Reception — primary source" : "Derivation — derived asset";
          const showSql     = !isReception && pipelineQuery && ev.outputs.includes(ds.name);

          return (
            <div style={{border:`1px solid ${borderColor}`,
              borderLeft:`4px solid ${borderColor}`,
              background:C.white,marginBottom:28}}>
              {/* Header */}
              <div style={{padding:"10px 16px",background:bgColor,
                borderBottom:`1px solid ${borderColor}`,
                display:"flex",alignItems:"center",
                justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontFamily:font,fontSize:12,fontWeight:700,
                    letterSpacing:"0.08em",textTransform:"uppercase",
                    color:labelColor}}>{typeLabel}</span>
                  {ev.tags.includes("mobility-planning")&&(
                    <span style={{fontFamily:font,fontSize:11,
                      fontStyle:"italic",color:C.warn}}>legal mandate</span>
                  )}
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontFamily:mono,fontSize:10,color:labelColor,
                    opacity:0.7}}>{ev.id}</span>
                  <span style={{fontFamily:mono,fontSize:10,color:labelColor,
                    opacity:0.7}}>{ev.date}</span>
                </div>
              </div>
              {/* Description */}
              <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.lineL}`,
                fontFamily:font,fontSize:13,color:C.soft,lineHeight:1.55}}>
                {ev.description}
              </div>
              {/* Panels */}
              <div style={{display:"flex",padding:"12px 0",
                alignItems:"stretch",flexWrap:"wrap"}}>
                {/* Actor */}
                <div style={{flex:"1 1 130px",padding:"0 16px",minWidth:110}}>
                  <Sub>Agent</Sub>
                  <div style={{fontFamily:font,fontSize:13,fontWeight:600,
                    color:C.ink,marginBottom:2}}>{ev.actor}</div>
                  <div style={{fontFamily:mono,fontSize:10,color:C.faint}}>
                    prov:wasAssociatedWith</div>
                </div>
                <VDiv/>
                {/* Source / inputs */}
                <div style={{flex:"2 1 180px",padding:"0 16px",minWidth:150}}>
                  {isReception ? <>
                    <Sub>Source</Sub>
                    {ev.inputs.length > 0
                      ? ev.inputs.map((inp,j) => (
                          <div key={j} style={{fontFamily:font,fontSize:13,
                            fontWeight:600,color:C.ink}}>{inp}
                            <span style={{fontFamily:mono,fontSize:10,
                              color:C.faint,marginLeft:6}}>external</span>
                          </div>
                        ))
                      : <span style={{fontFamily:font,fontSize:13,color:C.ink,
                          fontWeight:600}}>{ds.source}
                          <span style={{fontFamily:mono,fontSize:10,
                            color:C.faint,marginLeft:6}}>external provider</span>
                        </span>
                    }
                  </> : <>
                    <Sub>Derived from</Sub>
                    {ev.inputs.map((inp,j) => {
                      const inpDs = DATASETS.find(d=>d.name===inp);
                      return (
                        <div key={j} style={{display:"flex",alignItems:"baseline",
                          gap:6,marginBottom:4}}>
                          <span style={{fontFamily:font,fontSize:10,fontWeight:700,
                            letterSpacing:"0.06em",textTransform:"uppercase",
                            color:C.warn,flexShrink:0}}>in</span>
                          <div>
                            <span style={{fontFamily:font,fontSize:13,
                              fontWeight:600,color:C.ink}}>{inp}</span>
                            {inpDs&&<span style={{fontFamily:mono,fontSize:10,
                              color:C.faint,marginLeft:6}}>{inpDs.id}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </>}
                </div>
                <VDiv/>
                {/* Channel (reception) or Plan (derivation) */}
                <div style={{flex:"1 1 130px",padding:"0 16px",minWidth:110}}>
                  {isReception ? <>
                    <Sub>Channel</Sub>
                    <div style={{fontFamily:font,fontSize:13,fontWeight:600,
                      color:C.ink}}>{ev.plan||"—"}</div>
                    <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:4}}>
                      odm:channel</div>
                  </> : <>
                    <Sub>Plan</Sub>
                    {ev.plan ? <>
                      {ev.plan.startsWith("DAG ") ? (
                        <a href={`https://airflow.idm.lu/dags/${ev.plan.replace("DAG ","")}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{fontFamily:mono,fontSize:12,color:C.mid,
                            textDecoration:"underline",display:"block",marginBottom:2}}>
                          {ev.plan}</a>
                      ) : (
                        <span style={{fontFamily:mono,fontSize:12,color:C.mid,
                          display:"block",marginBottom:2}}>{ev.plan}</span>
                      )}
                      {ev.dagRun&&<div style={{fontFamily:mono,fontSize:10,
                        color:C.faint,marginTop:2}}>{ev.dagRun}</div>}
                      {showSql&&(
                        <button onClick={()=>onOpenSql(null,pipelineQuery)}
                          style={{marginTop:8,background:"none",
                            border:`1px solid ${C.line}`,fontFamily:font,
                            fontSize:11,fontWeight:600,color:C.mid,
                            padding:"2px 8px",cursor:"pointer"}}>
                          View SQL ⌕</button>
                      )}
                    </> : <span style={{fontFamily:font,fontSize:13,color:C.faint}}>—</span>}
                    <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:6}}>
                      prov:hadPlan</div>
                  </>}
                </div>
              </div>
            </div>
          );
        };

        /* ── Reuse card ───────────────────────────────────────────────────
           Compact — used in both technical and business sections.
           Technical: shows outputs produced + plan
           Business:  shows answered question + recipient
        ────────────────────────────────────────────────────────────────── */
        const ReuseCard = ({ev}) => {
          const subtype = classify(ev);
          const isTech  = subtype === "transformation";
          const showSql = isTech && pipelineQuery && ev.inputs.includes(ds.name);

          return (
            <div style={{background:C.card,border:`1px solid ${C.line}`,
              borderLeft:`3px solid ${isTech?"#1A4A7A":C.warn}`,
              marginBottom:6}}>
              {/* Header */}
              <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.lineL}`,
                display:"flex",alignItems:"center",
                justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontFamily:font,fontSize:12,fontWeight:700,
                    color:C.ink}}>{actMeta[ev.type]?.label||ev.type}</span>
                  {ev.tags.includes("mobility-planning")&&(
                    <span style={{fontFamily:font,fontSize:11,fontStyle:"italic",
                      color:C.warn}}>legal mandate</span>
                  )}
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>{ev.id}</span>
                  <span style={{fontFamily:mono,fontSize:10,color:C.muted}}>{ev.date}</span>
                </div>
              </div>
              {/* Panels */}
              <div style={{display:"flex",padding:"10px 0",
                alignItems:"stretch",flexWrap:"wrap"}}>
                {/* Agent */}
                <div style={{flex:"1 1 120px",padding:"0 14px",minWidth:100}}>
                  <Sub>Agent</Sub>
                  <div style={{fontFamily:font,fontSize:12,fontWeight:600,
                    color:C.ink}}>{ev.actor}</div>
                </div>
                <VDiv/>
                {/* Technical: outputs produced */}
                {isTech && (
                  <div style={{flex:"2 1 180px",padding:"0 14px",minWidth:140}}>
                    <Sub>Produced</Sub>
                    {ev.outputs.filter(o=>o).map((out,j) => {
                      const outDs = DATASETS.find(d=>d.name===out);
                      return (
                        <div key={j} style={{display:"flex",alignItems:"baseline",
                          gap:6,marginBottom:3}}>
                          <span style={{fontFamily:font,fontSize:10,fontWeight:700,
                            letterSpacing:"0.06em",textTransform:"uppercase",
                            color:C.ok,flexShrink:0}}>out</span>
                          <span style={{fontFamily:font,fontSize:12,color:C.ink}}>{out}</span>
                          {outDs&&<span style={{fontFamily:mono,fontSize:10,
                            color:C.faint}}>{outDs.id}</span>}
                        </div>
                      );
                    })}
                    {ev.outputs.filter(o=>o).length===0&&(
                      <span style={{fontFamily:font,fontSize:12,color:C.faint}}>—</span>
                    )}
                  </div>
                )}
                {/* Business: answered question */}
                {!isTech && (
                  <div style={{flex:"2 1 180px",padding:"0 14px",minWidth:140}}>
                    <Sub>What this answered</Sub>
                    <div style={{fontFamily:font,fontSize:13,color:C.soft,
                      lineHeight:1.5,fontStyle:"italic"}}>
                      {ev.description}
                    </div>
                  </div>
                )}
                <VDiv/>
                {/* Technical: plan */}
                {isTech && (
                  <div style={{flex:"1 1 120px",padding:"0 14px",minWidth:100}}>
                    <Sub>Plan</Sub>
                    {ev.plan ? <>
                      {ev.plan.startsWith("DAG ") ? (
                        <a href={`https://airflow.idm.lu/dags/${ev.plan.replace("DAG ","")}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{fontFamily:mono,fontSize:11,color:C.mid,
                            textDecoration:"underline",display:"block"}}>
                          {ev.plan}</a>
                      ) : (
                        <span style={{fontFamily:mono,fontSize:11,color:C.mid}}>
                          {ev.plan}</span>
                      )}
                      {ev.dagRun&&<div style={{fontFamily:mono,fontSize:10,
                        color:C.faint,marginTop:2}}>{ev.dagRun}</div>}
                      {showSql&&(
                        <button onClick={()=>onOpenSql(null,pipelineQuery)}
                          style={{marginTop:6,background:"none",
                            border:`1px solid ${C.line}`,fontFamily:font,
                            fontSize:11,fontWeight:600,color:C.mid,
                            padding:"2px 8px",cursor:"pointer"}}>
                          View SQL ⌕</button>
                      )}
                    </> : <span style={{fontFamily:font,fontSize:12,color:C.faint}}>—</span>}
                  </div>
                )}
                {/* Business: recipient */}
                {!isTech && (
                  <div style={{flex:"1 1 120px",padding:"0 14px",minWidth:100}}>
                    <Sub>Recipient</Sub>
                    <div style={{fontFamily:font,fontSize:12,fontWeight:600,
                      color:C.ink}}>{ev.actor}</div>
                    <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:3}}>
                      odm:recipient</div>
                  </div>
                )}
              </div>
            </div>
          );
        };

        /* ── Recorded dissemination card (from form) ─────────────────── */
        const DissCard = ({d}) => {
          const chanLabel = ODM_CHANNELS.find(c=>c.id===d.channel)?.label||d.channel;
          return (
            <div style={{background:C.card,border:`1px solid ${C.line}`,
              borderLeft:`3px solid ${C.warn}`,marginBottom:6}}>
              <div style={{padding:"8px 16px",borderBottom:`1px solid ${C.lineL}`,
                display:"flex",alignItems:"center",
                justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:font,fontSize:12,fontWeight:700,
                    color:C.ink}}>Dissemination</span>
                  <span style={{fontFamily:font,fontSize:10,fontWeight:700,
                    letterSpacing:"0.07em",textTransform:"uppercase",
                    color:C.warn,background:C.warnBg,
                    border:`1px solid ${C.warnBd}`,padding:"1px 6px"}}>
                    {chanLabel}</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontFamily:mono,fontSize:10,color:C.faint}}>{d.id}</span>
                  <span style={{fontFamily:mono,fontSize:10,color:C.muted}}>{d.date}</span>
                </div>
              </div>
              {/* Answered question — prominent */}
              <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.lineL}`}}>
                <Sub>What question did this answer?</Sub>
                <div style={{fontFamily:font,fontSize:14,color:C.ink,
                  lineHeight:1.5,fontStyle:"italic"}}>
                  "{d.answeredQuestion}"</div>
              </div>
              <div style={{display:"flex",padding:"10px 0",
                alignItems:"stretch",flexWrap:"wrap"}}>
                <div style={{flex:"1 1 120px",padding:"0 14px",minWidth:100}}>
                  <Sub>Agent</Sub>
                  <div style={{fontFamily:font,fontSize:12,fontWeight:600,
                    color:C.ink}}>{d.authorName}</div>
                  <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:2}}>
                    prov:wasAssociatedWith</div>
                </div>
                <VDiv/>
                <div style={{flex:"1 1 120px",padding:"0 14px",minWidth:100}}>
                  <Sub>Recipient</Sub>
                  <div style={{fontFamily:font,fontSize:12,fontWeight:600,
                    color:C.ink}}>{d.recipient}</div>
                  <div style={{fontFamily:mono,fontSize:10,color:C.faint,marginTop:2}}>
                    odm:recipient</div>
                </div>
                <VDiv/>
                <div style={{flex:"2 1 160px",padding:"0 14px",minWidth:120}}>
                  <Sub>Tags</Sub>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {d.tags.length>0
                      ? d.tags.map(t=>(
                          <span key={t} style={{fontFamily:font,fontSize:11,
                            color:C.mid,background:C.surface,
                            border:`1px solid ${C.lineL}`,padding:"1px 6px"}}>{t}</span>
                        ))
                      : <span style={{fontFamily:font,fontSize:12,color:C.faint}}>—</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        };

        return (
          <div>

            {/* ════ 1. ORIGIN ══════════════════════════════════════════════
                The single activity that created this dataset.
                If none recorded, the dataset is an untracked external source.
            ══════════════════════════════════════════════════════════════ */}
            <Eyebrow style={{marginTop:0}}>Origin</Eyebrow>
            {originAct
              ? <OriginCard ev={originAct}/>
              : <div style={{borderLeft:`4px solid ${C.ok}`,background:C.okBg,
                  border:`1px solid ${C.okBd}`,
                  padding:"14px 18px",marginBottom:28}}>
                  <div style={{fontFamily:font,fontSize:12,fontWeight:700,
                    letterSpacing:"0.08em",textTransform:"uppercase",
                    color:C.ok,marginBottom:4}}>Primary source</div>
                  <div style={{fontFamily:font,fontSize:13,color:C.soft}}>
                    No reception activity recorded. This dataset is treated as a
                    primary external source provided by <strong>{ds.source}</strong>.
                  </div>
                </div>
            }

            {/* ════ 2. TECHNICAL REUSES ════════════════════════════════════
                Transformations that used this dataset as input.
                Each produced one or more downstream ODM datasets.
            ══════════════════════════════════════════════════════════════ */}
            {technicalUses.length > 0 && (
              <>
                <Eyebrow>
                  Technical reuses · {technicalUses.length}
                </Eyebrow>
                {technicalUses.map(ev => <ReuseCard key={ev.id} ev={ev}/>)}
              </>
            )}

            {/* ════ 3. BUSINESS REUSES ═════════════════════════════════════
                Disseminations that used this dataset to create value.
                Includes recorded disseminations (from the form) and
                delivery activities from the PROV-O activity log.
            ══════════════════════════════════════════════════════════════ */}
            <div style={{marginTop: technicalUses.length>0 ? 24 : 0}}>
              <div style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",gap:12,
                marginBottom:12,flexWrap:"wrap"}}>
                <Eyebrow style={{margin:0}}>
                  Business reuses · {businessUses.length + disseminations.length}
                </Eyebrow>
                <button
                  onClick={()=>{setShowDissForm(s=>!s);setDissErr("");}}
                  style={{background:showDissForm?C.surface:C.ink,
                    border:`1px solid ${showDissForm?C.lineH:C.ink}`,
                    color:showDissForm?C.mid:C.white,
                    fontFamily:font,fontSize:12,fontWeight:600,
                    padding:"5px 14px",cursor:"pointer"}}>
                  {showDissForm?"Cancel":"+ Record dissemination"}
                </button>
              </div>

              {/* Record form */}
              {showDissForm&&(
                <div style={{background:C.card,border:`1px solid ${C.line}`,
                  borderLeft:`3px solid ${C.warn}`,
                  padding:"18px 20px",marginBottom:12}}>
                  <div style={{fontFamily:font,fontSize:13,fontWeight:700,
                    color:C.ink,marginBottom:14}}>
                    New dissemination · {ds.name}
                  </div>
                  {dissErr&&(
                    <div style={{fontFamily:font,fontSize:13,color:C.bad,
                      marginBottom:12,borderLeft:`3px solid ${C.badBd}`,
                      paddingLeft:10}}>{dissErr}</div>
                  )}
                  <div style={{display:"grid",
                    gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:"0 20px"}}>
                    <Field label="What question did this answer?" required
                      error={dissErr&&!dissForm.answeredQuestion.trim()}>
                      <textarea value={dissForm.answeredQuestion}
                        onChange={e=>setDissForm(f=>({...f,answeredQuestion:e.target.value}))}
                        placeholder="e.g. Is cycling share increasing in ZH post-2020?"
                        rows={2}
                        style={{...inputStyle,resize:"vertical",lineHeight:1.5}}/>
                    </Field>
                    <Field label="Recipient" required
                      error={dissErr&&!dissForm.recipient.trim()}>
                      <input value={dissForm.recipient}
                        onChange={e=>setDissForm(f=>({...f,recipient:e.target.value}))}
                        placeholder="e.g. ARE — Federal Roads Office"
                        style={inputStyle}/>
                    </Field>
                    <Field label="Channel">
                      <select value={dissForm.channel}
                        onChange={e=>setDissForm(f=>({...f,channel:e.target.value}))}
                        style={{...inputStyle,cursor:"pointer"}}>
                        {ODM_CHANNELS.map(ch=>(
                          <option key={ch.id} value={ch.id}>{ch.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Description">
                      <input value={dissForm.description}
                        onChange={e=>setDissForm(f=>({...f,description:e.target.value}))}
                        placeholder="What happened — free text"
                        style={inputStyle}/>
                    </Field>
                    <div style={{gridColumn:"1 / -1"}}>
                      <Field label="Tags">
                        <input value={dissForm.tags}
                          onChange={e=>setDissForm(f=>({...f,tags:e.target.value}))}
                          placeholder="Comma-separated — e.g. mobility-planning, cycling"
                          style={inputStyle}/>
                      </Field>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                    <button onClick={handleDissSubmit}
                      style={{background:C.ink,border:"none",color:C.white,
                        fontFamily:font,fontSize:13,fontWeight:600,
                        padding:"7px 20px",cursor:"pointer"}}>
                      Save dissemination
                    </button>
                    <span style={{fontFamily:font,fontSize:12,color:C.muted}}>
                      {CURRENT_USER.name} · {new Date().toISOString().slice(0,10)}
                    </span>
                  </div>
                </div>
              )}

              {/* Prov-O delivery events */}
              {businessUses.map(ev => <ReuseCard key={ev.id} ev={ev}/>)}

              {/* Manually recorded disseminations */}
              {disseminations.map(d => <DissCard key={d.id} d={d}/>)}

              {businessUses.length===0 && disseminations.length===0 && !showDissForm && (
                <Notice type="info">
                  No business reuses recorded yet. Use "+ Record dissemination"
                  to log when this dataset answered a question or created value.
                </Notice>
              )}
            </div>

          </div>
        );
      })()}
    </div>
  );
}

function ActorsPage({mobile,onSelect}) {
  const [filter,setFilter]=useState("all");
  const list=filter==="all"?ACTORS:ACTORS.filter(a=>a.type===filter);
  return (
    <div>
      <PageTitle section="Network · PROV-O Agents" title="Actors"
        sub="Data providers, recipients and internal contributors"
        right={
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <label style={{fontFamily:font,fontSize:11,fontWeight:700,
              letterSpacing:"0.09em",textTransform:"uppercase",color:C.muted}}>Type</label>
            <select value={filter} onChange={e=>setFilter(e.target.value)}
              style={{fontFamily:font,fontSize:13,color:C.ink,background:C.white,
                border:`1px solid ${C.line}`,borderBottom:`2px solid ${C.lineH}`,
                padding:"5px 8px",outline:"none",cursor:"pointer"}}>
              <option value="all">All</option>
              <option value="external">External</option>
              <option value="internal">Internal</option>
            </select>
          </div>
        }/>
      {list.map((ac,i)=>{
        const actorEvs=ACTIVITIES.filter(e=>e.actorId===ac.id);
        return (
          <div key={ac.id} onClick={()=>onSelect(ac)}
            style={{display:"grid",gridTemplateColumns:mobile?"1fr":"2fr 80px 80px 80px",
              gap:"0 24px",padding:"15px 0",
              borderBottom:i<list.length-1?`1px solid ${C.lineL}`:"none",
              alignItems:"center",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background="#F2F2EF"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontFamily:font,fontSize:15,fontWeight:600,color:C.ink}}>{ac.name}</span>
                <span style={{fontFamily:mono,fontSize:11,color:C.muted}}>{ac.id}</span>
                {ac.type==="internal"&&<span style={{fontFamily:font,fontSize:11,color:C.muted,fontStyle:"italic"}}>internal</span>}
              </div>
              <div style={{fontFamily:font,fontSize:12,color:C.muted}}>{ac.role}</div>
            </div>
            {!mobile&&([
              [ac.receptions,"Received",C.ink],
              [ac.deliveries,"Delivered",C.ok],
              [actorEvs.length,"Activities",C.mid],
            ].map(([n,label,color])=>(
              <div key={label} style={{borderLeft:`1px solid ${C.lineL}`,paddingLeft:16}}>
                {n>0?<>
                  <div style={{fontFamily:font,fontSize:22,fontWeight:700,color,lineHeight:1}}>{n}</div>
                  <div style={{fontFamily:font,fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                    textTransform:"uppercase",color:C.muted,marginTop:2}}>{label}</div>
                </>:<span style={{fontFamily:font,fontSize:17,color:C.faint}}>—</span>}
              </div>
            )))}
          </div>
        );
      })}
    </div>
  );
}

function ActorDetail({ac,mobile,onBack,onDataset}) {
  const [filter,setFilter]=useState("all");
  const actorEvs=ACTIVITIES.filter(e=>e.actorId===ac.id);
  const filtered=filter==="all"?actorEvs:actorEvs.filter(e=>e.type===filter);
  const provided=DATASETS.filter(d=>d.sourceId===ac.id);
  const received=[...new Set(actorEvs.filter(e=>e.type==="delivery").map(e=>e.input).filter(Boolean))];
  return (
    <div>
      <div style={{fontFamily:font,fontSize:12,color:C.muted,marginBottom:18,
        display:"flex",alignItems:"center",gap:6}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",
          fontFamily:font,fontSize:12,fontWeight:600,color:C.mid,padding:0}}>Actors</button>
        <span>›</span>
        <span style={{fontFamily:mono,fontSize:11}}>{ac.id}</span>
        <span>›</span>
        <span style={{color:C.ink}}>{ac.name}</span>
      </div>
      <div style={{marginBottom:24,paddingBottom:16,borderBottom:`1px solid ${C.line}`}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
          <span style={{fontFamily:mono,fontSize:11,color:C.muted}}>{ac.id}</span>
          <span style={{fontFamily:font,fontSize:11,fontStyle:"italic",color:C.muted}}>{ac.type}</span>
        </div>
        <h1 style={{fontFamily:font,fontSize:mobile?20:22,fontWeight:700,color:C.ink,
          margin:"0 0 4px 0",letterSpacing:"-0.015em"}}>{ac.name}</h1>
        <div style={{fontFamily:font,fontSize:14,color:C.mid,marginBottom:16}}>{ac.role}</div>
        <div style={{display:"flex",flexWrap:"wrap"}}>
          <Stat n={ac.receptions}   label="Datasets received"/>
          <Stat n={ac.deliveries}   label="Deliveries made"/>
          <Stat n={actorEvs.length} label="Total activities"/>
        </div>
      </div>
      {provided.length>0&&<>
        <Eyebrow style={{marginTop:0}}>Datasets provided by {ac.name}</Eyebrow>
        {provided.map(ds=><DatasetEntry key={ds.id} ds={ds} onClick={()=>onDataset(ds.id)}/>)}
      </>}
      {received.length>0&&<>
        <Eyebrow>Datasets delivered to {ac.name}</Eyebrow>
        {received.map(name=>{
          const ds=DATASETS.find(d=>d.name===name);
          return ds?<DatasetEntry key={ds.id} ds={ds} onClick={()=>onDataset(ds.id)}/>
            :<div key={name} style={{fontFamily:font,fontSize:13,color:C.muted,
              padding:"8px 0",borderBottom:`1px solid ${C.lineL}`}}>{name}</div>;
        })}
      </>}
      <Eyebrow>Activity log</Eyebrow>
      <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:`1px solid ${C.line}`,
        overflowX:"auto",scrollbarWidth:"none"}}>
        {["all","reception","delivery","pipeline","manual","dashboard"].map(t=>{
          const active=filter===t;
          return <button key={t} onClick={()=>setFilter(t)} style={{
            background:"none",border:"none",
            borderBottom:active?`2px solid ${C.ink}`:"2px solid transparent",
            color:active?C.ink:C.muted,fontFamily:font,fontSize:13,
            fontWeight:active?600:400,padding:"7px 14px 7px 0",marginRight:4,
            marginBottom:-1,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
            {t==="all"?"All":actMeta[t]?.label||t}</button>;
        })}
      </div>
      {filtered.length===0
        ?<Notice type="info">No activities of this type recorded for {ac.name}.</Notice>
        :filtered.map((ev,i)=>(
          <ActivityEntry key={ev.id} ev={ev} last={i===filtered.length-1}
            onDataset={name=>{const ds=DATASETS.find(d=>d.name===name);if(ds)onDataset(ds.id);}}/>
        ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   APP SHELL
══════════════════════════════════════════════════════════════════════ */
const NAV = [
  {id:"overview", label:"Overview",    short:"Home"},
  {id:"datasets", label:"Data Assets", short:"Data"},
  {id:"actors",   label:"Actors",      short:"Actors"},
  {id:"queries",  label:"Queries",     short:"Queries"},
];

const DRAWER_BOTTOM_PAD = {
  [DRAWER_COLLAPSED]: 36,
  [DRAWER_HALF]:      Math.min(420, typeof window!=="undefined"?window.innerHeight*0.45:300),
  [DRAWER_FULL]:      typeof window!=="undefined"?window.innerHeight-120:500,
};

export default function App() {
  const mobile=useIsMobile();
  const [page,setPage]=useState("overview");
  const [selDs,setSelDs]=useState(null);
  const [selAc,setSelAc]=useState(null);
  const [searchOpen,setSearchOpen]=useState(false);
  const [registerOpen,setRegisterOpen]=useState(false);

  /* Query library state */
  const [queries,setQueries]=useState(INITIAL_QUERIES);

  /* SQL drawer state */
  const [drawerState,setDrawerState]=useState(DRAWER_COLLAPSED);
  const [activeQuery,setActiveQuery]=useState(null);

  const go=p=>{setPage(p);setSelDs(null);setSelAc(null);};

  /* Open SQL drawer — optionally with a dataset pre-selected and/or a query loaded */
  const openSql=useCallback((ds=null,query=null)=>{
    if(query) setActiveQuery(query);
    setDrawerState(DRAWER_HALF);
    /* Note: the drawer itself handles injecting the dataset */
  },[]);

  useEffect(()=>{
    const h=e=>{
      if((e.key==="/"||e.key==="k"&&(e.metaKey||e.ctrlKey))&&!searchOpen){
        e.preventDefault();setSearchOpen(true);
      }
      if(e.key==="Escape")setSearchOpen(false);
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[searchOpen]);

  const handleSearchNav=(type,id)=>{
    if(type==="dataset"){const ds=DATASETS.find(d=>d.id===id);if(ds){setPage("datasets");setSelDs(ds);setSelAc(null);}}
    else if(type==="actor"){const ac=ACTORS.find(a=>a.id===id);if(ac){setPage("actors");setSelAc(ac);setSelDs(null);}}
    else if(type==="query"){const q=queries.find(x=>x.id===id);if(q){openSql(null,q);}}
  };

  const drawerPad=DRAWER_BOTTOM_PAD[drawerState]||36;

  return (
    <div style={{minHeight:"100vh",background:C.page,color:C.ink,
      fontFamily:font,display:"flex",flexDirection:"column"}}>

      {searchOpen&&<GlobalSearch onNavigate={handleSearchNav}
        onClose={()=>setSearchOpen(false)} queries={queries}/>}
      {registerOpen&&<RegisterWizard mobile={mobile}
        onClose={()=>setRegisterOpen(false)}
        onRegister={asset=>{/* add to DATASETS in production */}}/>}

      <header style={{position:"sticky",top:0,zIndex:100}}>
        {/* Logo bar */}
        <div style={{background:C.white,
          padding:mobile?"10px 16px":"12px 28px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          borderBottom:`3px solid ${LU.red}`}}>
          <div style={{display:"flex",alignItems:"center",gap:mobile?10:16,flexShrink:0}}>
            <img src="https://cdn.public.lu/pictures/logos/gov/fr/gov-dark.png"
              alt="Le Gouvernement du Grand-Duché de Luxembourg"
              style={{height:mobile?34:44,width:"auto"}}/>
            <div style={{width:1,height:mobile?34:44,background:LU.gray+"44",flexShrink:0}}/>
            <div style={{lineHeight:1}}>
              <div style={{fontFamily:font,fontSize:mobile?7:8.5,fontWeight:700,
                letterSpacing:"0.14em",textTransform:"uppercase",
                color:LU.gray,marginBottom:3,opacity:0.7}}>
                Le Gouvernement du Grand-Duché de Luxembourg</div>
              <div style={{fontFamily:font,fontSize:mobile?11:13,fontWeight:600,
                color:LU.red,marginBottom:2,letterSpacing:"0.01em"}}>
                Institut du développement municipal</div>
              <div style={{fontFamily:font,fontSize:mobile?9:11,fontWeight:400,
                color:LU.gray,letterSpacing:"0.01em"}}>
                Observatoire de la mobilité</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <button onClick={()=>setSearchOpen(true)} style={{display:"flex",
              alignItems:"center",gap:8,background:C.surface,border:`1px solid ${C.line}`,
              padding:mobile?"6px 10px":"7px 14px",cursor:"pointer",fontFamily:font,
              fontSize:mobile?11:12,color:C.muted}}>
              <span style={{fontSize:15}}>⌕</span>
              {!mobile&&<span>Search</span>}
              {!mobile&&<span style={{fontFamily:mono,fontSize:11,color:C.faint,marginLeft:4}}>/</span>}
            </button>
            {/* Current user indicator */}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:C.surface,
                border:`1px solid ${C.line}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontFamily:font,fontSize:11,
                fontWeight:700,color:C.mid}}>
                {CURRENT_USER.name.split(" ").map(n=>n[0]).join("")}</div>
              {!mobile&&<span style={{fontFamily:font,fontSize:12,color:C.muted}}>
                {CURRENT_USER.name}</span>}
            </div>
          </div>
        </div>
        {/* Nav */}
        <div style={{background:C.header}}>
          <div style={{maxWidth:980+56,margin:"0 auto",
            padding:mobile?"0 8px":"0 28px",
            display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
            {NAV.map(item=>{
              const active=page===item.id;
              return <button key={item.id} onClick={()=>go(item.id)} style={{
                background:"none",border:"none",
                borderBottom:active?`3px solid ${LU.red}`:"3px solid transparent",
                color:active?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.38)",
                padding:mobile?"9px 12px":"10px 18px",cursor:"pointer",fontFamily:font,
                fontSize:mobile?11:12,fontWeight:active?600:400,letterSpacing:"0.02em",
                whiteSpace:"nowrap",flexShrink:0,marginBottom:-1,
                transition:"color 0.1s,border-color 0.1s"}}>
                {mobile?item.short:item.label}
              </button>;
            })}
            <div style={{flex:1}}/>
            {/* SQL drawer toggle in nav */}
            <button onClick={()=>setDrawerState(s=>s===DRAWER_COLLAPSED?DRAWER_HALF:DRAWER_COLLAPSED)}
              style={{background:drawerState!==DRAWER_COLLAPSED?"rgba(239,51,64,0.15)":"none",
                border:"none",borderBottom:drawerState!==DRAWER_COLLAPSED?`3px solid ${LU.red}`:"3px solid transparent",
                color:drawerState!==DRAWER_COLLAPSED?"rgba(239,180,180,0.9)":"rgba(255,255,255,0.38)",
                padding:mobile?"9px 12px":"10px 18px",cursor:"pointer",fontFamily:font,
                fontSize:mobile?11:12,fontWeight:600,letterSpacing:"0.02em",
                whiteSpace:"nowrap",flexShrink:0,marginBottom:-1}}>
              SQL {drawerState!==DRAWER_COLLAPSED?"▼":"▲"}
              {activeQuery&&<span style={{fontFamily:mono,fontSize:10,
                marginLeft:6,opacity:0.6}}>
                {activeQuery.name.slice(0,16)}{activeQuery.name.length>16?"…":""}</span>}
            </button>
          </div>
        </div>
      </header>

      <main style={{flex:1,
        padding:mobile?"20px 16px 60px":"32px 36px 72px",
        paddingBottom:drawerPad+24,
        maxWidth:980,width:"100%",boxSizing:"border-box",margin:"0 auto"}}>
        {page==="overview"&&<Overview mobile={mobile} onNavigate={handleSearchNav}/>}
        {page==="datasets"&&!selDs&&
          <DatasetsPage mobile={mobile} onSelect={ds=>setSelDs(ds)} onOpenSql={openSql} onRegister={()=>setRegisterOpen(true)}/>}
        {page==="datasets"&&selDs&&
          <DatasetDetail ds={selDs} mobile={mobile} queries={queries}
            onBack={()=>setSelDs(null)} onOpenSql={openSql}
            onActor={id=>{const ac=ACTORS.find(a=>a.id===id);if(ac){setPage("actors");setSelAc(ac);setSelDs(null);}}}/>}
        {page==="actors"&&!selAc&&<ActorsPage mobile={mobile} onSelect={ac=>setSelAc(ac)}/>}
        {page==="actors"&&selAc&&
          <ActorDetail ac={selAc} mobile={mobile} onBack={()=>setSelAc(null)}
            onDataset={id=>{const ds=DATASETS.find(d=>d.id===id);if(ds){setPage("datasets");setSelDs(ds);setSelAc(null);}}}/>}
        {page==="queries"&&
          <QueryLibrary queries={queries} setQueries={setQueries} mobile={mobile}
            onOpenQuery={q=>{setActiveQuery(q);setDrawerState(DRAWER_HALF);}}/>}
      </main>

      <footer style={{background:C.header,borderTop:`3px solid ${LU.red}`,
        padding:mobile?"10px 16px":"12px 28px",paddingBottom:drawerPad+12,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="https://cdn.public.lu/pictures/logos/gov/fr/gov-light.png"
            alt="" style={{height:18,width:"auto",opacity:0.3}}/>
          <span style={{fontFamily:font,fontSize:10,fontWeight:600,
            letterSpacing:"0.1em",textTransform:"uppercase",
            color:"rgba(255,255,255,0.2)"}}>
            © {new Date().getFullYear()} Institut du développement municipal</span>
        </div>
        <span style={{fontFamily:font,fontSize:10,color:"rgba(255,255,255,0.15)",
          letterSpacing:"0.06em"}}>DCAT-AP · PROV-O · DuckDB WASM</span>
      </footer>

      {/* Persistent SQL drawer */}
      <SqlDrawer
        drawerState={drawerState}
        setDrawerState={setDrawerState}
        activeQuery={activeQuery}
        setActiveQuery={setActiveQuery}
        queries={queries}
        setQueries={setQueries}
        onNavigateDataset={id=>{const ds=DATASETS.find(d=>d.id===id);if(ds){setPage("datasets");setSelDs(ds);setSelAc(null);}}}
      />
    </div>
  );
}

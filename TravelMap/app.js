/* Travel Map Static — DRR website unified with interactive legend & exports
 * - Countries: multiple .txt uploads; first wins base; overlaps add hatches.
 * - States: single .txt of names/abbr; drawn on top with halo; included in legend with count.
 * - Robinson or Mercator; optional zoom; outlying territories toggle (mainland-only via largest polygon).
 * - Export SVG/PNG/JPG. All client-side.
 * - Legend hover highlights corresponding countries/states.
 */

const PALETTES = {
  1: ["#e6b800", "#4daf4a", "#a52a2a", "#9467bd", "#1f77b4",  "#8c564b"],
  2: ["#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#4e79a7", "#edc948"],
  3: ["#abdda4", "#fdae61", "#d7191c", "#7570b3", "#2b83ba", "#66c2a5"],
};

// ISO3 -> canonical English name (broad but not 100% exhaustive)
const ISO3_TO_NAME = {
  AFG:"Afghanistan", ALB:"Albania", DZA:"Algeria", AND:"Andorra", AGO:"Angola", ATG:"Antigua and Barbuda",
  ARG:"Argentina", ARM:"Armenia", AUS:"Australia", AUT:"Austria", AZE:"Azerbaijan", BHS:"Bahamas",
  BHR:"Bahrain", BGD:"Bangladesh", BRB:"Barbados", BLR:"Belarus", BEL:"Belgium", BLZ:"Belize",
  BEN:"Benin", BTN:"Bhutan", BOL:"Bolivia", BIH:"Bosnia and Herzegovina", BWA:"Botswana", BRA:"Brazil",
  BRN:"Brunei", BGR:"Bulgaria", BFA:"Burkina Faso", BDI:"Burundi", CPV:"Cabo Verde", KHM:"Cambodia",
  CMR:"Cameroon", CAN:"Canada", CAF:"Central African Republic", TCD:"Chad", CHL:"Chile", CHN:"China",
  COL:"Colombia", COM:"Comoros", COG:"Congo", COD:"Democratic Republic of the Congo", CRI:"Costa Rica",
  CIV:"Côte d’Ivoire", HRV:"Croatia", CUB:"Cuba", CYP:"Cyprus", CZE:"Czechia", DNK:"Denmark",
  DJI:"Djibouti", DMA:"Dominica", DOM:"Dominican Republic", ECU:"Ecuador", EGY:"Egypt", SLV:"El Salvador",
  GNQ:"Equatorial Guinea", ERI:"Eritrea", EST:"Estonia", SWZ:"Eswatini", ETH:"Ethiopia", FJI:"Fiji",
  FIN:"Finland", FRA:"France", GAB:"Gabon", GMB:"Gambia", GEO:"Georgia", DEU:"Germany", GHA:"Ghana",
  GRC:"Greece", GRD:"Grenada", GTM:"Guatemala", GIN:"Guinea", GNB:"Guinea-Bissau", GUY:"Guyana",
  HTI:"Haiti", HND:"Honduras", HUN:"Hungary", ISL:"Iceland", IND:"India", IDN:"Indonesia", IRN:"Iran",
  IRQ:"Iraq", IRL:"Ireland", ISR:"Israel", ITA:"Italy", JAM:"Jamaica", JPN:"Japan", JOR:"Jordan",
  KAZ:"Kazakhstan", KEN:"Kenya", KIR:"Kiribati", PRK:"North Korea", KOR:"South Korea", KWT:"Kuwait",
  KGZ:"Kyrgyzstan", LAO:"Laos", LVA:"Latvia", LBN:"Lebanon", LSO:"Lesotho", LBR:"Liberia",
  LBY:"Libya", LIE:"Liechtenstein", LTU:"Lithuania", LUX:"Luxembourg", MDG:"Madagascar", MWI:"Malawi",
  MYS:"Malaysia", MDV:"Maldives", MLI:"Mali", MLT:"Malta", MHL:"Marshall Islands", MRT:"Mauritania",
  MUS:"Mauritius", MEX:"Mexico", FSM:"Micronesia", MDA:"Moldova", MCO:"Monaco", MNG:"Mongolia",
  MNE:"Montenegro", MAR:"Morocco", MOZ:"Mozambique", MMR:"Myanmar", NAM:"Namibia", NRU:"Nauru",
  NPL:"Nepal", NLD:"Netherlands", NZL:"New Zealand", NIC:"Nicaragua", NER:"Niger", NGA:"Nigeria",
  MKD:"North Macedonia", NOR:"Norway", OMN:"Oman", PAK:"Pakistan", PLW:"Palau", PAN:"Panama",
  PNG:"Papua New Guinea", PRY:"Paraguay", PER:"Peru", PHL:"Philippines", POL:"Poland", PRT:"Portugal",
  QAT:"Qatar", ROU:"Romania", RUS:"Russia", RWA:"Rwanda", KNA:"Saint Kitts and Nevis",
  LCA:"Saint Lucia", VCT:"Saint Vincent and the Grenadines", WSM:"Samoa", SMR:"San Marino",
  STP:"Sao Tome and Principe", SAU:"Saudi Arabia", SEN:"Senegal", SRB:"Serbia", SYC:"Seychelles",
  SLE:"Sierra Leone", SGP:"Singapore", SVK:"Slovakia", SVN:"Slovenia", SLB:"Solomon Islands",
  SOM:"Somalia", ZAF:"South Africa", SSD:"South Sudan", ESP:"Spain", LKA:"Sri Lanka", SDN:"Sudan",
  SUR:"Suriname", SWE:"Sweden", CHE:"Switzerland", SYR:"Syria", TJK:"Tajikistan", TZA:"Tanzania",
  THA:"Thailand", TLS:"Timor-Leste", TGO:"Togo", TON:"Tonga", TTO:"Trinidad and Tobago",
  TUN:"Tunisia", TUR:"Turkey", TKM:"Turkmenistan", TUV:"Tuvalu", UGA:"Uganda", UKR:"Ukraine",
  ARE:"United Arab Emirates", GBR:"United Kingdom", USA:"United States of America", URY:"Uruguay",
  UZB:"Uzbekistan", VUT:"Vanuatu", VAT:"Vatican", VEN:"Venezuela", VNM:"Vietnam", YEM:"Yemen",
  ZMB:"Zambia", ZWE:"Zimbabwe", HKG:"Hong Kong", MAC:"Macao", PSE:"Palestine", TWN:"Taiwan",
  GRL:"Greenland"
};

// US states: FIPS -> name and name/abbr lookup
const FIPS2NAME = {
  "01":"Alabama","02":"Alaska","04":"Arizona","05":"Arkansas","06":"California","08":"Colorado","09":"Connecticut",
  "10":"Delaware","11":"District of Columbia","12":"Florida","13":"Georgia","15":"Hawaii","16":"Idaho","17":"Illinois",
  "18":"Indiana","19":"Iowa","20":"Kansas","21":"Kentucky","22":"Louisiana","23":"Maine","24":"Maryland","25":"Massachusetts",
  "26":"Michigan","27":"Minnesota","28":"Mississippi","29":"Missouri","30":"Montana","31":"Nebraska","32":"Nevada",
  "33":"New Hampshire","34":"New Jersey","35":"New Mexico","36":"New York","37":"North Carolina","38":"North Dakota",
  "39":"Ohio","40":"Oklahoma","41":"Oregon","42":"Pennsylvania","44":"Rhode Island","45":"South Carolina","46":"South Dakota",
  "47":"Tennessee","48":"Texas","49":"Utah","50":"Vermont","51":"Virginia","53":"Washington","54":"West Virginia",
  "55":"Wisconsin","56":"Wyoming"
};
const ABBR2NAME = {
  "AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois",
  "IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana",
  "NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania",
  "RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","DC":"District of Columbia"
};

const WORLD_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const US_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const svg = d3.select('#map');
const g = svg.append('g');
const legend = d3.select('#legend');
const logEl = d3.select('#log');

let worldTopo, worldFC, usTopo, usFC;
let nameIndex;
let listConfig = [];         // [{ file, label }], user-controlled order
let colorSlots = [];         // colors by position; reordering swaps which file gets which color

// Get chosen DPI, convert to scale relative to 96dpi
function getDpiScale() {
  const sel = document.getElementById('dpi');
  const dpi = sel ? parseFloat(sel.value) || 300 : 300;
  return Math.max(1, dpi / 96);
}

// Build the List order & colors UI dynamically so no HTML edit is needed
(function setupConfigurator(){
  if (document.getElementById('listsPanel')) return; // already present
  const controls = document.querySelector('.controls');
  if (!controls) return;
  // inject minimal CSS if not present
  if (!document.getElementById('lists-config-css')) {
    const css = document.createElement('style');
    css.id = 'lists-config-css';
    css.textContent = `
      .lists-config { padding: 0.5rem clamp(1rem, 3vw, 2rem); border-bottom: 1px solid var(--border); background: var(--panel); }
      .lists-config h2 { margin: 0 0 .4rem; font-size: 1rem; color: var(--text); }
      .lists-config .hint { margin: 0 0 .6rem; color: var(--muted); font-size: .9rem; }
      .lists-panel { display: grid; grid-template-columns: 1fr auto auto auto; gap: .5rem .6rem; }
      .list-item { display: contents; }
      .list-name { align-self: center; color: var(--text); }
      .list-color { align-self: center; }
      .list-color input[type="color"] { width: 36px; height: 28px; background: transparent; border: 1px solid var(--border); border-radius: 6px; padding: 0; }
      .list-controls { display: inline-flex; gap: .3rem; align-items: center; }
      .list-controls button { padding: .35rem .55rem; border-radius: 6px; }
      .list-index { align-self: center; color: var(--muted); font-variant-numeric: tabular-nums; }
      .geo { transition: opacity .15s ease; } .dim { opacity: .25; }
    `;
    document.head.appendChild(css);
  }
  const section = document.createElement('section');
  section.className = 'lists-config';
  section.innerHTML = `<h2>List order & colors</h2>
    <p class="hint">Use ▲/▼ to reorder which color applies to which file; adjust the color for each position if needed.</p>
    <div id="listsPanel" class="lists-panel"></div>`;
  controls.insertAdjacentElement('afterend', section);
})();

function paletteArray(){ return PALETTES[1]; }

function rebuildListsPanel() {
  const panel = document.getElementById('listsPanel');
  if (!panel) return;
  const pal = paletteArray();
  // ensure colorSlots length
  for (let i=0; i<listConfig.length; i++) if (!colorSlots[i]) colorSlots[i] = pal[i % pal.length];
  colorSlots = colorSlots.slice(0, listConfig.length); // trim extras
  panel.innerHTML = '';
  listConfig.forEach((item, idx) => {
    const row = document.createElement('div'); row.className = 'list-item';
    const name = document.createElement('div'); name.className = 'list-name'; name.textContent = item.label; row.appendChild(name);
    const colorDiv = document.createElement('div'); colorDiv.className = 'list-color';
    const color = document.createElement('input'); color.type = 'color'; color.value = colorSlots[idx];
    color.oninput = (e)=>{ colorSlots[idx] = e.target.value; };
    colorDiv.appendChild(color); row.appendChild(colorDiv);
    const ctrls = document.createElement('div'); ctrls.className = 'list-controls';
    const up = document.createElement('button'); up.textContent = '▲'; up.title = 'Move up';
    up.onclick = ()=>{ if (idx>0){ const t=listConfig[idx]; listConfig[idx]=listConfig[idx-1]; listConfig[idx-1]=t; rebuildListsPanel(); } };
    const dn = document.createElement('button'); dn.textContent = '▼'; dn.title = 'Move down';
    dn.onclick = ()=>{ if (idx<listConfig.length-1){ const t=listConfig[idx]; listConfig[idx]=listConfig[idx+1]; listConfig[idx+1]=t; rebuildListsPanel(); } };
    ctrls.appendChild(up); ctrls.appendChild(dn); row.appendChild(ctrls);
    const ix = document.createElement('div'); ix.className='list-index'; ix.textContent = `#${idx+1}`; row.appendChild(ix);
    panel.appendChild(row);
  });
}

// Seed listConfig/colors when files are selected
document.getElementById('files')?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files || []);
  const pal = paletteArray();
  listConfig = files.map(f => ({ file: f, label: f.name.replace(/\.[A-Za-z0-9]+$/, '') }));
  colorSlots = listConfig.map((_, i) => pal[i % pal.length]);
  rebuildListsPanel();
});


(async function bootstrap() {
  log('Loading basemaps…');
  [worldTopo, usTopo] = await Promise.all([ d3.json(WORLD_URL), d3.json(US_URL) ]);
  worldFC  = topojson.feature(worldTopo, worldTopo.objects.countries);
  usFC     = topojson.feature(usTopo, usTopo.objects.states);
  log('Basemaps loaded.');
})();

function log(msg) { logEl.text(msg); }
function palettes(){ return PALETTES[1]; }
function getProjection(name, width, height, fitFeature=null) {
  const pad = 20;
  const proj = (name === 'mercator') ? d3.geoMercator() : d3.geoRobinson();
  const target = fitFeature || worldFC;
  return proj.fitExtent([[pad, pad], [width - pad, height - pad]], target);
}
function normalize(s) { return (s ?? '').normalize('NFKC').toLowerCase().replace(/^(the )/,'').replace(/[’']/g,"'").replace(/ \(.*\)$/,'').trim(); }
function isoOrNameToName(token) { if(!token) return null; const t=token.trim(); if(!t) return null; if(/^[A-Z]{3}$/.test(t)) return ISO3_TO_NAME[t]||null; return t; }
function buildNameIndex(features) {
  const idx = new Map();
  for (const f of features) { const n = f.properties?.name || f.properties?.NAME || null; if (!n) continue; idx.set(normalize(n), f); }
  // A few aliases to align ISO names to Natural Earth short names
  const ALIAS=[
    ["cote d’ivoire","côte d’ivoire"],["cote d'ivoire","côte d’ivoire"],["ivory coast","côte d’ivoire"],
    ["congo (brazzaville)","congo"],["congo-brazzaville","congo"],
    ["congo (kinshasa)","democratic republic of the congo"],["congo-kinshasa","democratic republic of the congo"],
    ["czech republic","czechia"],
    ["united states","united states of america"],["usa","united states of america"],
    ["uk","united kingdom"],
    ["bosnia and herzegovina","bosnia and herz."] // Natural Earth short label
  ];
  for (const [a,b] of ALIAS) {
    const fb = idx.get(normalize(b));
    if (fb) idx.set(normalize(a), fb);
  }
  return idx;
}
// Keep only largest polygon (approx mainland) to drop outliers
function largestPolygon(geom) {
  if (!geom) return geom;
  if (geom.type === "Polygon") return geom;
  if (geom.type !== "MultiPolygon") return geom;
  let best = null, bestA = -1;
  for (const poly of geom.coordinates) {
    const g = { type: "Polygon", coordinates: poly };
    const a = d3.geoArea(g);
    if (a > bestA) { bestA = a; best = g; }
  }
  return best || geom;
}
function addPattern(color, id, angle=45, density=10, strokeWidth=2) {
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  if (!svg.select(`#${id}`).empty()) return id;
  const pat = defs.append('pattern')
    .attr('id', id).attr('patternUnits','userSpaceOnUse')
    .attr('width', density).attr('height', density)
    .attr('patternTransform', `rotate(${angle})`);
  pat.append('line')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', density)
    .attr('stroke', color).attr('stroke-width', strokeWidth);
  return id;
}

document.getElementById('render').onclick = async () => {
  if (!worldFC || !usFC) { log('Basemap not ready yet…'); return; }
  const projName = document.getElementById('proj').value;
  const pal = palettes();
  const doZoom = document.getElementById('zoom').checked;
  const includeOutliers = document.getElementById('outliers').checked;
  const files = Array.from(document.getElementById('files').files); // raw (fallback only)
  const statesFile = document.getElementById('statesFile').files[0] || null;
  if (!files.length) { log('Please upload one or more country lists (.txt).'); return; }
  nameIndex = buildNameIndex(worldFC.features);

  // Ensure listConfig/colors exist; if empty but files chosen, seed them now
  if (listConfig.length === 0 && files.length) {
    const pal = paletteArray();
    listConfig = files.map(f => ({ file: f, label: f.name.replace(/\.[A-Za-z0-9]+$/, '') }));
    colorSlots = listConfig.map((_, i) => pal[i % pal.length]);
    rebuildListsPanel();
  }
  if (!listConfig.length) { log('Please upload one or more country lists (.txt).'); return; }
  nameIndex = buildNameIndex(worldFC.features);

  // Build country groups from listConfig so order & colors are user-controlled
  const groups = [];
  for (let i=0;i<listConfig.length;i++) {
    const conf = listConfig[i];
    const text = await conf.file.text();
    const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const tokens = lines.map(isoOrNameToName).filter(Boolean);
    groups.push({ label: conf.label, tokens, color: (colorSlots[i] || paletteArray()[i % paletteArray().length]) });
  }


  // membership: normalized name -> list indices (upload order)
  const membership = new Map();
  const unmatchedC = new Set();
  for (let gi=0; gi<groups.length; gi++) {
    for (const t of groups[gi].tokens) {
      const f = nameIndex.get(normalize(t));
      if (!f) { unmatchedC.add(t); continue; }
      const key = normalize(f.properties?.name || f.properties?.NAME);
      const arr = membership.get(key) || [];
      // record all memberships; first index is "base owner"
      arr.push(gi);
      membership.set(key, arr);
    }
  }

  // Base owner: FIRST file wins
  const baseOwner = new Map([...membership.entries()].map(([k, arr]) => [k, arr[0]]));

  g.selectAll('*').remove();
  legend.selectAll('*').remove();
  svg.select('defs').remove();

  // Prepare hatch patterns
  const uniqueColors = Array.from(new Set(groups.map(g => g.color)));
  uniqueColors.forEach(c => {
    addPattern(c, `hatch-slash-${c.replace('#','')}`, 45, 10, 2);
    addPattern(c, `hatch-back-${c.replace('#','')}`, -45, 6, 2);
  });
  // Dots for 4+
  const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
  if (svg.select('#hatch-dots').empty()) {
    const pat = defs.append('pattern')
      .attr('id','hatch-dots').attr('patternUnits','userSpaceOnUse')
      .attr('width',4).attr('height',4);
    pat.append('circle').attr('cx',1).attr('cy',1).attr('r',0.6).attr('fill','#9aa1ac');
  }

  // Build selection for zoom
  let fitFeatures = [];
  worldFC.features.forEach(f => {
    const key = normalize(f.properties?.name || f.properties?.NAME || '');
    const owner = baseOwner.get(key);
    let geom = f.geometry;
    if (!includeOutliers) geom = largestPolygon(geom);
    if (owner==null) return;
    fitFeatures.push({type:"Feature", geometry: geom, properties:{}});
  });
  let fitFeature = null;
  if (doZoom && fitFeatures.length>0) {
    fitFeature = { type:'FeatureCollection', features: fitFeatures };
  }

  const width = parseFloat(svg.attr('width'));
  const height = parseFloat(svg.attr('height'));
  const proj = getProjection(projName, width, height, fitFeature);
  const path = d3.geoPath(proj);

  // Draw base country fills
  worldFC.features.forEach(f => {
    const key = normalize(f.properties?.name || f.properties?.NAME || '');
    const owner = baseOwner.get(key);
    let geom = f.geometry;
    if (!includeOutliers) geom = largestPolygon(geom);
    const fill = (owner==null) ? '#0f1116' : groups[owner].color;
    if (owner==null) {
      g.append('path')
        .attr('class','geo country')
        .attr('data-groups','')
        .attr('d', path(f))
        .attr('fill', '#0f1116')
        .attr('stroke', '#999')
        .attr('stroke-width', 0.7)
    } else {
      const arr = membership.get(key) || [];
      g.append('path')
        .attr('class','geo country')
        .attr('data-groups', arr.join(','))
        .attr('d', path({type:"Feature", geometry: geom}))
        .attr('fill', fill)
        .attr('stroke', '#999')
        .attr('stroke-width', 0.7)
    }
  });

  // Overlay hatches for overlaps
  membership.forEach((arr, key) => {
    const f = nameIndex.get(key);
    if (!f) return;
    let geom = f.geometry;
    if (!includeOutliers) geom = largestPolygon(geom);
    if (arr.length >= 2) {
      const c2 = groups[arr[1]].color;
      g.append('path')
        .attr('class','geo hatch')
        .attr('data-groups', arr.join(','))
        .attr('d', path({type:"Feature", geometry: geom}))
        .attr('fill', `url(#hatch-slash-${c2.replace('#','')})`)
        .attr('stroke','none');
    }
    if (arr.length >= 3) {
      const c3 = groups[arr[2]].color;
      g.append('path')
        .attr('class','geo hatch')
        .attr('data-groups', arr.join(','))
        .attr('d', path({type:"Feature", geometry: geom}))
        .attr('fill', `url(#hatch-back-${c3.replace('#','')})`)
        .attr('stroke','none');
    }
    if (arr.length >= 4) {
      g.append('path')
        .attr('class','geo hatch')
        .attr('data-groups', arr.join(','))
        .attr('d', path({type:"Feature", geometry: geom}))
        .attr('fill','url(#hatch-dots)')
        .attr('stroke','none');
    }
  });

  // US states overlay
  let statesSel = [];
  let statesCount = 0;
  if (statesFile) {
    const statesText = await statesFile.text();
    const lines = statesText.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const NAME2FIPS = new Map(Object.entries(FIPS2NAME).map(([k,v]) => [v.toLowerCase(), k]));
    for (const [abbr,name] of Object.entries(ABBR2NAME)) {
      if (!NAME2FIPS.has(name.toLowerCase())) continue;
      NAME2FIPS.set(abbr.toLowerCase(), NAME2FIPS.get(name.toLowerCase()));
    }
    const wanted = new Set();
    for (const raw of lines) {
      const key = raw.trim().toLowerCase();
      const fips = NAME2FIPS.get(key);
      if (fips) wanted.add(fips);
    }
    statesSel = usFC.features.filter(f => wanted.has(String(f.id).padStart(2,'0')));
    statesCount = statesSel.length;

    statesSel.forEach(f => {
      g.append('path')
        .attr('class','geo state')
        .attr('data-groups','states')
        .attr('d', path(f))
        .attr('fill', '#4e79a7')
        .attr('opacity', 0.9)
        .attr('stroke','none');
    });
    // Haloed boundaries for readability
    const b = topojson.mesh(usTopo, usTopo.objects.states, (a,b)=>a!==b);
    g.append('path').attr('d', path(b)).attr('fill','none').attr('stroke','#000').attr('stroke-width',1.3).attr('opacity',0.8);
    g.append('path').attr('d', path(b)).attr('fill','none').attr('stroke','#fff').attr('stroke-width',0.7).attr('opacity',0.9);
  }

  // Legend with counts (unique per list)
  const legendItems = [];
  const matchedByGroup = groups.map(() => new Set());
  membership.forEach((arr, key) => { arr.forEach(gi => matchedByGroup[gi].add(key)); });
  const groupCounts = matchedByGroup.map(s => s.size);
  groups.forEach((gItem, i) => legendItems.push({color:gItem.color, label:`${gItem.label} [${groupCounts[i]}]`}));
  if (statesCount > 0) legendItems.push({color:"#4e79a7", label:`U.S. states [${statesCount}]`});

  legend.selectAll('div')
    .data(legendItems)
    .enter()
    .append('div')
    .attr('class','legend-item')
    .html(d => `<span class="legend-swatch" style="background:${d.color}"></span>${d.label}`);

  // Interactive legend hover: dim others, highlight matches
  const legendNodes = document.querySelectorAll('#legend .legend-item');
  legendNodes.forEach((node, idx) => {
    let gi = idx < groups.length ? String(idx) : 'states';
    node.dataset.gi = gi;
    node.tabIndex = 0; // keyboard focusable

    const applyHighlight = () => {
      const all = document.querySelectorAll('.geo');
      all.forEach(el => el.classList.add('dim'));
      all.forEach(el => {
        const groupsAttr = (el.getAttribute('data-groups') || '').split(',');
        if (groupsAttr.includes(gi)) el.classList.remove('dim');
      });
    };
    const clearHighlight = () => {
      document.querySelectorAll('.geo').forEach(el => el.classList.remove('dim'));
    };

    node.addEventListener('mouseenter', applyHighlight);
    node.addEventListener('focus', applyHighlight);
    node.addEventListener('mouseleave', clearHighlight);
    node.addEventListener('blur', clearHighlight);
  });

  const issues = [];
  if (unmatchedC.size) issues.push(`Unmatched countries: ${Array.from(unmatchedC).join(', ')}`);
  if (statesFile && statesCount===0) issues.push(`No U.S. states matched. Use full names or USPS codes (e.g., CA, NY, WI).`);
  log(issues.length ? issues.join(' | ') : 'Rendered.');
};

// Exports
document.getElementById('downloadSVG').onclick = () => {
  const s = new XMLSerializer().serializeToString(document.querySelector('svg'));
  const blob = new Blob([s], {type:"image/svg+xml;charset=utf-8"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "travel_map.svg"; a.click();
};
document.getElementById('downloadPNG').onclick = () => {
  const scale = getDpiScale();
  saveSvgAsPng(document.getElementById('map'), 'travel_map.png', { scale });
};
document.getElementById('downloadJPG').onclick = () => {
  const svgNode = document.getElementById('map');
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgNode);

  if (!source.match(/^<svg[^>]+xmlns=/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const width  = parseInt(svgNode.getAttribute('width'))  || svgNode.clientWidth  || 1280;
    const height = parseInt(svgNode.getAttribute('height')) || svgNode.clientHeight || 720;

    const scale = getDpiScale();          // 96 -> 1, 300 -> ~3.125, etc.
    const outW  = Math.round(width * scale);
    const outH  = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width  = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');  // <-- you were missing this line
    ctx.imageSmoothingEnabled  = true;
    ctx.imageSmoothingQuality  = 'high';

    // white background for JPG
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);

    // draw the SVG image scaled to the output size
    ctx.drawImage(img, 0, 0, outW, outH);

    canvas.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'travel_map.jpg';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  };

  img.onerror = () => {
    console.error('Failed to load SVG as image for JPG export.');
    URL.revokeObjectURL(url);
  };

  img.src = url;  // <-- you were missing this line
};

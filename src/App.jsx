import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════
   CONSTANTS & DATA
═══════════════════════════════════════════════ */
const API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

const DISEASE_DB = [
  { id: 1, name: "Powdery Mildew", category: "Fungal", icon: "🍄", severity: "medium", color: "#a8c5a0", plants: ["Rose", "Cucumber", "Squash", "Grape"], symptoms: ["White powdery coating on leaves", "Distorted or stunted new growth", "Yellowing of infected tissue", "Premature leaf drop"], cause: "Caused by various fungal species (Erysiphales). Thrives in warm days with cool nights and high humidity, but unlike most fungi doesn't need wet leaves to spread.", treatment: { immediate: ["Remove and dispose of infected leaves", "Improve air circulation around plant", "Avoid overhead watering"], longTerm: ["Apply neem oil or potassium bicarbonate spray weekly", "Use resistant cultivars when possible"], preventive: ["Space plants adequately", "Water at soil level in morning", "Avoid excessive nitrogen fertilization"] }, spreadRisk: "High", funFact: "Powdery mildew is actually a collection of 900+ different species, each specialized for different host plants." },
  { id: 2, name: "Black Spot", category: "Fungal", icon: "🍄", severity: "high", color: "#8b7355", plants: ["Rose", "Maple", "Strawberry"], symptoms: ["Circular black spots with yellow margins", "Premature defoliation", "Weakened canes over time", "Reduced blooming"], cause: "Diplocarpon rosae fungus. Spores spread through water splash and require leaf wetness for germination. Very common in humid climates.", treatment: { immediate: ["Remove all infected leaves including fallen ones", "Apply copper-based fungicide"], longTerm: ["Weekly fungicide rotation", "Mulch around base to prevent splash"], preventive: ["Choose disease-resistant varieties", "Avoid wetting foliage", "Ensure 6+ hours direct sun"] }, spreadRisk: "High", funFact: "A single black spot lesion can produce thousands of spores that spread to neighboring plants." },
  { id: 3, name: "Root Rot", category: "Fungal", icon: "🍄", severity: "high", color: "#8b4513", plants: ["Most houseplants", "Tomato", "Pepper", "Avocado"], symptoms: ["Yellowing lower leaves", "Wilting despite moist soil", "Mushy dark brown roots", "Stunted growth", "Foul smell from soil"], cause: "Usually caused by Phytophthora or Pythium species thriving in waterlogged, oxygen-deprived soil. Overwatering is the primary trigger.", treatment: { immediate: ["Unpot plant immediately", "Trim all dark/mushy roots with sterile scissors", "Let roots air-dry 30 minutes", "Repot in fresh well-draining mix"], longTerm: ["Reduce watering frequency significantly", "Ensure pot has drainage holes"], preventive: ["Use well-draining soil", "Never let plants sit in standing water", "Allow topsoil to dry between waterings"] }, spreadRisk: "Low", funFact: "Root rot pathogens can persist in soil for years. Always use fresh potting mix when replanting." },
  { id: 4, name: "Leaf Curl Virus", category: "Viral", icon: "🔬", severity: "high", color: "#9b7fa8", plants: ["Tomato", "Pepper", "Cotton", "Squash"], symptoms: ["Upward or downward curling of leaf margins", "Purple discoloration on undersides", "Stunted plant growth", "Reduced fruit set"], cause: "Transmitted by whiteflies (Bemisia tabaci). Once infected, plants cannot be cured. Management focuses on controlling the insect vector.", treatment: { immediate: ["Remove and destroy severely infected plants", "Control whitefly populations with insecticidal soap"], longTerm: ["Use reflective mulch to repel whiteflies", "Install yellow sticky traps"], preventive: ["Use virus-resistant varieties", "Use row covers during early growth", "Manage whitefly populations proactively"] }, spreadRisk: "High", funFact: "Tomato yellow leaf curl virus can be transmitted to a new plant in as little as 15-30 minutes of whitefly feeding." },
  { id: 5, name: "Nitrogen Deficiency", category: "Nutrient", icon: "⚗️", severity: "medium", color: "#c8b870", plants: ["Most plants"], symptoms: ["Yellowing of older/lower leaves first", "Pale green overall color", "Stunted growth", "Thin weak stems", "Reduced yield"], cause: "Insufficient nitrogen in soil due to leaching, poor soil, excessive watering, or overly acidic/alkaline pH preventing uptake.", treatment: { immediate: ["Apply balanced liquid fertilizer immediately", "Test soil pH (ideal 6.0-7.0)"], longTerm: ["Add slow-release nitrogen fertilizer", "Incorporate compost into soil"], preventive: ["Regular soil testing", "Consistent fertilization schedule", "Maintain proper soil pH"] }, spreadRisk: "N/A", funFact: "Nitrogen is the most abundant element in Earth's atmosphere (78%) yet plants can't use it directly — they need it in forms converted by soil bacteria." },
  { id: 6, name: "Iron Chlorosis", category: "Nutrient", icon: "⚗️", severity: "medium", color: "#d4a853", plants: ["Blueberry", "Azalea", "Rose", "Pin Oak"], symptoms: ["Yellowing between leaf veins (veins stay green)", "Affects youngest/newest leaves first", "Browning of leaf edges in severe cases", "Poor overall growth"], cause: "Iron unavailable to plant roots, typically due to high soil pH (above 7.0) rather than actual iron deficiency in soil.", treatment: { immediate: ["Apply chelated iron foliar spray", "Acidify soil with sulfur or acidifying fertilizer"], longTerm: ["Regular soil pH monitoring", "Use acidifying mulch like pine needles"], preventive: ["Plant acid-loving plants in naturally acidic soil", "Avoid over-liming"] }, spreadRisk: "N/A", funFact: "Iron chlorosis is sometimes called 'lime-induced chlorosis' because it's most often caused by too much lime raising soil pH." },
  { id: 7, name: "Aphid Infestation", category: "Pest", icon: "🐛", severity: "medium", color: "#87a96b", plants: ["Rose", "Vegetable crops", "Fruit trees", "Most plants"], symptoms: ["Clusters of tiny insects under leaves", "Sticky honeydew coating on leaves", "Curled or distorted new growth", "Sooty mold growing on honeydew", "Ants farming aphids"], cause: "Rapid-reproducing soft-bodied insects that pierce plant tissue and suck phloem sap. One aphid can produce 80+ offspring per week without mating.", treatment: { immediate: ["Blast with strong stream of water", "Apply insecticidal soap spray", "Introduce ladybugs or lacewings"], longTerm: ["Neem oil weekly applications", "Encourage natural predators"], preventive: ["Avoid over-fertilizing with nitrogen", "Inspect plants regularly", "Use reflective mulch"] }, spreadRisk: "High", funFact: "Aphids are among the most evolutionarily successful insects — they can clone themselves (reproduce asexually) when conditions are good." },
  { id: 8, name: "Spider Mites", category: "Pest", icon: "🐛", severity: "medium", color: "#c4956a", plants: ["Houseplants", "Strawberry", "Cucumber", "Beans"], symptoms: ["Fine webbing on leaves and stems", "Stippled/bronzed leaf appearance", "Tiny moving dots on leaf undersides", "Rapid leaf drop in severe infestations"], cause: "Arachnids (not insects) that thrive in hot, dry conditions. Can reproduce extremely rapidly — from egg to reproductive adult in 5-7 days.", treatment: { immediate: ["Increase humidity around plant", "Wipe leaves with damp cloth", "Apply miticide or insecticidal soap"], longTerm: ["Neem oil applications every 5-7 days", "Introduce predatory mites"], preventive: ["Maintain humidity above 50%", "Avoid water stress", "Regular leaf inspection"] }, spreadRisk: "High", funFact: "Spider mites are technically arachnids, making them more closely related to spiders and scorpions than to insects." },
  { id: 9, name: "Fire Blight", category: "Bacterial", icon: "🦠", severity: "high", color: "#c0603c", plants: ["Apple", "Pear", "Quince", "Hawthorn"], symptoms: ["Shoots die back and turn black/brown", "Wilted shoots hook downward ('shepherd's crook')", "Bark sunken and water-soaked", "Amber bacterial ooze in wet conditions"], cause: "Erwinia amylovora bacteria enter through flowers and wounds. Spreads rapidly during warm, wet spring weather by insects, rain, and pruning tools.", treatment: { immediate: ["Prune 8-12 inches below visible infection", "Sterilize pruning tools between cuts with 10% bleach"], longTerm: ["Apply copper bactericide during dormancy", "Avoid excessive nitrogen"], preventive: ["Plant resistant varieties", "Prune during dry weather", "Minimize wounding"] }, spreadRisk: "High", funFact: "Fire blight bacteria can double in population every 20 minutes under ideal warm, wet conditions." },
  { id: 10, name: "Botrytis (Gray Mold)", category: "Fungal", icon: "🍄", severity: "medium", color: "#9aabb0", plants: ["Tomato", "Strawberry", "Lettuce", "Cannabis", "Peony"], symptoms: ["Gray fuzzy mold on affected tissue", "Brown water-soaked lesions", "Rapid spread in humid conditions", "Entire plant collapse possible"], cause: "Botrytis cinerea fungus thrives in cool, humid, still air. Commonly enters through dead or damaged tissue then spreads to healthy parts.", treatment: { immediate: ["Remove all infected material immediately", "Improve air circulation drastically", "Reduce humidity"], longTerm: ["Apply sulfur or Bacillus subtilis fungicide", "Space plants further apart"], preventive: ["Remove dead flowers and leaves promptly", "Water in morning", "Avoid dense planting"] }, spreadRisk: "Very High", funFact: "The same Botrytis fungus that destroys crops is intentionally cultivated on grapes to make the prized Sauternes and Tokaji dessert wines." },
  { id: 11, name: "Bacterial Leaf Spot", category: "Bacterial", icon: "🦠", severity: "medium", color: "#b5785c", plants: ["Tomato", "Pepper", "Begonia", "Philodendron"], symptoms: ["Water-soaked spots turning brown or black", "Yellow halo around spots", "Spots may fall out leaving holes", "Lower leaves affected first"], cause: "Xanthomonas or Pseudomonas bacteria spread through water splash, contaminated tools, and infected plant material. Favors warm, wet conditions.", treatment: { immediate: ["Remove infected leaves", "Avoid overhead watering", "Apply copper-based bactericide"], longTerm: ["Improve drainage and air circulation", "Rotate crops annually"], preventive: ["Use pathogen-free seeds/transplants", "Sanitize gardening tools regularly"] }, spreadRisk: "Medium", funFact: "Bacterial leaf spot bacteria can survive in soil and plant debris for up to two years between growing seasons." },
  { id: 12, name: "Scale Insects", category: "Pest", icon: "🐛", severity: "medium", color: "#9e8060", plants: ["Citrus", "Ficus", "Magnolia", "Orchid", "Most woody plants"], symptoms: ["Bumpy brown/tan shells attached to stems", "Sticky honeydew on leaves below", "Sooty black mold on honeydew", "Yellowing and wilting of infested branches"], cause: "Armored or soft scale insects attach to plant tissue and feed on sap. They produce a protective shell making them resistant to sprays. Crawlers spread to new plants.", treatment: { immediate: ["Scrub off visible scales with soft brush and soapy water", "Apply horticultural oil spray thoroughly"], longTerm: ["Systemic insecticide application", "Repeat oil sprays every 2-3 weeks for 2 months"], preventive: ["Inspect new plants before introducing to collection", "Monitor regularly with magnifying glass"] }, spreadRisk: "Medium", funFact: "Female scale insects are essentially immobile their entire adult life, but their tiny 'crawler' offspring can spread to neighboring plants on the wind." },
  { id: 13, name: "Fusarium Wilt", category: "Fungal", icon: "🍄", severity: "critical", color: "#c04040", plants: ["Tomato", "Banana", "Watermelon", "Carnation"], symptoms: ["One-sided yellowing of leaves", "Wilting despite adequate moisture", "Brown vascular tissue visible when stem cut", "Plant death in severe cases"], cause: "Fusarium oxysporum soil fungus enters through roots and colonizes the water-conducting xylem vessels, causing the plant to wilt from the inside. Persists in soil for decades.", treatment: { immediate: ["Remove and destroy infected plants entirely", "Do not compost infected material"], longTerm: ["Solarize soil with clear plastic sheeting", "Use biological controls (Trichoderma)"], preventive: ["Use resistant varieties", "Practice 4-year crop rotation", "Avoid injuring roots during transplanting"] }, spreadRisk: "Low", funFact: "Fusarium wilt of banana (Panama Disease) devastated the Gros Michel banana variety in the 1950s, forcing the switch to the Cavendish variety we eat today." },
  { id: 14, name: "Thrips Damage", category: "Pest", icon: "🐛", severity: "medium", color: "#b8a060", plants: ["Onion", "Pepper", "Cucumber", "Rose", "Chrysanthemum"], symptoms: ["Silver-streaked or bronzed leaf surfaces", "Distorted or scarred flowers", "Tiny black specks (frass) on leaves", "Stippling similar to mite damage"], cause: "Tiny (1-2mm) winged insects that rasp plant cells and suck the contents. Can also transmit viruses. Populations explode in warm, dry conditions.", treatment: { immediate: ["Apply insecticidal soap or spinosad spray", "Use blue or yellow sticky traps"], longTerm: ["Introduce predatory mites or minute pirate bugs", "Neem oil weekly"], preventive: ["Avoid drought stress", "Use reflective mulch", "Inspect flowers regularly"] }, spreadRisk: "High", funFact: "Thrips are so light they can travel hundreds of miles on wind currents, making them one of the most migratory agricultural pests." },
  { id: 15, name: "Magnesium Deficiency", category: "Nutrient", icon: "⚗️", severity: "low", color: "#a8c870", plants: ["Tomato", "Rose", "Citrus", "Potato", "Apple"], symptoms: ["Interveinal chlorosis on older leaves", "Reddish-purple discoloration", "Leaves remain attached longer than normal", "Reduced fruit and seed quality"], cause: "Insufficient magnesium, often caused by sandy soils, heavy rain leaching, high potassium or calcium interfering with uptake, or acidic soils below pH 5.5.", treatment: { immediate: ["Apply Epsom salt (magnesium sulfate) foliar spray: 2 tbsp per gallon", "Soil drench with dissolved Epsom salt"], longTerm: ["Incorporate dolomitic limestone if soil pH is low", "Use a balanced fertilizer with magnesium"], preventive: ["Annual soil testing", "Avoid excessive potassium fertilization"] }, spreadRisk: "N/A", funFact: "Magnesium is the central atom in the chlorophyll molecule — without it, plants literally cannot be green." },
];

const buildChatPrompt = (plantData) => {
  const p = plantData?.plantIdentification;
  const h = plantData?.healthAssessment;
  const d = plantData?.diagnosis;
  return `You are BioScan, an expert plant pathologist, botanist, and horticulturist AI assistant.

The user has just scanned the following plant:
- Species: ${p?.commonName || "Unknown"} (${p?.scientificName || "unknown species"})
- Family: ${p?.family || "Unknown"}
- Health Status: ${h?.overallHealth || "Unknown"} — Score: ${h?.healthScore || "?"}/100
- Primary Issue: ${h?.primaryIssue || "None detected"}
- Issue Category: ${h?.issueCategory || "N/A"}
- Severity: ${d?.severity || "none"}
- Spread Risk: ${h?.spreadRisk || "N/A"}
- Root Cause: ${d?.rootCause || "N/A"}

Answer the user's questions about this specific plant with expert knowledge. Be concise (2-4 sentences), practical, and use appropriate botanical/horticultural terminology. If asked about something completely unrelated to plants or gardening, politely redirect. Do not repeat the plant summary unless asked.`;
};

const SYMPTOM_PROMPT = `You are BioScan, an expert plant diagnostician. Analyze the described symptoms and respond ONLY in valid JSON with no markdown or extra text:
{
  "mostLikelyDiagnosis": "string (disease/condition name)",
  "confidence": 85,
  "category": "Fungal Disease",
  "severity": "medium",
  "explanation": "2-3 sentence explanation of what this is and why",
  "immediateActions": ["action1", "action2", "action3"],
  "confirmingSymptoms": ["symptom that would confirm this diagnosis", "another symptom"],
  "alternativeDiagnoses": ["possible alternative 1", "possible alternative 2"],
  "prognosis": "Expected outcome with/without treatment in 1-2 sentences",
  "spreadRisk": "None|Low|Medium|High|Very High"
}
Categories: Fungal Disease | Bacterial Disease | Viral Disease | Pest Damage | Nutrient Deficiency | Environmental Stress | Multiple Issues
Severities: low | medium | high | critical`;

const SYSTEM_PROMPT = `You are BioScan, the world's most advanced plant diagnostics AI combining expertise in plant pathology, botany, horticulture, and agronomy.

When given a plant image, provide a COMPREHENSIVE analysis. Respond ONLY in this exact JSON:
{
  "plantIdentification": {
    "commonName": "string",
    "scientificName": "string (Genus species)",
    "family": "string",
    "origin": "string (native region/continent)",
    "plantType": "string (annual/perennial/tree/shrub/vine/succulent/etc)",
    "description": "string (2-3 sentence botanical description)",
    "growthHabit": "string",
    "matureSize": "string (height x spread)",
    "lifespan": "string",
    "confidence": 0
  },
  "careProfile": {
    "wateringFrequency": "string",
    "wateringAmount": "string",
    "sunlight": "string",
    "hoursOfSun": "string",
    "soilType": "string",
    "soilPH": "string",
    "fertilizer": "string",
    "fertilizerSchedule": "string",
    "humidity": "string",
    "temperature": "string",
    "hardiness": "string",
    "propagation": ["method1"],
    "pruning": "string",
    "repotting": "string"
  },
  "interestingFacts": ["fact1", "fact2", "fact3", "fact4"],
  "edibleInfo": {
    "isEdible": false,
    "edibleParts": "string or null",
    "toxicity": "string"
  },
  "nativeEcology": "string",
  "seasonality": {
    "bloomTime": "string or N/A",
    "dormancy": "string or N/A",
    "peakGrowth": "string"
  },
  "healthAssessment": {
    "overallHealth": "Excellent|Good|Fair|Poor|Critical",
    "healthScore": 0,
    "primaryIssue": "string or null",
    "issueCategory": "Fungal Disease|Bacterial Disease|Viral Disease|Pest Damage|Nutrient Deficiency|Environmental Stress|Healthy",
    "confidence": 0,
    "affectedAreaPercent": "string",
    "spreadRisk": "None|Low|Medium|High|Very High"
  },
  "diagnosis": {
    "symptoms": ["symptom1", "symptom2"],
    "rootCause": "string",
    "severity": "none|low|medium|high|critical",
    "progressionRisk": "string"
  },
  "actionPlan": {
    "urgency": "Immediate|Within 24hrs|Within a Week|Monitor Only",
    "day1": ["action1"],
    "week1": ["action1"],
    "month1": ["action1"],
    "longTerm": ["action1"]
  },
  "products": [
    {"name": "product name", "type": "Fungicide/Fertilizer/etc", "usage": "how to use"}
  ],
  "report": {
    "summary": "string (3-4 sentence executive summary)",
    "prognosis": "string",
    "watchFor": ["warning sign 1", "warning sign 2"]
  }
}`;

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --forest: #0e1a10;
    --deep: #0a120b;
    --bark: #1c2e1e;
    --moss: #2a3d2c;
    --sage: #4a7c59;
    --leaf: #6aab7a;
    --mint: #95d5b2;
    --cream: #f0ebe0;
    --parchment: #e8e0d0;
    --gold: #c8a855;
    --amber: #e8b84b;
    --rust: #c24d2c;
    --lavender: #9b8fc4;
    --sky: #4a9abe;
    --text: #d8d4c8;
    --muted: #7a8070;
    --faint: #3a4a3c;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { background: var(--deep); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--faint); border-radius: 2px; }

  .app {
    background: var(--deep);
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
    position: relative;
    overflow-x: hidden;
  }

  .grain {
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 999; opacity: 0.4;
  }

  .header {
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--faint);
    background: linear-gradient(180deg, var(--deep) 0%, rgba(10,18,11,0.95) 100%);
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(20px);
  }

  .logo-row { display: flex; align-items: center; gap: 12px; }

  .logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--moss), var(--sage));
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-size: 20px;
    box-shadow: 0 4px 20px rgba(106,171,122,0.2); flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px; font-weight: 700; color: #fff;
    letter-spacing: -0.5px; line-height: 1;
  }

  .logo-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px; color: var(--muted); letter-spacing: 3px; margin-top: 2px;
  }

  .nav {
    position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 100%; max-width: 430px;
    background: rgba(10,18,11,0.97); border-top: 1px solid var(--faint);
    display: flex; z-index: 100; backdrop-filter: blur(20px);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .nav-btn {
    flex: 1; padding: 10px 4px 12px; border: none;
    background: transparent; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    transition: all 0.2s;
  }

  .nav-icon { font-size: 19px; transition: transform 0.2s; }
  .nav-btn:hover .nav-icon { transform: translateY(-2px); }

  .nav-label {
    font-size: 9px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; font-family: 'JetBrains Mono', monospace;
    transition: color 0.2s;
  }

  .nav-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--mint); margin-top: 2px; opacity: 0; transition: opacity 0.2s;
  }

  .page { padding: 20px 16px 90px; }

  .upload-zone {
    border: 1.5px dashed var(--moss); border-radius: 20px;
    padding: 48px 24px; text-align: center; cursor: pointer;
    transition: all 0.3s;
    background: linear-gradient(135deg, rgba(42,61,44,0.2), rgba(14,26,16,0.5));
    position: relative; overflow: hidden;
  }

  .upload-zone::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(106,171,122,0.08), transparent 70%);
    pointer-events: none;
  }

  .upload-zone:hover {
    border-color: var(--leaf);
    background: linear-gradient(135deg, rgba(42,61,44,0.35), rgba(14,26,16,0.6));
    box-shadow: 0 0 40px rgba(106,171,122,0.08);
  }

  .upload-icon { font-size: 52px; margin-bottom: 14px; }

  .upload-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 600; color: var(--cream); margin-bottom: 6px;
  }

  .upload-sub { color: var(--muted); font-size: 13px; }

  .btn-primary {
    width: 100%; padding: 15px; border-radius: 14px;
    background: linear-gradient(135deg, var(--sage), var(--leaf));
    border: none; color: #fff; font-size: 14px; font-weight: 600;
    font-family: 'Outfit', sans-serif; cursor: pointer; letter-spacing: 0.5px;
    transition: all 0.2s; box-shadow: 0 4px 20px rgba(106,171,122,0.25);
  }

  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(106,171,122,0.35); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-secondary {
    width: 100%; padding: 13px; border-radius: 14px;
    background: transparent; border: 1px solid var(--faint);
    color: var(--muted); font-size: 13px; font-weight: 500;
    font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  }

  .btn-secondary:hover { border-color: var(--sage); color: var(--mint); }

  .btn-ghost {
    padding: 10px 18px; border-radius: 10px;
    background: rgba(42,61,44,0.4); border: 1px solid var(--faint);
    color: var(--mint); font-size: 12px; font-weight: 600;
    font-family: 'JetBrains Mono', monospace; cursor: pointer;
    letter-spacing: 0.5px; transition: all 0.2s; white-space: nowrap;
  }

  .btn-ghost:hover { background: rgba(74,124,89,0.3); border-color: var(--sage); }

  .card {
    background: linear-gradient(135deg, rgba(28,46,30,0.6), rgba(14,26,16,0.8));
    border: 1px solid var(--faint); border-radius: 16px;
    padding: 16px; margin-bottom: 12px; position: relative; overflow: hidden;
  }

  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(149,213,178,0.2), transparent);
  }

  .card-title {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--muted); letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
  }

  .search-input {
    width: 100%; padding: 12px 16px 12px 42px;
    background: rgba(28,46,30,0.5); border: 1px solid var(--faint);
    border-radius: 12px; color: var(--cream); font-size: 14px;
    font-family: 'Outfit', sans-serif; outline: none; transition: all 0.2s;
  }

  .search-input:focus { border-color: var(--sage); box-shadow: 0 0 0 3px rgba(74,124,89,0.15); }
  .search-input::placeholder { color: var(--muted); }
  .search-wrap { position: relative; margin-bottom: 16px; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--muted); pointer-events: none; }

  .tabs {
    display: flex; background: rgba(14,26,16,0.8); border-radius: 12px;
    padding: 4px; margin-bottom: 16px; border: 1px solid var(--faint);
    overflow-x: auto; gap: 2px;
  }

  .tab {
    flex: 1; padding: 8px 10px; border: none;
    background: transparent; color: var(--muted); font-size: 11px;
    font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase;
    cursor: pointer; border-radius: 8px; transition: all 0.2s;
    white-space: nowrap; font-family: 'JetBrains Mono', monospace;
  }

  .tab.active {
    background: linear-gradient(135deg, var(--moss), var(--sage));
    color: #fff; box-shadow: 0 2px 10px rgba(74,124,89,0.3);
  }

  .score-ring { position: relative; width: 100px; height: 100px; flex-shrink: 0; }
  .score-svg { transform: rotate(-90deg); }

  .score-number {
    position: absolute; inset: 0; display: flex;
    flex-direction: column; align-items: center; justify-content: center;
  }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 10px; border-radius: 20px; font-size: 11px;
    font-weight: 600; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px;
  }

  .timeline-item { display: flex; gap: 14px; margin-bottom: 16px; position: relative; }

  .timeline-line {
    position: absolute; left: 15px; top: 32px; bottom: -16px;
    width: 1px; background: var(--faint);
  }

  .timeline-dot {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; position: relative; z-index: 1;
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 8px rgba(149,213,178,0.3); } 50% { box-shadow: 0 0 20px rgba(149,213,178,0.6); } }

  .fade-up { animation: fadeUp 0.4s ease both; }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.1s; }
  .fade-up-3 { animation-delay: 0.15s; }
  .fade-up-4 { animation-delay: 0.2s; }
  .loading-pulse { animation: pulse 1.5s ease infinite; }
  .slide-in { animation: slideIn 0.3s ease both; }

  .reminder-card {
    background: linear-gradient(135deg, rgba(28,46,30,0.7), rgba(14,26,16,0.9));
    border: 1px solid var(--faint); border-radius: 14px;
    padding: 14px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;
  }

  .reminder-card:hover { border-color: var(--sage); transform: translateY(-1px); }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 16px 0; color: var(--faint); font-size: 16px;
  }

  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--faint); }

  .img-preview {
    width: 100%; height: 220px; object-fit: cover;
    border-radius: 16px; margin-bottom: 16px; border: 1px solid var(--faint);
  }

  .category-pill {
    padding: 3px 10px; border-radius: 20px;
    font-size: 10px; font-family: 'JetBrains Mono', monospace;
    font-weight: 500; letter-spacing: 0.5px;
  }

  .history-item {
    display: flex; gap: 12px; align-items: center;
    background: rgba(28,46,30,0.4); border: 1px solid var(--faint);
    border-radius: 14px; padding: 12px; margin-bottom: 10px;
    cursor: pointer; transition: all 0.2s;
  }

  .history-item:hover { border-color: var(--sage); background: rgba(42,61,44,0.5); }

  .chip {
    padding: 4px 10px; background: rgba(74,124,89,0.15);
    border: 1px solid rgba(74,124,89,0.3); border-radius: 20px;
    font-size: 11px; color: var(--mint); display: inline-block;
  }

  /* Chat styles */
  .chat-container {
    display: flex; flex-direction: column; gap: 12px;
    max-height: 380px; overflow-y: auto; padding: 4px 0;
  }

  .chat-bubble-user {
    align-self: flex-end; max-width: 82%; padding: 10px 14px;
    background: linear-gradient(135deg, var(--moss), var(--sage));
    border-radius: 16px 16px 4px 16px; color: #fff;
    font-size: 13px; line-height: 1.5;
  }

  .chat-bubble-ai {
    align-self: flex-start; max-width: 88%; padding: 10px 14px;
    background: rgba(28,46,30,0.8); border: 1px solid var(--faint);
    border-radius: 16px 16px 16px 4px; color: var(--text);
    font-size: 13px; line-height: 1.6;
  }

  .chat-input-row {
    display: flex; gap: 8px; margin-top: 12px;
  }

  .chat-input {
    flex: 1; padding: 10px 14px;
    background: rgba(28,46,30,0.6); border: 1px solid var(--faint);
    border-radius: 12px; color: var(--cream); font-size: 13px;
    font-family: 'Outfit', sans-serif; outline: none; transition: all 0.2s;
    resize: none;
  }

  .chat-input:focus { border-color: var(--sage); box-shadow: 0 0 0 2px rgba(74,124,89,0.15); }
  .chat-input::placeholder { color: var(--muted); }

  .chat-send-btn {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, var(--sage), var(--leaf));
    border: none; cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
  }

  .chat-send-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(106,171,122,0.4); }
  .chat-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Treatment tracker */
  .treatment-item {
    display: flex; gap: 10px; align-items: flex-start;
    padding: 10px 12px; border-radius: 10px;
    background: rgba(14,26,16,0.5); border: 1px solid var(--faint);
    margin-bottom: 8px; cursor: pointer; transition: all 0.2s;
  }

  .treatment-item.done {
    background: rgba(106,171,122,0.06); border-color: rgba(106,171,122,0.2);
  }

  .treatment-check {
    width: 18px; height: 18px; border-radius: 50%;
    border: 1.5px solid var(--faint); display: flex;
    align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
    transition: all 0.2s;
  }

  .treatment-item.done .treatment-check {
    background: var(--sage); border-color: var(--sage);
  }

  /* Symptom checker */
  .symptom-textarea {
    width: 100%; min-height: 120px; padding: 14px;
    background: rgba(28,46,30,0.5); border: 1px solid var(--faint);
    border-radius: 14px; color: var(--cream); font-size: 14px;
    font-family: 'Outfit', sans-serif; outline: none;
    resize: vertical; transition: all 0.2s; line-height: 1.6;
  }

  .symptom-textarea:focus { border-color: var(--sage); box-shadow: 0 0 0 3px rgba(74,124,89,0.1); }
  .symptom-textarea::placeholder { color: var(--muted); }

  /* Notes */
  .notes-area {
    width: 100%; min-height: 80px; padding: 12px;
    background: rgba(28,46,30,0.4); border: 1px solid var(--faint);
    border-radius: 12px; color: var(--cream); font-size: 13px;
    font-family: 'Outfit', sans-serif; outline: none; resize: vertical;
    transition: all 0.2s; line-height: 1.6;
  }

  .notes-area:focus { border-color: var(--sage); }
  .notes-area::placeholder { color: var(--muted); }

  /* Mode toggle */
  .mode-toggle {
    display: flex; background: rgba(14,26,16,0.8); border-radius: 12px;
    padding: 4px; border: 1px solid var(--faint); margin-bottom: 20px;
  }

  .mode-btn {
    flex: 1; padding: 10px; border: none; background: transparent;
    color: var(--muted); font-size: 12px; font-weight: 600;
    cursor: pointer; border-radius: 8px; transition: all 0.2s;
    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px;
  }

  .mode-btn.active {
    background: linear-gradient(135deg, var(--moss), var(--sage));
    color: #fff; box-shadow: 0 2px 10px rgba(74,124,89,0.3);
  }

  /* Garden stats */
  .stat-card {
    flex: 1; background: rgba(28,46,30,0.5); border: 1px solid var(--faint);
    border-radius: 14px; padding: 14px; text-align: center;
  }

  /* Confidence bar */
  .conf-bar {
    height: 4px; border-radius: 2px;
    background: linear-gradient(90deg, var(--sage), var(--mint));
    transition: width 0.8s ease;
  }

  /* Tag input */
  .plant-name-input {
    padding: 6px 10px; background: rgba(14,26,16,0.8);
    border: 1px solid var(--faint); border-radius: 8px;
    color: var(--cream); font-size: 12px;
    font-family: 'Outfit', sans-serif; outline: none;
    transition: border-color 0.2s;
  }

  .plant-name-input:focus { border-color: var(--sage); }
`;

/* ═══════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════ */
const healthColor = (score) => {
  if (score >= 80) return "#6aab7a";
  if (score >= 60) return "#c8a855";
  if (score >= 40) return "#e8854b";
  return "#c24d2c";
};

const severityConfig = {
  none: { color: "#6aab7a", bg: "rgba(106,171,122,0.1)", label: "None" },
  low: { color: "#c8a855", bg: "rgba(200,168,85,0.1)", label: "Low" },
  medium: { color: "#e8854b", bg: "rgba(232,133,75,0.1)", label: "Medium" },
  high: { color: "#c24d2c", bg: "rgba(194,77,44,0.1)", label: "High" },
  critical: { color: "#a0001e", bg: "rgba(160,0,30,0.1)", label: "Critical" },
};

const healthConfig = {
  Excellent: { color: "#6aab7a", emoji: "✦" },
  Good: { color: "#95d5b2", emoji: "◈" },
  Fair: { color: "#c8a855", emoji: "◉" },
  Poor: { color: "#e8854b", emoji: "◎" },
  Critical: { color: "#c24d2c", emoji: "◌" },
};

function HealthRing({ score }) {
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = healthColor(score);
  return (
    <div className="score-ring">
      <svg width="100" height="100" className="score-svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(42,61,44,0.5)" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 6px ${color}55)` }} />
      </svg>
      <div className="score-number">
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: "700", color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--muted)", letterSpacing: "1px" }}>HEALTH</span>
      </div>
    </div>
  );
}

function Badge({ children, color = "#6aab7a", bg }) {
  return (
    <span className="badge" style={{ background: bg || `${color}18`, color, border: `1px solid ${color}40` }}>
      {children}
    </span>
  );
}

function SeverityBar({ severity }) {
  const cfg = severityConfig[severity] || severityConfig.none;
  const levels = ["none", "low", "medium", "high", "critical"];
  const idx = levels.indexOf(severity);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "1px" }}>SEVERITY</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: cfg.color, fontWeight: "600" }}>{cfg.label.toUpperCase()}</span>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {levels.map((l, i) => (
          <div key={l} style={{ flex: 1, height: "5px", borderRadius: "3px", background: i <= idx ? severityConfig[l].color : "var(--faint)", transition: "background 0.5s", boxShadow: i === idx ? `0 0 6px ${cfg.color}` : "none" }} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AI CHAT TAB
═══════════════════════════════════════════════ */
function ChatTab({ plantData }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi! I've analyzed your ${plantData?.plantIdentification?.commonName || "plant"}. Ask me anything — treatment options, care tips, what to watch for, or anything else about this plant.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const systemPrompt = buildChatPrompt(plantData);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = history.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 500, system: systemPrompt, messages: apiMessages })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please check your network and try again." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const SUGGESTED = ["How do I prevent this from spreading?", "Is this plant safe for pets?", "What's the best treatment product?", "When should I see improvement?"];

  return (
    <div className="fade-up">
      <div className="card" style={{ borderColor: "rgba(149,213,178,0.2)" }}>
        <div className="card-title" style={{ color: "var(--mint)" }}>🤖 AI PLANT EXPERT CHAT</div>
        <div className="chat-container">
          {messages.map((m, i) => (
            <div key={i} className={`slide-in ${m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              {m.role === "assistant" && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--mint)", letterSpacing: "1px", marginBottom: "4px" }}>BIOSCAN AI</div>
              )}
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble-ai loading-pulse">
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--mint)", letterSpacing: "1px", marginBottom: "4px" }}>BIOSCAN AI</div>
              Analyzing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about this plant..."
            rows={2}
          />
          <button className="chat-send-btn" onClick={send} disabled={loading || !input.trim()}>
            {loading ? <span style={{ fontSize: "14px", animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : "↑"}
          </button>
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="card">
          <div className="card-title">💡 SUGGESTED QUESTIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {SUGGESTED.map((q, i) => (
              <button key={i} onClick={() => setInput(q)} style={{
                padding: "10px 14px", background: "rgba(42,61,44,0.3)", border: "1px solid var(--faint)",
                borderRadius: "10px", color: "var(--text)", fontSize: "13px", cursor: "pointer",
                textAlign: "left", transition: "all 0.2s", fontFamily: "'Outfit', sans-serif"
              }}
                onMouseEnter={e => { e.target.style.borderColor = "var(--sage)"; e.target.style.color = "var(--mint)"; }}
                onMouseLeave={e => { e.target.style.borderColor = "var(--faint)"; e.target.style.color = "var(--text)"; }}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SYMPTOM CHECKER
═══════════════════════════════════════════════ */
function SymptomChecker({ onSymptomResult }) {
  const [symptoms, setSymptoms] = useState("");
  const [plantName, setPlantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const diagnose = async () => {
    if (!symptoms.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const prompt = `Plant: ${plantName || "Unknown"}\nSymptoms described: ${symptoms}\n\nDiagnose this plant condition.`;
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, max_tokens: 600,
          system: SYMPTOM_PROMPT,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const txt = data.content?.[0]?.text || "";
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch { setError("Diagnosis failed. Please describe symptoms more clearly and try again."); }
    setLoading(false);
  };

  if (result) {
    const sev = severityConfig[result.severity] || severityConfig.medium;
    return (
      <div className="fade-up">
        <button onClick={() => { setResult(null); setSymptoms(""); setPlantName(""); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", marginBottom: "16px", fontSize: "13px" }}>
          ← New Diagnosis
        </button>

        <div className="card" style={{ borderColor: `${sev.color}40`, borderLeft: `3px solid ${sev.color}` }}>
          <div className="card-title">🔬 SYMPTOM DIAGNOSIS</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: "700", color: "var(--cream)", marginBottom: "4px" }}>{result.mostLikelyDiagnosis}</div>
              <Badge color={sev.color}>{result.severity?.toUpperCase()} severity</Badge>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: result.confidence >= 70 ? "#6aab7a" : "#c8a855" }}>{result.confidence}%</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--muted)" }}>CONFIDENCE</div>
            </div>
          </div>
          <div style={{ height: "4px", borderRadius: "2px", background: "var(--faint)", marginBottom: "14px" }}>
            <div className="conf-bar" style={{ width: `${result.confidence}%` }} />
          </div>
          <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{result.explanation}</p>
        </div>

        <div className="card">
          <div className="card-title" style={{ color: "#c24d2c" }}>⚡ IMMEDIATE ACTIONS</div>
          {result.immediateActions?.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(194,77,44,0.15)", border: "1px solid rgba(194,77,44,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#c24d2c", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
              <span style={{ color: "var(--text)", fontSize: "13px", lineHeight: "1.6" }}>{a}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ color: "var(--mint)" }}>✓ CONFIRMING SYMPTOMS TO LOOK FOR</div>
          {result.confirmingSymptoms?.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
              <span style={{ color: "var(--mint)", fontSize: "12px" }}>›</span>
              <span style={{ color: "var(--text)", fontSize: "13px" }}>{s}</span>
            </div>
          ))}
        </div>

        {result.alternativeDiagnoses?.length > 0 && (
          <div className="card">
            <div className="card-title">◈ ALTERNATIVE POSSIBILITIES</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {result.alternativeDiagnoses.map((a, i) => <span key={i} className="chip">{a}</span>)}
            </div>
          </div>
        )}

        <div className="card" style={{ background: "rgba(200,168,85,0.06)", borderColor: "rgba(200,168,85,0.2)" }}>
          <div className="card-title" style={{ color: "var(--gold)" }}>◆ PROGNOSIS</div>
          <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{result.prognosis}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: "700", color: "var(--cream)", marginBottom: "4px" }}>Symptom <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Checker</span></h2>
        <p style={{ color: "var(--muted)", fontSize: "13px" }}>Describe what you see — get an AI diagnosis without a photo</p>
      </div>

      {error && (
        <div style={{ background: "rgba(194,77,44,0.1)", border: "1px solid rgba(194,77,44,0.3)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", color: "#e8854b", fontSize: "13px" }}>
          ⚠ {error}
        </div>
      )}

      <div className="card">
        <div className="card-title">🌿 PLANT NAME (OPTIONAL)</div>
        <input
          value={plantName}
          onChange={e => setPlantName(e.target.value)}
          placeholder="e.g. Tomato, Rose, Peace Lily..."
          style={{ width: "100%", padding: "10px 12px", background: "rgba(14,26,16,0.8)", border: "1px solid var(--faint)", borderRadius: "10px", color: "var(--cream)", fontSize: "14px", fontFamily: "'Outfit', sans-serif", outline: "none", marginBottom: "0" }}
        />
      </div>

      <div className="card">
        <div className="card-title">📋 DESCRIBE THE SYMPTOMS</div>
        <textarea
          className="symptom-textarea"
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="Be specific: describe leaf color changes, spots, texture, affected areas, how long ago you noticed, recent watering or care changes...

Example: 'Yellow spots with brown edges on lower leaves, started 2 weeks ago, some spots have a fuzzy white coating, spreads when I water overhead'"
        />
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          {["Yellowing leaves", "Brown spots", "Wilting", "White coating", "Sticky residue", "Holes in leaves"].map(t => (
            <button key={t} onClick={() => setSymptoms(s => s ? `${s}, ${t.toLowerCase()}` : t.toLowerCase())}
              style={{ padding: "5px 10px", borderRadius: "20px", border: "1px solid var(--faint)", background: "transparent", color: "var(--muted)", fontSize: "11px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "var(--sage)"; e.target.style.color = "var(--mint)"; }}
              onMouseLeave={e => { e.target.style.borderColor = "var(--faint)"; e.target.style.color = "var(--muted)"; }}>
              + {t}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={diagnose} disabled={loading || !symptoms.trim()}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
            <span className="loading-pulse">Diagnosing symptoms...</span>
          </span>
        ) : "🔬 Diagnose Symptoms"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SCAN PAGE
═══════════════════════════════════════════════ */
function ScanPage({ onResult }) {
  const [mode, setMode] = useState("photo");
  const [image, setImage] = useState(null);
  const [b64, setB64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [camera, setCamera] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const steps = ["Analyzing image...", "Identifying species...", "Diagnosing health...", "Building action plan...", "Finalizing report..."];

  useEffect(() => {
    let t;
    if (loading) t = setInterval(() => setStep(s => (s + 1) % steps.length), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const toB64 = (file) => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(",")[1]); fr.readAsDataURL(file); });

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(URL.createObjectURL(f));
    setB64(await toB64(f));
    setError(null);
  };

  const startCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setCamera(true);
    } catch { setError("Camera unavailable. Please upload a photo instead."); }
  };

  const stopCam = () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); setCamera(false); };

  const capture = () => {
    const c = canvasRef.current, v = videoRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const url = c.toDataURL("image/jpeg");
    setImage(url); setB64(url.split(",")[1]);
    stopCam(); setError(null);
  };

  const analyze = async () => {
    if (!b64) return;
    setLoading(true); setError(null); setStep(0);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL, max_tokens: 1000, system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
            { type: "text", text: "Perform a comprehensive analysis of this plant. Identify the species and assess its health thoroughly." }
          ]}]
        })
      });
      const data = await res.json();
      const txt = data.content.map(b => b.text || "").join("");
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      onResult({ result: parsed, image, timestamp: new Date() });
    } catch { setError("Analysis failed. Please use a clear, well-lit plant photo and try again."); }
    setLoading(false);
  };

  const reset = () => { setImage(null); setB64(null); setError(null); };

  return (
    <div className="page">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "30px", fontWeight: "700", color: "var(--cream)", lineHeight: 1.1, marginBottom: "6px" }}>
          Plant<br /><span style={{ color: "var(--mint)", fontStyle: "italic" }}>Diagnostics</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.6" }}>AI-powered species identification & disease analysis</p>
      </div>

      <div className="mode-toggle">
        <button className={`mode-btn ${mode === "photo" ? "active" : ""}`} onClick={() => setMode("photo")}>📷 Photo Scan</button>
        <button className={`mode-btn ${mode === "symptom" ? "active" : ""}`} onClick={() => setMode("symptom")}>📋 Symptom Check</button>
      </div>

      {mode === "symptom" ? (
        <SymptomChecker />
      ) : (
        <>
          {error && (
            <div style={{ background: "rgba(194,77,44,0.1)", border: "1px solid rgba(194,77,44,0.3)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px", color: "#e8854b", fontSize: "13px" }}>
              ⚠ {error}
            </div>
          )}

          {camera ? (
            <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", marginBottom: "16px", border: "1px solid var(--faint)" }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "320px", objectFit: "cover", display: "block" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "20px", gap: "12px" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "55%", height: "55%", border: "2px solid rgba(149,213,178,0.6)", borderRadius: "12px", pointerEvents: "none" }}>
                  {[["top", "left", "borderTop", "borderLeft"], ["top", "right", "borderTop", "borderRight"], ["bottom", "left", "borderBottom", "borderLeft"], ["bottom", "right", "borderBottom", "borderRight"]].map(([v, h, b1, b2], i) => (
                    <div key={i} style={{ position: "absolute", [v]: -2, [h]: -2, width: 16, height: 16, [b1]: "3px solid var(--mint)", [b2]: "3px solid var(--mint)", borderRadius: v === "top" ? (h === "left" ? "2px 0 0 0" : "0 2px 0 0") : (h === "left" ? "0 0 0 2px" : "0 0 2px 0") }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={capture} style={{ width: "68px", height: "68px", borderRadius: "50%", background: "#fff", border: "4px solid var(--mint)", cursor: "pointer", fontSize: "26px", display: "flex", alignItems: "center", justifyContent: "center" }}>📸</button>
                  <button onClick={stopCam} style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid #333", cursor: "pointer", color: "#888", fontSize: "16px", alignSelf: "center" }}>✕</button>
                </div>
              </div>
            </div>
          ) : image ? (
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <img src={image} alt="Plant" className="img-preview" />
              <button onClick={reset} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.7)", border: "1px solid #333", borderRadius: "50%", width: "30px", height: "30px", color: "#fff", cursor: "pointer", fontSize: "14px" }}>✕</button>
            </div>
          ) : (
            <div className="upload-zone" onClick={() => fileRef.current?.click()} style={{ marginBottom: "16px" }}>
              <div className="upload-icon">🌿</div>
              <div className="upload-title">Upload Plant Photo</div>
              <div className="upload-sub">Tap to browse • Supports any image format</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {image && !camera && (
              <button className="btn-primary" onClick={analyze} disabled={loading}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                    <span className="loading-pulse">{steps[step]}</span>
                  </span>
                ) : "🔬 Run Full Analysis"}
              </button>
            )}
            {!camera && !image && <button className="btn-secondary" onClick={startCam}>📷 Use Camera</button>}
            {image && !loading && <button className="btn-secondary" onClick={reset}>Choose Different Photo</button>}
          </div>

          {!image && !camera && (
            <div style={{ marginTop: "28px" }}>
              <div className="divider">🌱</div>
              <div className="card">
                <div className="card-title">📸 Tips for Best Results</div>
                {["Fill the frame with the plant", "Include both healthy & affected areas", "Ensure bright, natural lighting", "Keep camera steady — avoid blur", "Capture leaf undersides for pests"].map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--mint)", marginTop: "2px", flexShrink: 0 }}>0{i + 1}</span>
                    <span style={{ color: "var(--muted)", fontSize: "13px" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RESULTS PAGE
═══════════════════════════════════════════════ */
function ResultsPage({ data, onNewScan, onUpdateEntry }) {
  const [tab, setTab] = useState("overview");
  const [notes, setNotes] = useState(data.notes || "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`bioscan_checks_${data.id}`) || "{}"); } catch { return {}; }
  });

  const { result, image } = data;
  const p = result.plantIdentification;
  const care = result.careProfile;
  const health = result.healthAssessment;
  const diag = result.diagnosis;
  const plan = result.actionPlan;
  const report = result.report;

  const sev = diag?.severity || "none";
  const sevCfg = severityConfig[sev];
  const hCfg = healthConfig[health?.overallHealth] || healthConfig.Good;

  const toggleCheck = (key) => {
    const updated = { ...checkedItems, [key]: !checkedItems[key] };
    setCheckedItems(updated);
    localStorage.setItem(`bioscan_checks_${data.id}`, JSON.stringify(updated));
  };

  const saveNotes = () => {
    setEditingNotes(false);
    onUpdateEntry?.({ ...data, notes });
  };

  const exportReport = () => {
    const content = `BIOSCAN PLANT DIAGNOSTIC REPORT\nGenerated: ${new Date().toLocaleString()}\n${"━".repeat(40)}\n\nPLANT: ${p?.commonName} (${p?.scientificName})\nHEALTH: ${health?.overallHealth} (${health?.healthScore}/100)\nISSUE: ${health?.primaryIssue || "None"}\nSEVERITY: ${diag?.severity?.toUpperCase()}\n\nSUMMARY\n${report?.summary}\n\nSYMPTOMS\n${diag?.symptoms?.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nROOT CAUSE\n${diag?.rootCause}\n\nACTION PLAN\nUrgency: ${plan?.urgency}\nDay 1: ${plan?.day1?.join(", ")}\nWeek 1: ${plan?.week1?.join(", ")}\n\nNOTES\n${notes || "None"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bioscan-${p?.commonName?.replace(/\s/g, "-")}-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const shareReport = () => {
    const text = `🌿 BioScan Report\n${p?.commonName} — ${health?.overallHealth} health (${health?.healthScore}/100)\n${health?.primaryIssue ? `Issue: ${health.primaryIssue}` : "No issues detected!"}\n\nGenerated with BioScan Plant Diagnostics`;
    if (navigator.share) navigator.share({ title: "BioScan Report", text });
    else { navigator.clipboard?.writeText(text); }
  };

  const totalItems = [...(plan?.day1 || []), ...(plan?.week1 || []), ...(plan?.month1 || []), ...(plan?.longTerm || [])];
  const doneCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPct = totalItems.length > 0 ? Math.round((doneCount / totalItems.length) * 100) : 0;

  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative" }}>
        {image && <img src={image} alt={p?.commonName} style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, var(--deep) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 16px 12px" }}>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
            <Badge color={hCfg.color}>{hCfg.emoji} {health?.overallHealth}</Badge>
            {health?.primaryIssue && health.primaryIssue !== "null" && <Badge color={sevCfg.color}>{health.primaryIssue}</Badge>}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "#fff", lineHeight: 1.1 }}>{data.customName || p?.commonName}</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", fontStyle: "italic" }}>{p?.scientificName}</p>
        </div>
        <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px" }}>
          <button className="btn-ghost" onClick={shareReport}>Share</button>
          <button className="btn-ghost" onClick={exportReport}>Export</button>
        </div>
      </div>

      <div style={{ padding: "16px 16px 90px" }}>
        {/* Score + Progress Row */}
        <div className="card fade-up" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <HealthRing score={health?.healthScore || 75} />
          <div style={{ flex: 1 }}>
            <SeverityBar severity={sev} />
            <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "2px" }}>AFFECTED</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: "700", color: "var(--cream)" }}>{health?.affectedAreaPercent}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "2px" }}>SPREAD RISK</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: "700", color: health?.spreadRisk === "High" || health?.spreadRisk === "Very High" ? "#c24d2c" : "var(--cream)" }}>{health?.spreadRisk}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "2px" }}>URGENCY</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "14px", fontWeight: "700", color: plan?.urgency === "Immediate" ? "#c24d2c" : "var(--cream)" }}>{plan?.urgency}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Progress */}
        {totalItems.length > 0 && (
          <div className="card fade-up fade-up-1">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div className="card-title" style={{ marginBottom: 0 }}>✓ TREATMENT PROGRESS</div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: "700", color: progressPct === 100 ? "#6aab7a" : "var(--cream)" }}>{progressPct}%</span>
            </div>
            <div style={{ height: "4px", borderRadius: "2px", background: "var(--faint)", marginBottom: "0" }}>
              <div style={{ height: "100%", borderRadius: "2px", background: progressPct === 100 ? "#6aab7a" : "linear-gradient(90deg, var(--sage), var(--mint))", width: `${progressPct}%`, transition: "width 0.5s ease" }} />
            </div>
            {progressPct === 100 && <div style={{ marginTop: "8px", fontSize: "12px", color: "#6aab7a", fontFamily: "'JetBrains Mono', monospace" }}>✦ All treatment steps complete!</div>}
          </div>
        )}

        {/* Summary */}
        <div className="card fade-up fade-up-1" style={{ borderLeft: "3px solid var(--mint)" }}>
          <div className="card-title">◆ DIAGNOSTIC SUMMARY</div>
          <p style={{ color: "var(--text)", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", lineHeight: "1.7", fontStyle: "italic" }}>{report?.summary}</p>
        </div>

        {/* Tabs */}
        <div className="tabs fade-up fade-up-2">
          {[
            { key: "overview", label: "Report" },
            { key: "diagnosis", label: "Diagnosis" },
            { key: "action", label: "Plan" },
            { key: "chat", label: "💬 Chat" },
            { key: "plant", label: "Species" },
            { key: "care", label: "Care" },
            { key: "notes", label: "Notes" },
          ].map(({ key, label }) => (
            <button key={key} className={`tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {tab === "overview" && (
          <div className="fade-up">
            {diag?.symptoms?.length > 0 && (
              <div className="card">
                <div className="card-title">⬡ Symptoms Observed</div>
                {diag.symptoms.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(149,213,178,0.15)", border: "1px solid var(--mint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: "var(--mint)", flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
                    <span style={{ color: "var(--text)", fontSize: "13px", lineHeight: "1.6" }}>{s}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="card">
              <div className="card-title">◈ Prognosis</div>
              <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{report?.prognosis}</p>
            </div>
            {report?.watchFor?.length > 0 && (
              <div className="card" style={{ background: "rgba(194,77,44,0.06)", borderColor: "rgba(194,77,44,0.2)" }}>
                <div className="card-title" style={{ color: "#e8854b" }}>⚠ Watch For</div>
                {report.watchFor.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ color: "#e8854b", fontSize: "12px" }}>›</span>
                    <span style={{ color: "var(--text)", fontSize: "13px" }}>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: DIAGNOSIS */}
        {tab === "diagnosis" && (
          <div className="fade-up">
            <div className="card">
              <div className="card-title">◉ Root Cause</div>
              <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{diag?.rootCause}</p>
            </div>
            {diag?.progressionRisk && (
              <div className="card">
                <div className="card-title">⏱ Progression Risk</div>
                <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{diag.progressionRisk}</p>
              </div>
            )}
            <div className="card">
              <div className="card-title">◆ Category</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "32px" }}>
                  {health?.issueCategory === "Fungal Disease" ? "🍄" : health?.issueCategory === "Bacterial Disease" ? "🦠" : health?.issueCategory === "Viral Disease" ? "🔬" : health?.issueCategory === "Pest Damage" ? "🐛" : health?.issueCategory === "Nutrient Deficiency" ? "⚗️" : "🌿"}
                </span>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: "600", color: "var(--cream)" }}>{health?.issueCategory}</div>
                  <div style={{ color: "var(--muted)", fontSize: "12px" }}>Confidence: {health?.confidence}%</div>
                </div>
              </div>
            </div>
            {result.products?.length > 0 && (
              <div className="card">
                <div className="card-title">🧪 Recommended Products</div>
                {result.products.map((prod, i) => (
                  <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: i < result.products.length - 1 ? "1px solid var(--faint)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "600", color: "var(--cream)", fontSize: "14px" }}>{prod.name}</span>
                      <span className="category-pill" style={{ background: "rgba(74,124,89,0.15)", color: "var(--mint)", border: "1px solid rgba(74,124,89,0.3)" }}>{prod.type}</span>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: "12px" }}>{prod.usage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ACTION PLAN with Treatment Tracker */}
        {tab === "action" && (
          <div className="fade-up">
            <div style={{ background: "rgba(200,168,85,0.08)", border: "1px solid rgba(200,168,85,0.2)", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--gold)", letterSpacing: "1px" }}>ACTION TIMELINE — {plan?.urgency?.toUpperCase()}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)" }}>{doneCount}/{totalItems.length} done</span>
              </div>
            </div>
            {[
              { label: "Day 1", emoji: "⚡", color: "#c24d2c", items: plan?.day1, bg: "rgba(194,77,44,0.1)" },
              { label: "Week 1", emoji: "📅", color: "#e8854b", items: plan?.week1, bg: "rgba(232,133,75,0.1)" },
              { label: "Month 1", emoji: "🌱", color: "#c8a855", items: plan?.month1, bg: "rgba(200,168,85,0.1)" },
              { label: "Long Term", emoji: "🌳", color: "#6aab7a", items: plan?.longTerm, bg: "rgba(106,171,122,0.1)" },
            ].map(({ label, emoji, color, items, bg }, idx) => items?.length > 0 && (
              <div key={label} className="timeline-item">
                {idx < 3 && <div className="timeline-line" />}
                <div className="timeline-dot" style={{ background: bg, border: `1px solid ${color}40` }}>
                  <span style={{ fontSize: "12px" }}>{emoji}</span>
                </div>
                <div style={{ flex: 1, paddingBottom: "8px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color, letterSpacing: "1px", marginBottom: "8px", fontWeight: "600" }}>{label.toUpperCase()}</div>
                  {items.map((item, i) => {
                    const key = `${label}-${i}`;
                    const done = checkedItems[key];
                    return (
                      <div key={i} className={`treatment-item ${done ? "done" : ""}`} onClick={() => toggleCheck(key)}>
                        <div className="treatment-check">
                          {done && <span style={{ color: "#fff", fontSize: "10px" }}>✓</span>}
                        </div>
                        <span style={{ color: done ? "var(--muted)" : "var(--text)", fontSize: "13px", lineHeight: "1.5", textDecoration: done ? "line-through" : "none", transition: "all 0.2s" }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: CHAT */}
        {tab === "chat" && <ChatTab plantData={result} />}

        {/* TAB: PLANT */}
        {tab === "plant" && (
          <div className="fade-up">
            <div className="card">
              <div className="card-title">🌿 Species Profile</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                {[
                  { label: "Family", val: p?.family }, { label: "Type", val: p?.plantType },
                  { label: "Origin", val: p?.origin }, { label: "Lifespan", val: p?.lifespan },
                  { label: "Mature Size", val: p?.matureSize }, { label: "Growth", val: p?.growthHabit },
                ].map(({ label, val }) => val && (
                  <div key={label} style={{ background: "rgba(14,26,16,0.6)", borderRadius: "10px", padding: "10px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "4px" }}>{label.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", color: "var(--cream)", fontWeight: "600" }}>{val}</div>
                  </div>
                ))}
              </div>
              <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{p?.description}</p>
            </div>

            {result.interestingFacts?.length > 0 && (
              <div className="card" style={{ background: "rgba(155,143,196,0.06)", borderColor: "rgba(155,143,196,0.2)" }}>
                <div className="card-title" style={{ color: "var(--lavender)" }}>✦ Fascinating Facts</div>
                {result.interestingFacts.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--lavender)", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>◆</span>
                    <span style={{ color: "var(--text)", fontSize: "13px", lineHeight: "1.6" }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {result.edibleInfo && (
              <div className="card">
                <div className="card-title">🍽 Edibility & Safety</div>
                <Badge color={result.edibleInfo.isEdible ? "#6aab7a" : "#c24d2c"}>{result.edibleInfo.isEdible ? "✓ Edible" : "✗ Not Edible"}</Badge>
                {result.edibleInfo.edibleParts && result.edibleInfo.edibleParts !== "null" && <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>Edible parts: <span style={{ color: "var(--text)" }}>{result.edibleInfo.edibleParts}</span></p>}
                <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "4px" }}>Toxicity: <span style={{ color: "var(--text)" }}>{result.edibleInfo.toxicity}</span></p>
              </div>
            )}

            {result.nativeEcology && (
              <div className="card">
                <div className="card-title">🌍 Ecology & Wildlife</div>
                <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{result.nativeEcology}</p>
              </div>
            )}

            {result.seasonality && (
              <div className="card">
                <div className="card-title">🗓 Seasonality</div>
                {[{ label: "Bloom Time", val: result.seasonality.bloomTime }, { label: "Peak Growth", val: result.seasonality.peakGrowth }, { label: "Dormancy", val: result.seasonality.dormancy }].map(({ label, val }) => val && val !== "N/A" && (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--faint)" }}>
                    <span style={{ color: "var(--muted)", fontSize: "13px" }}>{label}</span>
                    <span style={{ color: "var(--cream)", fontSize: "13px", fontWeight: "500" }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: CARE */}
        {tab === "care" && (
          <div className="fade-up">
            {[
              { icon: "💧", label: "Watering", items: [{ k: "Frequency", v: care?.wateringFrequency }, { k: "Amount", v: care?.wateringAmount }], color: "#4a9abe" },
              { icon: "☀️", label: "Light", items: [{ k: "Requirement", v: care?.sunlight }, { k: "Hours", v: care?.hoursOfSun }], color: "#c8a855" },
              { icon: "🌡️", label: "Climate", items: [{ k: "Temperature", v: care?.temperature }, { k: "Humidity", v: care?.humidity }, { k: "Hardiness", v: care?.hardiness }], color: "#e8854b" },
              { icon: "🪴", label: "Soil", items: [{ k: "Type", v: care?.soilType }, { k: "pH", v: care?.soilPH }], color: "#8b7355" },
              { icon: "🧪", label: "Fertilizing", items: [{ k: "Type", v: care?.fertilizer }, { k: "Schedule", v: care?.fertilizerSchedule }], color: "#7a9e7e" },
              { icon: "✂️", label: "Maintenance", items: [{ k: "Pruning", v: care?.pruning }, { k: "Repotting", v: care?.repotting }], color: "#9b8fc4" },
            ].map(({ icon, label, items, color }) => (
              <div key={label} className="card">
                <div className="card-title" style={{ color }}>{icon} {label.toUpperCase()}</div>
                {items.map(({ k, v }) => v && v !== "N/A" && (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--faint)", gap: "12px" }}>
                    <span style={{ color: "var(--muted)", fontSize: "13px", flexShrink: 0 }}>{k}</span>
                    <span style={{ color: "var(--cream)", fontSize: "13px", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
            {care?.propagation?.length > 0 && (
              <div className="card">
                <div className="card-title">🌱 Propagation Methods</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {care.propagation.map(m => <span key={m} className="chip">{m}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: NOTES */}
        {tab === "notes" && (
          <div className="fade-up">
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div className="card-title" style={{ marginBottom: 0 }}>📝 PERSONAL NOTES</div>
                <button onClick={() => editingNotes ? saveNotes() : setEditingNotes(true)}
                  style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid var(--sage)", background: "transparent", color: "var(--mint)", fontSize: "11px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                  {editingNotes ? "Save" : "Edit"}
                </button>
              </div>
              {editingNotes ? (
                <textarea className="notes-area" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add your observations, treatments applied, changes noticed..." autoFocus />
              ) : (
                <p style={{ color: notes ? "var(--text)" : "var(--faint)", fontSize: "14px", lineHeight: "1.7", fontStyle: notes ? "normal" : "italic" }}>
                  {notes || "No notes yet. Tap Edit to add your observations."}
                </p>
              )}
            </div>

            <div className="card" style={{ background: "rgba(149,213,178,0.04)", borderColor: "rgba(149,213,178,0.15)" }}>
              <div className="card-title" style={{ color: "var(--mint)" }}>📊 SCAN METADATA</div>
              {[
                { label: "Scanned", val: new Date(data.timestamp).toLocaleString() },
                { label: "Plant", val: p?.commonName },
                { label: "Species", val: p?.scientificName },
                { label: "Health Score", val: `${health?.healthScore}/100` },
                { label: "Confidence", val: `${p?.confidence}%` },
              ].map(({ label, val }) => val && (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--faint)" }}>
                  <span style={{ color: "var(--muted)", fontSize: "12px" }}>{label}</span>
                  <span style={{ color: "var(--cream)", fontSize: "12px", fontFamily: label === "Species" ? "'Cormorant Garamond', serif" : "inherit", fontStyle: label === "Species" ? "italic" : "normal" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button className="btn-primary" onClick={onNewScan}>🔬 New Scan</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DISEASE LIBRARY
═══════════════════════════════════════════════ */
function SearchPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [catFilter, setCatFilter] = useState("All");
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  const cats = ["All", "Fungal", "Bacterial", "Viral", "Nutrient", "Pest"];
  const filtered = DISEASE_DB.filter(d =>
    (catFilter === "All" || d.category === catFilter) &&
    (query === "" || d.name.toLowerCase().includes(query.toLowerCase()) || d.plants.some(p => p.toLowerCase().includes(query.toLowerCase())))
  );

  if (compareMode && compareA && compareB) {
    return (
      <div className="page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: "700", color: "var(--cream)" }}>Comparison</h2>
          <button onClick={() => { setCompareMode(false); setCompareA(null); setCompareB(null); }} style={{ background: "transparent", border: "1px solid var(--faint)", borderRadius: "8px", padding: "6px 12px", color: "var(--muted)", cursor: "pointer", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>✕ Close</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[compareA, compareB].map((d, si) => (
            <div key={si}>
              <div style={{ background: `${d.color}15`, border: `1px solid ${d.color}30`, borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ fontSize: "22px", marginBottom: "4px" }}>{d.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: "700", color: "var(--cream)" }}>{d.name}</div>
                <Badge color={d.color}>{d.category}</Badge>
              </div>
              {[
                { label: "Severity", val: d.severity },
                { label: "Spread Risk", val: d.spreadRisk },
                { label: "Plants", val: d.plants.slice(0, 3).join(", ") },
              ].map(({ label, val }) => (
                <div key={label} style={{ marginBottom: "8px" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "3px" }}>{label.toUpperCase()}</div>
                  <div style={{ color: "var(--text)", fontSize: "12px" }}>{val}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: "8px" }}>
          <div className="card-title">📋 TREATMENT DIFFERENCES</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[compareA, compareB].map((d, si) => (
              <div key={si}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: d.color, letterSpacing: "1px", marginBottom: "6px" }}>{d.name.toUpperCase()}</div>
                {d.treatment.immediate.slice(0, 2).map((t, i) => (
                  <div key={i} style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px", lineHeight: "1.4" }}>• {t}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selected) {
    const sev = severityConfig[selected.severity] || severityConfig.medium;
    return (
      <div className="page">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "13px" }}>
            ← Back to Library
          </button>
          <button onClick={() => {
            if (!compareA) { setCompareA(selected); setSelected(null); }
            else if (!compareB) { setCompareB(selected); setCompareMode(true); setSelected(null); }
          }} style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid var(--sage)", background: "transparent", color: "var(--mint)", fontSize: "11px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
            {compareA ? "Compare ↔" : "+ Compare"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${selected.color}20`, border: `1px solid ${selected.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>{selected.icon}</div>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: "700", color: "var(--cream)", lineHeight: 1.1 }}>{selected.name}</h2>
            <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
              <Badge color={selected.color}>{selected.category}</Badge>
              <Badge color={sev.color}>Severity: {sev.label}</Badge>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">🌿 Affected Plants</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>{selected.plants.map(p => <span key={p} className="chip">{p}</span>)}</div>
        </div>
        <div className="card">
          <div className="card-title">⬡ Symptoms</div>
          {selected.symptoms.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: `${selected.color}15`, border: `1px solid ${selected.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: selected.color, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>{i + 1}</div>
              <span style={{ color: "var(--text)", fontSize: "13px", lineHeight: "1.6" }}>{s}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">◈ Cause</div>
          <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7" }}>{selected.cause}</p>
        </div>
        {[
          { label: "⚡ Immediate Actions", items: selected.treatment.immediate, color: "#c24d2c" },
          { label: "🌱 Long-Term Care", items: selected.treatment.longTerm, color: "#4a9abe" },
          { label: "🛡 Prevention", items: selected.treatment.preventive, color: "#6aab7a" },
        ].map(({ label, items, color }) => (
          <div key={label} className="card">
            <div className="card-title" style={{ color }}>{label}</div>
            {items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <span style={{ color, fontSize: "12px", marginTop: "2px" }}>›</span>
                <span style={{ color: "var(--text)", fontSize: "13px", lineHeight: "1.6" }}>{item}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="card" style={{ background: "rgba(200,168,85,0.06)", borderColor: "rgba(200,168,85,0.2)" }}>
          <div className="card-title" style={{ color: "var(--gold)" }}>✦ Spread Risk: {selected.spreadRisk}</div>
          <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.6", fontStyle: "italic" }}>{selected.funFact}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "var(--cream)", marginBottom: "4px" }}>Disease <span style={{ color: "var(--mint)", fontStyle: "italic" }}>Library</span></h1>
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>Search diseases, deficiencies & pests</p>
          </div>
          {compareA && !compareB && (
            <div style={{ background: "rgba(74,124,89,0.2)", border: "1px solid var(--sage)", borderRadius: "10px", padding: "8px 12px", fontSize: "11px", color: "var(--mint)", fontFamily: "'JetBrains Mono', monospace" }}>
              Comparing: {compareA.name}<br />
              <button onClick={() => setCompareA(null)} style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "10px", padding: 0, marginTop: "2px" }}>✕ Clear</button>
            </div>
          )}
        </div>
      </div>

      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Search by disease or plant name..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: "6px 14px", borderRadius: "20px", border: "1px solid", cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: "500",
            background: catFilter === c ? "var(--sage)" : "transparent",
            color: catFilter === c ? "#fff" : "var(--muted)",
            borderColor: catFilter === c ? "var(--sage)" : "var(--faint)", transition: "all 0.2s"
          }}>{c}</button>
        ))}
      </div>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "12px" }}>
        {filtered.length} RESULT{filtered.length !== 1 ? "S" : ""} · Tap two to compare
      </div>

      {filtered.map((d, i) => (
        <div key={d.id} className="reminder-card fade-up" style={{ animationDelay: `${i * 0.03}s`, borderColor: compareA?.id === d.id ? "var(--sage)" : "var(--faint)" }} onClick={() => setSelected(d)}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${d.color}15`, border: `1px solid ${d.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{d.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", fontWeight: "600", color: "var(--cream)", marginBottom: "4px" }}>{d.name}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <Badge color={d.color}>{d.category}</Badge>
                <Badge color={severityConfig[d.severity].color}>{severityConfig[d.severity].label} severity</Badge>
              </div>
            </div>
            <span style={{ color: "var(--faint)", fontSize: "18px" }}>›</span>
          </div>
          <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {d.plants.slice(0, 4).map(p => <span key={p} className="chip" style={{ fontSize: "10px", padding: "2px 8px" }}>{p}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CARE REMINDERS
═══════════════════════════════════════════════ */
function RemindersPage() {
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bioscan_reminders") || "[]"); } catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ plant: "", task: "Water", interval: "7", notes: "", emoji: "💧" });

  const taskEmojis = { Water: "💧", Fertilize: "🧪", Prune: "✂️", Repot: "🪴", "Check pests": "🔍", Mist: "🌫️", "Turn/Rotate": "🔄", "Check soil": "🌱" };
  const tasks = Object.keys(taskEmojis);

  const isDue = (r) => !r.lastDone || new Date() >= new Date(new Date(r.lastDone).getTime() + r.interval * 86400000);
  const daysUntil = (r) => {
    if (!r.lastDone) return 0;
    const next = new Date(new Date(r.lastDone).getTime() + r.interval * 86400000);
    return Math.max(0, Math.ceil((next - new Date()) / 86400000));
  };

  const save = () => {
    if (!form.plant) return;
    const newR = { ...form, id: Date.now(), lastDone: null, streak: 0, nextDue: new Date(Date.now() + parseInt(form.interval) * 86400000).toLocaleDateString() };
    const updated = [newR, ...reminders];
    setReminders(updated);
    localStorage.setItem("bioscan_reminders", JSON.stringify(updated));
    setAdding(false);
    setForm({ plant: "", task: "Water", interval: "7", notes: "", emoji: "💧" });
  };

  const markDone = (id) => {
    const updated = reminders.map(r => r.id === id ? { ...r, lastDone: new Date().toISOString(), streak: (r.streak || 0) + 1, nextDue: new Date(Date.now() + r.interval * 86400000).toLocaleDateString() } : r);
    setReminders(updated);
    localStorage.setItem("bioscan_reminders", JSON.stringify(updated));
  };

  const remove = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem("bioscan_reminders", JSON.stringify(updated));
  };

  const due = reminders.filter(isDue);
  const upcoming = reminders.filter(r => !isDue(r));
  const totalStreak = reminders.reduce((acc, r) => acc + (r.streak || 0), 0);

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "var(--cream)", marginBottom: "4px" }}>Plant <span style={{ color: "var(--sky)", fontStyle: "italic" }}>Care</span></h1>
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>{reminders.length} reminder{reminders.length !== 1 ? "s" : ""} · {due.length} due</p>
        </div>
        <button className="btn-ghost" onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "+ Add"}</button>
      </div>

      {reminders.length > 0 && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <div className="stat-card">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "#e8854b", marginBottom: "2px" }}>{due.length}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>DUE NOW</div>
          </div>
          <div className="stat-card">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "#6aab7a", marginBottom: "2px" }}>{totalStreak}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>TOTAL STREAK</div>
          </div>
          <div className="stat-card">
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "var(--mint)", marginBottom: "2px" }}>{reminders.length}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>PLANTS</div>
          </div>
        </div>
      )}

      {adding && (
        <div className="card fade-up" style={{ marginBottom: "16px", borderColor: "var(--sage)" }}>
          <div className="card-title" style={{ color: "var(--mint)" }}>✦ New Reminder</div>
          <input value={form.plant} onChange={e => setForm({ ...form, plant: e.target.value })} placeholder="Plant name..." style={{ width: "100%", padding: "10px 12px", background: "rgba(14,26,16,0.8)", border: "1px solid var(--faint)", borderRadius: "10px", color: "var(--cream)", fontSize: "14px", fontFamily: "'Outfit', sans-serif", outline: "none", marginBottom: "10px" }} />
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
            {tasks.map(t => (
              <button key={t} onClick={() => setForm({ ...form, task: t, emoji: taskEmojis[t] })} style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid", cursor: "pointer", background: form.task === t ? "var(--sage)" : "transparent", color: form.task === t ? "#fff" : "var(--muted)", borderColor: form.task === t ? "var(--sage)" : "var(--faint)", fontSize: "12px", fontFamily: "'Outfit', sans-serif", transition: "all 0.2s" }}>
                {taskEmojis[t]} {t}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "var(--muted)", fontSize: "13px", flexShrink: 0 }}>Every</span>
            <input type="number" value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })} style={{ width: "70px", padding: "8px 10px", background: "rgba(14,26,16,0.8)", border: "1px solid var(--faint)", borderRadius: "10px", color: "var(--cream)", fontSize: "14px", fontFamily: "'Outfit', sans-serif", outline: "none" }} />
            <span style={{ color: "var(--muted)", fontSize: "13px" }}>days</span>
          </div>
          <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)..." style={{ width: "100%", padding: "10px 12px", background: "rgba(14,26,16,0.8)", border: "1px solid var(--faint)", borderRadius: "10px", color: "var(--cream)", fontSize: "14px", fontFamily: "'Outfit', sans-serif", outline: "none", marginBottom: "12px" }} />
          <button className="btn-primary" onClick={save}>Save Reminder</button>
        </div>
      )}

      {reminders.length === 0 && !adding && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--faint)" }}>
          <div style={{ fontSize: "52px", marginBottom: "14px" }}>🌱</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "var(--muted)", marginBottom: "6px" }}>No reminders yet</div>
          <div style={{ fontSize: "13px" }}>Add care reminders for your plants</div>
        </div>
      )}

      {due.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#e8854b", letterSpacing: "1.5px", marginBottom: "10px" }}>⚡ DUE NOW ({due.length})</div>
          {due.map(r => (
            <div key={r.id} className="reminder-card" style={{ borderColor: "rgba(232,133,75,0.3)", background: "rgba(232,133,75,0.05)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(232,133,75,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: "600", color: "var(--cream)" }}>{r.plant}</div>
                  <div style={{ color: "var(--muted)", fontSize: "12px" }}>{r.task} · Every {r.interval} days</div>
                  {r.streak > 0 && <div style={{ color: "#6aab7a", fontSize: "11px", marginTop: "2px" }}>🔥 {r.streak} streak</div>}
                  {r.notes && <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "2px", fontStyle: "italic" }}>{r.notes}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <button onClick={() => markDone(r.id)} style={{ padding: "7px 14px", background: "var(--sage)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px", cursor: "pointer", fontWeight: "600", fontFamily: "'JetBrains Mono', monospace" }}>Done ✓</button>
                  <button onClick={() => remove(r.id)} style={{ padding: "4px", background: "transparent", border: "none", color: "var(--faint)", fontSize: "14px", cursor: "pointer" }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "1.5px", marginBottom: "10px" }}>📅 UPCOMING</div>
          {upcoming.map(r => (
            <div key={r.id} className="reminder-card">
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(74,124,89,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: "600", color: "var(--cream)" }}>{r.plant}</div>
                  <div style={{ color: "var(--muted)", fontSize: "12px" }}>{r.task} · in {daysUntil(r)} day{daysUntil(r) !== 1 ? "s" : ""}</div>
                  {r.streak > 0 && <div style={{ color: "#6aab7a", fontSize: "11px", marginTop: "2px" }}>🔥 {r.streak} streak</div>}
                </div>
                <button onClick={() => remove(r.id)} style={{ padding: "6px", background: "transparent", border: "none", color: "var(--faint)", fontSize: "14px", cursor: "pointer" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MY GARDEN (Enhanced History)
═══════════════════════════════════════════════ */
function GardenPage({ history, onSelect, onClear, onUpdateEntry }) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const filtered = history.filter(e => {
    const name = e.customName || e.result?.plantIdentification?.commonName || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const avgHealth = history.length > 0
    ? Math.round(history.reduce((acc, e) => acc + (e.result?.healthAssessment?.healthScore || 75), 0) / history.length)
    : 0;

  const healthDist = history.reduce((acc, e) => {
    const h = e.result?.healthAssessment?.overallHealth || "Unknown";
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});

  const saveCustomName = (entry) => {
    onUpdateEntry?.({ ...entry, customName: editName });
    setEditingId(null);
    setEditName("");
  };

  if (history.length === 0) {
    return (
      <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🌿</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "var(--muted)", marginBottom: "6px" }}>Your garden is empty</h2>
        <p style={{ color: "var(--faint)", fontSize: "13px", textAlign: "center" }}>Scan your first plant to start your garden</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "var(--cream)", marginBottom: "4px" }}>My <span style={{ color: "#95d5b2", fontStyle: "italic" }}>Garden</span></h1>
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>{history.length} plant{history.length !== 1 ? "s" : ""} scanned</p>
        </div>
        <button onClick={onClear} style={{ background: "transparent", border: "1px solid var(--faint)", borderRadius: "8px", padding: "6px 12px", color: "var(--muted)", cursor: "pointer", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>Clear All</button>
      </div>

      {/* Garden Stats */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <div className="stat-card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: healthColor(avgHealth), marginBottom: "2px" }}>{avgHealth}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>AVG HEALTH</div>
        </div>
        <div className="stat-card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "#6aab7a", marginBottom: "2px" }}>
            {history.filter(e => (e.result?.healthAssessment?.healthScore || 0) >= 70).length}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>HEALTHY</div>
        </div>
        <div className="stat-card">
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: "700", color: "#c24d2c", marginBottom: "2px" }}>
            {history.filter(e => (e.result?.healthAssessment?.healthScore || 0) < 50).length}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>NEEDS CARE</div>
        </div>
      </div>

      {/* Health distribution bar */}
      {history.length > 1 && (
        <div className="card" style={{ marginBottom: "16px" }}>
          <div className="card-title">🌿 GARDEN HEALTH OVERVIEW</div>
          <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", gap: "2px" }}>
            {Object.entries(healthConfig).map(([key, cfg]) => {
              const count = healthDist[key] || 0;
              const pct = history.length > 0 ? (count / history.length) * 100 : 0;
              return pct > 0 ? <div key={key} style={{ width: `${pct}%`, background: cfg.color, transition: "width 0.5s" }} title={`${key}: ${count}`} /> : null;
            })}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "8px" }}>
            {Object.entries(healthConfig).map(([key, cfg]) => healthDist[key] ? (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cfg.color }} />
                <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "'JetBrains Mono', monospace" }}>{key} ({healthDist[key]})</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Search your garden..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.map((entry, i) => {
        const p = entry.result?.plantIdentification;
        const h = entry.result?.healthAssessment;
        const hCfg = healthConfig[h?.overallHealth] || healthConfig.Good;
        const displayName = entry.customName || p?.commonName;
        const isEditing = editingId === entry.id;

        return (
          <div key={entry.id} className="history-item fade-up" style={{ animationDelay: `${i * 0.04}s`, flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }} onClick={() => !isEditing && onSelect(entry)}>
              {entry.image && <img src={entry.image} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <input
                    className="plant-name-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveCustomName(entry); if (e.key === "Escape") setEditingId(null); }}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                    style={{ width: "100%", marginBottom: "4px" }}
                  />
                ) : (
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: "600", color: "var(--cream)", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {displayName}
                    {entry.customName && entry.customName !== p?.commonName && (
                      <span style={{ color: "var(--muted)", fontSize: "12px", fontFamily: "'Outfit', sans-serif", marginLeft: "6px", fontStyle: "italic" }}>({p?.commonName})</span>
                    )}
                  </div>
                )}
                <div style={{ color: "var(--muted)", fontSize: "11px", fontStyle: "italic", marginBottom: "4px" }}>{p?.scientificName}</div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  <Badge color={hCfg.color}>{hCfg.emoji} {h?.overallHealth}</Badge>
                  {h?.primaryIssue && h.primaryIssue !== "null" && <Badge color="#e8854b" bg="rgba(232,133,75,0.1)">{h.primaryIssue}</Badge>}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--faint)" }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: "700", color: healthColor(h?.healthScore || 75) }}>{h?.healthScore || 75}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--faint)" }}>SCORE</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {isEditing ? (
                <>
                  <button onClick={() => saveCustomName(entry)} style={{ flex: 1, padding: "6px", background: "var(--sage)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>Save Name</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--faint)", borderRadius: "8px", color: "var(--muted)", fontSize: "11px", cursor: "pointer" }}>Cancel</button>
                </>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setEditingId(entry.id); setEditName(entry.customName || p?.commonName || ""); }}
                  style={{ padding: "5px 10px", background: "rgba(42,61,44,0.4)", border: "1px solid var(--faint)", borderRadius: "8px", color: "var(--muted)", fontSize: "10px", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
                  ✏ Rename
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function BioScan() {
  const [page, setPage] = useState("scan");
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bioscan_history_v3") || "[]"); } catch { return []; }
  });

  const saveHistory = useCallback((newHistory) => {
    setHistory(newHistory);
    localStorage.setItem("bioscan_history_v3", JSON.stringify(newHistory));
  }, []);

  const handleResult = useCallback((data) => {
    const entry = { ...data, id: Date.now() };
    setCurrentResult(entry);
    const newHistory = [entry, ...history].slice(0, 50);
    saveHistory(newHistory);
    setPage("result");
  }, [history, saveHistory]);

  const handleUpdateEntry = useCallback((updated) => {
    const newHistory = history.map(e => e.id === updated.id ? updated : e);
    saveHistory(newHistory);
    if (currentResult?.id === updated.id) setCurrentResult(updated);
  }, [history, currentResult, saveHistory]);

  const handleNewScan = () => { setCurrentResult(null); setPage("scan"); };
  const handleHistorySelect = (entry) => { setCurrentResult(entry); setPage("result"); };
  const handleClearHistory = () => { saveHistory([]); setCurrentResult(null); };

  const navItems = [
    { id: "scan", icon: "🔬", label: "Scan" },
    { id: "library", icon: "📚", label: "Library" },
    { id: "care", icon: "💧", label: "Care" },
    { id: "garden", icon: "🌿", label: "Garden" },
  ];

  const activePage = page === "result" ? "scan" : page;

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="grain" />

      <div className="header">
        <div className="logo-row">
          <div className="logo-icon">🌿</div>
          <div>
            <div className="logo-text">BioScan</div>
            <div className="logo-sub">PLANT DIAGNOSTICS AI</div>
          </div>
          {page === "result" && (
            <button onClick={handleNewScan} style={{ marginLeft: "auto", background: "transparent", border: "1px solid var(--faint)", borderRadius: "8px", padding: "6px 12px", color: "var(--muted)", cursor: "pointer", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>← New Scan</button>
          )}
        </div>
      </div>

      <div>
        {page === "scan" && <ScanPage onResult={handleResult} />}
        {page === "result" && currentResult && <ResultsPage data={currentResult} onNewScan={handleNewScan} onUpdateEntry={handleUpdateEntry} />}
        {page === "library" && <SearchPage />}
        {page === "care" && <RemindersPage />}
        {page === "garden" && <GardenPage history={history} onSelect={handleHistorySelect} onClear={handleClearHistory} onUpdateEntry={handleUpdateEntry} />}
      </div>

      <nav className="nav">
        {navItems.map(({ id, icon, label }) => (
          <button key={id} className="nav-btn" onClick={() => setPage(id)} style={{ color: activePage === id ? "var(--mint)" : "var(--muted)" }}>
            <span className="nav-icon">{icon}</span>
            <span className="nav-label" style={{ color: activePage === id ? "var(--mint)" : "var(--muted)" }}>{label}</span>
            <div className="nav-dot" style={{ opacity: activePage === id ? 1 : 0 }} />
          </button>
        ))}
      </nav>
    </div>
  );
}

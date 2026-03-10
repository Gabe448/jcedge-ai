// Fundamentals hardcoded (update quarterly after earnings)
// Live price/52w data fetched from Yahoo Finance
const FUNDAMENTALS = {
  AAPL: { name:'Apple Inc.',                    sector:'Technology',       pe:32,  rev_growth:4,   margin:26, roe:160, debt_eq:1.87 },
  MSFT: { name:'Microsoft Corporation',         sector:'Technology',       pe:37,  rev_growth:15,  margin:36, roe:38,  debt_eq:0.37 },
  NVDA: { name:'NVIDIA Corporation',            sector:'Technology',       pe:40,  rev_growth:122, margin:55, roe:91,  debt_eq:0.41 },
  AMZN: { name:'Amazon.com Inc.',               sector:'Cons. Disc.',      pe:44,  rev_growth:13,  margin:9,  roe:21,  debt_eq:0.49 },
  META: { name:'Meta Platforms Inc.',           sector:'Technology',       pe:27,  rev_growth:22,  margin:35, roe:34,  debt_eq:0.08 },
  GOOGL:{ name:'Alphabet Inc.',                 sector:'Technology',       pe:25,  rev_growth:14,  margin:26, roe:29,  debt_eq:0.09 },
  TSLA: { name:'Tesla Inc.',                    sector:'Cons. Disc.',      pe:120, rev_growth:2,   margin:8,  roe:11,  debt_eq:0.18 },
  AVGO: { name:'Broadcom Inc.',                 sector:'Technology',       pe:35,  rev_growth:51,  margin:22, roe:28,  debt_eq:1.20 },
  COST: { name:'Costco Wholesale Corp.',        sector:'Cons. Staples',    pe:58,  rev_growth:8,   margin:3,  roe:35,  debt_eq:0.49 },
  NFLX: { name:'Netflix Inc.',                  sector:'Comm. Services',   pe:44,  rev_growth:16,  margin:26, roe:35,  debt_eq:0.44 },
  AMD:  { name:'Advanced Micro Devices Inc.',   sector:'Technology',       pe:44,  rev_growth:18,  margin:22, roe:8,   debt_eq:0.04 },
  ADBE: { name:'Adobe Inc.',                    sector:'Technology',       pe:30,  rev_growth:11,  margin:31, roe:38,  debt_eq:0.29 },
  CSCO: { name:'Cisco Systems Inc.',            sector:'Technology',       pe:18,  rev_growth:6,   margin:22, roe:32,  debt_eq:0.22 },
  TXN:  { name:'Texas Instruments Inc.',        sector:'Technology',       pe:35,  rev_growth:-3,  margin:32, roe:40,  debt_eq:0.88 },
  QCOM: { name:'Qualcomm Inc.',                 sector:'Technology',       pe:18,  rev_growth:18,  margin:26, roe:44,  debt_eq:0.54 },
  AMGN: { name:'Amgen Inc.',                    sector:'Healthcare',       pe:17,  rev_growth:19,  margin:28, roe:88,  debt_eq:5.10 },
  INTU: { name:'Intuit Inc.',                   sector:'Technology',       pe:55,  rev_growth:17,  margin:17, roe:16,  debt_eq:0.55 },
  AMAT: { name:'Applied Materials Inc.',        sector:'Technology',       pe:22,  rev_growth:7,   margin:27, roe:44,  debt_eq:0.38 },
  BKNG: { name:'Booking Holdings Inc.',         sector:'Cons. Disc.',      pe:26,  rev_growth:11,  margin:22, roe:88,  debt_eq:1.88 },
  PANW: { name:'Palo Alto Networks Inc.',       sector:'Technology',       pe:55,  rev_growth:14,  margin:19, roe:38,  debt_eq:0.70 },
  SBUX: { name:'Starbucks Corp.',               sector:'Cons. Disc.',      pe:28,  rev_growth:-2,  margin:11, roe:88,  debt_eq:5.00 },
  GILD: { name:'Gilead Sciences Inc.',          sector:'Healthcare',       pe:15,  rev_growth:7,   margin:26, roe:28,  debt_eq:1.10 },
  ADI:  { name:'Analog Devices Inc.',           sector:'Technology',       pe:40,  rev_growth:-8,  margin:25, roe:8,   debt_eq:0.37 },
  VRTX: { name:'Vertex Pharmaceuticals Inc.',   sector:'Healthcare',       pe:32,  rev_growth:12,  margin:38, roe:25,  debt_eq:0.00 },
  REGN: { name:'Regeneron Pharmaceuticals Inc.',sector:'Healthcare',       pe:18,  rev_growth:8,   margin:32, roe:22,  debt_eq:0.11 },
  MDLZ: { name:'Mondelez International Inc.',   sector:'Cons. Staples',    pe:22,  rev_growth:2,   margin:14, roe:14,  debt_eq:0.88 },
  ADP:  { name:'Automatic Data Processing Inc.',sector:'Technology',       pe:32,  rev_growth:7,   margin:19, roe:88,  debt_eq:0.44 },
  LRCX: { name:'Lam Research Corp.',            sector:'Technology',       pe:22,  rev_growth:20,  margin:29, roe:88,  debt_eq:0.55 },
  MU:   { name:'Micron Technology Inc.',        sector:'Technology',       pe:18,  rev_growth:84,  margin:22, roe:14,  debt_eq:0.32 },
  KLAC: { name:'KLA Corporation',               sector:'Technology',       pe:24,  rev_growth:24,  margin:38, roe:88,  debt_eq:1.22 },
  JPM:  { name:'JPMorgan Chase & Co.',          sector:'Financials',       pe:14,  rev_growth:12,  margin:28, roe:16,  debt_eq:1.44 },
  V:    { name:'Visa Inc.',                     sector:'Financials',       pe:32,  rev_growth:10,  margin:54, roe:44,  debt_eq:0.52 },
  MA:   { name:'Mastercard Inc.',               sector:'Financials',       pe:38,  rev_growth:12,  margin:46, roe:88,  debt_eq:1.88 },
  UNH:  { name:'UnitedHealth Group Inc.',       sector:'Healthcare',       pe:22,  rev_growth:8,   margin:6,  roe:26,  debt_eq:0.72 },
  JNJ:  { name:'Johnson & Johnson',             sector:'Healthcare',       pe:15,  rev_growth:4,   margin:22, roe:22,  debt_eq:0.44 },
  WMT:  { name:'Walmart Inc.',                  sector:'Cons. Staples',    pe:38,  rev_growth:5,   margin:3,  roe:18,  debt_eq:0.55 },
  PG:   { name:'Procter & Gamble Co.',          sector:'Cons. Staples',    pe:24,  rev_growth:3,   margin:19, roe:28,  debt_eq:0.55 },
  HD:   { name:'Home Depot Inc.',               sector:'Cons. Disc.',      pe:26,  rev_growth:4,   margin:10, roe:88,  debt_eq:8.80 },
  BAC:  { name:'Bank of America Corp.',         sector:'Financials',       pe:14,  rev_growth:8,   margin:22, roe:10,  debt_eq:1.10 },
  XOM:  { name:'Exxon Mobil Corp.',             sector:'Energy',           pe:14,  rev_growth:-5,  margin:10, roe:14,  debt_eq:0.22 },
  CVX:  { name:'Chevron Corp.',                 sector:'Energy',           pe:16,  rev_growth:-8,  margin:9,  roe:12,  debt_eq:0.14 },
  LLY:  { name:'Eli Lilly and Company',         sector:'Healthcare',       pe:58,  rev_growth:45,  margin:24, roe:71,  debt_eq:1.70 },
  ABBV: { name:'AbbVie Inc.',                   sector:'Healthcare',       pe:16,  rev_growth:4,   margin:22, roe:88,  debt_eq:3.30 },
  MRK:  { name:'Merck & Co. Inc.',              sector:'Healthcare',       pe:14,  rev_growth:7,   margin:28, roe:28,  debt_eq:0.66 },
  PFE:  { name:'Pfizer Inc.',                   sector:'Healthcare',       pe:12,  rev_growth:-41, margin:1,  roe:2,   debt_eq:0.55 },
  TMO:  { name:'Thermo Fisher Scientific Inc.', sector:'Healthcare',       pe:32,  rev_growth:-5,  margin:14, roe:14,  debt_eq:0.66 },
  ABT:  { name:'Abbott Laboratories',           sector:'Healthcare',       pe:22,  rev_growth:5,   margin:12, roe:16,  debt_eq:0.44 },
  ACN:  { name:'Accenture plc',                 sector:'Technology',       pe:30,  rev_growth:4,   margin:11, roe:28,  debt_eq:0.10 },
  CRM:  { name:'Salesforce Inc.',               sector:'Technology',       pe:45,  rev_growth:11,  margin:16, roe:10,  debt_eq:0.14 },
  ORCL: { name:'Oracle Corporation',            sector:'Technology',       pe:38,  rev_growth:8,   margin:20, roe:88,  debt_eq:8.80 },
  NOW:  { name:'ServiceNow Inc.',               sector:'Technology',       pe:60,  rev_growth:22,  margin:15, roe:36,  debt_eq:0.10 },
  UBER: { name:'Uber Technologies Inc.',        sector:'Technology',       pe:18,  rev_growth:20,  margin:8,  roe:31,  debt_eq:1.10 },
  SHOP: { name:'Shopify Inc.',                  sector:'Technology',       pe:68,  rev_growth:26,  margin:13, roe:14,  debt_eq:0.00 },
  COIN: { name:'Coinbase Global Inc.',          sector:'Financials',       pe:28,  rev_growth:88,  margin:32, roe:44,  debt_eq:0.55 },
  PLTR: { name:'Palantir Technologies Inc.',    sector:'Technology',       pe:180, rev_growth:36,  margin:16, roe:11,  debt_eq:0.00 },
  APP:  { name:'AppLovin Corporation',          sector:'Technology',       pe:44,  rev_growth:44,  margin:28, roe:88,  debt_eq:2.10 },
  HOOD: { name:'Robinhood Markets Inc.',        sector:'Financials',       pe:24,  rev_growth:58,  margin:22, roe:16,  debt_eq:0.10 },
  HIMS: { name:'Hims & Hers Health Inc.',       sector:'Healthcare',       pe:38,  rev_growth:69,  margin:14, roe:18,  debt_eq:0.12 },
  DUOL: { name:'Duolingo Inc.',                 sector:'Technology',       pe:150, rev_growth:40,  margin:16, roe:14,  debt_eq:0.00 },
  DDOG: { name:'Datadog Inc.',                  sector:'Technology',       pe:88,  rev_growth:26,  margin:24, roe:18,  debt_eq:0.11 },
  SNOW: { name:'Snowflake Inc.',                sector:'Technology',       pe:280, rev_growth:29,  margin:-5, roe:-8,  debt_eq:0.00 },
  CRWD: { name:'CrowdStrike Holdings Inc.',     sector:'Technology',       pe:88,  rev_growth:25,  margin:22, roe:28,  debt_eq:0.22 },
  ZS:   { name:'Zscaler Inc.',                  sector:'Technology',       pe:88,  rev_growth:26,  margin:18, roe:22,  debt_eq:0.22 },
  NET:  { name:'Cloudflare Inc.',               sector:'Technology',       pe:220, rev_growth:28,  margin:8,  roe:10,  debt_eq:0.11 },
  PYPL: { name:'PayPal Holdings Inc.',          sector:'Financials',       pe:17,  rev_growth:7,   margin:16, roe:21,  debt_eq:0.58 },
  MELI: { name:'MercadoLibre Inc.',             sector:'Cons. Disc.',      pe:44,  rev_growth:38,  margin:11, roe:28,  debt_eq:1.44 },
  TTD:  { name:'The Trade Desk Inc.',           sector:'Technology',       pe:68,  rev_growth:22,  margin:18, roe:22,  debt_eq:0.00 },
  CELH: { name:'Celsius Holdings Inc.',         sector:'Cons. Staples',    pe:38,  rev_growth:-5,  margin:14, roe:16,  debt_eq:0.00 },
  NKE:  { name:'NIKE Inc.',                     sector:'Cons. Disc.',      pe:22,  rev_growth:-8,  margin:9,  roe:35,  debt_eq:0.81 },
  LULU: { name:'lululemon athletica inc.',      sector:'Cons. Disc.',      pe:22,  rev_growth:8,   margin:14, roe:38,  debt_eq:0.22 },
  SPOT: { name:'Spotify Technology S.A.',       sector:'Comm. Services',   pe:62,  rev_growth:18,  margin:12, roe:22,  debt_eq:0.26 },
  ARM:  { name:'Arm Holdings plc',              sector:'Technology',       pe:220, rev_growth:34,  margin:24, roe:18,  debt_eq:0.00 },
  INTC: { name:'Intel Corporation',             sector:'Technology',       pe:22,  rev_growth:-8,  margin:-15,roe:-8,  debt_eq:0.44 },
  IBM:  { name:'IBM Corporation',               sector:'Technology',       pe:22,  rev_growth:3,   margin:14, roe:22,  debt_eq:2.20 },
  SQ:   { name:'Block Inc.',                    sector:'Financials',       pe:44,  rev_growth:8,   margin:6,  roe:8,   debt_eq:0.44 },
  AFRM: { name:'Affirm Holdings Inc.',          sector:'Financials',       pe:88,  rev_growth:36,  margin:-8, roe:-11, debt_eq:3.30 },
  RBLX: { name:'Roblox Corporation',            sector:'Technology',       pe:88,  rev_growth:20,  margin:-18,roe:-44, debt_eq:1.10 },
  SOFI: { name:'SoFi Technologies Inc.',        sector:'Financials',       pe:30,  rev_growth:22,  margin:9,  roe:8,   debt_eq:4.20 },
  ABNB: { name:'Airbnb Inc.',                   sector:'Cons. Disc.',      pe:38,  rev_growth:12,  margin:22, roe:28,  debt_eq:0.44 },

  BABA: { name:'Alibaba Group Holding Ltd.',      sector:'Cons. Disc.',      pe:15,  rev_growth:8,   margin:14, roe:12,  debt_eq:0.22 },
  ONDS: { name:'Ondas Holdings Inc.',              sector:'Technology',       pe:0,   rev_growth:42,  margin:-80,roe:-88, debt_eq:1.10 },
  BRK:  { name:'Berkshire Hathaway Inc.',          sector:'Financials',       pe:22,  rev_growth:6,   margin:18, roe:12,  debt_eq:0.28 },
  LIN:  { name:'Linde plc',                        sector:'Materials',        pe:30,  rev_growth:5,   margin:18, roe:18,  debt_eq:0.44 },
  AAON: { name:'AAON Inc.',                        sector:'Industrials',      pe:32,  rev_growth:12,  margin:22, roe:22,  debt_eq:0.00 },
  GE:   { name:'GE Aerospace',                     sector:'Industrials',      pe:38,  rev_growth:18,  margin:12, roe:28,  debt_eq:0.44 },
  CAT:  { name:'Caterpillar Inc.',                 sector:'Industrials',      pe:18,  rev_growth:2,   margin:16, roe:55,  debt_eq:1.44 },
  DE:   { name:'Deere & Company',                  sector:'Industrials',      pe:16,  rev_growth:-8,  margin:14, roe:38,  debt_eq:2.20 },
  HON:  { name:'Honeywell International Inc.',     sector:'Industrials',      pe:22,  rev_growth:4,   margin:16, roe:28,  debt_eq:1.10 },
  RTX:  { name:'RTX Corporation',                  sector:'Industrials',      pe:22,  rev_growth:10,  margin:8,  roe:10,  debt_eq:0.77 },
  BA:   { name:'Boeing Company',                   sector:'Industrials',      pe:0,   rev_growth:5,   margin:-5, roe:-88, debt_eq:8.80 },
  GS:   { name:'Goldman Sachs Group Inc.',         sector:'Financials',       pe:14,  rev_growth:14,  margin:22, roe:12,  debt_eq:4.40 },
  MS:   { name:'Morgan Stanley',                   sector:'Financials',       pe:18,  rev_growth:12,  margin:18, roe:14,  debt_eq:3.30 },
  BLK:  { name:'BlackRock Inc.',                   sector:'Financials',       pe:22,  rev_growth:8,   margin:28, roe:14,  debt_eq:0.44 },
  SCHW: { name:'Charles Schwab Corp.',             sector:'Financials',       pe:28,  rev_growth:6,   margin:22, roe:12,  debt_eq:0.55 },
  AXP:  { name:'American Express Co.',             sector:'Financials',       pe:18,  rev_growth:10,  margin:18, roe:33,  debt_eq:1.77 },
  SPGI: { name:'S&P Global Inc.',                  sector:'Financials',       pe:45,  rev_growth:12,  margin:32, roe:22,  debt_eq:0.88 },
  MCO:  { name:'Moodys Corporation',             sector:'Financials',       pe:40,  rev_growth:10,  margin:30, roe:88,  debt_eq:2.20 },
  COF:  { name:'Capital One Financial Corp.',      sector:'Financials',       pe:12,  rev_growth:6,   margin:18, roe:10,  debt_eq:0.77 },
  AMT:  { name:'American Tower Corp.',             sector:'Real Estate',      pe:44,  rev_growth:4,   margin:18, roe:22,  debt_eq:3.30 },
  PLD:  { name:'Prologis Inc.',                    sector:'Real Estate',      pe:38,  rev_growth:8,   margin:44, roe:8,   debt_eq:0.66 },
  NEE:  { name:'NextEra Energy Inc.',              sector:'Utilities',        pe:22,  rev_growth:8,   margin:22, roe:12,  debt_eq:1.44 },
  SO:   { name:'Southern Company',                 sector:'Utilities',        pe:22,  rev_growth:4,   margin:16, roe:12,  debt_eq:1.77 },
  DUK:  { name:'Duke Energy Corp.',                sector:'Utilities',        pe:20,  rev_growth:3,   margin:14, roe:10,  debt_eq:1.55 },
  UNP:  { name:'Union Pacific Corp.',              sector:'Industrials',      pe:22,  rev_growth:2,   margin:28, roe:55,  debt_eq:1.88 },
  CSX:  { name:'CSX Corporation',                  sector:'Industrials',      pe:18,  rev_growth:1,   margin:26, roe:38,  debt_eq:1.44 },
  FDX:  { name:'FedEx Corporation',                sector:'Industrials',      pe:14,  rev_growth:1,   margin:6,  roe:16,  debt_eq:0.88 },
  UPS:  { name:'United Parcel Service Inc.',       sector:'Industrials',      pe:18,  rev_growth:-4,  margin:8,  roe:88,  debt_eq:2.20 },
  MMM:  { name:'3M Company',                       sector:'Industrials',      pe:14,  rev_growth:1,   margin:14, roe:44,  debt_eq:0.77 },
  EMR:  { name:'Emerson Electric Co.',             sector:'Industrials',      pe:22,  rev_growth:15,  margin:14, roe:14,  debt_eq:0.44 },
  ETN:  { name:'Eaton Corporation plc',            sector:'Industrials',      pe:30,  rev_growth:10,  margin:16, roe:18,  debt_eq:0.44 },
  CARR: { name:'Carrier Global Corp.',             sector:'Industrials',      pe:22,  rev_growth:18,  margin:10, roe:18,  debt_eq:1.10 },
  ISRG: { name:'Intuitive Surgical Inc.',          sector:'Healthcare',       pe:65,  rev_growth:17,  margin:25, roe:18,  debt_eq:0.00 },
  ELV:  { name:'Elevance Health Inc.',             sector:'Healthcare',       pe:14,  rev_growth:4,   margin:4,  roe:18,  debt_eq:0.66 },
  CI:   { name:'Cigna Group',                      sector:'Healthcare',       pe:12,  rev_growth:8,   margin:4,  roe:14,  debt_eq:0.66 },
  HUM:  { name:'Humana Inc.',                      sector:'Healthcare',       pe:22,  rev_growth:4,   margin:2,  roe:14,  debt_eq:0.55 },
  CVS:  { name:'CVS Health Corp.',                 sector:'Healthcare',       pe:10,  rev_growth:4,   margin:2,  roe:10,  debt_eq:0.77 },
  BMY:  { name:'Bristol-Myers Squibb Co.',         sector:'Healthcare',       pe:8,   rev_growth:2,   margin:18, roe:22,  debt_eq:1.44 },
  MRNA: { name:'Moderna Inc.',                     sector:'Healthcare',       pe:0,   rev_growth:-28, margin:-44,roe:-22, debt_eq:0.00 },
  DXCM: { name:'DexCom Inc.',                      sector:'Healthcare',       pe:55,  rev_growth:11,  margin:12, roe:14,  debt_eq:0.44 },
  IDXX: { name:'IDEXX Laboratories Inc.',          sector:'Healthcare',       pe:45,  rev_growth:7,   margin:22, roe:55,  debt_eq:0.55 },
  ZBH:  { name:'Zimmer Biomet Holdings Inc.',      sector:'Healthcare',       pe:16,  rev_growth:4,   margin:10, roe:8,   debt_eq:0.88 },
  LOW:  { name:'Lowes Companies Inc.',           sector:'Cons. Disc.',      pe:22,  rev_growth:1,   margin:9,  roe:88,  debt_eq:8.80 },
  TGT:  { name:'Target Corporation',               sector:'Cons. Disc.',      pe:14,  rev_growth:1,   margin:4,  roe:28,  debt_eq:1.10 },
  MCD:  { name:'McDonalds Corporation',          sector:'Cons. Disc.',      pe:24,  rev_growth:2,   margin:32, roe:88,  debt_eq:8.80 },
  CMG:  { name:'Chipotle Mexican Grill Inc.',      sector:'Cons. Disc.',      pe:50,  rev_growth:15,  margin:13, roe:44,  debt_eq:0.11 },
  YUM:  { name:'Yum! Brands Inc.',                 sector:'Cons. Disc.',      pe:22,  rev_growth:4,   margin:22, roe:88,  debt_eq:8.80 },
  DIS:  { name:'Walt Disney Company',              sector:'Comm. Services',   pe:22,  rev_growth:4,   margin:8,  roe:6,   debt_eq:0.55 },
  CMCSA:{ name:'Comcast Corporation',              sector:'Comm. Services',   pe:12,  rev_growth:2,   margin:14, roe:16,  debt_eq:1.44 },
  T:    { name:'AT&T Inc.',                        sector:'Comm. Services',   pe:14,  rev_growth:1,   margin:12, roe:10,  debt_eq:1.44 },
  VZ:   { name:'Verizon Communications Inc.',      sector:'Comm. Services',   pe:10,  rev_growth:1,   margin:14, roe:22,  debt_eq:1.77 },
  TMUS: { name:'T-Mobile US Inc.',                 sector:'Comm. Services',   pe:22,  rev_growth:4,   margin:14, roe:14,  debt_eq:1.22 },
  CHTR: { name:'Charter Communications Inc.',      sector:'Comm. Services',   pe:14,  rev_growth:1,   margin:12, roe:88,  debt_eq:8.80 },
  NXPI: { name:'NXP Semiconductors NV',            sector:'Technology',       pe:18,  rev_growth:1,   margin:22, roe:28,  debt_eq:1.44 },
  MCHP: { name:'Microchip Technology Inc.',        sector:'Technology',       pe:28,  rev_growth:-18, margin:22, roe:28,  debt_eq:1.55 },
  STX:  { name:'Seagate Technology Holdings',      sector:'Technology',       pe:18,  rev_growth:18,  margin:14, roe:88,  debt_eq:8.80 },
  WDC:  { name:'Western Digital Corp.',            sector:'Technology',       pe:22,  rev_growth:44,  margin:8,  roe:8,   debt_eq:0.88 },
  HPQ:  { name:'HP Inc.',                          sector:'Technology',       pe:10,  rev_growth:1,   margin:8,  roe:88,  debt_eq:8.80 },
  DELL: { name:'Dell Technologies Inc.',           sector:'Technology',       pe:14,  rev_growth:8,   margin:4,  roe:88,  debt_eq:8.80 },
  ANET: { name:'Arista Networks Inc.',             sector:'Technology',       pe:45,  rev_growth:20,  margin:38, roe:28,  debt_eq:0.00 },
  SMCI: { name:'Super Micro Computer Inc.',        sector:'Technology',       pe:18,  rev_growth:38,  margin:8,  roe:22,  debt_eq:0.44 },
  MSTR: { name:'MicroStrategy Inc.',               sector:'Technology',       pe:0,   rev_growth:-8,  margin:-44,roe:-22, debt_eq:2.20 },
  IONQ: { name:'IonQ Inc.',                        sector:'Technology',       pe:0,   rev_growth:95,  margin:-88,roe:-44, debt_eq:0.22 },
  RGTI: { name:'Rigetti Computing Inc.',           sector:'Technology',       pe:0,   rev_growth:42,  margin:-88,roe:-88, debt_eq:0.55 },
  QUBT: { name:'Quantum Computing Inc.',           sector:'Technology',       pe:0,   rev_growth:88,  margin:-88,roe:-88, debt_eq:0.44 },
  SLB:  { name:'SLB (Schlumberger)',               sector:'Energy',           pe:14,  rev_growth:2,   margin:12, roe:18,  debt_eq:0.55 },
  COP:  { name:'ConocoPhillips',                   sector:'Energy',           pe:14,  rev_growth:-4,  margin:18, roe:18,  debt_eq:0.33 },
  EOG:  { name:'EOG Resources Inc.',               sector:'Energy',           pe:12,  rev_growth:-2,  margin:22, roe:18,  debt_eq:0.22 },
  OXY:  { name:'Occidental Petroleum Corp.',       sector:'Energy',           pe:14,  rev_growth:-4,  margin:12, roe:12,  debt_eq:0.77 },
  MPC:  { name:'Marathon Petroleum Corp.',         sector:'Energy',           pe:10,  rev_growth:-8,  margin:6,  roe:28,  debt_eq:0.88 },

  FTNT: { name:'Fortinet Inc.',                 sector:'Technology',       pe:55,  rev_growth:14,  margin:19, roe:38,  debt_eq:0.70 },
}

function scoreStock(s) {
  // ── LONG SCORING ──────────────────────────────────────────
  let fund = 0
  if (s.eps_beat > 15) fund += 10; else if (s.eps_beat > 5) fund += 6; else if (s.eps_beat > 0) fund += 3
  if (s.rev_growth > 20) fund += 8; else if (s.rev_growth > 10) fund += 5; else if (s.rev_growth > 0) fund += 2
  if (s.margin > 20) fund += 7; else if (s.margin > 10) fund += 4; else if (s.margin > 0) fund += 1
  if (s.roe > 20) fund += 5
  const longFund = Math.min(fund, 30)

  let mac = 0
  if (s.rev_growth > 30) mac += 20; else if (s.rev_growth > 15) mac += 15; else if (s.rev_growth > 5) mac += 10; else mac += 5
  const longMacro = Math.min(mac, 25)

  let mis = 0
  if (s.from52h < -15) mis += 10
  if (s.from52h < -30) mis += 5
  if (s.from52h < -10 && s.rev_growth > 10) mis += 8
  if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) mis += 7
  const longMispricing = Math.min(mis, 25)

  let tech = 0
  if (s.rsi > 35 && s.rsi < 60) tech += 8
  if (s.rsi < 35) tech += 5  // oversold
  if (s.vol_ratio > 1.5) tech += 6
  if (s.vol_ratio > 2.0) tech += 6
  const longTech = Math.min(tech, 20)

  const longScore = longFund + longMacro + longMispricing + longTech

  // ── SHORT SCORING ─────────────────────────────────────────
  let sFund = 0
  if (s.rev_growth < 0) sFund += 10; else if (s.rev_growth < 5) sFund += 5
  if (s.margin < 0) sFund += 10; else if (s.margin < 5) sFund += 5
  if (s.pe > 60 && s.rev_growth < 20) sFund += 10  // expensive + slowing
  if (s.pe > 100) sFund += 5
  const shortFund = Math.min(sFund, 30)

  let sVal = 0
  if (s.from52h > -10 && s.pe > 50) sVal += 15  // near highs + expensive
  if (s.from52h > -5) sVal += 10                  // basically at highs
  if (s.pe > 80 && s.rev_growth < 30) sVal += 10  // PE not justified
  const shortOverval = Math.min(sVal, 25)

  let sTech = 0
  if (s.rsi > 70) sTech += 15   // overbought
  if (s.rsi > 80) sTech += 10   // extremely overbought
  if (s.vol_ratio > 2.0 && s.rsi > 65) sTech += 5  // volume at top
  const shortTech = Math.min(sTech, 25)

  let sMom = 0
  if (s.from52h > -8 && s.rsi > 65) sMom += 20  // extended at highs
  const shortMom = Math.min(sMom, 20)

  const shortScore = shortFund + shortOverval + shortTech + shortMom

  // ── DETERMINE DIRECTION ───────────────────────────────────
  const isShort = shortScore > longScore && shortScore > 40
  const score = isShort ? shortScore : longScore
  const direction = isShort ? 'short' : 'long'

  let archetype = 'catalyst_surprise'
  if (isShort) {
    if (s.pe > 80 && s.rev_growth < 20) archetype = 'deep_value'  // reuse as overvalued
    else if (s.rsi > 75) archetype = 'macro_pattern'
    else archetype = 'earnings_mispricing'
  } else {
    if (s.from52h < -15 && s.rev_growth > 10) archetype = 'earnings_mispricing'
    else if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) archetype = 'deep_value'
    else if (s.rev_growth > 25 && s.rsi < 60) archetype = 'macro_pattern'
  }

  const upside = isShort
    ? Math.min(Math.abs(s.from52h) + 20, 60)  // short downside estimate
    : Math.abs(s.from52h) * 0.65
  const stopPct = s.rsi < 40 || s.rsi > 70 ? 4 : 6
  const rr = stopPct > 0 ? +(upside / stopPct).toFixed(1) : 0

  return {
    ...s, score, direction,
    breakdown: isShort
      ? { fundamentals: shortFund, macro: shortMom, mispricing: shortOverval, technical: shortTech }
      : { fundamentals: longFund, macro: longMacro, mispricing: longMispricing, technical: longTech },
    archetype, upside: +upside.toFixed(1), stopPct, rr
  }
}

async function fetchQuote(ticker) {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.chart?.result?.[0]?.meta || null
  } catch { return null }
}

export async function GET() {
  try {
    const tickers = Object.keys(FUNDAMENTALS)
    const concurrency = 15
    const stocks = []

    for (let i = 0; i < tickers.length; i += concurrency) {
      const chunk = tickers.slice(i, i + concurrency)
      const results = await Promise.all(chunk.map(async ticker => {
        const meta = await fetchQuote(ticker)
        if (!meta?.regularMarketPrice) return null

        const f = FUNDAMENTALS[ticker]
        const price = meta.regularMarketPrice || 0
        const high52 = meta.fiftyTwoWeekHigh || price
        const low52 = meta.fiftyTwoWeekLow || price * 0.7
        const from52h = high52 > 0 ? +((( price - high52) / high52) * 100).toFixed(1) : 0
        const avgVol = meta.averageDailyVolume3Month || meta.averageDailyVolume10Day || 1
        const curVol = meta.regularMarketVolume || avgVol
        const vol_ratio = avgVol > 0 ? +(curVol / avgVol).toFixed(2) : 1
        const range = high52 - low52
        const rsi = range > 0 ? Math.round(((price - low52) / range) * 100) : 50

        return {
          ticker,
          name: f.name,
          sector: f.sector,
          price: +price.toFixed(2),
          pe: f.pe,
          eps_beat: 0,
          rev_growth: f.rev_growth,
          margin: f.margin,
          roe: f.roe,
          debt_eq: f.debt_eq,
          rsi, from52h, vol_ratio,
          pattern: `${from52h < -20 ? 'Deep pullback' : from52h < -10 ? 'Pullback' : 'Near highs'} · RSI ${rsi}`,
          overhang: 'See AI analysis',
          macro: 'See AI analysis',
          sentiment: Math.min(100, Math.max(0, 50 + rsi * 0.3)),
        }
      }))
      stocks.push(...results.filter(Boolean))
    }

    const scored = stocks
      .map(scoreStock)
      .filter(s => s.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)

    return Response.json({ stocks: scored, updatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Scanner error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

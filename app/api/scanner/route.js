import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Full S&P 500 + extras ticker list
const ALL_TICKERS = [
  'MMM','AOS','ABT','ABBV','ACN','ADBE','AMD','AES','AFL','A','APD','ABNB','AKAM','ALB','ARE',
  'ALGN','ALLE','LNT','ALL','GOOGL','MO','AMZN','AMCR','AEE','AAL','AEP','AXP','AIG','AMT',
  'AWK','AMP','AME','AMGN','APH','ADI','ANSS','AON','APA','AAPL','AMAT','APTV','ACGL','ADM',
  'ANET','AJG','AIZ','T','ATO','ADSK','ADP','AZO','AVB','AVY','AXON','BKR','BALL','BAC','BAX',
  'BDX','BBY','BIIB','BLK','BX','BA','BKNG','BWA','BSX','BMY','AVGO','BR','BRO','BK','CDNS',
  'CPT','CPB','COF','CAH','KMX','CCL','CARR','CAT','CBOE','CBRE','CDW','COR','CNC','CF','CRL',
  'SCHW','CHTR','CVX','CMG','CB','CHD','CI','CINF','CTAS','CSCO','C','CFG','CLX','CME','CMS',
  'KO','CTSH','CL','CMCSA','CAG','COP','ED','STZ','CEG','COO','CPRT','GLW','COST','CTRA','CCI',
  'CSX','CMI','CVS','DHR','DRI','DVA','DECK','DE','DAL','DVN','DXCM','FANG','DLR','DFS','DG',
  'DLTR','D','DPZ','DOV','DOW','DHI','DTE','DUK','DD','EMN','ETN','EBAY','ECL','EIX','EW','EA',
  'ELV','EMR','ENPH','ETR','EOG','EFX','EQIX','EQR','ESS','EL','ETSY','EG','EVRG','ES','EXC',
  'EXPE','EXPD','EXR','XOM','FFIV','FDS','FICO','FAST','FRT','FDX','FIS','FITB','FSLR','FE',
  'FI','FMC','F','FTNT','FTV','BEN','FCX','GRMN','IT','GE','GEHC','GEN','GNRC','GD','GIS',
  'GM','GPC','GILD','GS','HAL','HIG','HAS','HCA','HSIC','HSY','HES','HPE','HLT','HOLX','HD',
  'HON','HRL','HST','HWM','HPQ','HUBB','HUM','HBAN','HII','IBM','IEX','IDXX','ITW','INCY',
  'IR','INTC','ICE','IFF','IP','IPG','INTU','ISRG','IVZ','INVH','IQV','IRM','JBHT','JBL',
  'J','JNJ','JCI','JPM','JNPR','K','KDP','KEY','KEYS','KMB','KIM','KMI','KLAC','KHC','KR',
  'LHX','LH','LRCX','LW','LVS','LDOS','LEN','LLY','LIN','LYV','LKQ','LMT','L','LOW','LULU',
  'LYB','MTB','MRO','MPC','MKTX','MAR','MMC','MLM','MAS','MA','MTCH','MKC','MCD','MCK','MDT',
  'MET','META','MTD','MGM','MCHP','MU','MSFT','MAA','MRNA','MHK','MOH','TAP','MDLZ','MPWR',
  'MNST','MCO','MS','MOS','MSI','MSCI','NDAQ','NTAP','NFLX','NEM','NEE','NKE','NI','NDSN',
  'NSC','NTRS','NOC','NCLH','NRG','NUE','NVR','NVDA','ORLY','OXY','ODFL','OMC','ON','OKE',
  'ORCL','OTIS','PCAR','PKG','PLTR','PH','PAYX','PAYC','PYPL','PNR','PEP','PFE','PCG','PM',
  'PSX','PNW','PNC','POOL','PPG','PPL','PFG','PG','PGR','PRU','PEG','PTC','PSA','PHM','PWR',
  'QCOM','DGX','RL','RJF','RTX','O','REG','REGN','RF','RSG','RMD','ROK','ROL','ROP','ROST',
  'RCL','SPGI','CRM','SBAC','SLB','STX','SRE','NOW','SHW','SPG','SWKS','SJM','SW','SNA',
  'SO','LUV','SWK','SBUX','STT','STLD','STE','SYK','SMCI','SYF','SNPS','SYY','TMUS','TROW',
  'TTWO','TPR','TGT','TEL','TDY','TFX','TER','TSLA','TXN','TXT','TMO','TJX','TSCO','TT',
  'TDG','TRV','TRMB','TFC','TYL','TSN','USB','UDR','ULTA','UNP','UAL','UPS','URI','UNH',
  'UHS','VLO','VTR','VRSN','VRSK','VZ','VRTX','V','VST','VICI','VMC','GWW','WAB','WBA',
  'WMT','DIS','WM','WAT','WEC','WFC','WELL','WST','WDC','WY','WHR','WMB','WTW','WDAY',
  'XEL','XYL','YUM','ZBRA','ZBH','ZTS',
  // High-conviction extras
  'COIN','HOOD','SOFI','AFRM','APP','HIMS','DDOG','SNOW','NET','CRWD','ZS','PANW','CELH',
  'DUOL','MELI','SHOP','RBLX','SPOT','TTD','UBER','ARM','MSTR','IONQ','RGTI','QUBT','ONDS','BABA'
]

// Hardcoded fundamentals for high-conviction stocks (quarterly update)
const HARDCODED = {
  // Updated Q1 2026 earnings data
  AAPL: { name:'Apple Inc.',                    sector:'Technology',     pe:31,  rev_growth:4,   margin:26, roe:160, debt_eq:1.80 },
  MSFT: { name:'Microsoft Corp.',               sector:'Technology',     pe:34,  rev_growth:14,  margin:37, roe:40,  debt_eq:0.44 },
  NVDA: { name:'NVIDIA Corp.',                  sector:'Technology',     pe:38,  rev_growth:80,  margin:57, roe:120, debt_eq:0.44 },
  GOOGL:{ name:'Alphabet Inc.',                 sector:'Comm. Services', pe:20,  rev_growth:12,  margin:30, roe:30,  debt_eq:0.08 },
  META: { name:'Meta Platforms Inc.',           sector:'Comm. Services', pe:24,  rev_growth:19,  margin:40, roe:38,  debt_eq:0.12 },
  AMZN: { name:'Amazon.com Inc.',               sector:'Cons. Disc.',    pe:38,  rev_growth:12,  margin:10, roe:24,  debt_eq:0.55 },
  TSLA: { name:'Tesla Inc.',                    sector:'Cons. Disc.',    pe:120, rev_growth:-1,  margin:6,  roe:10,  debt_eq:0.17 },
  AVGO: { name:'Broadcom Inc.',                 sector:'Technology',     pe:26,  rev_growth:22,  margin:42, roe:55,  debt_eq:1.10 },
  JPM:  { name:'JPMorgan Chase & Co.',          sector:'Financials',     pe:13,  rev_growth:10,  margin:28, roe:17,  debt_eq:1.33 },
  V:    { name:'Visa Inc.',                     sector:'Financials',     pe:31,  rev_growth:10,  margin:54, roe:46,  debt_eq:0.55 },
  MA:   { name:'Mastercard Inc.',               sector:'Financials',     pe:38,  rev_growth:12,  margin:47, roe:160, debt_eq:2.20 },
  LLY:  { name:'Eli Lilly and Co.',             sector:'Healthcare',     pe:65,  rev_growth:45,  margin:30, roe:90,  debt_eq:1.77 },
  UNH:  { name:'UnitedHealth Group Inc.',       sector:'Healthcare',     pe:13,  rev_growth:5,   margin:4,  roe:22,  debt_eq:0.77 },
  XOM:  { name:'Exxon Mobil Corp.',             sector:'Energy',         pe:14,  rev_growth:-3,  margin:10, roe:14,  debt_eq:0.22 },
  WMT:  { name:'Walmart Inc.',                  sector:'Cons. Staples',  pe:36,  rev_growth:6,   margin:3,  roe:22,  debt_eq:0.66 },
  PG:   { name:'Procter & Gamble Co.',          sector:'Cons. Staples',  pe:25,  rev_growth:2,   margin:19, roe:30,  debt_eq:0.66 },
  COST: { name:'Costco Wholesale Corp.',        sector:'Cons. Staples',  pe:52,  rev_growth:9,   margin:3,  roe:38,  debt_eq:0.44 },
  HD:   { name:'Home Depot Inc.',               sector:'Cons. Disc.',    pe:25,  rev_growth:2,   margin:10, roe:88,  debt_eq:8.80 },
  NFLX: { name:'Netflix Inc.',                  sector:'Comm. Services', pe:45,  rev_growth:16,  margin:28, roe:35,  debt_eq:0.77 },
  CRM:  { name:'Salesforce Inc.',               sector:'Technology',     pe:38,  rev_growth:9,   margin:18, roe:12,  debt_eq:0.22 },
  ADBE: { name:'Adobe Inc.',                    sector:'Technology',     pe:26,  rev_growth:10,  margin:30, roe:38,  debt_eq:0.44 },
  AMD:  { name:'Advanced Micro Devices Inc.',   sector:'Technology',     pe:38,  rev_growth:36,  margin:8,  roe:6,   debt_eq:0.04 },
  INTC: { name:'Intel Corp.',                   sector:'Technology',     pe:0,   rev_growth:-10, margin:-8, roe:-10, debt_eq:0.55 },
  QCOM: { name:'Qualcomm Inc.',                 sector:'Technology',     pe:15,  rev_growth:14,  margin:27, roe:44,  debt_eq:0.55 },
  TXN:  { name:'Texas Instruments Inc.',        sector:'Technology',     pe:32,  rev_growth:-2,  margin:36, roe:55,  debt_eq:0.88 },
  INTU: { name:'Intuit Inc.',                   sector:'Technology',     pe:52,  rev_growth:13,  margin:18, roe:18,  debt_eq:0.55 },
  ORCL: { name:'Oracle Corp.',                  sector:'Technology',     pe:38,  rev_growth:10,  margin:24, roe:88,  debt_eq:8.80 },
  NOW:  { name:'ServiceNow Inc.',               sector:'Technology',     pe:62,  rev_growth:22,  margin:17, roe:24,  debt_eq:0.22 },
  AMAT: { name:'Applied Materials Inc.',        sector:'Technology',     pe:19,  rev_growth:4,   margin:28, roe:55,  debt_eq:0.44 },
  LRCX: { name:'Lam Research Corp.',            sector:'Technology',     pe:20,  rev_growth:22,  margin:32, roe:88,  debt_eq:0.88 },
  KLAC: { name:'KLA Corp.',                     sector:'Technology',     pe:25,  rev_growth:24,  margin:38, roe:88,  debt_eq:1.44 },
  SNPS: { name:'Synopsys Inc.',                 sector:'Technology',     pe:44,  rev_growth:12,  margin:18, roe:18,  debt_eq:0.11 },
  CDNS: { name:'Cadence Design Systems Inc.',   sector:'Technology',     pe:54,  rev_growth:14,  margin:22, roe:44,  debt_eq:0.44 },
  ANET: { name:'Arista Networks Inc.',          sector:'Technology',     pe:48,  rev_growth:22,  margin:40, roe:30,  debt_eq:0.00 },
  SMCI: { name:'Super Micro Computer Inc.',     sector:'Technology',     pe:16,  rev_growth:42,  margin:8,  roe:22,  debt_eq:0.44 },
  MSTR: { name:'Strategy Inc.',                 sector:'Technology',     pe:0,   rev_growth:-6,  margin:-44,roe:-22, debt_eq:2.20 },
  IONQ: { name:'IonQ Inc.',                     sector:'Technology',     pe:0,   rev_growth:95,  margin:-88,roe:-44, debt_eq:0.22 },
  RGTI: { name:'Rigetti Computing Inc.',        sector:'Technology',     pe:0,   rev_growth:42,  margin:-88,roe:-88, debt_eq:0.55 },
  QUBT: { name:'Quantum Computing Inc.',        sector:'Technology',     pe:0,   rev_growth:88,  margin:-88,roe:-88, debt_eq:0.44 },
  ONDS: { name:'Ondas Holdings Inc.',           sector:'Technology',     pe:0,   rev_growth:42,  margin:-80,roe:-88, debt_eq:1.10 },
  BABA: { name:'Alibaba Group Holding Ltd.',    sector:'Cons. Disc.',    pe:14,  rev_growth:8,   margin:14, roe:12,  debt_eq:0.22 },
  COIN: { name:'Coinbase Global Inc.',          sector:'Financials',     pe:22,  rev_growth:65,  margin:38, roe:20,  debt_eq:0.44 },
  HOOD: { name:'Robinhood Markets Inc.',        sector:'Financials',     pe:20,  rev_growth:50,  margin:24, roe:22,  debt_eq:0.22 },
  SOFI: { name:'SoFi Technologies Inc.',        sector:'Financials',     pe:30,  rev_growth:22,  margin:12, roe:8,   debt_eq:0.88 },
  AFRM: { name:'Affirm Holdings Inc.',          sector:'Financials',     pe:0,   rev_growth:36,  margin:-6, roe:-8,  debt_eq:0.55 },
  APP:  { name:'AppLovin Corporation',          sector:'Technology',     pe:75,  rev_growth:73,  margin:42, roe:88,  debt_eq:1.10 },
  HIMS: { name:'Hims & Hers Health Inc.',       sector:'Healthcare',     pe:35,  rev_growth:68,  margin:14, roe:16,  debt_eq:0.11 },
  DDOG: { name:'Datadog Inc.',                  sector:'Technology',     pe:85,  rev_growth:27,  margin:8,  roe:10,  debt_eq:0.22 },
  SNOW: { name:'Snowflake Inc.',                sector:'Technology',     pe:0,   rev_growth:29,  margin:-8, roe:-12, debt_eq:0.00 },
  NET:  { name:'Cloudflare Inc.',               sector:'Technology',     pe:0,   rev_growth:28,  margin:-2, roe:-8,  debt_eq:0.44 },
  CRWD: { name:'CrowdStrike Holdings Inc.',     sector:'Technology',     pe:85,  rev_growth:28,  margin:6,  roe:10,  debt_eq:0.22 },
  ZS:   { name:'Zscaler Inc.',                  sector:'Technology',     pe:0,   rev_growth:24,  margin:-2, roe:-6,  debt_eq:0.55 },
  PANW: { name:'Palo Alto Networks Inc.',       sector:'Technology',     pe:52,  rev_growth:16,  margin:12, roe:44,  debt_eq:0.77 },
  AAP:  {name:'Advance Auto Parts Inc.', sector:'Cons. Disc.', pe:14, rev_growth:-6, margin:2, roe:4, debt_eq:0.88},
  ABC:  {name:'AmerisourceBergen Corp.', sector:'Healthcare', pe:22, rev_growth:12, margin:1, roe:88, debt_eq:2.2},
  ACN:  {name:'Accenture plc', sector:'Technology', pe:28, rev_growth:2, margin:12, roe:28, debt_eq:0.11},
  ADI:  {name:'Analog Devices Inc.', sector:'Technology', pe:28, rev_growth:-8, margin:26, roe:10, debt_eq:0.44},
  AEP:  {name:'American Electric Power Co.', sector:'Utilities', pe:18, rev_growth:4, margin:14, roe:10, debt_eq:1.55},
  AIG:  {name:'American International Group', sector:'Financials', pe:12, rev_growth:4, margin:8, roe:8, debt_eq:0.33},
  ALGN:  {name:'Align Technology Inc.', sector:'Healthcare', pe:30, rev_growth:4, margin:16, roe:18, debt_eq:0.11},
  ALL:  {name:'Allstate Corporation', sector:'Financials', pe:10, rev_growth:10, margin:6, roe:18, debt_eq:0.33},
  AME:  {name:'AMETEK Inc.', sector:'Industrials', pe:28, rev_growth:8, margin:20, roe:14, debt_eq:0.44},
  ANSS:  {name:'ANSYS Inc.', sector:'Technology', pe:44, rev_growth:8, margin:22, roe:14, debt_eq:0.11},
  AON:  {name:'Aon plc', sector:'Financials', pe:24, rev_growth:8, margin:22, roe:44, debt_eq:1.44},
  APD:  {name:'Air Products and Chemicals Inc.', sector:'Materials', pe:22, rev_growth:2, margin:22, roe:14, debt_eq:0.88},
  ATVI:  {name:'Activision Blizzard Inc.', sector:'Comm. Services', pe:22, rev_growth:2, margin:22, roe:14, debt_eq:0.22},
  AVB:  {name:'AvalonBay Communities Inc.', sector:'Real Estate', pe:28, rev_growth:6, margin:28, roe:8, debt_eq:0.77},
  AZO:  {name:'AutoZone Inc.', sector:'Cons. Disc.', pe:20, rev_growth:6, margin:14, roe:88, debt_eq:8.8},
  BA:  {name:'Boeing Company', sector:'Industrials', pe:0, rev_growth:5, margin:-5, roe:-88, debt_eq:8.8},
  BAH:  {name:'Booz Allen Hamilton Holding', sector:'Technology', pe:22, rev_growth:12, margin:8, roe:44, debt_eq:2.2},
  BAX:  {name:'Baxter International Inc.', sector:'Healthcare', pe:22, rev_growth:-2, margin:6, roe:6, debt_eq:1.44},
  BBWI:  {name:'Bath & Body Works Inc.', sector:'Cons. Disc.', pe:10, rev_growth:-4, margin:14, roe:88, debt_eq:8.8},
  BDX:  {name:'Becton Dickinson and Co.', sector:'Healthcare', pe:18, rev_growth:4, margin:8, roe:10, debt_eq:0.88},
  BJ:  {name:'BJ\'s Wholesale Club Holdings', sector:'Cons. Staples', pe:18, rev_growth:6, margin:3, roe:44, debt_eq:1.44},
  BKNG:  {name:'Booking Holdings Inc.', sector:'Cons. Disc.', pe:22, rev_growth:10, margin:22, roe:88, debt_eq:1.1},
  BKR:  {name:'Baker Hughes Company', sector:'Energy', pe:18, rev_growth:8, margin:8, roe:8, debt_eq:0.44},
  BSX:  {name:'Boston Scientific Corp.', sector:'Healthcare', pe:38, rev_growth:14, margin:12, roe:12, debt_eq:0.55},
  C:  {name:'Citigroup Inc.', sector:'Financials', pe:10, rev_growth:4, margin:16, roe:6, debt_eq:1.44},
  CAH:  {name:'Cardinal Health Inc.', sector:'Healthcare', pe:18, rev_growth:10, margin:1, roe:88, debt_eq:2.2},
  CB:  {name:'Chubb Limited', sector:'Financials', pe:14, rev_growth:10, margin:14, roe:14, debt_eq:0.22},
  CBOE:  {name:'Cboe Global Markets Inc.', sector:'Financials', pe:22, rev_growth:8, margin:28, roe:14, debt_eq:0.44},
  CCI:  {name:'Crown Castle Inc.', sector:'Real Estate', pe:44, rev_growth:-2, margin:18, roe:14, debt_eq:3.3},
  CEG:  {name:'Constellation Energy Corp.', sector:'Utilities', pe:22, rev_growth:14, margin:14, roe:18, debt_eq:0.88},
  CFLT:  {name:'Confluent Inc.', sector:'Technology', pe:0, rev_growth:22, margin:-18, roe:-22, debt_eq:1.1},
  CHD:  {name:'Church & Dwight Co. Inc.', sector:'Cons. Staples', pe:32, rev_growth:6, margin:12, roe:18, debt_eq:0.88},
  CHRW:  {name:'C.H. Robinson Worldwide Inc.', sector:'Industrials', pe:18, rev_growth:-8, margin:4, roe:28, debt_eq:0.55},
  CI:  {name:'Cigna Group', sector:'Healthcare', pe:12, rev_growth:8, margin:4, roe:14, debt_eq:0.66},
  CL:  {name:'Colgate-Palmolive Company', sector:'Cons. Staples', pe:26, rev_growth:4, margin:14, roe:88, debt_eq:8.8},
  CLX:  {name:'Clorox Company', sector:'Cons. Staples', pe:28, rev_growth:2, margin:12, roe:88, debt_eq:8.8},
  CMCSA:  {name:'Comcast Corporation', sector:'Comm. Services', pe:12, rev_growth:2, margin:14, roe:16, debt_eq:1.44},
  CME:  {name:'CME Group Inc.', sector:'Financials', pe:24, rev_growth:4, margin:44, roe:10, debt_eq:0.22},
  CMG:  {name:'Chipotle Mexican Grill Inc.', sector:'Cons. Disc.', pe:50, rev_growth:15, margin:13, roe:44, debt_eq:0.11},
  CRL:  {name:'Charles River Laboratories', sector:'Healthcare', pe:22, rev_growth:-4, margin:12, roe:16, debt_eq:1.1},
  CSCO:  {name:'Cisco Systems Inc.', sector:'Technology', pe:16, rev_growth:-6, margin:22, roe:28, debt_eq:0.22},
  CSX:  {name:'CSX Corporation', sector:'Industrials', pe:18, rev_growth:1, margin:26, roe:38, debt_eq:1.44},
  CTSH:  {name:'Cognizant Technology Solutions', sector:'Technology', pe:16, rev_growth:2, margin:12, roe:14, debt_eq:0.11},
  D:  {name:'Dominion Energy Inc.', sector:'Utilities', pe:18, rev_growth:2, margin:14, roe:8, debt_eq:1.77},
  DD:  {name:'DuPont de Nemours Inc.', sector:'Materials', pe:18, rev_growth:4, margin:8, roe:4, debt_eq:0.44},
  DELL:  {name:'Dell Technologies Inc.', sector:'Technology', pe:14, rev_growth:8, margin:4, roe:88, debt_eq:8.8},
  DFS:  {name:'Discover Financial Services', sector:'Financials', pe:12, rev_growth:8, margin:22, roe:22, debt_eq:2.2},
  DG:  {name:'Dollar General Corporation', sector:'Cons. Disc.', pe:14, rev_growth:2, margin:6, roe:22, debt_eq:0.77},
  DGX:  {name:'Quest Diagnostics Inc.', sector:'Healthcare', pe:16, rev_growth:2, margin:12, roe:18, debt_eq:0.77},
  DHI:  {name:'D.R. Horton Inc.', sector:'Cons. Disc.', pe:10, rev_growth:4, margin:14, roe:18, debt_eq:0.33},
  DIS:  {name:'Walt Disney Company', sector:'Comm. Services', pe:22, rev_growth:4, margin:8, roe:6, debt_eq:0.55},
  DKNG:  {name:'DraftKings Inc.', sector:'Cons. Disc.', pe:0, rev_growth:40, margin:-8, roe:-18, debt_eq:0.55},
  DLTR:  {name:'Dollar Tree Inc.', sector:'Cons. Disc.', pe:18, rev_growth:4, margin:4, roe:14, debt_eq:0.88},
  DOV:  {name:'Dover Corporation', sector:'Industrials', pe:20, rev_growth:2, margin:14, roe:28, debt_eq:0.66},
  DOW:  {name:'Dow Inc.', sector:'Materials', pe:14, rev_growth:-4, margin:4, roe:10, debt_eq:0.88},
  DPZ:  {name:'Domino\'s Pizza Inc.', sector:'Cons. Disc.', pe:28, rev_growth:6, margin:12, roe:88, debt_eq:8.8},
  DUK:  {name:'Duke Energy Corp.', sector:'Utilities', pe:20, rev_growth:3, margin:14, roe:10, debt_eq:1.55},
  DVN:  {name:'Devon Energy Corporation', sector:'Energy', pe:10, rev_growth:-8, margin:22, roe:22, debt_eq:0.44},
  EA:  {name:'Electronic Arts Inc.', sector:'Comm. Services', pe:22, rev_growth:2, margin:14, roe:10, debt_eq:0.22},
  EBAY:  {name:'eBay Inc.', sector:'Cons. Disc.', pe:12, rev_growth:2, margin:18, roe:88, debt_eq:1.77},
  ECL:  {name:'Ecolab Inc.', sector:'Materials', pe:32, rev_growth:8, margin:12, roe:18, debt_eq:0.88},
  ED:  {name:'Consolidated Edison Inc.', sector:'Utilities', pe:18, rev_growth:4, margin:12, roe:8, debt_eq:1.1},
  EFX:  {name:'Equifax Inc.', sector:'Industrials', pe:32, rev_growth:8, margin:16, roe:22, debt_eq:1.1},
  EIX:  {name:'Edison International', sector:'Utilities', pe:14, rev_growth:4, margin:10, roe:8, debt_eq:1.44},
  EL:  {name:'Estee Lauder Companies Inc.', sector:'Cons. Staples', pe:28, rev_growth:-8, margin:8, roe:22, debt_eq:1.1},
  ELV:  {name:'Elevance Health Inc.', sector:'Healthcare', pe:14, rev_growth:4, margin:4, roe:18, debt_eq:0.66},
  EMR:  {name:'Emerson Electric Co.', sector:'Industrials', pe:22, rev_growth:15, margin:14, roe:14, debt_eq:0.44},
  EQIX:  {name:'Equinix Inc.', sector:'Real Estate', pe:88, rev_growth:8, margin:8, roe:4, debt_eq:1.44},
  EQR:  {name:'Equity Residential', sector:'Real Estate', pe:28, rev_growth:4, margin:28, roe:8, debt_eq:0.88},
  ES:  {name:'Eversource Energy', sector:'Utilities', pe:14, rev_growth:2, margin:10, roe:6, debt_eq:1.77},
  ESTC:  {name:'Elastic N.V.', sector:'Technology', pe:0, rev_growth:18, margin:-8, roe:-22, debt_eq:0.55},
  ETR:  {name:'Entergy Corporation', sector:'Utilities', pe:18, rev_growth:4, margin:12, roe:10, debt_eq:1.55},
  ETSY:  {name:'Etsy Inc.', sector:'Cons. Disc.', pe:18, rev_growth:4, margin:14, roe:44, debt_eq:1.44},
  EW:  {name:'Edwards Lifesciences Corp.', sector:'Healthcare', pe:28, rev_growth:8, margin:22, roe:22, debt_eq:0.22},
  EXC:  {name:'Exelon Corporation', sector:'Utilities', pe:16, rev_growth:2, margin:12, roe:8, debt_eq:1.44},
  EXPD:  {name:'Expeditors International', sector:'Industrials', pe:22, rev_growth:-8, margin:8, roe:28, debt_eq:0.0},
  EXPE:  {name:'Expedia Group Inc.', sector:'Cons. Disc.', pe:14, rev_growth:8, margin:8, roe:22, debt_eq:1.44},
  EXR:  {name:'Extra Space Storage Inc.', sector:'Real Estate', pe:28, rev_growth:4, margin:44, roe:18, debt_eq:1.44},
  FANG:  {name:'Diamondback Energy Inc.', sector:'Energy', pe:10, rev_growth:4, margin:28, roe:14, debt_eq:0.44},
  FAST:  {name:'Fastenal Company', sector:'Industrials', pe:32, rev_growth:4, margin:20, roe:28, debt_eq:0.11},
  FDX:  {name:'FedEx Corporation', sector:'Industrials', pe:14, rev_growth:1, margin:6, roe:16, debt_eq:0.88},
  FE:  {name:'FirstEnergy Corp.', sector:'Utilities', pe:16, rev_growth:2, margin:12, roe:8, debt_eq:2.2},
  FFIV:  {name:'F5 Inc.', sector:'Technology', pe:18, rev_growth:4, margin:18, roe:22, debt_eq:0.44},
  FI:  {name:'Fiserv Inc.', sector:'Financials', pe:28, rev_growth:8, margin:18, roe:10, debt_eq:1.1},
  FIS:  {name:'Fidelity National Info Services', sector:'Financials', pe:14, rev_growth:2, margin:16, roe:4, debt_eq:0.88},
  FOXA:  {name:'Fox Corporation', sector:'Comm. Services', pe:12, rev_growth:4, margin:8, roe:10, debt_eq:0.44},
  FTV:  {name:'Fortive Corporation', sector:'Industrials', pe:24, rev_growth:4, margin:16, roe:10, debt_eq:0.44},
  GD:  {name:'General Dynamics Corporation', sector:'Industrials', pe:18, rev_growth:8, margin:10, roe:22, debt_eq:0.55},
  GIS:  {name:'General Mills Inc.', sector:'Cons. Staples', pe:14, rev_growth:-2, margin:14, roe:22, debt_eq:1.44},
  GM:  {name:'General Motors Company', sector:'Cons. Disc.', pe:6, rev_growth:4, margin:4, roe:14, debt_eq:1.77},
  GNRC:  {name:'Generac Holdings Inc.', sector:'Industrials', pe:22, rev_growth:4, margin:8, roe:14, debt_eq:0.88},
  GPN:  {name:'Global Payments Inc.', sector:'Financials', pe:14, rev_growth:6, margin:14, roe:4, debt_eq:0.66},
  GWW:  {name:'W.W. Grainger Inc.', sector:'Industrials', pe:22, rev_growth:8, margin:14, roe:55, debt_eq:0.88},
  H:  {name:'Hyatt Hotels Corporation', sector:'Cons. Disc.', pe:28, rev_growth:8, margin:8, roe:8, debt_eq:0.88},
  HAL:  {name:'Halliburton Company', sector:'Energy', pe:14, rev_growth:2, margin:10, roe:22, debt_eq:0.77},
  HIG:  {name:'Hartford Financial Services', sector:'Financials', pe:12, rev_growth:8, margin:8, roe:14, debt_eq:0.33},
  HLT:  {name:'Hilton Worldwide Holdings Inc.', sector:'Cons. Disc.', pe:28, rev_growth:10, margin:12, roe:88, debt_eq:8.8},
  HPE:  {name:'Hewlett Packard Enterprise Co.', sector:'Technology', pe:12, rev_growth:4, margin:6, roe:8, debt_eq:0.55},
  HPQ:  {name:'HP Inc.', sector:'Technology', pe:10, rev_growth:1, margin:8, roe:88, debt_eq:8.8},
  HRL:  {name:'Hormel Foods Corporation', sector:'Cons. Staples', pe:22, rev_growth:-4, margin:8, roe:10, debt_eq:0.33},
  HSIC:  {name:'Henry Schein Inc.', sector:'Healthcare', pe:18, rev_growth:4, margin:4, roe:12, debt_eq:0.44},
  HUBB:  {name:'Hubbell Inc.', sector:'Industrials', pe:22, rev_growth:8, margin:18, roe:28, debt_eq:0.66},
  HUBS:  {name:'HubSpot Inc.', sector:'Technology', pe:88, rev_growth:20, margin:4, roe:4, debt_eq:0.22},
  HUM:  {name:'Humana Inc.', sector:'Healthcare', pe:22, rev_growth:4, margin:2, roe:14, debt_eq:0.55},
  IBM:  {name:'IBM', sector:'Technology', pe:20, rev_growth:4, margin:10, roe:22, debt_eq:2.2},
  ICE:  {name:'Intercontinental Exchange Inc.', sector:'Financials', pe:28, rev_growth:10, margin:22, roe:10, debt_eq:0.88},
  IP:  {name:'International Paper Company', sector:'Materials', pe:14, rev_growth:-4, margin:4, roe:8, debt_eq:1.1},
  IPG:  {name:'Interpublic Group of Companies', sector:'Comm. Services', pe:12, rev_growth:2, margin:8, roe:22, debt_eq:1.1},
  IQV:  {name:'IQVIA Holdings Inc.', sector:'Healthcare', pe:22, rev_growth:4, margin:8, roe:12, debt_eq:1.44},
  IR:  {name:'Ingersoll Rand Inc.', sector:'Industrials', pe:24, rev_growth:6, margin:14, roe:10, debt_eq:0.55},
  ITW:  {name:'Illinois Tool Works Inc.', sector:'Industrials', pe:24, rev_growth:2, margin:26, roe:88, debt_eq:2.2},
  K:  {name:'Kellanova', sector:'Cons. Staples', pe:18, rev_growth:4, margin:10, roe:28, debt_eq:1.77},
  KMI:  {name:'Kinder Morgan Inc.', sector:'Energy', pe:18, rev_growth:2, margin:18, roe:8, debt_eq:1.1},
  KMX:  {name:'CarMax Inc.', sector:'Cons. Disc.', pe:18, rev_growth:-2, margin:2, roe:10, debt_eq:2.2},
  KO:  {name:'Coca-Cola Company', sector:'Cons. Staples', pe:24, rev_growth:4, margin:22, roe:44, debt_eq:1.77},
  KR:  {name:'Kroger Co.', sector:'Cons. Staples', pe:14, rev_growth:2, margin:2, roe:22, debt_eq:1.44},
  LCID:  {name:'Lucid Group Inc.', sector:'Cons. Disc.', pe:0, rev_growth:44, margin:-88, roe:-88, debt_eq:1.1},
  LH:  {name:'Labcorp', sector:'Healthcare', pe:14, rev_growth:2, margin:8, roe:12, debt_eq:0.88},
  LHX:  {name:'L3Harris Technologies Inc.', sector:'Industrials', pe:18, rev_growth:4, margin:10, roe:10, debt_eq:0.66},
  LIN:  {name:'Linde plc', sector:'Materials', pe:30, rev_growth:5, margin:18, roe:18, debt_eq:0.44},
  LMT:  {name:'Lockheed Martin Corporation', sector:'Industrials', pe:18, rev_growth:4, margin:10, roe:88, debt_eq:2.2},
  LNG:  {name:'Cheniere Energy Inc.', sector:'Energy', pe:12, rev_growth:-14, margin:28, roe:44, debt_eq:2.2},
  LOW:  {name:'Lowe\'s Companies Inc.', sector:'Cons. Disc.', pe:22, rev_growth:1, margin:9, roe:88, debt_eq:8.8},
  LULU:  {name:'Lululemon Athletica Inc.', sector:'Cons. Disc.', pe:22, rev_growth:8, margin:22, roe:44, debt_eq:0.11},
  LVS:  {name:'Las Vegas Sands Corp.', sector:'Cons. Disc.', pe:28, rev_growth:28, margin:18, roe:44, debt_eq:2.2},
  LYB:  {name:'LyondellBasell Industries NV', sector:'Materials', pe:10, rev_growth:-4, margin:6, roe:18, debt_eq:0.88},
  MAA:  {name:'Mid-America Apartment Communities', sector:'Real Estate', pe:24, rev_growth:4, margin:28, roe:8, debt_eq:0.77},
  MCD:  {name:'McDonald\'s Corporation', sector:'Cons. Disc.', pe:24, rev_growth:2, margin:32, roe:88, debt_eq:8.8},
  MCHP:  {name:'Microchip Technology Inc.', sector:'Technology', pe:28, rev_growth:-18, margin:22, roe:28, debt_eq:1.55},
  MCK:  {name:'McKesson Corporation', sector:'Healthcare', pe:18, rev_growth:14, margin:1, roe:88, debt_eq:2.2},
  MDB:  {name:'MongoDB Inc.', sector:'Technology', pe:0, rev_growth:22, margin:-4, roe:-14, debt_eq:1.1},
  MET:  {name:'MetLife Inc.', sector:'Financials', pe:10, rev_growth:4, margin:8, roe:12, debt_eq:0.44},
  MGM:  {name:'MGM Resorts International', sector:'Cons. Disc.', pe:18, rev_growth:10, margin:8, roe:14, debt_eq:2.2},
  MKC:  {name:'McCormick & Company Inc.', sector:'Cons. Staples', pe:26, rev_growth:2, margin:12, roe:18, debt_eq:1.44},
  MMC:  {name:'Marsh & McLennan Companies', sector:'Financials', pe:28, rev_growth:10, margin:18, roe:28, debt_eq:0.88},
  MO:  {name:'Altria Group Inc.', sector:'Cons. Staples', pe:10, rev_growth:2, margin:44, roe:88, debt_eq:8.8},
  MRNA:  {name:'Moderna Inc.', sector:'Healthcare', pe:0, rev_growth:-28, margin:-44, roe:-22, debt_eq:0.0},
  MSCI:  {name:'MSCI Inc.', sector:'Financials', pe:40, rev_growth:10, margin:44, roe:88, debt_eq:8.8},
  MTD:  {name:'Mettler-Toledo International', sector:'Healthcare', pe:30, rev_growth:2, margin:22, roe:88, debt_eq:8.8},
  NCLH:  {name:'Norwegian Cruise Line Holdings', sector:'Cons. Disc.', pe:14, rev_growth:18, margin:10, roe:14, debt_eq:4.4},
  NEM:  {name:'Newmont Corporation', sector:'Materials', pe:22, rev_growth:18, margin:14, roe:6, debt_eq:0.55},
  NRG:  {name:'NRG Energy Inc.', sector:'Utilities', pe:12, rev_growth:4, margin:8, roe:44, debt_eq:2.2},
  NSC:  {name:'Norfolk Southern Corporation', sector:'Industrials', pe:20, rev_growth:-2, margin:24, roe:22, debt_eq:1.44},
  NTAP:  {name:'NetApp Inc.', sector:'Technology', pe:18, rev_growth:6, margin:18, roe:88, debt_eq:2.2},
  NUE:  {name:'Nucor Corporation', sector:'Materials', pe:12, rev_growth:-8, margin:10, roe:18, debt_eq:0.33},
  NXPI:  {name:'NXP Semiconductors NV', sector:'Technology', pe:18, rev_growth:1, margin:22, roe:28, debt_eq:1.44},
  O:  {name:'Realty Income Corporation', sector:'Real Estate', pe:44, rev_growth:22, margin:18, roe:4, debt_eq:0.88},
  ODFL:  {name:'Old Dominion Freight Line Inc.', sector:'Industrials', pe:28, rev_growth:-2, margin:20, roe:28, debt_eq:0.11},
  OKE:  {name:'ONEOK Inc.', sector:'Energy', pe:18, rev_growth:4, margin:14, roe:18, debt_eq:1.44},
  OMC:  {name:'Omnicom Group Inc.', sector:'Comm. Services', pe:12, rev_growth:4, margin:8, roe:28, debt_eq:1.44},
  ORLY:  {name:'O\'Reilly Automotive Inc.', sector:'Cons. Disc.', pe:28, rev_growth:8, margin:14, roe:88, debt_eq:8.8},
  OTIS:  {name:'Otis Worldwide Corporation', sector:'Industrials', pe:24, rev_growth:4, margin:14, roe:88, debt_eq:8.8},
  OXY:  {name:'Occidental Petroleum Corp.', sector:'Energy', pe:14, rev_growth:-4, margin:12, roe:12, debt_eq:0.77},
  PARA:  {name:'Paramount Global', sector:'Comm. Services', pe:0, rev_growth:-4, margin:-8, roe:-14, debt_eq:1.44},
  PCG:  {name:'PG&E Corporation', sector:'Utilities', pe:14, rev_growth:8, margin:10, roe:8, debt_eq:2.2},
  PCTY:  {name:'Paylocity Holding Corporation', sector:'Technology', pe:44, rev_growth:16, margin:10, roe:18, debt_eq:0.22},
  PEP:  {name:'PepsiCo Inc.', sector:'Cons. Staples', pe:22, rev_growth:2, margin:10, roe:44, debt_eq:2.2},
  PGR:  {name:'Progressive Corporation', sector:'Financials', pe:18, rev_growth:20, margin:8, roe:28, debt_eq:0.33},
  PHM:  {name:'PulteGroup Inc.', sector:'Cons. Disc.', pe:8, rev_growth:8, margin:14, roe:22, debt_eq:0.22},
  PKG:  {name:'Packaging Corp. of America', sector:'Materials', pe:18, rev_growth:4, margin:12, roe:22, debt_eq:0.88},
  PKI:  {name:'PerkinElmer Inc.', sector:'Healthcare', pe:22, rev_growth:-8, margin:8, roe:8, debt_eq:0.88},
  PLD:  {name:'Prologis Inc.', sector:'Real Estate', pe:38, rev_growth:8, margin:44, roe:8, debt_eq:0.66},
  PNC:  {name:'PNC Financial Services Group', sector:'Financials', pe:12, rev_growth:2, margin:22, roe:10, debt_eq:0.88},
  PODD:  {name:'Insulet Corporation', sector:'Healthcare', pe:55, rev_growth:18, margin:12, roe:8, debt_eq:1.44},
  PPG:  {name:'PPG Industries Inc.', sector:'Materials', pe:18, rev_growth:2, margin:10, roe:22, debt_eq:0.88},
  PSX:  {name:'Phillips 66', sector:'Energy', pe:10, rev_growth:-8, margin:4, roe:14, debt_eq:0.66},
  PTC:  {name:'PTC Inc.', sector:'Technology', pe:44, rev_growth:10, margin:14, roe:14, debt_eq:0.88},
  PVH:  {name:'PVH Corp.', sector:'Cons. Disc.', pe:10, rev_growth:-2, margin:8, roe:10, debt_eq:0.88},
  PXD:  {name:'Pioneer Natural Resources Co.', sector:'Energy', pe:12, rev_growth:-4, margin:22, roe:14, debt_eq:0.22},
  RIVN:  {name:'Rivian Automotive Inc.', sector:'Cons. Disc.', pe:0, rev_growth:88, margin:-88, roe:-44, debt_eq:0.88},
  RL:  {name:'Ralph Lauren Corporation', sector:'Cons. Disc.', pe:16, rev_growth:4, margin:12, roe:28, debt_eq:0.44},
  ROK:  {name:'Rockwell Automation Inc.', sector:'Industrials', pe:22, rev_growth:-8, margin:12, roe:44, debt_eq:1.1},
  ROP:  {name:'Roper Technologies Inc.', sector:'Industrials', pe:32, rev_growth:14, margin:22, roe:10, debt_eq:0.55},
  SAIC:  {name:'Science Applications Intl Corp.', sector:'Technology', pe:14, rev_growth:4, margin:4, roe:28, debt_eq:1.1},
  SBAC:  {name:'SBA Communications Corp.', sector:'Real Estate', pe:44, rev_growth:4, margin:22, roe:88, debt_eq:8.8},
  SBUX:  {name:'Starbucks Corporation', sector:'Cons. Disc.', pe:28, rev_growth:2, margin:14, roe:88, debt_eq:8.8},
  SFM:  {name:'Sprouts Farmers Market Inc.', sector:'Cons. Staples', pe:28, rev_growth:10, margin:6, roe:28, debt_eq:0.22},
  SHW:  {name:'Sherwin-Williams Company', sector:'Materials', pe:28, rev_growth:4, margin:14, roe:88, debt_eq:2.2},
  SJM:  {name:'J.M. Smucker Company', sector:'Cons. Staples', pe:14, rev_growth:4, margin:8, roe:8, debt_eq:1.44},
  SNPS:  {name:'Synopsys Inc.', sector:'Technology', pe:44, rev_growth:14, margin:18, roe:18, debt_eq:0.11},
  SO:  {name:'Southern Company', sector:'Utilities', pe:22, rev_growth:4, margin:16, roe:12, debt_eq:1.77},
  SPG:  {name:'Simon Property Group Inc.', sector:'Real Estate', pe:22, rev_growth:4, margin:38, roe:44, debt_eq:4.4},
  SPX:  {name:'SPX Technologies Inc.', sector:'Industrials', pe:22, rev_growth:8, margin:12, roe:14, debt_eq:0.55},
  SRE:  {name:'Sempra Energy', sector:'Utilities', pe:18, rev_growth:4, margin:14, roe:10, debt_eq:1.44},
  STLD:  {name:'Steel Dynamics Inc.', sector:'Materials', pe:10, rev_growth:-8, margin:12, roe:22, debt_eq:0.44},
  STT:  {name:'State Street Corporation', sector:'Financials', pe:12, rev_growth:4, margin:18, roe:10, debt_eq:1.1},
  SYF:  {name:'Synchrony Financial', sector:'Financials', pe:8, rev_growth:4, margin:22, roe:18, debt_eq:1.44},
  SYK:  {name:'Stryker Corporation', sector:'Healthcare', pe:32, rev_growth:10, margin:16, roe:18, debt_eq:0.77},
  TDG:  {name:'TransDigm Group Inc.', sector:'Industrials', pe:38, rev_growth:18, margin:22, roe:88, debt_eq:8.8},
  TECH:  {name:'Bio-Techne Corporation', sector:'Healthcare', pe:35, rev_growth:2, margin:22, roe:12, debt_eq:0.22},
  TFX:  {name:'Teleflex Inc.', sector:'Healthcare', pe:18, rev_growth:4, margin:14, roe:10, debt_eq:1.1},
  TGT:  {name:'Target Corporation', sector:'Cons. Disc.', pe:14, rev_growth:1, margin:4, roe:28, debt_eq:1.1},
  TMUS:  {name:'T-Mobile US Inc.', sector:'Comm. Services', pe:22, rev_growth:4, margin:14, roe:14, debt_eq:1.22},
  TOL:  {name:'Toll Brothers Inc.', sector:'Cons. Disc.', pe:8, rev_growth:6, margin:12, roe:18, debt_eq:0.55},
  TPR:  {name:'Tapestry Inc.', sector:'Cons. Disc.', pe:12, rev_growth:2, margin:14, roe:22, debt_eq:0.88},
  TRGP:  {name:'Targa Resources Corp.', sector:'Energy', pe:22, rev_growth:10, margin:8, roe:18, debt_eq:1.77},
  TROW:  {name:'T. Rowe Price Group Inc.', sector:'Financials', pe:14, rev_growth:-4, margin:28, roe:28, debt_eq:0.11},
  TRV:  {name:'Travelers Companies Inc.', sector:'Financials', pe:12, rev_growth:10, margin:8, roe:14, debt_eq:0.22},
  TSN:  {name:'Tyson Foods Inc.', sector:'Cons. Staples', pe:14, rev_growth:-2, margin:2, roe:4, debt_eq:0.88},
  TT:  {name:'Trane Technologies plc', sector:'Industrials', pe:30, rev_growth:12, margin:14, roe:28, debt_eq:0.88},
  TTWO:  {name:'Take-Two Interactive Software', sector:'Comm. Services', pe:0, rev_growth:4, margin:-14, roe:-14, debt_eq:0.88},
  TWLO:  {name:'Twilio Inc.', sector:'Technology', pe:0, rev_growth:8, margin:-4, roe:-4, debt_eq:0.22},
  UPS:  {name:'United Parcel Service Inc.', sector:'Industrials', pe:18, rev_growth:-4, margin:8, roe:88, debt_eq:2.2},
  USB:  {name:'U.S. Bancorp', sector:'Financials', pe:12, rev_growth:2, margin:22, roe:12, debt_eq:1.1},
  VFC:  {name:'VF Corporation', sector:'Cons. Disc.', pe:0, rev_growth:-14, margin:-4, roe:-22, debt_eq:4.4},
  VRSK:  {name:'Verisk Analytics Inc.', sector:'Industrials', pe:32, rev_growth:8, margin:28, roe:44, debt_eq:1.44},
  VZ:  {name:'Verizon Communications Inc.', sector:'Comm. Services', pe:10, rev_growth:1, margin:14, roe:22, debt_eq:1.77},
  W:  {name:'Wayfair Inc.', sector:'Cons. Disc.', pe:0, rev_growth:2, margin:-2, roe:-44, debt_eq:8.8},
  WAB:  {name:'Westinghouse Air Brake Tech.', sector:'Industrials', pe:22, rev_growth:8, margin:12, roe:10, debt_eq:0.88},
  WAT:  {name:'Waters Corporation', sector:'Healthcare', pe:22, rev_growth:-2, margin:22, roe:44, debt_eq:1.44},
  WBD:  {name:'Warner Bros. Discovery Inc.', sector:'Comm. Services', pe:0, rev_growth:-4, margin:-4, roe:-8, debt_eq:2.2},
  WDC:  {name:'Western Digital Corp.', sector:'Technology', pe:22, rev_growth:44, margin:8, roe:8, debt_eq:0.88},
  WEC:  {name:'WEC Energy Group Inc.', sector:'Utilities', pe:18, rev_growth:4, margin:16, roe:10, debt_eq:1.44},
  WFC:  {name:'Wells Fargo & Company', sector:'Financials', pe:12, rev_growth:4, margin:22, roe:10, debt_eq:1.1},
  WMB:  {name:'Williams Companies Inc.', sector:'Energy', pe:22, rev_growth:4, margin:22, roe:12, debt_eq:1.44},
  WY:  {name:'Weyerhaeuser Company', sector:'Real Estate', pe:28, rev_growth:-4, margin:10, roe:8, debt_eq:0.55},
  WYNN:  {name:'Wynn Resorts Limited', sector:'Cons. Disc.', pe:22, rev_growth:14, margin:14, roe:44, debt_eq:8.8},
  XEL:  {name:'Xcel Energy Inc.', sector:'Utilities', pe:16, rev_growth:4, margin:12, roe:10, debt_eq:1.55},
  YUM:  {name:'Yum! Brands Inc.', sector:'Cons. Disc.', pe:22, rev_growth:4, margin:22, roe:88, debt_eq:8.8},
  ZBH:  {name:'Zimmer Biomet Holdings Inc.', sector:'Healthcare', pe:16, rev_growth:4, margin:10, roe:8, debt_eq:0.88},
  ZI:  {name:'ZoomInfo Technologies Inc.', sector:'Technology', pe:18, rev_growth:2, margin:14, roe:8, debt_eq:0.88},

  // Updated Q1 2026 earnings data
  FTNT: { name:'Fortinet Inc.',                 sector:'Technology',     pe:46,  rev_growth:17,  margin:26, roe:88,  debt_eq:0.88 },
  CELH: { name:'Celsius Holdings Inc.',         sector:'Cons. Staples',  pe:32,  rev_growth:-17, margin:10, roe:12,  debt_eq:0.00 },
  DUOL: { name:'Duolingo Inc.',                 sector:'Technology',     pe:110, rev_growth:38,  margin:8,  roe:8,   debt_eq:0.00 },
  MELI: { name:'MercadoLibre Inc.',             sector:'Cons. Disc.',    pe:38,  rev_growth:37,  margin:12, roe:40,  debt_eq:0.77 },
  SHOP: { name:'Shopify Inc.',                  sector:'Technology',     pe:72,  rev_growth:27,  margin:16, roe:14,  debt_eq:0.11 },
  RBLX: { name:'Roblox Corp.',                  sector:'Comm. Services', pe:0,   rev_growth:29,  margin:-18,roe:-44, debt_eq:0.55 },
  SPOT: { name:'Spotify Technology SA',         sector:'Comm. Services', pe:65,  rev_growth:20,  margin:12, roe:22,  debt_eq:0.44 },
  TTD:  { name:'Trade Desk Inc.',               sector:'Technology',     pe:55,  rev_growth:25,  margin:18, roe:22,  debt_eq:0.00 },
  UBER: { name:'Uber Technologies Inc.',        sector:'Cons. Disc.',    pe:22,  rev_growth:14,  margin:6,  roe:18,  debt_eq:0.88 },
  ARM:  { name:'Arm Holdings plc',              sector:'Technology',     pe:95,  rev_growth:34,  margin:32, roe:22,  debt_eq:0.11 },
  PLTR: { name:'Palantir Technologies Inc.',    sector:'Technology',     pe:180, rev_growth:39,  margin:22, roe:18,  debt_eq:0.00 },
  ABBV: { name:'AbbVie Inc.',                   sector:'Healthcare',     pe:15,  rev_growth:5,   margin:24, roe:88,  debt_eq:8.80 },
  JNJ:  { name:'Johnson & Johnson',             sector:'Healthcare',     pe:14,  rev_growth:2,   margin:20, roe:22,  debt_eq:0.44 },
  PFE:  { name:'Pfizer Inc.',                   sector:'Healthcare',     pe:9,   rev_growth:-8,  margin:10, roe:6,   debt_eq:0.55 },
  MRK:  { name:'Merck & Co. Inc.',              sector:'Healthcare',     pe:12,  rev_growth:2,   margin:22, roe:28,  debt_eq:0.66 },
  TMO:  { name:'Thermo Fisher Scientific Inc.', sector:'Healthcare',     pe:26,  rev_growth:0,   margin:14, roe:12,  debt_eq:0.66 },
  ABT:  { name:'Abbott Laboratories',           sector:'Healthcare',     pe:22,  rev_growth:7,   margin:16, roe:18,  debt_eq:0.44 },
  AMGN: { name:'Amgen Inc.',                    sector:'Healthcare',     pe:16,  rev_growth:10,  margin:34, roe:88,  debt_eq:8.80 },
  GILD: { name:'Gilead Sciences Inc.',          sector:'Healthcare',     pe:12,  rev_growth:8,   margin:28, roe:30,  debt_eq:0.88 },
  REGN: { name:'Regeneron Pharmaceuticals Inc.',sector:'Healthcare',     pe:14,  rev_growth:-4,  margin:30, roe:16,  debt_eq:0.22 },
  VRTX: { name:'Vertex Pharmaceuticals Inc.',   sector:'Healthcare',     pe:28,  rev_growth:13,  margin:38, roe:24,  debt_eq:0.00 },
  ISRG: { name:'Intuitive Surgical Inc.',       sector:'Healthcare',     pe:72,  rev_growth:19,  margin:28, roe:20,  debt_eq:0.00 },
  IDXX: { name:'IDEXX Laboratories Inc.',       sector:'Healthcare',     pe:40,  rev_growth:6,   margin:22, roe:55,  debt_eq:0.55 },
  DXCM: { name:'DexCom Inc.',                   sector:'Healthcare',     pe:28,  rev_growth:14,  margin:14, roe:14,  debt_eq:0.44 },
  BAC:  { name:'Bank of America Corp.',         sector:'Financials',     pe:12,  rev_growth:6,   margin:22, roe:10,  debt_eq:1.10 },
  GS:   { name:'Goldman Sachs Group Inc.',      sector:'Financials',     pe:14,  rev_growth:14,  margin:22, roe:12,  debt_eq:4.40 },
  MS:   { name:'Morgan Stanley',                sector:'Financials',     pe:18,  rev_growth:12,  margin:18, roe:14,  debt_eq:3.30 },
  SPGI: { name:'S&P Global Inc.',               sector:'Financials',     pe:45,  rev_growth:12,  margin:32, roe:22,  debt_eq:0.88 },
  BLK:  { name:'BlackRock Inc.',                sector:'Financials',     pe:22,  rev_growth:8,   margin:28, roe:14,  debt_eq:0.44 },
  AXP:  { name:'American Express Co.',          sector:'Financials',     pe:18,  rev_growth:10,  margin:18, roe:33,  debt_eq:1.77 },
  SCHW: { name:'Charles Schwab Corp.',          sector:'Financials',     pe:28,  rev_growth:6,   margin:22, roe:12,  debt_eq:0.55 },
  COF:  { name:'Capital One Financial Corp.',   sector:'Financials',     pe:12,  rev_growth:6,   margin:18, roe:10,  debt_eq:0.77 },
  MCO:  { name:"Moody's Corporation",           sector:'Financials',     pe:40,  rev_growth:10,  margin:30, roe:88,  debt_eq:2.20 },
  CVX:  { name:'Chevron Corp.',                 sector:'Energy',         pe:14,  rev_growth:-4,  margin:12, roe:12,  debt_eq:0.17 },
  COP:  { name:'ConocoPhillips',                sector:'Energy',         pe:14,  rev_growth:-4,  margin:18, roe:18,  debt_eq:0.33 },
  EOG:  { name:'EOG Resources Inc.',            sector:'Energy',         pe:12,  rev_growth:-2,  margin:22, roe:18,  debt_eq:0.22 },
  SLB:  { name:'SLB',                           sector:'Energy',         pe:14,  rev_growth:2,   margin:12, roe:18,  debt_eq:0.55 },
  MPC:  { name:'Marathon Petroleum Corp.',      sector:'Energy',         pe:10,  rev_growth:-8,  margin:6,  roe:28,  debt_eq:0.88 },
  NEE:  { name:'NextEra Energy Inc.',           sector:'Utilities',      pe:22,  rev_growth:8,   margin:22, roe:12,  debt_eq:1.44 },
  GE:   { name:'GE Aerospace',                  sector:'Industrials',    pe:38,  rev_growth:18,  margin:12, roe:28,  debt_eq:0.44 },
  CAT:  { name:'Caterpillar Inc.',              sector:'Industrials',    pe:18,  rev_growth:2,   margin:16, roe:55,  debt_eq:1.44 },
  HON:  { name:'Honeywell International Inc.',  sector:'Industrials',    pe:22,  rev_growth:4,   margin:16, roe:28,  debt_eq:1.10 },
  RTX:  { name:'RTX Corporation',               sector:'Industrials',    pe:22,  rev_growth:10,  margin:8,  roe:10,  debt_eq:0.77 },
  UNP:  { name:'Union Pacific Corp.',           sector:'Industrials',    pe:22,  rev_growth:2,   margin:28, roe:55,  debt_eq:1.88 },
  ETN:  { name:'Eaton Corporation plc',         sector:'Industrials',    pe:30,  rev_growth:10,  margin:16, roe:18,  debt_eq:0.44 },
  DE:   { name:"Deere & Company",               sector:'Industrials',    pe:16,  rev_growth:-8,  margin:14, roe:38,  debt_eq:2.20 },
  AMAT: { name:'Applied Materials Inc.',        sector:'Technology',     pe:18,  rev_growth:2,   margin:28, roe:55,  debt_eq:0.44 },
}

// Sector map for tickers not in HARDCODED
const SECTOR_MAP = {
  // Technology
  AKAM:'Technology',ANSS:'Technology',ADSK:'Technology',CDNS:'Technology',CDW:'Technology',
  EPAM:'Technology',FFIV:'Technology',FI:'Technology',FIS:'Technology',FISV:'Technology',
  GRMN:'Technology',HPE:'Technology',HPQ:'Technology',IBM:'Technology',IT:'Technology',
  JNPR:'Technology',KEYS:'Technology',MPWR:'Technology',MSI:'Technology',MSCI:'Technology',
  NDAQ:'Technology',NTAP:'Technology',NVDA:'Technology',ON:'Technology',ORCL:'Technology',
  PAYC:'Technology',PAYX:'Technology',QRVO:'Technology',ROP:'Technology',SNPS:'Technology',
  STX:'Technology',SWKS:'Technology',TDY:'Technology',TEL:'Technology',TER:'Technology',
  TRMB:'Technology',TYL:'Technology',VRSN:'Technology',WDC:'Technology',ZBRA:'Technology',
  // Healthcare
  A:'Healthcare',BAX:'Healthcare',BDX:'Healthcare',BIIB:'Healthcare',BIO:'Healthcare',
  BMY:'Healthcare',BSX:'Healthcare',CAH:'Healthcare',CNC:'Healthcare',CRL:'Healthcare',
  CVS:'Healthcare',DHR:'Healthcare',DVA:'Healthcare',ELV:'Healthcare',HCA:'Healthcare',
  HOLX:'Healthcare',HUM:'Healthcare',IDXX:'Healthcare',IQV:'Healthcare',ISRG:'Healthcare',
  MDT:'Healthcare',MHK:'Healthcare',MOH:'Healthcare',MTD:'Healthcare',RMD:'Healthcare',
  RVTY:'Healthcare',STE:'Healthcare',SYK:'Healthcare',TFX:'Healthcare',UHS:'Healthcare',
  VRTX:'Healthcare',ZBH:'Healthcare',ZTS:'Healthcare',PTCT:'Healthcare',
  // Financials
  AFL:'Financials',AIG:'Financials',AJG:'Financials',AIZ:'Financials',ACGL:'Financials',
  AMT:'Financials',AMP:'Financials',AON:'Financials',BAC:'Financials',BEN:'Financials',
  BK:'Financials',BLK:'Financials',BRO:'Financials',BX:'Financials',CBOE:'Financials',
  CFG:'Financials',CINF:'Financials',CME:'Financials',COF:'Financials',DFS:'Financials',
  EG:'Financials',EQR:'Financials',ESS:'Financials',EQT:'Financials',FDS:'Financials',
  FICO:'Financials',FRT:'Financials',GS:'Financials',HBAN:'Financials',ICE:'Financials',
  IVZ:'Financials',INVH:'Financials',IRM:'Financials',KEY:'Financials',KIM:'Financials',
  L:'Financials',MA:'Financials',MKTX:'Financials',MMC:'Financials',MS:'Financials',
  MTB:'Financials',NDAQ:'Financials',O:'Financials',PFG:'Financials',PNC:'Financials',
  PRU:'Financials',PSA:'Financials',RE:'Financials',REG:'Financials',RF:'Financials',
  RJF:'Financials',SBAC:'Financials',SCHW:'Financials',SPGI:'Financials',SYF:'Financials',
  TFC:'Financials',TROW:'Financials',TRV:'Financials',UDR:'Financials',USB:'Financials',
  V:'Financials',VNO:'Financials',VICI:'Financials',WFC:'Financials',WRB:'Financials',
  WTW:'Financials',
  // Consumer Discretionary
  ABNB:'Cons. Disc.',AZO:'Cons. Disc.',BBY:'Cons. Disc.',BKNG:'Cons. Disc.',BWA:'Cons. Disc.',
  CCL:'Cons. Disc.',CMG:'Cons. Disc.',DHI:'Cons. Disc.',DPZ:'Cons. Disc.',EXPE:'Cons. Disc.',
  F:'Cons. Disc.',GM:'Cons. Disc.',GPC:'Cons. Disc.',HD:'Cons. Disc.',HLT:'Cons. Disc.',
  LEN:'Cons. Disc.',LKQ:'Cons. Disc.',LOW:'Cons. Disc.',LULU:'Cons. Disc.',LVS:'Cons. Disc.',
  MAR:'Cons. Disc.',MCD:'Cons. Disc.',MGM:'Cons. Disc.',MHK:'Cons. Disc.',NCLH:'Cons. Disc.',
  NKE:'Cons. Disc.',NVR:'Cons. Disc.',ORLY:'Cons. Disc.',PHM:'Cons. Disc.',POOL:'Cons. Disc.',
  RCL:'Cons. Disc.',RL:'Cons. Disc.',ROST:'Cons. Disc.',SBUXi:'Cons. Disc.',TGT:'Cons. Disc.',
  TJX:'Cons. Disc.',TPR:'Cons. Disc.',TSCO:'Cons. Disc.',TTWO:'Cons. Disc.',ULTA:'Cons. Disc.',
  VLO:'Cons. Disc.',WHR:'Cons. Disc.',YUM:'Cons. Disc.',
  // Consumer Staples
  CAG:'Cons. Staples',CHD:'Cons. Staples',CL:'Cons. Staples',CLX:'Cons. Staples',
  CPB:'Cons. Staples',EL:'Cons. Staples',GIS:'Cons. Staples',HRL:'Cons. Staples',
  HSY:'Cons. Staples',K:'Cons. Staples',KDP:'Cons. Staples',KHC:'Cons. Staples',
  KMB:'Cons. Staples',KO:'Cons. Staples',KR:'Cons. Staples',MKC:'Cons. Staples',
  MDLZ:'Cons. Staples',MNST:'Cons. Staples',MO:'Cons. Staples',PEP:'Cons. Staples',
  PM:'Cons. Staples',SJM:'Cons. Staples',SYY:'Cons. Staples',TAP:'Cons. Staples',TSN:'Cons. Staples',
  // Energy
  AES:'Energy',APA:'Energy',BKR:'Energy',COP:'Energy',CVX:'Energy',DVN:'Energy',
  EOG:'Energy',FANG:'Energy',FCX:'Energy',FE:'Energy',HAL:'Energy',HES:'Energy',
  MPC:'Energy',MRO:'Energy',OKE:'Energy',OXY:'Energy',PCG:'Energy',PSX:'Energy',
  SLB:'Energy',SRE:'Energy',VLO:'Energy',WMB:'Energy',XOM:'Energy',
  // Industrials
  ALLE:'Industrials',AME:'Industrials',AOS:'Industrials',BA:'Industrials',CAT:'Industrials',
  CARR:'Industrials',CHRW:'Industrials',CMI:'Industrials',CPRT:'Industrials',CSX:'Industrials',
  CTAS:'Industrials',DAL:'Industrials',DE:'Industrials',DOV:'Industrials',EMR:'Industrials',
  ETN:'Industrials',EXPD:'Industrials',FAST:'Industrials',FDX:'Industrials',GD:'Industrials',
  GE:'Industrials',GNRC:'Industrials',GWW:'Industrials',HII:'Industrials',HON:'Industrials',
  HWM:'Industrials',HUBB:'Industrials',IR:'Industrials',ITW:'Industrials',J:'Industrials',
  JBHT:'Industrials',JCI:'Industrials',LHX:'Industrials',LMT:'Industrials',LUV:'Industrials',
  LDOS:'Industrials',LW:'Industrials',MAS:'Industrials',MLM:'Industrials',MMM:'Industrials',
  NOC:'Industrials',NSC:'Industrials',ODFL:'Industrials',OTIS:'Industrials',PCAR:'Industrials',
  PH:'Industrials',PKG:'Industrials',PNR:'Industrials',PWR:'Industrials',ROK:'Industrials',
  ROL:'Industrials',ROP:'Industrials',RSG:'Industrials',RTX:'Industrials',SNA:'Industrials',
  SWK:'Industrials',TDG:'Industrials',TT:'Industrials',TXT:'Industrials',UAL:'Industrials',
  UNP:'Industrials',UPS:'Industrials',URI:'Industrials',WAB:'Industrials',WM:'Industrials',
  XYL:'Industrials',
  // Materials
  ALB:'Materials',AVY:'Materials',Ball:'Materials',BALL:'Materials',CE:'Materials',
  CF:'Materials',DD:'Materials',DOW:'Materials',ECL:'Materials',EMN:'Materials',
  FCX:'Materials',FMC:'Materials',IP:'Materials',LIN:'Materials',LYB:'Materials',
  MOS:'Materials',NEM:'Materials',NUE:'Materials',PPG:'Materials',SHW:'Materials',
  STLD:'Materials',SW:'Materials',VMC:'Materials',
  // Real Estate
  AMT:'Real Estate',ARE:'Real Estate',AVB:'Real Estate',CBRE:'Real Estate',CSGP:'Real Estate',
  DLR:'Real Estate',EQR:'Real Estate',ESS:'Real Estate',EXR:'Real Estate',INVH:'Real Estate',
  IRM:'Real Estate',KIM:'Real Estate',MAA:'Real Estate',O:'Real Estate',PLD:'Real Estate',
  PSA:'Real Estate',REG:'Real Estate',SBAC:'Real Estate',SPG:'Real Estate',UDR:'Real Estate',
  VICI:'Real Estate',VNO:'Real Estate',WY:'Real Estate',
  // Utilities
  AEE:'Utilities',AEP:'Utilities',AES:'Utilities',ATO:'Utilities',AWK:'Utilities',
  CMS:'Utilities',D:'Utilities',DTE:'Utilities',DUK:'Utilities',ED:'Utilities',
  EVRG:'Utilities',ES:'Utilities',ETR:'Utilities',EXC:'Utilities',FE:'Utilities',
  LNT:'Utilities',NEE:'Utilities',NI:'Utilities',NRG:'Utilities',PCG:'Utilities',
  PEG:'Utilities',PNW:'Utilities',PPL:'Utilities',SO:'Utilities',SRE:'Utilities',
  VST:'Utilities',WEC:'Utilities',XEL:'Utilities',
  // Comm Services
  CHTR:'Comm. Services',CMCSA:'Comm. Services',DIS:'Comm. Services',IPG:'Comm. Services',
  LYV:'Comm. Services',MTCH:'Comm. Services',NWSA:'Comm. Services',OMC:'Comm. Services',
  T:'Comm. Services',TMUS:'Comm. Services',VZ:'Comm. Services',WBD:'Comm. Services',
}

function getFundamentals(ticker) {
  if (HARDCODED[ticker]) return HARDCODED[ticker]
  const sector = SECTOR_MAP[ticker] || 'Unknown'
  return { name: ticker, sector, pe: 0, rev_growth: 0, margin: 0, roe: 0, debt_eq: 0, _needsLive: true }
}

async function fetchLiveFundamentals(tickers) {
  const results = {}
  // Fetch in batches of 20
  const batches = []
  for (let i = 0; i < tickers.length; i += 20) batches.push(tickers.slice(i, i + 20))
  
  await Promise.all(batches.map(async batch => {
    await Promise.all(batch.map(async ticker => {
      try {
        const res = await fetch(
          `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,summaryDetail`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(6000) }
        )
        const data = await res.json()
        const fd = data?.quoteSummary?.result?.[0]?.financialData
        const ks = data?.quoteSummary?.result?.[0]?.defaultKeyStatistics
        const sd = data?.quoteSummary?.result?.[0]?.summaryDetail
        if (fd && ks) {
          results[ticker] = {
            pe:         +(sd?.trailingPE?.raw || ks?.forwardPE?.raw || 0).toFixed(1),
            rev_growth: +((fd?.revenueGrowth?.raw || 0) * 100).toFixed(1),
            margin:     +((fd?.profitMargins?.raw || 0) * 100).toFixed(1),
            roe:        +((fd?.returnOnEquity?.raw || 0) * 100).toFixed(1),
            debt_eq:    +(ks?.debtToEquity?.raw || 0).toFixed(2),
          }
        }
      } catch {}
    }))
  }))
  return results
}

// Market regime — daily cache
let regimeCache = { data: null, fetchedAt: 0 }
const REGIME_TTL = 6 * 60 * 60 * 1000 // 6 hours

async function fetchMarketRegime() {
  const now = Date.now()
  if (regimeCache.data && now - regimeCache.fetchedAt < REGIME_TTL) return regimeCache.data

  try {
    // Fetch SPY, QQQ, VIX
    const [spyRes, vixRes] = await Promise.all([
      fetch('https://query2.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=90d',
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }),
      fetch('https://query2.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=5d',
        { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }),
    ])

    const spyData = await spyRes.json()
    const vixData = await vixRes.json()

    const spyCloses = spyData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(p => p != null) || []
    const vix = vixData?.chart?.result?.[0]?.meta?.regularMarketPrice || 20

    if (spyCloses.length < 50) {
      regimeCache = { data: { regime: 'neutral', vix, spyMom20: 0, spyAbove50ma: true }, fetchedAt: now }
      return regimeCache.data
    }

    const spyPrice  = spyCloses[spyCloses.length - 1]
    const spy50ma   = spyCloses.slice(-50).reduce((a,b) => a+b,0) / 50
    const spy20ma   = spyCloses.slice(-20).reduce((a,b) => a+b,0) / 20
    const spy200ma  = spyCloses.length >= 200 ? spyCloses.slice(-200).reduce((a,b) => a+b,0) / 200 : spy50ma
    const spyMom20  = +((spyPrice / spyCloses[spyCloses.length - 21] - 1) * 100).toFixed(2)
    const spyMom5   = +((spyPrice / spyCloses[spyCloses.length - 6]  - 1) * 100).toFixed(2)
    const spyAbove50ma  = spyPrice > spy50ma
    const spyAbove200ma = spyPrice > spy200ma

    // MA slopes
    const spy50maOld  = spyCloses.slice(-60,-10).reduce((a,b)=>a+b,0)/50
    const spy50Slope  = spy50ma - spy50maOld

    // VIX spike detection
    const vixCloses = vixData?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(p => p != null) || []
    const vixPrev = vixCloses.length >= 3 ? vixCloses[vixCloses.length - 3] : vix
    const vixSpike = vix > 28 && vix > vixPrev * 1.15

    const spyMom3 = spyCloses.length >= 4 ? +((spyPrice / spyCloses[spyCloses.length - 4] - 1) * 100).toFixed(2) : 0
    const spyMin10d = Math.min(...spyCloses.slice(-11, -1))
    const recentPanic = spyMom20 < -8 || (vix > 28 && spyMom20 < -4)

    // ── 7-regime classification ───────────────────────────
    let regime
    if (vixSpike && spyMom5 < -4) {
      regime = 'panic_selloff'
    } else if (recentPanic && spyMom3 > 2.5 && !spyAbove50ma) {
      regime = 'bull_relief'
    } else if (!spyAbove50ma && !spyAbove200ma && spy50Slope < 0 && vix > 22) {
      regime = 'bear'
    } else if (!spyAbove50ma && spyAbove200ma && vix > 18) {
      regime = 'correction'
    } else if (spyAbove50ma && spyAbove200ma && spyMom20 > 8 && vix < 15) {
      regime = 'bull_run'
    } else if (spyAbove50ma && spyAbove200ma && spy50Slope > 0 && vix < 20) {
      regime = 'bull'
    } else if (Math.abs(spyMom20) < 4 && vix > 16 && vix < 26) {
      regime = 'lost'
    } else {
      regime = 'neutral'
    }

    // regimeScore for sector scoring
    let regimeScore = 0
    if (!spyAbove200ma) regimeScore -= 3
    if (!spyAbove50ma)  regimeScore -= 2
    if (spy50Slope < 0) regimeScore -= 2
    if (spyMom20 < -8)  regimeScore -= 3
    else if (spyMom20 < -4) regimeScore -= 1
    if (vix > 30)  regimeScore -= 3
    else if (vix > 22) regimeScore -= 1
    if (spyAbove200ma && spyAbove50ma) regimeScore += 2
    if (spy50Slope > 0) regimeScore += 2
    if (spyMom20 > 4)   regimeScore += 2
    if (vix < 16)       regimeScore += 1

    const data = {
      regime, vix, spyMom20, spyMom5,
      spyAbove50ma, spyAbove200ma,
      spy50Slope, regimeScore,
      spyPrice: +spyPrice.toFixed(2),
      spy50ma:  +spy50ma.toFixed(2),
      spy200ma: +spy200ma.toFixed(2),
    }
    regimeCache = { data, fetchedAt: now }
    return data
  } catch {
    return { regime: 'neutral', vix: 20, spyMom20: 0, spyAbove50ma: true }
  }
}


// Sector ETF map
const SECTOR_ETFS = {
  'Technology':     'XLK',
  'Financials':     'XLF',
  'Healthcare':     'XLV',
  'Cons. Disc.':    'XLY',
  'Cons. Staples':  'XLP',
  'Energy':         'XLE',
  'Industrials':    'XLI',
  'Materials':      'XLB',
  'Real Estate':    'XLRE',
  'Utilities':      'XLU',
  'Comm. Services': 'XLC',
}

// Fetch sector performance — weekly, cached in module scope
let sectorCache = { data: {}, fetchedAt: 0 }
const SECTOR_TTL = 7 * 24 * 60 * 60 * 1000 // 1 week

async function fetchSectorMacro() {
  const now = Date.now()
  if (now - sectorCache.fetchedAt < SECTOR_TTL && Object.keys(sectorCache.data).length > 0) {
    return sectorCache.data
  }
  const etfs = Object.values(SECTOR_ETFS)
  const results = {}
  await Promise.all(etfs.map(async etf => {
    try {
      const res = await fetch(
        `https://query2.finance.yahoo.com/v8/finance/chart/${etf}?interval=1wk&range=4wk`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(5000) }
      )
      const data = await res.json()
      const closes = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(p => p != null) || []
      if (closes.length >= 2) {
        const weekPct  = +((closes[closes.length-1] / closes[closes.length-2] - 1) * 100).toFixed(2)
        const monthPct = +((closes[closes.length-1] / closes[0] - 1) * 100).toFixed(2)
        results[etf] = { weekPct, monthPct }
      }
    } catch {}
  }))
  sectorCache = { data: results, fetchedAt: now }
  return results
}

function getSectorScore(sector, sectorPerf) {
  const etf = SECTOR_ETFS[sector]
  if (!etf || !sectorPerf[etf]) return 10 // neutral if no data
  const { weekPct, monthPct } = sectorPerf[etf]
  let score = 10 // base
  // Weekly momentum
  if (weekPct > 3) score += 6
  else if (weekPct > 1) score += 4
  else if (weekPct > 0) score += 2
  else if (weekPct < -3) score -= 4
  else if (weekPct < -1) score -= 2
  // Monthly trend
  if (monthPct > 8) score += 4
  else if (monthPct > 4) score += 2
  else if (monthPct < -8) score -= 4
  else if (monthPct < -4) score -= 2
  return Math.max(0, Math.min(20, score))
}


// Fetch 60d OHLCV for real TA calculations
async function fetchTA(tickers) {
  const results = {}
  const batches = []
  for (let i = 0; i < tickers.length; i += 10) batches.push(tickers.slice(i, i + 10))

  await Promise.all(batches.map(async batch => {
    await Promise.all(batch.map(async ticker => {
      try {
        const res = await fetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=90d`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(6000) }
        )
        const data = await res.json()
        const result = data?.chart?.result?.[0]
        if (!result) return

        const closes  = result.indicators?.quote?.[0]?.close?.filter(p => p != null) || []
        const volumes = result.indicators?.quote?.[0]?.volume?.filter(v => v != null) || []
        if (closes.length < 20) return

        const rsi   = calcRSI(closes)
        const ma20  = closes.slice(-20).reduce((a,b) => a+b,0) / 20
        const ma50  = closes.length >= 50 ? closes.slice(-50).reduce((a,b) => a+b,0) / 50 : null
        const price = closes[closes.length - 1]
        const aboveMa20 = price > ma20
        const aboveMa50 = ma50 ? price > ma50 : null
        const ma20Pct = +((price / ma20 - 1) * 100).toFixed(1)
        const ma50Pct = ma50 ? +((price / ma50 - 1) * 100).toFixed(1) : 0

        const ma20Prev = closes.slice(-21,-1).reduce((a,b) => a+b,0) / 20
        const ma50Prev = closes.length >= 51 ? closes.slice(-51,-1).reduce((a,b) => a+b,0) / 50 : null
        const goldenCross = !!(ma50Prev && ma20Prev < ma50Prev && ma20 > (ma50 || 0))
        const deathCross  = !!(ma50Prev && ma20Prev > ma50Prev && ma20 < (ma50 || 0))

        const vol5     = volumes.slice(-5).reduce((a,b) => a+b,0) / 5
        const vol20    = volumes.slice(-20).reduce((a,b) => a+b,0) / 20
        const volTrend = vol20 > 0 ? +(vol5 / vol20).toFixed(2) : 1

        const mom5  = closes.length >= 6  ? (closes[closes.length-1]/closes[closes.length-6]  - 1)*100 : 0
        const mom20 = closes.length >= 21 ? (closes[closes.length-1]/closes[closes.length-21] - 1)*100 : 0

        const recent       = closes.slice(-20)
        const recentHigh   = Math.max(...recent)
        const recentLow    = Math.min(...recent)
        const compression  = (recentHigh - recentLow) / recentHigh
        const isConsolidating = compression < 0.06
        const isBreakingOut   = price > recentHigh * 0.98 && volTrend > 1.3
        const isBreakingDown  = price < recentLow  * 1.02 && volTrend > 1.3
        const bullishDiv      = price < recentLow * 1.02 && rsi > 35

        // ── Trend detection ───────────────────────────────
        // MA slope — is the 20MA rising or falling?
        const ma20_10dAgo = closes.length >= 30 ? closes.slice(-30,-10).reduce((a,b)=>a+b,0)/20 : ma20
        const ma50_10dAgo = closes.length >= 60 && ma50 ? closes.slice(-60,-10).reduce((a,b)=>a+b,0)/50 : ma50
        const ma20Slope = ma20 - ma20_10dAgo  // positive = rising, negative = falling
        const ma50Slope = ma50 && ma50_10dAgo ? ma50 - ma50_10dAgo : 0

        // Higher highs / lower lows over last 40 days
        const firstHalf  = closes.slice(-40, -20)
        const secondHalf = closes.slice(-20)
        const firstHigh  = firstHalf.length  ? Math.max(...firstHalf)  : price
        const secondHigh = secondHalf.length ? Math.max(...secondHalf) : price
        const firstLow   = firstHalf.length  ? Math.min(...firstHalf)  : price
        const secondLow  = secondHalf.length ? Math.min(...secondHalf) : price

        const makingHigherHighs = secondHigh > firstHigh * 1.01
        const makingLowerHighs  = secondHigh < firstHigh * 0.99
        const makingHigherLows  = secondLow  > firstLow  * 1.01
        const makingLowerLows   = secondLow  < firstLow  * 0.99

        // Trend classification
        const inUptrend   = makingHigherHighs && makingHigherLows && ma20Slope > 0
        const inDowntrend = makingLowerHighs  && makingLowerLows  && ma20Slope < 0

        // Downtrend exhaustion signals (potential reversal)
        const volumeClimax  = volTrend > 2.5 && mom5 < -5   // heavy selling = capitulation
        const higherLowForm = makingLowerHighs && !makingLowerLows && rsi < 45  // structure improving
        const downtrendExhausted = inDowntrend && (volumeClimax || higherLowForm || bullishDiv)

        // Relative strength vs market (proxy: how far off highs vs how oversold RSI is)
        // Strong RS: stock is only -10% off high but RSI is 35 = holding up well
        // Weak RS: stock is -40% off high and RSI is 25 = falling knife
        const relativeStrength = closes.length > 1
          ? Math.max(0, Math.min(100, 50 + (rsi - 50) - (Math.abs(ma20Pct) * 0.5)))
          : 50

        results[ticker] = {
          rsi, ma20Pct, ma50Pct, aboveMa20, aboveMa50,
          goldenCross, deathCross, volTrend, mom5, mom20,
          isConsolidating, isBreakingOut, isBreakingDown, bullishDiv,
          // trend
          inUptrend, inDowntrend, downtrendExhausted,
          makingHigherHighs, makingLowerHighs, makingHigherLows, makingLowerLows,
          ma20Slope, ma50Slope, volumeClimax, higherLowForm, relativeStrength,
        }
      } catch {}
    }))
  }))
  return results
}

async function fetchBatchPrices(tickers) {
  const results = {}
  // Use v8 chart endpoint per ticker in parallel batches of 15
  const batches = []
  for (let i = 0; i < tickers.length; i += 15) batches.push(tickers.slice(i, i + 15))

  await Promise.all(batches.map(async batch => {
    await Promise.all(batch.map(async ticker => {
      try {
        const res = await fetch(
          `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }, signal: AbortSignal.timeout(6000) }
        )
        const data = await res.json()
        const meta = data?.chart?.result?.[0]?.meta
        if (!meta) return
        results[ticker] = {
          price:      +(meta.regularMarketPrice || 0).toFixed(2),
          high52:     +(meta.fiftyTwoWeekHigh || 0).toFixed(2),
          volume:     meta.regularMarketVolume || 0,
          avg_volume: meta.averageDailyVolume3Month || meta.averageDailyVolume10Day || 1,
          change_pct: +(((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 || 0).toFixed(2),
        }
      } catch {}
    }))
  }))
  return results
}

function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return Math.round(100 - 100 / (1 + rs))
}

function scoreStock(s) {
  // ── LONG SCORING ─────────────────────────────────────────
  // Fundamentals /20 — quality gate, static quarterly
  let fund = 0
  if (s.rev_growth > 20) fund += 7; else if (s.rev_growth > 10) fund += 5; else if (s.rev_growth > 0) fund += 3
  if (s.margin > 20) fund += 6; else if (s.margin > 10) fund += 4; else if (s.margin > 0) fund += 2
  if (s.roe > 20) fund += 4; else if (s.roe > 10) fund += 2
  if (s.pe > 0 && s.pe < 20) fund += 3; else if (s.pe > 0 && s.pe < 40) fund += 2
  if (s.debt_eq < 0.5) fund += 2; else if (s.debt_eq < 1.0) fund += 1
  const longFund = Math.min(fund, 20)

  // Macro /20 — sector ETF performance, weekly refresh
  const longMacro = Math.min(s.sectorScore || 10, 20)

  // Mispricing /20 — how far from fair value
  let mis = 0
  if (s.from52h < -10) mis += 5
  if (s.from52h < -20) mis += 5
  if (s.from52h < -35) mis += 4
  if (s.from52h < -10 && s.rev_growth > 10) mis += 6
  if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) mis += 5
  if (s.pe > 0 && s.pe < 25 && s.rev_growth > 15) mis += 3
  if (s.bullishDiv) mis += 4
  const longMispricing = Math.min(mis, 20)

  // Technical /40 — daily, regime + trend aware
  let tech = 0

  // ── Market regime modifier ─────────────────────────────
  const isBearMarket  = s.regime === 'bear' || s.regime === 'panic_selloff'
  const isCaution     = s.regime === 'correction' || s.regime === 'lost'
  const isBullMarket  = s.regime === 'bull' || s.regime === 'bull_run'
  const isPanic       = s.regime === 'panic_selloff'
  const isBullRelief  = s.regime === 'bull_relief'
  const isBullRun     = s.regime === 'bull_run'
  const isLost        = s.regime === 'lost'
  const isCorrection  = s.regime === 'correction'

  // ── Stock trend ────────────────────────────────────────
  const stockInDowntrend = s.inDowntrend
  const stockInUptrend   = s.inUptrend
  const downtrendOK      = s.downtrendExhausted  // downtrend but showing reversal signs

  // RSI — heavily penalized in bear market unless downtrend is exhausted
  if (isBearMarket && stockInDowntrend && !downtrendOK) {
    // Bear market + downtrend = falling knife, give almost no credit for oversold
    if (s.rsi < 25) tech += 4
    else if (s.rsi < 35) tech += 2
    // No credit for RSI 35-55 in bear + downtrend
  } else if (isBearMarket && !stockInDowntrend) {
    // Bear market but stock showing relative strength = worth watching
    if (s.rsi < 25) tech += 12
    else if (s.rsi < 35) tech += 9
    else if (s.rsi < 45) tech += 5
    else if (s.rsi < 55) tech += 2
  } else if (isCaution && stockInDowntrend && !downtrendOK) {
    // Caution regime + downtrend = reduce reward
    if (s.rsi < 25) tech += 9
    else if (s.rsi < 35) tech += 6
    else if (s.rsi < 45) tech += 3
  } else {
    // Bull market OR downtrend exhausted — full credit
    if (s.rsi < 25) tech += 16
    else if (s.rsi < 35) tech += 13
    else if (s.rsi < 45) tech += 9
    else if (s.rsi < 55) tech += 6
    else if (s.rsi < 65) tech += 3
  }

  // ── Trend bonuses ──────────────────────────────────────
  if (stockInUptrend) tech += 6                  // confirmed uptrend = big bonus
  if (downtrendOK)    tech += 5                  // downtrend exhausting = setup forming
  if (stockInDowntrend && !downtrendOK) tech -= 4 // raw downtrend penalty

  // MA positioning — worth more in bull, less in bear
  if (s.aboveMa20) tech += isBearMarket ? 2 : 5
  if (s.aboveMa50) tech += isBearMarket ? 2 : 5

  // MA slopes matter more than position
  if (s.ma20Slope > 0 && s.ma50Slope > 0) tech += 4   // both MAs rising = momentum
  if (s.ma20Slope < 0 && s.ma50Slope < 0) tech -= 3   // both falling = avoid

  // Crossovers
  if (s.goldenCross) tech += 7
  // Pattern
  if (s.isConsolidating && !stockInDowntrend) tech += 5  // only reward consolidation in uptrend/neutral
  if (s.isBreakingOut) tech += 9
  // Divergence
  if (s.bullishDiv) tech += 5
  // Volume
  if (s.volTrend > 1.8) tech += 5
  else if (s.volTrend > 1.2) tech += 3
  // Relative strength — stock holding up better than market
  if (s.relativeStrength > 60) tech += 4
  if (s.relativeStrength > 70) tech += 3
  // Momentum turning after selloff
  if (s.mom5 > 2 && s.mom20 < -5) tech += 5
  else if (s.mom5 > 0 && s.mom20 < 0) tech += 2

  const longTech = Math.min(Math.max(tech, 0), 40)

  const longScore = longFund + longMacro + longMispricing + longTech

  // ── SHORT SCORING ─────────────────────────────────────────
  // Weak fundamentals /20
  let sFund = 0
  if (s.rev_growth < 0) sFund += 8; else if (s.rev_growth < 5) sFund += 4
  if (s.margin < 0) sFund += 8; else if (s.margin < 5) sFund += 4
  if (s.pe > 60 && s.rev_growth < 20) sFund += 6
  if (s.pe > 100) sFund += 4
  const shortFund = Math.min(sFund, 20)

  // Sector headwind /20
  const sectorShortScore = s.sectorScore != null ? Math.max(0, 20 - s.sectorScore) : 10
  const shortMacro = Math.min(sectorShortScore, 20)

  // Overvaluation /20
  let sVal = 0
  if (s.from52h > -8 && s.pe > 50) sVal += 10
  if (s.from52h > -5) sVal += 6
  if (s.pe > 80 && s.rev_growth < 30) sVal += 8
  if (s.mom20 > 15 && s.pe > 40) sVal += 4
  const shortOverval = Math.min(sVal, 20)

  // Technical deterioration /40 — boosted in bear market
  const bearBoost = isPanic ? 1.5 : isBearMarket ? 1.3 : isCorrection ? 1.15 : 1.0
  let sTech = 0
  if (s.rsi > 80) sTech += 16
  else if (s.rsi > 72) sTech += 12
  else if (s.rsi > 65) sTech += 8
  else if (s.rsi > 58) sTech += 4
  if (!s.aboveMa20) sTech += 7
  if (!s.aboveMa50) sTech += 7
  if (s.deathCross) sTech += 9
  if (s.isBreakingDown) sTech += 11
  if (s.inDowntrend) sTech += 8           // confirmed downtrend = short signal
  if (s.volTrend > 1.5 && s.rsi > 60) sTech += 5
  if (s.mom5 < -3 && s.mom20 > 5) sTech += 7
  else if (s.mom5 < 0 && s.mom20 > 10) sTech += 4
  if (s.ma20Slope < 0 && s.ma50Slope < 0) sTech += 5  // both MAs declining
  const shortTech = Math.min(Math.round(sTech * bearBoost), 40)

  const shortScore = shortFund + shortMacro + shortOverval + shortTech

  const isShort = shortScore > longScore && shortScore > 40
  const score   = isShort ? shortScore : longScore
  const direction = isShort ? 'short' : 'long'

  // Archetype
  let archetype = 'catalyst_surprise'
  if (isShort) {
    if (s.pe > 80 && s.rev_growth < 20) archetype = 'deep_value'
    else if (s.rsi > 75 || s.isBreakingDown) archetype = 'macro_pattern'
    else archetype = 'earnings_mispricing'
  } else {
    if (s.from52h < -15 && s.rev_growth > 10) archetype = 'earnings_mispricing'
    else if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) archetype = 'deep_value'
    else if (s.goldenCross || s.isBreakingOut) archetype = 'macro_pattern'
    else if (s.rev_growth > 25 && s.rsi < 60) archetype = 'macro_pattern'
  }

  const upside  = isShort ? Math.min(Math.abs(s.from52h) + 20, 60) : Math.abs(s.from52h) * 0.65
  const stopPct = s.rsi < 35 || s.rsi > 72 ? 4 : 6
  const rr      = stopPct > 0 ? +(upside / stopPct).toFixed(1) : 0

  // Pattern description using real TA
  let patternParts = []
  if (isShort) {
    if (s.rsi > 75) patternParts.push('Extremely overbought')
    else if (s.rsi > 65) patternParts.push('Overbought')
    if (s.deathCross) patternParts.push('Death cross')
    if (s.isBreakingDown) patternParts.push('Breaking down on volume')
    if (s.mom5 < -3) patternParts.push('Rolling over')
    patternParts.push(`RSI ${s.rsi}`)
  } else {
    if (s.rsi < 30) patternParts.push('Extremely oversold')
    else if (s.rsi < 40) patternParts.push('Oversold')
    else if (s.isConsolidating) patternParts.push('Tight base / coiling')
    if (s.goldenCross) patternParts.push('Golden cross')
    if (s.isBreakingOut) patternParts.push('Breaking out')
    if (s.bullishDiv) patternParts.push('Bullish RSI divergence')
    if (s.aboveMa20 && s.aboveMa50) patternParts.push('Above both MAs')
    else if (!s.aboveMa20) patternParts.push('Below 20MA')
    patternParts.push(`RSI ${s.rsi}`)
    if (s.volTrend > 1.5) patternParts.push('High volume')
  }
  const pattern = patternParts.slice(0,3).join(' · ')

  return {
    ...s, score, direction,
    breakdown: isShort
      ? { fundamentals: shortFund, macro: shortMacro, mispricing: shortOverval, technical: shortTech }
      : { fundamentals: longFund, macro: longMacro, mispricing: longMispricing, technical: longTech },
    archetype, upside: +upside.toFixed(1), stopPct, rr, pattern
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rawLimit = parseInt(searchParams.get('limit') ?? '0', 10)
  const limit = [3, 5, 10].includes(rawLimit) ? rawLimit : 0
  try {
    // Step 1: fetch live prices for all tickers
    const priceData = await fetchBatchPrices(ALL_TICKERS)

    // Step 2: fetch market regime (6h cache) + sector macro (weekly)
    const [regime, sectorPerf] = await Promise.all([fetchMarketRegime(), fetchSectorMacro()])

    // Step 3: fetch real TA for all tickers with price data
    const hasPrices = ALL_TICKERS.filter(t => priceData[t]?.price > 0)
    const taData = await fetchTA(hasPrices)

    // Step 3: find tickers needing live fundamentals
    const needLive = ALL_TICKERS.filter(t => !HARDCODED[t] && priceData[t]?.price > 0)

    // Step 3: fetch live fundamentals for unknown tickers (in parallel, best effort)
    const liveFunds = await fetchLiveFundamentals(needLive)

    // Step 4: build stock objects
    const stocks = []
    for (const ticker of ALL_TICKERS) {
      const pd = priceData[ticker]
      if (!pd || pd.price <= 0) continue

      const base = getFundamentals(ticker)
      const lf = liveFunds[ticker]

      const fund = {
        ...base,
        pe:         lf?.pe         ?? base.pe,
        rev_growth: lf?.rev_growth ?? base.rev_growth,
        margin:     lf?.margin     ?? base.margin,
        roe:        lf?.roe        ?? base.roe,
        debt_eq:    lf?.debt_eq    ?? base.debt_eq,
      }

      // Use Yahoo name if we don't have a proper one
      const name = base.name !== ticker ? base.name : ticker
      const sector = base.sector !== 'Unknown' ? base.sector : (SECTOR_MAP[ticker] || 'Unknown')

      const from52h = pd.high52 > 0 ? +((pd.price / pd.high52 - 1) * 100).toFixed(1) : 0
      const vol_ratio = pd.avg_volume > 0 ? +(pd.volume / pd.avg_volume).toFixed(2) : 1
      // Approximate RSI from price position in 52w range (rough proxy without full OHLCV)
      const rsi = pd.high52 > 0 ? Math.round(30 + ((pd.price / pd.high52) * 70)) : 50

      const ta = taData[ticker] || {}
      const realRsi = ta.rsi || rsi  // use real RSI if available
      const stock = {
        ticker, name, sector,
        price: pd.price,
        high52: pd.high52,
        from52h,
        vol_ratio,
        rsi: realRsi,
        change_pct: pd.change_pct,
        pe:         fund.pe,
        rev_growth: fund.rev_growth,
        margin:     fund.margin,
        roe:        fund.roe,
        debt_eq:    fund.debt_eq,
        sectorScore:    getSectorScore(sector, sectorPerf),
        regime:         regime.regime,
        marketVix:      regime.vix,
        spyMom20:       regime.spyMom20,
        // real TA fields
        ma20Pct:       ta.ma20Pct       || 0,
        ma50Pct:       ta.ma50Pct       || 0,
        aboveMa20:     ta.aboveMa20     ?? true,
        aboveMa50:     ta.aboveMa50     ?? true,
        goldenCross:   ta.goldenCross   || false,
        deathCross:    ta.deathCross    || false,
        volTrend:      ta.volTrend      || vol_ratio,
        mom5:          ta.mom5          || 0,
        mom20:         ta.mom20         || 0,
        isConsolidating: ta.isConsolidating || false,
        isBreakingOut:   ta.isBreakingOut   || false,
        isBreakingDown:  ta.isBreakingDown  || false,
        bullishDiv:      ta.bullishDiv      || false,
      }

      stocks.push(scoreStock(stock))
    }

    // Sort by score, filter low scores
    const sorted = stocks
      .filter(s => s.score >= 20)
      .sort((a, b) => b.score - a.score)

    // Write top 10 to bot_scan_results so the REST connector always has fresh data
    try {
      await supabaseAdmin.from('bot_scan_results').delete().neq('id', 0)
      await supabaseAdmin.from('bot_scan_results').insert(
        sorted.slice(0, 10).map(s => ({
          ticker:     s.ticker,
          name:       s.name,
          sector:     s.sector,
          price:      s.price,
          score:      s.score,
          rsi:        s.rsi,
          from52h:    s.from52h,
          vol_ratio:  s.vol_ratio,
          rev_growth: s.rev_growth,
          margin:     s.margin,
          pe:         s.pe,
          rr:         s.rr,
          archetype:  s.archetype,
          pattern:    s.pattern,
          breakdown:  s.breakdown,
          scanned_at: new Date().toISOString(),
        }))
      )
    } catch (e) {
      console.error('[scanner] bot_scan_results write failed:', e.message)
    }

    const result = limit > 0 ? sorted.slice(0, limit) : sorted
    return Response.json({
      stocks: result,
      updatedAt: new Date().toISOString()
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

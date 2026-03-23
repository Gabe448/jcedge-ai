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
  AAPL: { name:'Apple Inc.',                    sector:'Technology',     pe:28,  rev_growth:2,   margin:25, roe:160, debt_eq:1.80 },
  MSFT: { name:'Microsoft Corp.',               sector:'Technology',     pe:36,  rev_growth:16,  margin:36, roe:38,  debt_eq:0.44 },
  NVDA: { name:'NVIDIA Corp.',                  sector:'Technology',     pe:50,  rev_growth:122, margin:55, roe:110, debt_eq:0.44 },
  GOOGL:{ name:'Alphabet Inc.',                 sector:'Comm. Services', pe:22,  rev_growth:14,  margin:28, roe:28,  debt_eq:0.08 },
  META: { name:'Meta Platforms Inc.',           sector:'Comm. Services', pe:26,  rev_growth:22,  margin:35, roe:34,  debt_eq:0.12 },
  AMZN: { name:'Amazon.com Inc.',               sector:'Cons. Disc.',    pe:44,  rev_growth:11,  margin:8,  roe:22,  debt_eq:0.55 },
  TSLA: { name:'Tesla Inc.',                    sector:'Cons. Disc.',    pe:80,  rev_growth:2,   margin:8,  roe:12,  debt_eq:0.17 },
  AVGO: { name:'Broadcom Inc.',                 sector:'Technology',     pe:28,  rev_growth:44,  margin:38, roe:55,  debt_eq:1.10 },
  JPM:  { name:'JPMorgan Chase & Co.',          sector:'Financials',     pe:12,  rev_growth:12,  margin:28, roe:16,  debt_eq:1.33 },
  V:    { name:'Visa Inc.',                     sector:'Financials',     pe:30,  rev_growth:10,  margin:52, roe:44,  debt_eq:0.55 },
  MA:   { name:'Mastercard Inc.',               sector:'Financials',     pe:36,  rev_growth:12,  margin:46, roe:160, debt_eq:2.20 },
  LLY:  { name:'Eli Lilly and Co.',             sector:'Healthcare',     pe:55,  rev_growth:32,  margin:22, roe:88,  debt_eq:1.77 },
  UNH:  { name:'UnitedHealth Group Inc.',       sector:'Healthcare',     pe:20,  rev_growth:8,   margin:6,  roe:26,  debt_eq:0.77 },
  XOM:  { name:'Exxon Mobil Corp.',             sector:'Energy',         pe:14,  rev_growth:-4,  margin:10, roe:14,  debt_eq:0.22 },
  WMT:  { name:'Walmart Inc.',                  sector:'Cons. Staples',  pe:34,  rev_growth:6,   margin:3,  roe:20,  debt_eq:0.66 },
  PG:   { name:'Procter & Gamble Co.',          sector:'Cons. Staples',  pe:26,  rev_growth:3,   margin:18, roe:32,  debt_eq:0.66 },
  COST: { name:'Costco Wholesale Corp.',        sector:'Cons. Staples',  pe:50,  rev_growth:8,   margin:3,  roe:38,  debt_eq:0.44 },
  HD:   { name:'Home Depot Inc.',               sector:'Cons. Disc.',    pe:24,  rev_growth:1,   margin:10, roe:88,  debt_eq:8.80 },
  NFLX: { name:'Netflix Inc.',                  sector:'Comm. Services', pe:40,  rev_growth:15,  margin:20, roe:28,  debt_eq:0.77 },
  CRM:  { name:'Salesforce Inc.',               sector:'Technology',     pe:45,  rev_growth:9,   margin:16, roe:10,  debt_eq:0.22 },
  ADBE: { name:'Adobe Inc.',                    sector:'Technology',     pe:28,  rev_growth:10,  margin:30, roe:38,  debt_eq:0.44 },
  AMD:  { name:'Advanced Micro Devices Inc.',   sector:'Technology',     pe:45,  rev_growth:14,  margin:5,  roe:4,   debt_eq:0.04 },
  INTC: { name:'Intel Corp.',                   sector:'Technology',     pe:0,   rev_growth:-8,  margin:-5, roe:-8,  debt_eq:0.44 },
  QCOM: { name:'Qualcomm Inc.',                 sector:'Technology',     pe:16,  rev_growth:12,  margin:26, roe:44,  debt_eq:0.55 },
  TXN:  { name:'Texas Instruments Inc.',        sector:'Technology',     pe:30,  rev_growth:-4,  margin:36, roe:55,  debt_eq:0.88 },
  INTU: { name:'Intuit Inc.',                   sector:'Technology',     pe:55,  rev_growth:12,  margin:18, roe:18,  debt_eq:0.55 },
  ORCL: { name:'Oracle Corp.',                  sector:'Technology',     pe:34,  rev_growth:8,   margin:22, roe:88,  debt_eq:8.80 },
  NOW:  { name:'ServiceNow Inc.',               sector:'Technology',     pe:65,  rev_growth:22,  margin:16, roe:22,  debt_eq:0.22 },
  AMAT: { name:'Applied Materials Inc.',        sector:'Technology',     pe:18,  rev_growth:2,   margin:28, roe:55,  debt_eq:0.44 },
  LRCX: { name:'Lam Research Corp.',            sector:'Technology',     pe:20,  rev_growth:4,   margin:30, roe:88,  debt_eq:0.88 },
  KLAC: { name:'KLA Corp.',                     sector:'Technology',     pe:24,  rev_growth:20,  margin:38, roe:88,  debt_eq:1.44 },
  SNPS: { name:'Synopsys Inc.',                 sector:'Technology',     pe:45,  rev_growth:12,  margin:18, roe:18,  debt_eq:0.11 },
  CDNS: { name:'Cadence Design Systems Inc.',   sector:'Technology',     pe:55,  rev_growth:14,  margin:22, roe:44,  debt_eq:0.44 },
  ANET: { name:'Arista Networks Inc.',          sector:'Technology',     pe:45,  rev_growth:20,  margin:38, roe:28,  debt_eq:0.00 },
  SMCI: { name:'Super Micro Computer Inc.',     sector:'Technology',     pe:18,  rev_growth:38,  margin:8,  roe:22,  debt_eq:0.44 },
  MSTR: { name:'MicroStrategy Inc.',            sector:'Technology',     pe:0,   rev_growth:-8,  margin:-44,roe:-22, debt_eq:2.20 },
  IONQ: { name:'IonQ Inc.',                     sector:'Technology',     pe:0,   rev_growth:95,  margin:-88,roe:-44, debt_eq:0.22 },
  RGTI: { name:'Rigetti Computing Inc.',        sector:'Technology',     pe:0,   rev_growth:42,  margin:-88,roe:-88, debt_eq:0.55 },
  QUBT: { name:'Quantum Computing Inc.',        sector:'Technology',     pe:0,   rev_growth:88,  margin:-88,roe:-88, debt_eq:0.44 },
  ONDS: { name:'Ondas Holdings Inc.',           sector:'Technology',     pe:0,   rev_growth:42,  margin:-80,roe:-88, debt_eq:1.10 },
  BABA: { name:'Alibaba Group Holding Ltd.',    sector:'Cons. Disc.',    pe:15,  rev_growth:8,   margin:14, roe:12,  debt_eq:0.22 },
  COIN: { name:'Coinbase Global Inc.',          sector:'Financials',     pe:28,  rev_growth:88,  margin:32, roe:18,  debt_eq:0.44 },
  HOOD: { name:'Robinhood Markets Inc.',        sector:'Financials',     pe:24,  rev_growth:58,  margin:22, roe:20,  debt_eq:0.22 },
  SOFI: { name:'SoFi Technologies Inc.',        sector:'Financials',     pe:44,  rev_growth:22,  margin:10, roe:6,   debt_eq:0.88 },
  AFRM: { name:'Affirm Holdings Inc.',          sector:'Financials',     pe:0,   rev_growth:36,  margin:-8, roe:-10, debt_eq:0.55 },
  APP:  { name:'AppLovin Corporation',          sector:'Technology',     pe:55,  rev_growth:44,  margin:28, roe:88,  debt_eq:1.10 },
  HIMS: { name:'Hims & Hers Health Inc.',       sector:'Healthcare',     pe:44,  rev_growth:68,  margin:12, roe:14,  debt_eq:0.11 },
  DDOG: { name:'Datadog Inc.',                  sector:'Technology',     pe:80,  rev_growth:26,  margin:6,  roe:8,   debt_eq:0.22 },
  SNOW: { name:'Snowflake Inc.',                sector:'Technology',     pe:0,   rev_growth:30,  margin:-10,roe:-14, debt_eq:0.00 },
  NET:  { name:'Cloudflare Inc.',               sector:'Technology',     pe:0,   rev_growth:28,  margin:-4, roe:-10, debt_eq:0.44 },
  CRWD: { name:'CrowdStrike Holdings Inc.',     sector:'Technology',     pe:80,  rev_growth:32,  margin:4,  roe:8,   debt_eq:0.22 },
  ZS:   { name:'Zscaler Inc.',                  sector:'Technology',     pe:0,   rev_growth:26,  margin:-2, roe:-8,  debt_eq:0.55 },
  PANW: { name:'Palo Alto Networks Inc.',       sector:'Technology',     pe:50,  rev_growth:16,  margin:10, roe:44,  debt_eq:0.77 },
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

  FTNT: { name:'Fortinet Inc.',                 sector:'Technology',     pe:40,  rev_growth:12,  margin:22, roe:88,  debt_eq:0.88 },
  CELH: { name:'Celsius Holdings Inc.',         sector:'Cons. Staples',  pe:40,  rev_growth:12,  margin:14, roe:22,  debt_eq:0.00 },
  DUOL: { name:'Duolingo Inc.',                 sector:'Technology',     pe:80,  rev_growth:40,  margin:4,  roe:6,   debt_eq:0.00 },
  MELI: { name:'MercadoLibre Inc.',             sector:'Cons. Disc.',    pe:44,  rev_growth:38,  margin:11, roe:44,  debt_eq:0.77 },
  SHOP: { name:'Shopify Inc.',                  sector:'Technology',     pe:80,  rev_growth:26,  margin:14, roe:14,  debt_eq:0.11 },
  RBLX: { name:'Roblox Corp.',                  sector:'Comm. Services', pe:0,   rev_growth:22,  margin:-20,roe:-44, debt_eq:0.55 },
  SPOT: { name:'Spotify Technology SA',         sector:'Comm. Services', pe:55,  rev_growth:18,  margin:4,  roe:14,  debt_eq:0.44 },
  TTD:  { name:'Trade Desk Inc.',               sector:'Technology',     pe:80,  rev_growth:26,  margin:14, roe:22,  debt_eq:0.00 },
  UBER: { name:'Uber Technologies Inc.',        sector:'Cons. Disc.',    pe:30,  rev_growth:16,  margin:4,  roe:14,  debt_eq:0.88 },
  ARM:  { name:'Arm Holdings plc',              sector:'Technology',     pe:80,  rev_growth:22,  margin:28, roe:18,  debt_eq:0.11 },
  PLTR: { name:'Palantir Technologies Inc.',    sector:'Technology',     pe:80,  rev_growth:28,  margin:16, roe:14,  debt_eq:0.00 },
  ABBV: { name:'AbbVie Inc.',                   sector:'Healthcare',     pe:16,  rev_growth:4,   margin:22, roe:88,  debt_eq:8.80 },
  JNJ:  { name:'Johnson & Johnson',             sector:'Healthcare',     pe:16,  rev_growth:4,   margin:18, roe:22,  debt_eq:0.44 },
  PFE:  { name:'Pfizer Inc.',                   sector:'Healthcare',     pe:12,  rev_growth:-28, margin:10, roe:8,   debt_eq:0.55 },
  MRK:  { name:'Merck & Co. Inc.',              sector:'Healthcare',     pe:14,  rev_growth:7,   margin:22, roe:28,  debt_eq:0.66 },
  TMO:  { name:'Thermo Fisher Scientific Inc.', sector:'Healthcare',     pe:28,  rev_growth:2,   margin:14, roe:14,  debt_eq:0.66 },
  ABT:  { name:'Abbott Laboratories',           sector:'Healthcare',     pe:22,  rev_growth:4,   margin:14, roe:16,  debt_eq:0.44 },
  AMGN: { name:'Amgen Inc.',                    sector:'Healthcare',     pe:18,  rev_growth:18,  margin:32, roe:88,  debt_eq:8.80 },
  GILD: { name:'Gilead Sciences Inc.',          sector:'Healthcare',     pe:14,  rev_growth:6,   margin:22, roe:28,  debt_eq:0.88 },
  REGN: { name:'Regeneron Pharmaceuticals Inc.',sector:'Healthcare',     pe:22,  rev_growth:8,   margin:32, roe:18,  debt_eq:0.22 },
  VRTX: { name:'Vertex Pharmaceuticals Inc.',   sector:'Healthcare',     pe:30,  rev_growth:12,  margin:36, roe:22,  debt_eq:0.00 },
  ISRG: { name:'Intuitive Surgical Inc.',       sector:'Healthcare',     pe:65,  rev_growth:17,  margin:25, roe:18,  debt_eq:0.00 },
  IDXX: { name:'IDEXX Laboratories Inc.',       sector:'Healthcare',     pe:45,  rev_growth:7,   margin:22, roe:55,  debt_eq:0.55 },
  DXCM: { name:'DexCom Inc.',                   sector:'Healthcare',     pe:55,  rev_growth:11,  margin:12, roe:14,  debt_eq:0.44 },
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
  // ── LONG SCORING ──────────────────────────────────────────
  let fund = 0
  if (s.rev_growth > 20) fund += 8; else if (s.rev_growth > 10) fund += 5; else if (s.rev_growth > 0) fund += 2
  if (s.margin > 20) fund += 7; else if (s.margin > 10) fund += 4; else if (s.margin > 0) fund += 1
  if (s.roe > 20) fund += 5
  if (s.pe > 0 && s.pe < 20) fund += 5; else if (s.pe > 0 && s.pe < 35) fund += 3
  if (s.debt_eq < 0.5) fund += 5
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
  if (s.rsi > 35 && s.rsi < 55) tech += 8
  if (s.rsi < 35) tech += 10  // oversold
  if (s.rsi < 25) tech += 5   // extremely oversold
  if (s.vol_ratio > 1.5) tech += 6
  if (s.vol_ratio > 2.0) tech += 6
  const longTech = Math.min(tech, 20)

  const longScore = longFund + longMacro + longMispricing + longTech

  // ── SHORT SCORING ─────────────────────────────────────────
  let sFund = 0
  if (s.rev_growth < 0) sFund += 10; else if (s.rev_growth < 5) sFund += 5
  if (s.margin < 0) sFund += 10; else if (s.margin < 5) sFund += 5
  if (s.pe > 60 && s.rev_growth < 20) sFund += 10
  if (s.pe > 100) sFund += 5
  const shortFund = Math.min(sFund, 30)

  let sVal = 0
  if (s.from52h > -8 && s.pe > 50) sVal += 15
  if (s.from52h > -5) sVal += 10
  if (s.pe > 80 && s.rev_growth < 30) sVal += 10
  const shortOverval = Math.min(sVal, 25)

  let sTech = 0
  if (s.rsi > 70) sTech += 15
  if (s.rsi > 80) sTech += 10
  if (s.vol_ratio > 2.0 && s.rsi > 65) sTech += 5
  const shortTech = Math.min(sTech, 25)

  let sMom = 0
  if (s.from52h > -8 && s.rsi > 65) sMom += 20
  const shortMom = Math.min(sMom, 20)

  const shortScore = shortFund + shortOverval + shortTech + shortMom

  const isShort = shortScore > longScore && shortScore > 40
  const score = isShort ? shortScore : longScore
  const direction = isShort ? 'short' : 'long'

  let archetype = 'catalyst_surprise'
  if (isShort) {
    if (s.pe > 80 && s.rev_growth < 20) archetype = 'deep_value'
    else if (s.rsi > 75) archetype = 'macro_pattern'
    else archetype = 'earnings_mispricing'
  } else {
    if (s.from52h < -15 && s.rev_growth > 10) archetype = 'earnings_mispricing'
    else if (s.pe > 0 && s.pe < 15 && s.rev_growth > 5) archetype = 'deep_value'
    else if (s.rev_growth > 25 && s.rsi < 60) archetype = 'macro_pattern'
  }

  const upside = isShort ? Math.min(Math.abs(s.from52h) + 20, 60) : Math.abs(s.from52h) * 0.65
  const stopPct = s.rsi < 40 || s.rsi > 70 ? 4 : 6
  const rr = stopPct > 0 ? +(upside / stopPct).toFixed(1) : 0

  const pattern = isShort
    ? `${s.rsi > 70 ? 'Overbought' : 'Extended'} · RSI ${s.rsi} · ${Math.abs(s.from52h)}% from 52w high`
    : `${s.rsi < 35 ? 'Oversold bounce' : s.rsi < 50 ? 'Deep pullback' : 'Setup'} · RSI ${s.rsi}${s.vol_ratio > 1.5 ? ' · High volume' : ''}`

  return {
    ...s, score, direction,
    breakdown: isShort
      ? { fundamentals: shortFund, macro: shortMom, mispricing: shortOverval, technical: shortTech }
      : { fundamentals: longFund, macro: longMacro, mispricing: longMispricing, technical: longTech },
    archetype, upside: +upside.toFixed(1), stopPct, rr, pattern
  }
}

export async function GET() {
  try {
    // Step 1: fetch live prices for all tickers
    const priceData = await fetchBatchPrices(ALL_TICKERS)

    // Step 2: find tickers needing live fundamentals
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

      const stock = {
        ticker, name, sector,
        price: pd.price,
        high52: pd.high52,
        from52h,
        vol_ratio,
        rsi,
        change_pct: pd.change_pct,
        pe:         fund.pe,
        rev_growth: fund.rev_growth,
        margin:     fund.margin,
        roe:        fund.roe,
        debt_eq:    fund.debt_eq,
      }

      stocks.push(scoreStock(stock))
    }

    // Sort by score, filter low scores
    const sorted = stocks
      .filter(s => s.score >= 20)
      .sort((a, b) => b.score - a.score)

    return Response.json({
      stocks: sorted,
      updatedAt: new Date().toISOString()
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

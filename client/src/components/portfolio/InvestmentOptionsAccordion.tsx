import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Building, BarChart4, Landmark, Coins } from "lucide-react";

interface InvestmentOptionsAccordionProps {
  locale: string;
}

export default function InvestmentOptionsAccordion({ locale }: InvestmentOptionsAccordionProps) {
  const localeToOptions: Record<string, {
    country: string;
    largeCapStocks: string[];
    indexETFs: string[];
    fixedIncome: string[];
    alternatives: string[];
  }> = {
    IN: {
      country: "India",
      largeCapStocks: [
        "HDFC Bank (HDFCBANK.NS)",
        "Reliance Industries (RELIANCE.NS)",
        "Infosys (INFY.NS)",
        "TCS (TCS.NS)",
        "ICICI Bank (ICICIBANK.NS)"
      ],
      indexETFs: [
        "Nippon India Nifty BeES ETF (NIFTYBEES.NS)",
        "SBI Nifty ETF (SETFNIF50.NS)",
        "UTI Nifty ETF (UTINIFTETF.NS)",
        "ICICI Prudential Nifty ETF (ICICININF.NS)",
        "Kotak Nifty ETF (KOTAKNIFTY.NS)"
      ],
      fixedIncome: [
        "Government Securities",
        "Public Provident Fund (PPF)",
        "Corporate Bonds",
        "Tax-Free Bonds",
        "Fixed Deposits"
      ],
      alternatives: [
        "Gold ETFs (GOLDBEES.NS)",
        "REITs (Embassy REIT, Mindspace REIT)",
        "InvITs (IRB InvIT, India Grid Trust)",
        "Sovereign Gold Bonds",
        "National Pension Scheme (NPS)"
      ]
    },
    US: {
      country: "United States",
      largeCapStocks: [
        "Apple (AAPL)",
        "Microsoft (MSFT)",
        "Amazon (AMZN)",
        "Google (GOOGL)",
        "Berkshire Hathaway (BRK.B)"
      ],
      indexETFs: [
        "SPDR S&P 500 ETF (SPY)",
        "Vanguard S&P 500 ETF (VOO)",
        "iShares Core S&P 500 ETF (IVV)",
        "Vanguard Total Stock Market ETF (VTI)",
        "Invesco QQQ Trust (QQQ)"
      ],
      fixedIncome: [
        "U.S. Treasury Bonds",
        "Municipal Bonds",
        "Corporate Bonds",
        "TIPS (Treasury Inflation-Protected Securities)",
        "Certificates of Deposit (CDs)"
      ],
      alternatives: [
        "SPDR Gold Shares (GLD)",
        "Vanguard Real Estate ETF (VNQ)",
        "iShares U.S. Real Estate ETF (IYR)",
        "Alerian MLP ETF (AMLP)",
        "Invesco Optimum Yield Diversified Commodity Strategy ETF (PDBC)"
      ]
    },
    UK: {
      country: "United Kingdom",
      largeCapStocks: [
        "HSBC Holdings (HSBA.L)",
        "AstraZeneca (AZN.L)",
        "Shell (SHEL.L)",
        "BP (BP.L)",
        "Unilever (ULVR.L)"
      ],
      indexETFs: [
        "iShares Core FTSE 100 UCITS ETF (ISF.L)",
        "Vanguard FTSE 100 UCITS ETF (VUKE.L)",
        "SPDR FTSE UK All Share UCITS ETF (FTAL.L)",
        "Lyxor Core FTSE Actuaries UK Gilts UCITS ETF (GILS.L)",
        "iShares Core FTSE All-Share ETF (CSUK.L)"
      ],
      fixedIncome: [
        "UK Gilts",
        "Corporate Bonds",
        "Premium Bonds",
        "ISA Cash Accounts",
        "Fixed-Rate Bonds"
      ],
      alternatives: [
        "iShares Physical Gold ETC (SGLN.L)",
        "iShares UK Property UCITS ETF (IUKP.L)",
        "BMO UK Property Fund (BMOUKPF.L)",
        "WisdomTree Gold ETF (BULL.L)",
        "L&G All Commodities UCITS ETF (BCOG.L)"
      ]
    },
    SG: {
      country: "Singapore",
      largeCapStocks: [
        "DBS Group (D05.SI)",
        "OCBC Bank (O39.SI)",
        "UOB (U11.SI)",
        "Singtel (Z74.SI)",
        "CapitaLand (C31.SI)"
      ],
      indexETFs: [
        "SPDR Straits Times Index ETF (ES3.SI)",
        "Nikko AM STI ETF (G3B.SI)",
        "Lion-Phillip S-REIT ETF (CLR.SI)",
        "NikkoAM-StraitsTrading Asia ex Japan REIT ETF (CFA.SI)",
        "ICBC CSOP FTSE Chinese Government Bond Index ETF (CYC.SI)"
      ],
      fixedIncome: [
        "Singapore Government Securities (SGS)",
        "Singapore Savings Bonds (SSB)",
        "Corporate Bonds",
        "Fixed Deposits",
        "Singapore Treasury Bills (T-bills)"
      ],
      alternatives: [
        "SPDR Gold Shares (GLD.SI)",
        "REITs (CapitaLand Mall Trust, Mapletree Commercial Trust)",
        "Phillip SGX APAC Dividend Leaders REIT ETF (BYI.SI)",
        "ABF Singapore Bond Index Fund (A35.SI)",
        "Central Provident Fund (CPF) Special Account"
      ]
    }
  };

  const options = localeToOptions[locale] || localeToOptions.US;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="investment-options" className="border-none">
        <AccordionTrigger className="py-3 px-4 text-sm font-medium flex items-center bg-gradient-to-r from-primary/5 to-transparent hover:no-underline">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" />
            <span>Top Investment Options for {options.country}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-3 px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="bg-blue-50/30 p-3 rounded-md">
              <h3 className="text-xs font-semibold mb-2 flex items-center text-blue-700">
                <Building className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                Large Cap Stocks
              </h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {options.largeCapStocks.map((stock, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1 text-blue-500">•</span> {stock}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-amber-50/30 p-3 rounded-md">
              <h3 className="text-xs font-semibold mb-2 flex items-center text-amber-700">
                <BarChart4 className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                Index ETFs
              </h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {options.indexETFs.map((etf, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1 text-amber-500">•</span> {etf}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-green-50/30 p-3 rounded-md">
              <h3 className="text-xs font-semibold mb-2 flex items-center text-green-700">
                <Landmark className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                Fixed Income
              </h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {options.fixedIncome.map((bond, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1 text-green-500">•</span> {bond}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-purple-50/30 p-3 rounded-md">
              <h3 className="text-xs font-semibold mb-2 flex items-center text-purple-700">
                <Coins className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                Alternatives
              </h3>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {options.alternatives.map((alt, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-1 text-purple-500">•</span> {alt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
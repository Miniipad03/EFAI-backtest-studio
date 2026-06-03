"""인기 한국 주식 10종목의 3년치 일봉을 public/data/<code>.json으로 저장."""
import json
import os
from datetime import datetime, timedelta

try:
    import FinanceDataReader as fdr
except ImportError:
    print("ERROR: pip install FinanceDataReader pandas")
    raise

STOCKS = [
    ("005930", "삼성전자"),
    ("000660", "SK하이닉스"),
    ("035420", "NAVER"),
    ("005380", "현대차"),
    ("051910", "LG화학"),
    ("006400", "삼성SDI"),
    ("035720", "카카오"),
    ("000270", "기아"),
    ("068270", "셀트리온"),
    ("105560", "KB금융"),
]

END = datetime.now()
START = END - timedelta(days=3 * 365)
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(OUT_DIR, exist_ok=True)

for code, name in STOCKS:
    print(f"Fetching {code} ({name})...")
    try:
        df = fdr.DataReader(code, START.strftime("%Y-%m-%d"), END.strftime("%Y-%m-%d"))
        if df is None or df.empty:
            print(f"  SKIP: no data")
            continue
        candles = [
            {
                "date": date.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]),
            }
            for date, row in df.iterrows()
        ]
        path = os.path.join(OUT_DIR, f"{code}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"code": code, "name": name, "candles": candles}, f, ensure_ascii=False)
        print(f"  OK: {len(candles)} candles → {path}")
    except Exception as e:
        print(f"  ERROR: {e}")

print("Done.")

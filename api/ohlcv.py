from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timedelta
import json


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        code = params.get("code", ["005930"])[0].strip()
        try:
            years = max(1, min(10, int(params.get("years", ["3"])[0])))
        except ValueError:
            years = 3

        end = datetime.now()
        start = end - timedelta(days=years * 365)

        try:
            import FinanceDataReader as fdr

            df = fdr.DataReader(
                code,
                start.strftime("%Y-%m-%d"),
                end.strftime("%Y-%m-%d"),
            )

            if df is None or df.empty:
                self._respond(404, {"error": f"종목 '{code}'의 데이터가 없습니다."})
                return

            try:
                listing = fdr.StockListing("KRX")
                match = listing[listing["Code"] == code]
                name = str(match.iloc[0]["Name"]) if not match.empty else code
            except Exception:
                name = code

            candles = []
            for date, row in df.iterrows():
                candles.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]),
                })

            self._respond(200, {"code": code, "name": name, "candles": candles})

        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _respond(self, status: int, body: dict) -> None:
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):
        pass

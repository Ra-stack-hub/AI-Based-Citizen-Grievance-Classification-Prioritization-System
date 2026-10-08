from datetime import datetime

def format_datetime(dt: datetime) -> str:
    if dt is None:
        return ""
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def format_currency(amount: float) -> str:
    return f"${amount:,.2f}"

def format_complaint_title(title: str) -> str:
    return title.strip().capitalize()

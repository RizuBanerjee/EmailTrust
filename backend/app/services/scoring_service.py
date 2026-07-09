import dns.resolver
import dns.exception
from functools import lru_cache

# Provider reputation base scores (0-100)
PROVIDER_TRUST = {
    "gmail.com": 95,
    "outlook.com": 95,
    "hotmail.com": 95,
    "live.com": 95,
    "msn.com": 90,
    "yahoo.com": 90,
    "yahoo.co.in": 90,
    "ymail.com": 85,
    "icloud.com": 95,
    "me.com": 95,
    "mac.com": 90,
    "protonmail.com": 85,
    "proton.me": 85,
    "zoho.com": 80,
    "zohomail.com": 80,
    "yandex.com": 75,
    "yandex.ru": 75,
    "ya.ru": 75,
    "mail.ru": 70,
    "inbox.ru": 70,
    "bk.ru": 70,
    "list.ru": 70,
    "gmx.com": 75,
    "gmx.net": 75,
    "aol.com": 80,
    "aim.com": 80,
    "foxmail.com": 70,
    "qq.com": 70,
    "163.com": 70,
    "126.com": 70,
    "yeah.net": 70,
    "sina.com": 70,
    "sina.cn": 70,
    "sohu.com": 70,
    "rediffmail.com": 70,
}

# Low-reputation TLDs often used for throwaway or spam domains
SUSPICIOUS_TLDS = (
    ".tk", ".ml", ".ga", ".cf", ".top", ".work", ".click", ".link",
    ".zip", ".mov", ".cyou", ".uno", ".monster", ".email",
    ".live", ".site", ".space", ".online", ".store", ".fun",
)

# Role-based / shared addresses that usually do not represent a single person
ROLE_PREFIXES = {
    "admin", "support", "noreply", "no-reply", "info", "sales", "marketing",
    "postmaster", "webmaster", "hostmaster", "abuse", "billing", "help",
    "contact", "service", "team", "root", "sysadmin", "web", "mail", "office",
    "customerservice", "enquiries", "feedback", "hr", "jobs", "legal", "press",
    "security", "account", "accounts", "api", "bot", "daemon", "ftp",
    "host", "master", "noc", "post", "www", "register", "signup", "user",
}

# Common typos of popular email domains
TYPO_DOMAINS = {
    "gmial.com", "gmal.com", "gmail.co", "gmail.cm", "gmaill.com",
    "gnail.com", "gmaik.com", "gmailn.com",
    "yahooo.com", "yaho.com", "yahoo.co", "yhaoo.com", "yahoo.com.com",
    "hotmial.com", "hotmal.com", "hotmail.co", "hotmail.cm", "hotmaill.com",
    "outlok.com", "outlook.co", "outlook.cm", "outlookl.com",
    "icloud.co", "me.co", "mac.co", "apple.co",
}


@lru_cache(maxsize=1024)
def has_mx_records(domain: str) -> bool:
    """
    Return True if the domain has at least one MX record.
    NXDOMAIN, NoAnswer, NoNameservers and timeouts are treated as no MX.
    """
    try:
        answers = dns.resolver.resolve(domain, "MX")
        return len(answers) > 0
    except (
        dns.resolver.NXDOMAIN,
        dns.resolver.NoAnswer,
        dns.resolver.NoNameservers,
        dns.exception.Timeout,
    ):
        return False
    except Exception:
        return False


def score_email(email: str, domain: str, temporary: bool) -> dict:
    """
    Calculate trust/risk scores and a recommendation for an email address.

    Returns:
        dict with keys: trust_score, risk_score, recommendation, checks
    """
    if temporary:
        return {
            "trust_score": 0,
            "risk_score": 100,
            "recommendation": "BLOCK",
            "checks": {
                "syntax": True,
                "disposable": True,
                "mx_record": has_mx_records(domain),
                "role_based": False,
                "suspicious_tld": False,
                "typo": False,
            },
        }

    # Start from the provider's reputation, or 70 for unknown custom domains
    trust = PROVIDER_TRUST.get(domain, 70)
    risk = 100 - trust

    checks = {
        "syntax": True,
        "disposable": False,
        "mx_record": has_mx_records(domain),
        "role_based": False,
        "suspicious_tld": False,
        "typo": False,
    }

    local = email.split("@")[0].lower()

    if local in ROLE_PREFIXES:
        trust -= 10
        risk += 10
        checks["role_based"] = True

    if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        trust -= 15
        risk += 15
        checks["suspicious_tld"] = True

    if domain in TYPO_DOMAINS:
        trust -= 45
        risk += 45
        checks["typo"] = True

    if not checks["mx_record"]:
        trust -= 25
        risk += 25

    trust = max(0, min(100, trust))
    risk = max(0, min(100, risk))

    if trust >= 70:
        recommendation = "ALLOW"
    elif trust >= 40:
        recommendation = "REVIEW"
    else:
        recommendation = "BLOCK"

    return {
        "trust_score": trust,
        "risk_score": risk,
        "recommendation": recommendation,
        "checks": checks,
    }
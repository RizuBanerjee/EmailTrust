GOOGLE_DOMAINS = {"gmail.com"}

MICROSOFT_DOMAINS = {
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
}

YAHOO_DOMAINS = {
    "yahoo.com",
    "yahoo.co.in",
    "ymail.com",
}

APPLE_DOMAINS = {
    "icloud.com",
    "me.com",
    "mac.com",
}

PROTON_DOMAINS = {
    "protonmail.com",
    "proton.me",
}

ZOHO_DOMAINS = {
    "zoho.com",
    "zohomail.com",
}

YANDEX_DOMAINS = {
    "yandex.com",
    "yandex.ru",
    "ya.ru",
}

MAIL_RU_DOMAINS = {
    "mail.ru",
    "inbox.ru",
    "bk.ru",
    "list.ru",
}

GMX_DOMAINS = {
    "gmx.com",
    "gmx.net",
}

AOL_DOMAINS = {
    "aol.com",
    "aim.com",
}

TENCENT_DOMAINS = {
    "qq.com",
    "foxmail.com",
}

NETEASE_DOMAINS = {
    "163.com",
    "126.com",
    "yeah.net",
}

SINA_DOMAINS = {
    "sina.com",
    "sina.cn",
}

SOHU_DOMAINS = {
    "sohu.com",
}

REDIFF_DOMAINS = {
    "rediffmail.com",
}


def classify_provider(domain: str, temporary: bool):
    if temporary:
        return "Disposable"

    if domain in GOOGLE_DOMAINS:
        return "Google"

    if domain in MICROSOFT_DOMAINS:
        return "Microsoft"

    if domain in YAHOO_DOMAINS:
        return "Yahoo"

    if domain in APPLE_DOMAINS:
        return "Apple"

    if domain in PROTON_DOMAINS:
        return "ProtonMail"

    if domain in ZOHO_DOMAINS:
        return "Zoho"

    if domain in YANDEX_DOMAINS:
        return "Yandex"

    if domain in MAIL_RU_DOMAINS:
        return "Mail.ru"

    if domain in GMX_DOMAINS:
        return "GMX"

    if domain in AOL_DOMAINS:
        return "AOL"

    if domain in TENCENT_DOMAINS:
        return "Tencent"

    if domain in NETEASE_DOMAINS:
        return "NetEase"

    if domain in SINA_DOMAINS:
        return "Sina"

    if domain in SOHU_DOMAINS:
        return "Sohu"

    if domain in REDIFF_DOMAINS:
        return "Rediff"

    return "Custom"
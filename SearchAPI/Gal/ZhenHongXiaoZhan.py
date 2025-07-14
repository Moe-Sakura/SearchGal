from ..common import *


def ZhenHongXiaoZhan(game: str, mode=False) -> list:
    yinqin = "真红小站"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'hover:underline" href="(?P<URL>.+?)">\s*(?P<NAME>.+?)\s*</a>', re.S
        )
        searesp = session.get(
            url="https://www.shinnku.com/search?q=" + game,
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        mainurl = "https://www.shinnku.com"
        for i in list(searul.finditer(searesp.text))[:MAX_RESULTS]:
            gamelst.append(
                {
                    "name": i.group("NAME").strip(),
                    "url": mainurl + urllib.parse.quote(i.group("URL")),
                }
            )
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


ZhenHongXiaoZhan.color = "lime"
ZhenHongXiaoZhan.magic = False

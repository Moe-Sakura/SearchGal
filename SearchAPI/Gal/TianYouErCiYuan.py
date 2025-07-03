from ..common import *

def TianYouErCiYuan(game: str, mode=False) -> list:
    yinqin = "天游二次元"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'</i></a><h2><a href="(?P<URL>.*?)" title="(?P<NAME>.*?)"', re.S
        )
        searesp = session.get(
            url=f"https://www.tiangal.com/search/{game}",
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text))[:MAX_RESULTS]:
            gamelst.append({"name": i.group("NAME").strip(), "url": i.group("URL")})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]

TianYouErCiYuan.color = "white"
TianYouErCiYuan.magic = False
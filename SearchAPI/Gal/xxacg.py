from ..common import *


def xxacg(game: str, mode=False) -> list:
    yinqin = "xxacg"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<h4 class="entry-title title"><a href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h4>',
            re.S,
        )
        searesp = session.get(
            url="https://xxacg.net/",
            params={"s": game},
            verify=False,
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


xxacg.color = "gold"
xxacg.magic = True

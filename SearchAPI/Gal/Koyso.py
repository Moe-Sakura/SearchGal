from ..common import *


def Koyso(game: str, mode=False) -> list:
    yinqin = "Koyso"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<a class="game_item" href="(?P<URL>.+?)"\s*>.*?<span style="background-color: rgba\(128,128,128,0\)">(?P<NAME>.+?)</span>',
            re.S,
        )
        searesp = session.get(
            url="https://koyso.to/?keywords=" + game,
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        mainurl = "https://koyso.to"
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


Koyso.color = "lime"
Koyso.magic = False

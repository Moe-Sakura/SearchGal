from ..common import *


def GGS(game: str, mode=False) -> list:
    yinqin = "GGS"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://gal.saop.cc/search.json", headers=headers, timeout=timeoutsec
        )
        resjson = [i for i in json.loads(searesp.text) if game in i["title"]]
        count = 0
        gamelst = []
        mainurl = "https://gal.saop.cc"
        for i in resjson[:MAX_RESULTS]:
            gamelst.append({"name": i["title"], "url": mainurl + i["url"]})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


GGS.color = "lime"
GGS.magic = False

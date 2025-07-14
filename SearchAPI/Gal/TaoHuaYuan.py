from ..common import *


def TaoHuaYuan(game: str, mode=False) -> list:
    yinqin = "桃花源"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://peach.sslswwdx.top/page/search/index.json",
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = [i for i in json.loads(searesp.text) if game in i["title"]]
        count = 0
        gamelst = []
        for i in resjson[:MAX_RESULTS]:
            gamelst.append({"name": i["title"], "url": i["permalink"]})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


TaoHuaYuan.color = "lime"
TaoHuaYuan.magic = False

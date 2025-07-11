from ..common import *

def GalTuShuGuan(game: str, mode=False) -> list:
    yinqin = "GAL图书馆"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://gallibrary.pw/galgame/game/manyGame?page=1&type=1&count={min(1000,MAX_RESULTS)}&keyWord="
            + game,
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["code"] != 200:
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        mainurl = "https://gallibrary.pw/game.html?id="
        for i in resjson["data"][:MAX_RESULTS]:
            gamelst.append(
                {
                    "name": i["listGameText"][1]["data"].strip(),
                    "url": mainurl + str(i["id"]),
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

GalTuShuGuan.color = "lime"
GalTuShuGuan.magic = False
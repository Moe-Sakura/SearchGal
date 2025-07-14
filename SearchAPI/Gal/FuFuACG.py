from ..common import *


def FuFuACG(game: str, mode=False) -> list:
    yinqin = "FuFuACG"
    if mode:
        return yinqin
    ynheaders = {
        "Connection": "close",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
    }
    try:
        searesp = session.get(
            url="https://www.fufugal.com/so",
            params={"query": game},
            headers=ynheaders,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception
        dt = json.loads(searesp.text)
        count = len(dt["obj"])
        gamelst = []
        for i in dt["obj"][:MAX_RESULTS]:
            gamelst.append(
                {
                    "url": "https://www.fufugal.com/detail?id=" + str(i["game_id"]),
                    "name": i["game_name"],
                }
            )
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


FuFuACG.color = "white"
FuFuACG.magic = False

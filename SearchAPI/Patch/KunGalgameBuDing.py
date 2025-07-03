from ..common import *


def KunGalgameBuDing(game: str, mode=False) -> list:
    yinqin = "鲲Galgame补丁"
    if mode:
        return yinqin
    try:
        data = {
            "limit": 12,
            "page": 1,
            "query": list(game.split()),
            "searchOption": {
                "searchInAlias": True,
                "searchInIntroduction": False,
                "searchInTag": False,
            },
        }
        searesp = session.post(
            url=f"https://www.moyu.moe/api/search",
            headers=headers,
            timeout=timeoutsec,
            verify=False,
            json=data,
        )
        resjson = json.loads(searesp.text)
        count = 0
        gamelst = []
        mainurl = "https://www.moyu.moe/patch/"
        lasturl = "/introduction"
        for i in resjson["galgames"][:MAX_RESULTS]:
            gamelst.append({"name": i["name"], "url": mainurl + str(i["id"]) + lasturl})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


KunGalgameBuDing.color = "lime"
KunGalgameBuDing.magic = False

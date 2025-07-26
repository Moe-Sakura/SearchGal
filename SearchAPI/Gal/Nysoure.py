from ..common import *


def Nysoure(game: str, mode=False) -> list:
    yinqin = "Nysoure"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://res.nyne.dev/api/resource/search?keyword={game}&page=1",
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["success"] != True:
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        mainurl = "https://res.nyne.dev/resources/"
        for i in resjson["data"][:MAX_RESULTS]:
            gamelst.append(
                {"name": i["title"].strip(), "url": mainurl + str(i["id"])}
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


Nysoure.color = "gold"
Nysoure.magic = True

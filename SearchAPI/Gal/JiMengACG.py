from ..common import *

def JiMengACG(game: str, mode=False) -> list:
    yinqin = "绮梦ACG"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://game.acgs.one/api/posts?filterType=search&filterSlug={game}&page=1&pageSize={str(MAX_RESULTS)}",
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["status"] != "success":
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        for i in resjson["data"]["dataSet"][:MAX_RESULTS]:
            gamelst.append(
                {"name": i["title"].strip(), "url": i["permalink"]}
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

JiMengACG.color = "lime"
JiMengACG.magic = False
from ..common import *

def KunGalgame(game: str, mode=False) -> list:
    yinqin = "鲲Galgame"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://www.kungal.com/api/search?keywords={game}&type=galgame&page=1&limit=12",
            headers=headers,
            timeout=timeoutsec,
            verify=False,
        )
        resjson = json.loads(searesp.text)
        count = 0
        gamelst = []
        mainurl = "https://www.kungal.com/zh-cn/galgame/"
        for i in resjson[:MAX_RESULTS]:
            zhname = i["name"]["zh-cn"].strip()
            jpname = i["name"]["ja-jp"].strip()
            gamelst.append(
                {"name": zhname if zhname else jpname, "url": mainurl + str(i["gid"])}
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

KunGalgame.color = "lime"
KunGalgame.magic = False
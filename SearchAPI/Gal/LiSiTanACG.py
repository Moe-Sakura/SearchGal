from ..common import *


def LiSiTanACG(game: str, mode=False) -> list:
    yinqin = "莉斯坦ACG"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://www.limulu.moe/search.xml",
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        root = ET.fromstring(searesp.text)
        count = 0
        gamelst = []
        main_URL = "https://www.limulu.moe"
        for entry in root.findall("entry"):
            if game not in entry.findtext("title"):
                continue
            gamelst.append(
                {
                    "name": entry.findtext("title").strip(),
                    "url": main_URL + entry.findtext("url"),
                }
            )
            count += 1
            if len(gamelst) == MAX_RESULTS:
                break
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


LiSiTanACG.color = "lime"
LiSiTanACG.magic = False

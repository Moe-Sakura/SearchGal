from ..common import *


def YueYao(game: str, mode=False) -> list:
    yinqin = "月谣"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://www.sayafx.vip/search.xml",
            headers=headers,
            timeout=timeoutsec,
        )
        root = ET.fromstring(searesp.text)
        count = 0
        gamelst = []
        mainurl = "https://www.sayafx.vip"
        for entry in root.findall("entry"):
            if game not in entry.findtext("title"):
                continue
            gamelst.append(
                {
                    "name": entry.findtext("title").strip(),
                    "url": mainurl + entry.findtext("url"),
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


YueYao.color = "lime"
YueYao.magic = False

from ..common import *

def YingZhiGuang(game: str, mode=False) -> list:
    yinqin = "萤ノ光"
    if mode:
        return yinqin
    try:
        searesp = session.get(
            url=f"https://yinghu.netlify.app/search.xml", headers=headers, timeout=timeoutsec
        )
        root = ET.fromstring(searesp.text)
        count = 0
        gamelst = []
        mainurl = "https://yinghu.netlify.app"
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

YingZhiGuang.color = "lime"
YingZhiGuang.magic = False
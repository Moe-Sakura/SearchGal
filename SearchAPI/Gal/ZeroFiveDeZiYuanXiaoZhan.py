from ..common import *


def ZeroFiveDeZiYuanXiaoZhan(game: str, mode=False) -> list:
    yinqin = "05的资源小站"
    if mode:
        return yinqin
    try:
        data = {
            "parent": "/",
            "keywords": game,
            "scope": 0,
            "page": 1,
            "per_page": MAX_RESULTS,
            "password": "",
        }
        searesp = session.post(
            url=f"https://05fx.022016.xyz/api/fs/search",
            json=data,
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["message"] != "success":
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        mainurl = "https://05fx.022016.xyz"
        reslen = len(resjson["data"]["content"])
        if reslen != resjson["data"]["total"]:
            raise Exception("访问密码错误")
        for i in resjson["data"]["content"]:
            gamelst.append(
                {
                    "name": i["name"].strip(),
                    "url": mainurl + i["parent"] + "/" + i["name"],
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


ZeroFiveDeZiYuanXiaoZhan.color = "lime"
ZeroFiveDeZiYuanXiaoZhan.magic = False

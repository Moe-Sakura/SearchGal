from ..common import *


def GalgameX(game: str, mode=False) -> list:
    yinqin = "Galgamex"
    if mode:
        return yinqin
    try:
        # searul = re.compile(r'.jpg" alt="(?P<NAME>.*?)" class="lazyload fit-cover radius8"></a></div><div class="item-body"><h2 class="item-heading"><a target="_blank" href="(?P<URL>.*?)">',re.S)
        # searesp = session.get(url='https://www.galgamex.net/', params={'s':game,'type':'post'}, headers=headers)
        searesp = session.post(
            url="https://www.galgamex.net/api/search",
            headers=headers,
            json={
                "queryString": '[{"type":"keyword","name":"' + game + '"}]',
                # Limit硬编码：Number must be less than or equal to 24
                "limit": min(MAX_RESULTS, 24),
                "searchOption": {
                    "searchInIntroduction": False,
                    "searchInAlias": True,
                    "searchInTag": False,
                },
                "page": 1,
                "selectedType": "all",
                "selectedLanguage": "all",
                "selectedPlatform": "all",
                "sortField": "resource_update_time",
                "sortOrder": "desc",
                "selectedYears": ["all"],
                "selectedMonths": ["all"],
            },
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        resjson = json.loads(searesp.text)
        count = 0
        gamelst = []
        mainurl = "https://www.galgamex.net/"
        for i in resjson["galgames"][:MAX_RESULTS]:
            gamelst.append({"name": i["name"].strip(), "url": mainurl + i["uniqueId"]})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


GalgameX.color = "lime"
GalgameX.magic = False

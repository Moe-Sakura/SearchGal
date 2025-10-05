from ..common import *

def ZiYuanShe(game: str, mode=False) -> list:
    yinqin = "紫缘Gal"
    if mode:
        return yinqin
    
    try:
        mainurl = "https://galzy.eu.org"
        searesp = requests.get(
            f"{mainurl}/api/search?q={game}", 
            headers=headers,
            timeout=timeoutsec)
        resjson = searesp.json()
        searesp.close()
        
        gamelst = []
        count = 0
        
        for hit in resjson.get("hits", []):
            zh_name = None
            first_title = None
            for title_obj in hit.get("titles", []):
                if not first_title:
                    first_title = title_obj.get("title")
                if title_obj.get("lang") in ["zh-Hans", "zh-Hant"]:
                    zh_name = title_obj.get("title")
                    break
            name = zh_name or first_title or "未知"
            
            gamelst.append({
                "name": name.strip(),
                "url": f"{mainurl}/{hit.get('id')}"
            })
            count += 1
        
        return [gamelst, count, yinqin]
    
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]

ZiYuanShe.color = "lime"
ZiYuanShe.magic = False

from ..common import *

# 资源站
# 倒了
def xinling(game:str,mode=False) -> list:
    yinqin = "杏铃ACG"
    if mode: return yinqin
    try:
        searul = re.compile(r'<a href="(?P<URL>.*?)">(?P<NAME>.*?)</a>',re.S)
        searesp = session.get(url='https://g.杏铃.top/', params={'q':game}, headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        flag = False
        for i in list(searul.finditer(searesp.text)):
            if flag == False:
                flag = True
                continue
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
            if len(gamelst) == MAX_RESULTS: break
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]
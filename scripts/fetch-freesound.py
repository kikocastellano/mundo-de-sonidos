# Busca en Freesound (páginas públicas) sonidos CC0 o CC BY y descarga la previsualización HQ.
import sys,re,urllib.request,urllib.parse,html,json,os
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,os.path.dirname(__file__))
UA={'User-Agent':'Mozilla/5.0 MundoDeSonidos/0.1'}
OUT=sys.argv[1]
import time
def get(u,b=False):
    for i in range(6):
        try:
            d=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=40).read(); time.sleep(0.7); return d if b else d.decode('utf8','replace')
        except urllib.error.HTTPError as e:
            if e.code in (403,429,503): time.sleep(8*(i+1)); continue
            raise
    raise Exception('reintentos '+u)
ALT={'ballena':'whale song','oso':'brown bear','panda':'giant panda','cuco':'cuckoo bird','canguro':'kangaroo grunt','tigre':'tiger','leon':'lion','lobo':'wolves howling','aguila':'eagle'}
Q={'vaca':'cow moo','perro':'dog bark','gato':'cat meow','oveja':'sheep bleat','cerdo':'pig oink','caballo':'horse neigh','pato':'duck quack','gallo':'rooster crow',
'ballena':'humpback whale','delfin':'dolphin','foca':'sea lion bark','leon':'lion roar','elefante':'elephant trumpet','mono':'chimpanzee','hipopotamo':'hippo',
'lobo':'wolf howl','oso':'bear growl','loro':'parrot macaw','aguila':'eagle call','tigre':'tiger roar','panda':'panda bear','pavo-real':'peacock call',
'buho':'owl hoot','rana':'frog croak','cuco':'cuckoo','canguro':'kangaroo','koala':'koala','kookaburra':'kookaburra','pinguino':'penguin','oso-polar':'polar bear',
'cabra':'goat bleat','gallina':'hen clucking','pollito':'chick peep','pavo':'turkey gobble','burro':'donkey bray','ganso':'goose honk','conejo':'rabbit','toro':'bull','orca':'orca','nutria':'otter','gaviota':'seagull',
'cebra':'zebra','jirafa':'giraffe','rinoceronte':'rhino','gorila':'gorilla','leopardo':'leopard','flamenco':'flamingo','camello':'camel','bisonte':'bison','mapache':'raccoon','llama':'llama hum','serpiente':'rattlesnake',
'alce':'moose call','perezoso':'sloth','orangutan':'orangutan','bufalo':'water buffalo','cobra':'snake hiss','grulla':'crane bird call','zorro':'fox scream','erizo':'hedgehog','ardilla':'squirrel chatter','abeja':'bee buzz',
'grillo':'cricket chirp','cuervo':'crow caw','jabali':'wild boar','ciervo':'deer roar','paloma':'dove coo','cocodrilo':'crocodile','cacatua':'cockatoo','tortuga':'turtle','reno':'reindeer','morsa':'walrus','buho-nival':'snowy owl','zorro-artico':'arctic fox'}
LIC={'"Creative Commons 0"':'CC0','"Attribution"':'CC BY'}
BAD=re.compile(r'cartoon|toy|imitat|human|voice|vocal|kid|child|synth|fart|music|loop|beat|remix|song|game|sfx pack|robot|scream|angry|wolf|cat, |pack',re.I)
def one(aid):
    res=[]
    for f,L in LIC.items():
        u='https://freesound.org/search/?'+urllib.parse.urlencode({'q':ALT.get(aid,Q[aid]) if os.environ.get('ALT') else Q[aid],'f':f'license:{f} duration:[0.5 TO 25]','s':'Downloads (most first)'})
        h=get(u)
        for b in re.findall(r'class="bw-player"(.*?)tabindex',h,re.S):
            g=lambda k:html.unescape((re.search(k+r'="([^"]*)"',b) or [None,''])[1])
            t=g('data-title')
            if BAD.search(t): continue
            res.append(dict(id=g('data-sound-id'),title=t,author=g('data-username'),license=L,dur=float(g('data-duration') or 0),dl=int(g('data-num-downloads') or 0),
              mp3=g('data-mp3').replace('-lq.mp3','-hq.mp3'),page=f"https://freesound.org/people/{g('data-username')}/sounds/{g('data-sound-id')}/"))
    res.sort(key=lambda r:-r['dl']); seen=set(); out=[]
    for r in res:
        if r['id'] in seen: continue
        seen.add(r['id'])
        if len(out)>=6: break
        d=f'{OUT}/{aid}'; os.makedirs(d,exist_ok=True); fn=f'{len(out)+1:02d}-freesound.mp3'
        try: open(f'{d}/{fn}','wb').write(get(r['mp3'],True))
        except Exception as e: print(' x',e); continue
        out.append(dict(file=fn,source='freesound',url=r['mp3'],page=r['page'],title='File:'+r['title'],author=r['author'],license=r['license']))
    os.makedirs(f'{OUT}/{aid}',exist_ok=True); json.dump(out,open(f'{OUT}/{aid}/candidatos.json','w'),indent=1,ensure_ascii=False)
    return f"{aid} {len(out)} {[o['title'][5:40] for o in out]}"
ids=[a for a in (sys.argv[2:] or list(Q)) if not os.path.exists(f'{OUT}/{a}/candidatos.json')]
with ThreadPoolExecutor(1) as ex:
    for line in ex.map(one,ids): print(line,flush=True)

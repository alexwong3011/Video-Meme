"""Cut each armor piece from the figure crop with a background-difference matte.
usage: pieces.py SCALE IMG.png OUTDIR    (IMG = figure crop at SCALE x original resolution)"""
import numpy as np, cv2, sys, os, json
FX,FY=570,110
s=int(sys.argv[1]); src=sys.argv[2]; out=sys.argv[3]; os.makedirs(out,exist_ok=True)
fig=cv2.cvtColor(cv2.imread(src),cv2.COLOR_BGR2RGB).astype(np.float32)
H,W=fig.shape[:2]
bg=cv2.resize(np.load('bg.npy'),(W,H),interpolation=cv2.INTER_CUBIC)
am=cv2.resize(np.load('am.npy'),(W,H),interpolation=cv2.INTER_LINEAR)
D=np.sqrt(((fig-bg)**2).sum(2))
D=cv2.GaussianBlur(D,(0,0),0.35*s)
def P(pts): return np.array([[round((x-FX+0.5)*s-0.5),round((y-FY+0.5)*s-0.5)] for x,y in pts],np.int32)
def poly(pts):
    m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[P(pts)],1); return m
helm=[(795,112),(1005,112),(1005,334),(956,338),(940,356),(933,370),(920,371),(880,371),(867,370),(860,356),(844,338),(795,334)]
tasset=[(860,557),(940,557),(907,664),(893,664)]
legboot=poly([(640,752),(796,752),(796,1000),(640,1000)])|poly([(1003,752),(1160,752),(1160,1000),(1003,1000)])

regions={
 'helmet':poly(helm),
 'chestplate':(poly([(712,318),(1090,318),(1090,557),(712,557)])|poly(tasset))&(1-poly(helm)),
 'leggings':poly([(760,557),(1040,557),(1040,940),(760,940)])&(1-poly(tasset))&(1-legboot),
 'gauntlet_left':poly([(578,342),(712,342),(712,712),(578,712)]),
 'gauntlet_right':poly([(1073,342),(1207,342),(1207,712),(1073,712)]),
 'boot_left':poly([(648,752),(822,752),(822,982),(648,982)])&legboot,
 'boot_right':poly([(978,752),(1152,752),(1152,982),(978,982)])&legboot,
}
LINES=[ [(552,442),(582,474),(605,474)], [(1171,474),(1200,474),(1232,438)],
 [(587,632),(558,658)], [(1180,631),(1199,655),(1235,655)],
 [(792,690),(765,717),(690,717)], [(716,830),(698,850),(630,850)], [(1079,830),(1097,850),(1170,850)] ]
DOTS=[(587,632,6),(1180,631,6),(792,690,5),(716,830,6.5),(1079,830,6.5)]
excl=np.zeros((H,W),np.uint8)
for L in LINES: cv2.polylines(excl,[P(L)],False,1,thickness=int(7*s))
for d in DOTS: cv2.circle(excl,tuple(int(v) for v in P([d[:2]])[0]),int(round(d[2]*s)),1,-1)
cv2.polylines(excl,[P([(560,689.5),(680,689.5),(686,693),(688.5,700),(688.5,816)])],False,1,thickness=int(4*s))  # LEG PANTS panel border
excl|=poly([(686,700),(699,700),(699,816),(686,816)])
excl|=poly([(640,1000),(640,970),(747,968),(753,958),(760,948),(764,953),(800,953),(800,1000)])   # floor under left boot
excl|=poly([(1000,1000),(1000,953),(1032,953),(1037,948),(1043,958),(1050,968),(1160,970),(1160,1000)])
excl|=poly([(640,1000),(640,972),(1160,972),(1160,1000)])
keepR=1-excl
t0,t1=7.0,20.0
yy=(np.arange(H)[:,None]/s+FY)*np.ones((1,W))
floor=np.clip((yy-880)/30,0,1)           # spotlight glow on the floor: be stricter there
t0m=t0+6*floor; t1m=t1+6*floor
A=np.clip((D-t0m)/(t1m-t0m),0,1); A=A*A*(3-2*A); A*=keepR
lumd=(fig-bg).mean(2)
B=(A>0.5).astype(np.uint8)
k=int(round(1.6*s))|1
Bo=cv2.morphologyEx(B,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(k,k)))
meta={}
for name,R in regions.items():
    Bo_r=Bo&R
    n,lab,st,_=cv2.connectedComponentsWithStats(Bo_r,8)
    if n<=1: continue
    big=st[1:,cv2.CC_STAT_AREA].max()
    core=np.isin(lab,[i for i in range(1,n) if st[i,cv2.CC_STAT_AREA]>=0.03*big]).astype(np.uint8)
    Ar=A*R
    Bm=(Ar>0.06).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(Bm,8)
    ids=np.unique(lab[core>0]); ids=ids[ids>0]
    keep=np.isin(lab,ids).astype(np.uint8)
    Ar=Ar*keep
    sol=(Ar>0.3).astype(np.uint8)
    ck=int(5*s)|1
    cl=cv2.morphologyEx(sol,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(ck,ck)))
    ff=cl.copy(); m=np.zeros((H+2,W+2),np.uint8); cv2.floodFill(ff,m,(0,0),1)
    holes=((1-ff)|(cl&(1-sol))).astype(np.uint8)
    n,lab,st,_=cv2.connectedComponentsWithStats(holes,4)
    fill=np.zeros_like(holes)
    for i in range(1,n):
        msk=lab==i
        enclosed=not ff[msk].all()  # inside an enclosed hole of the closed mask
        dark=lumd[msk].mean()<-5
        if (enclosed and dark) or (st[i,4]<=(1.5*s)**2*4):
            fill[msk]=1
    a=np.maximum(Ar,fill.astype(np.float32)*R*keepR)
    # solid silhouette of this piece (closing + hole fill)
    sil=cl.copy(); m=np.zeros((H+2,W+2),np.uint8); f2=cl.copy(); cv2.floodFill(f2,m,(0,0),1); sil=(cl|(1-f2)).astype(np.uint8)
    sil=sil*R*keepR
    # shaded/dark armour surfaces that sit close to the background colour
    Ad=np.clip((-lumd-4)/8,0,1); a=np.maximum(a,Ad*sil)
    # semantic matte from the segmentation model: trust its confident interior
    amc=cv2.erode((am>0.9).astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(int(3*s)|1,int(3*s)|1)))
    a=np.maximum(a,amc*cv2.dilate(sil,np.ones((3,3),np.uint8))*R*keepR)
    # de-speckle the soft zone (keeps fully opaque interior and crisp edges untouched)
    med=cv2.medianBlur((a*255).astype(np.uint8),5 if s>1 else 3).astype(np.float32)/255
    a=np.where((a>0.02)&(a<0.98),med,a)
    a=np.clip((a-0.08)/0.92,0,1)
    n,lab,st,_=cv2.connectedComponentsWithStats((a>0.02).astype(np.uint8),8)
    if n>2:
        main=1+np.argmax(st[1:,4]); keepc=[i for i in range(1,n) if i==main or st[i,4]>0.01*st[main,4]]
        a=a*np.isin(lab,keepc)
    np.save(f'{out}/{name}_a.npy',a.astype(np.float16))
    aa=np.maximum(a,0.25)[...,None]
    F=np.clip(bg+(fig-bg)/aa,0,255)
    F=np.where(a[...,None]>0.98,fig,F)
    ys,xs=np.where(a>0.02); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    pad=2*s; x0=max(0,x0-pad);y0=max(0,y0-pad);x1=min(W,x1+pad);y1=min(H,y1+pad)
    rgba=np.dstack([F,a*255])[y0:y1,x0:x1]
    cv2.imwrite(f'{out}/{name}.png',cv2.cvtColor(np.round(rgba).astype(np.uint8),cv2.COLOR_RGBA2BGRA))
    meta[name]={'x':int(x0),'y':int(y0),'w':int(x1-x0),'h':int(y1-y0)}
json.dump({'scale':s,'figure_w':W,'figure_h':H,'pieces':meta},open(f'{out}/layout.json','w'),indent=1)
print(meta)

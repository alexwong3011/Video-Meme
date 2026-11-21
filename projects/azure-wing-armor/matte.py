"""Background model for the reference sheet.
Reads cut/<piece>.png (segmentation-model mattes of 3x crops) and writes am.npy (model alpha),
bg.npy (smooth background estimate) and D.npy (colour distance to background) for pieces.py."""
import numpy as np, cv2
from PIL import Image
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from views import VIEWS
V=VIEWS[sys.argv[1]]   # usage: matte.py VIEW   (cwd = work dir holding cut/<box>.png from prep.py + cutout.mjs)
SRC=os.path.join(os.path.dirname(os.path.abspath(__file__)),V['source'])
FX,FY,FX2,FY2=V['figure']
img=cv2.cvtColor(cv2.imread(SRC),cv2.COLOR_BGR2RGB).astype(np.float32)
fig=img[FY:FY2,FX:FX2]
H,W=fig.shape[:2]
boxes=V["seg_boxes"]
# model alpha at original res, max over piece crops
am=np.zeros((H,W),np.float32)
for k,(x0,y0,x1,y1) in boxes.items():
    a=np.array(Image.open(f'cut/{k}.png').convert('RGBA'))[:,:,3].astype(np.float32)/255
    a=cv2.resize(a,(x1-x0,y1-y0),interpolation=cv2.INTER_AREA)
    sl=(slice(y0-FY,y1-FY),slice(x0-FX,x1-FX))
    am[sl]=np.maximum(am[sl],a)
np.save('am.npy',am)
# background estimate: normalized convolution of pixels far from figure
fgz=cv2.dilate((am>0.03).astype(np.uint8),np.ones((15,15),np.uint8))
w=(1-fgz).astype(np.float32)
# reject bright text/lines: only keep pixels darker than local median+8
lum=fig.mean(2)
med=cv2.medianBlur(lum.astype(np.uint8),31).astype(np.float32)
w*= (lum<med+8)
sig=25
num=cv2.GaussianBlur(fig*w[...,None],(0,0),sig); den=cv2.GaussianBlur(w,(0,0),sig)
bg=num/np.maximum(den,1e-4)[...,None]
# second pass with larger sigma to fill big holes
num2=cv2.GaussianBlur(fig*w[...,None],(0,0),80); den2=cv2.GaussianBlur(w,(0,0),80)
bg2=num2/np.maximum(den2,1e-4)[...,None]
t=np.clip(den/0.3,0,1)[...,None]
bg=bg*t+bg2*(1-t)
np.save('bg.npy',bg)
D=np.sqrt(((fig-bg)**2).sum(2))
np.save('D.npy',D)
print('bg range',bg.min(),bg.max(),'D pct over bg',np.percentile(D[w>0],[50,90,99,99.9]))
cv2.imwrite('D.png',np.clip(D*4,0,255).astype(np.uint8))
cv2.imwrite('bg.png',cv2.cvtColor(np.clip(bg,0,255).astype(np.uint8),cv2.COLOR_RGB2BGR))

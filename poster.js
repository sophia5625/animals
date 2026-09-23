let posterGeneration=0,posterUrl=null,posterFile=null;
function clearPoster(){posterGeneration++;if(posterUrl)URL.revokeObjectURL(posterUrl);posterUrl=null;posterFile=null;}
function loadPosterImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('插画加载失败，请重试'));img.src=src;});}
function wrapPosterText(ctx,text,x,y,width,lineHeight){let line='';for(const char of text){if(ctx.measureText(line+char).width>width&&line){ctx.fillText(line,x,y);line=char;y+=lineHeight;}else line+=char;}if(line)ctx.fillText(line,x,y);return y+lineHeight;}
async function createAnimalPoster(animal){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');if(!c)throw new Error('当前浏览器暂不支持海报生成');
 const art=await loadPosterImage('animals.png');
 const palette={'月光小猫':['#263ba7','#edf0ff'],'棉花小兔':['#934763','#fff0f4'],'向阳小狗':['#a34f18','#fff2d8'],'漫游小狐':['#a64027','#fff0e8'],'森林小熊':['#3c634e','#edf5ee'],'浪花海獭':['#136a84','#e6f6fa']};const [ink,paper]=palette[animal.name];
 c.fillStyle=paper;c.fillRect(0,0,1080,1440);c.fillStyle=ink;c.fillRect(0,0,1080,540);
 c.save();c.beginPath();c.roundRect(44,44,992,496,28);c.clip();c.drawImage(art,0,60,art.width,art.height-160,44,44,992,496);c.restore();
 const font='"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';c.textAlign='center';c.fillStyle=ink;c.font='600 25px '+font;c.fillText('I N N E R   A N I M A L   C L U B',540,598);c.font='500 30px '+font;c.fillText('我的心里，住着一只',540,657);c.font='900 84px '+font;c.fillText(animal.name,540,760);
 c.font='500 25px '+font;const widths=animal.tags.map(t=>c.measureText(t).width+42);let x=(1080-widths.reduce((s,w)=>s+w,0)-32)/2;animal.tags.forEach((t,i)=>{c.strokeStyle=ink;c.lineWidth=1.5;c.beginPath();c.roundRect(x,804,widths[i],48,24);c.stroke();c.fillText(t,x+widths[i]/2,837);x+=widths[i]+16;});
 c.font='600 35px '+font;c.fillStyle='#282c39';wrapPosterText(c,animal.line,540,928,880,53);
 c.fillStyle='#ffffff';c.beginPath();c.roundRect(64,1033,952,208,22);c.fill();c.textAlign='left';c.fillStyle=ink;c.font='700 26px '+font;c.fillText('给今天的自己，一件小事',100,1084);c.fillStyle='#44495c';c.font='400 30px '+font;wrapPosterText(c,animal.task,100,1140,870,46);
 c.textAlign='center';c.fillStyle=ink;c.font='700 27px '+font;c.fillText('✦ 心里住着谁 · 内心小动物测试',540,1310);c.fillStyle='#666a77';c.font='400 22px '+font;c.fillText('每一种你，都有自己的可爱。',540,1355);c.font='400 18px '+font;c.fillText('娱乐与自我探索 · 本次结果不代表固定人格',540,1398);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('海报生成失败')),'image/png'));return {blob,file:new File([blob],`我的内心小动物-${animal.name}.png`,{type:'image/png'})};
}
async function mountAnimalPoster(animal){
 clearPoster();const generation=posterGeneration,region=document.getElementById('poster-region');if(!region)return;
 const status=document.getElementById('poster-status'),save=document.getElementById('save-poster'),share=document.getElementById('share-poster'),retry=document.getElementById('retry-poster');retry.hidden=true;
 try{const result=await createAnimalPoster(animal);if(generation!==posterGeneration||!region.isConnected)return;posterFile=result.file;posterUrl=URL.createObjectURL(result.blob);const img=document.getElementById('poster-image');img.src=posterUrl;img.hidden=false;save.href=posterUrl;save.download=posterFile.name;save.hidden=false;share.disabled=false;status.textContent='海报已生成。可保存图片，或长按下方海报保存到相册。';
 share.onclick=async()=>{if(!posterFile)return;try{if(navigator.canShare?.({files:[posterFile]})&&navigator.share){await navigator.share({files:[posterFile]});status.textContent='已交给系统分享。';}else{status.textContent='此浏览器不支持直接分享图片，请先保存海报，再从相册分享到小红书或微信。';img.scrollIntoView({behavior:'smooth',block:'center'});}}catch(e){status.textContent=e.name==='AbortError'?'已取消分享，海报仍可保存。':'分享未完成，请保存海报后从相册分享。';}};
 save.onclick=()=>{status.textContent='若没有自动下载，请长按海报保存；也可在系统浏览器中打开后下载。';};
 }catch(e){if(generation!==posterGeneration)return;status.textContent='海报暂未生成，请检查网络后重试。';retry.hidden=false;retry.onclick=()=>mountAnimalPoster(animal);}
}

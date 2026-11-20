/* ============ Hallucindriod · 幻卓 · P2P 联机（WebRTC / PeerJS） ============
 * 参考 borderops 的纯静态联机方案：
 *   · 用公共 PeerJS 信令 + STUN 建立 P2P DataChannel，无需自建后端。
 *   · 每个用户以「用户名哈希」作为固定 Peer ID，别人可以通过用户名找到他。
 *   · 搜索好友时尝试直连：连通=真人；超时/失败=视为不存在，由调用方降级为 LLM 账号。
 *   · 公共信令不可用时（被墙/离线）自动降级，不影响本地功能。
 */
(function(){
  var PEER_LIB='vendor/peerjs.min.js';
  var PREFIX='hallucindriod-v1-';
  var libPromise=null;
  var peer=null, myId='', myName='';
  var conns={};          // peerId -> DataConnection
  var inflight={};       // peerId -> Promise（避免重复连接）
  var api={ online:false, lastError:'', onMessage:null, onPool:null };

  function hash(s){
    var h=5381;
    for(var i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))>>>0; }
    return h.toString(36);
  }
  function idFor(name){ return PREFIX+hash(String(name||'').trim().toLowerCase()); }

  function loadLib(){
    if(window.Peer) return Promise.resolve(true);
    if(libPromise) return libPromise;
    libPromise=new Promise(function(resolve){
      var s=document.createElement('script');
      s.src=PEER_LIB;
      s.onload=function(){ resolve(!!window.Peer); };
      s.onerror=function(){ api.lastError='lib-load-failed'; resolve(false); };
      document.head.appendChild(s);
    });
    return libPromise;
  }

  function peerOpts(){
    return {
      debug:0,
      config:{
        iceServers:[
          {urls:'stun:stun.l.google.com:19302'},
          {urls:'stun:global.stun.twilio.com:3478'}
        ]
      }
    };
  }

  function bindConn(conn){
    var id=conn.peer;
    conns[id]=conn;
    conn.on('data',function(d){
      try{ handleData(id,d); }catch(e){}
    });
    conn.on('close',function(){ delete conns[id]; });
    conn.on('error',function(){ delete conns[id]; });
  }

  function handleData(peerId,d){
    if(!d||typeof d!=='object')return;
    if(d.t==='hello'){
      // 对方资料
      var f=(window.__SOCIAL&&window.__SOCIAL.friends||[]).find(function(x){return x.peerId===peerId});
      if(f){ f.name=d.name||f.name; f.avatar=d.avatar||f.avatar; f.level=d.level||f.level; f.isAI=false; f.online=true;
        if(window.HOS&&window.HOS.saveSocial)window.HOS.saveSocial(window.__SOCIAL); }
      return;
    }
    if(d.t==='msg'&&api.onMessage){
      api.onMessage(peerId,{text:String(d.text||'').slice(0,500),ts:Number(d.ts)||Date.now()});
    }
    if(d.t==='pool'&&d.video){
      // 收到好友广播的短视频 → 写入本机公共池，别人的视频也能被刷到（P0）
      try{
        var pool=JSON.parse(localStorage.getItem('hallucindriod_pool_v1')||'[]');
        if(!Array.isArray(pool))pool=[];
        var v=d.video;
        var title=String(v&&v.title||'').trim().slice(0,40);
        if(title&&!pool.some(function(x){return String(x&&x.title||'').slice(0,40)===title})){
          pool.unshift({
            title:title, up:String(v.up||'@好友').slice(0,18),
            desc:String(v.desc||'').slice(0,60), style:String(v.style||'night'),
            music:String(v.music||'原声').slice(0,18),
            likes:Number(v.likes)||0, shares:Number(v.shares)||0,
            comments:Array.isArray(v.comments)?v.comments.slice(0,6):[],
            mine:false, ts:Date.now()
          });
          pool=pool.slice(0,60);
          localStorage.setItem('hallucindriod_pool_v1',JSON.stringify(pool));
          if(api.onPool)api.onPool(v);
        }
      }catch(e){}
    }
  }

  api.init=function(userName){
    myName=String(userName||'').trim();
    if(!myName) return Promise.resolve(false);
    if(peer && api.online) return Promise.resolve(true);
    return loadLib().then(function(ok){
      if(!ok){ api.lastError='lib-missing'; return false; }
      return new Promise(function(resolve){
        var id=idFor(myName);
        var p;
        try{ p=new window.Peer(id,peerOpts()); }catch(e){ api.lastError='ctor:'+e.message; resolve(false); return; }
        var settled=false;
        var timer=setTimeout(function(){
          if(settled)return; settled=true;
          api.lastError='signaling-timeout';
          try{ p.destroy(); }catch(e){}
          resolve(false);
        },9000);
        p.on('open',function(){
          if(settled)return; settled=true; clearTimeout(timer);
          peer=p; myId=p.id; api.online=true; api.lastError='';
          p.on('connection',function(c){
            bindConn(c);
            c.on('open',function(){
              try{ c.send({t:'hello',name:myName,avatar:(window.__SOCIAL&&window.__SOCIAL.profile&&window.__SOCIAL.profile.avatar)||'🙂'}); }catch(e){}
            });
          });
          // 已存在的 ID 冲突（同名用户）
          p.on('error',function(e){
            if(e&&e.type==='unavailable-id'){ api.lastError='id-taken'; api.online=false; }
          });
          resolve(true);
        });
        p.on('error',function(e){
          if(settled)return; settled=true; clearTimeout(timer);
          api.lastError=(e&&e.type)||'err';
          resolve(false);
        });
      });
    }).catch(function(e){ api.lastError=String(e&&e.message||e); return false; });
  };

  // 搜索真人：连得上=存在，超时=不存在
  api.findUser=function(name){
    if(!api.online||!peer) return Promise.resolve(null);
    var target=idFor(name);
    if(target===myId) return Promise.resolve(null);
    if(conns[target] && conns[target].open){
      return Promise.resolve({name:name,peerId:target,isAI:false,online:true,avatar:'🙂',level:'Lv1',bio:'在线好友',msgs:[]});
    }
    if(inflight[target]) return inflight[target];
    var p=new Promise(function(resolve){
      var done=false;
      var conn;
      try{ conn=peer.connect(target,{reliable:true}); }catch(e){ resolve(null); return; }
      var finish=function(v){
        if(done)return; done=true; clearTimeout(timer);
        if(!v){ try{conn.close()}catch(e){} }
        resolve(v);
      };
      var timer=setTimeout(function(){ finish(null); },3000);
      conn.on('open',function(){
        bindConn(conn);
        try{ conn.send({t:'hello',name:myName,avatar:'🙂'}); }catch(e){}
        finish({name:name,peerId:target,isAI:false,online:true,avatar:'🙂',level:'Lv1',bio:'真人好友 · 在线',msgs:[]});
      });
      conn.on('error',function(){ finish(null); });
      conn.on('close',function(){ finish(null); });
    });
    inflight[target]=p;
    p.then(function(){ delete inflight[target] });
    return p;
  };

  api.send=function(peerId,msg){
    var c=conns[peerId];
    if(c&&c.open){ try{ c.send(msg); return true; }catch(e){} }
    return false;
  };

  // 广播给所有在线连接（engine.js 发布视频时调用；此前该 API 不存在，静默失效）
  api.broadcast=function(msg){
    var n=0;
    Object.keys(conns).forEach(function(id){
      var c=conns[id];
      if(c&&c.open){ try{ c.send(msg); n++ }catch(e){} }
    });
    return n;
  };

  api.isOnline=function(){ return api.online; };
  api.status=function(){ return {online:api.online,id:myId,error:api.lastError}; };

  window.P2P=api;
})();

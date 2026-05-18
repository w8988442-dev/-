// core same as before
let DB={users:[],logs:[],msgs:[],lockUntil:0,failCount:0};
function saveDB(){localStorage.setItem('DB',JSON.stringify(DB))}
function loadDB(){DB=JSON.parse(localStorage.getItem('DB')||'{"users":[],"logs":[],"msgs":[],"lockUntil":0,"failCount":0}')}
loadDB();
function now(){return new Date().toLocaleString()}
function addLog(a,p=""){DB.logs.unshift({action:a,phone:p,time:now()});saveDB();}
function sendMsg(p,t){DB.msgs.push({phone:p,text:t,time:now()});saveDB();}
function addUser(p){if(DB.users.find(u=>u.phone===p))return false;DB.users.push({phone:p,password:"abc12345",points:0,reset:false});saveDB();return true;}
function getUser(p){return DB.users.find(u=>u.phone===p);}
function addPoints(p,pts){let u=getUser(p);if(!u)return false;u.points+=pts;addLog("加积分+"+pts,p);sendMsg(p,"积分变动 +"+pts);saveDB();return true;}
function resetPassword(p){let u=getUser(p);if(!u)return false;u.password="abc12345";u.reset=true;addLog("重置密码",p);saveDB();return true;}
function checkAccess(pwd){if(Date.now()<DB.lockUntil)return"LOCK";if(pwd==="325000"){DB.failCount=0;saveDB();return"OK";}else{DB.failCount++;if(DB.failCount>=5){DB.lockUntil=Date.now()+600000;saveDB();return"LOCK";}saveDB();return"FAIL";}}

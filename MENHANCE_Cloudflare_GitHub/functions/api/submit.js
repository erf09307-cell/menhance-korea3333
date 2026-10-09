import { json, sameOrigin } from "../_utils.js";
export async function onRequestPost({request,env}) {
  if(!sameOrigin(request)) return json({error:"잘못된 요청입니다."},403);
  if(!env.LEADS_DB||!env.TURNSTILE_SECRET) return json({error:"서버 설정이 완료되지 않았습니다."},503);
  const length=Number(request.headers.get("Content-Length")||0); if(length>12000)return json({error:"요청 크기가 너무 큽니다."},413);
  let data; try{data=await request.json()}catch{return json({error:"요청 형식이 올바르지 않습니다."},400)}
  if(typeof data.website==="string"&&data.website.trim())return json({ok:true});
  const topics=["예약 가능 일정","상담 절차","비용 및 서비스 범위","기타 문의"];
  const times=["","오전 09:00–12:00","오후 12:00–18:00","저녁 18:00–21:00"];
  const topic=typeof data.topic==="string"?data.topic:"", name=typeof data.name==="string"?data.name.trim():"", contact=typeof data.contact==="string"?data.contact.trim():"", time=typeof data.time==="string"?data.time:"", token=typeof data.turnstileToken==="string"?data.turnstileToken:"";
  if(!topics.includes(topic))return json({error:"문의 주제를 선택해 주세요."},400);
  if(!contact||contact.length>160||name.length>80)return json({error:"연락처를 확인해 주세요."},400);
  if(!times.includes(time))return json({error:"연락 시간을 확인해 주세요."},400);
  if(data.consent!==true)return json({error:"개인정보 안내 동의가 필요합니다."},400);
  if(!token||token.length>4096)return json({error:"보안 인증을 완료해 주세요."},400);
  const verifyBody=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token}); const ip=request.headers.get("CF-Connecting-IP"); if(ip)verifyBody.set("remoteip",ip);
  let verification; try{const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:verifyBody});verification=await r.json()}catch{return json({error:"보안 인증을 확인할 수 없습니다. 다시 시도해 주세요."},502)}
  if(!verification.success)return json({error:"보안 인증에 실패했습니다. 다시 시도해 주세요."},400);
  try{await env.LEADS_DB.prepare("INSERT INTO leads (topic,name,contact,preferred_time,status,consent) VALUES (?,?,?,?,'new',1)").bind(topic,name||null,contact,time||null).run();return json({ok:true})}catch{return json({error:"문의 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."},500)}
}
export function onRequestGet(){return json({error:"Method not allowed"},405,{Allow:"POST"})}

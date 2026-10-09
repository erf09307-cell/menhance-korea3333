import {json,sameOrigin} from "../../_utils.js";
export async function onRequestPost({request}){if(!sameOrigin(request))return json({error:"잘못된 요청입니다."},403);return json({ok:true},200,{"Set-Cookie":"mh_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"});}

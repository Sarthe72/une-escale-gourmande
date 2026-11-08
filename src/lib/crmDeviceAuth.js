export function validDeviceKey(key){
 return key?.kty==='EC'&&key.crv==='P-256'&&typeof key.x==='string'&&typeof key.y==='string'&&/^[A-Za-z0-9_-]{43}$/.test(key.x)&&/^[A-Za-z0-9_-]{43}$/.test(key.y)&&!key.d;
}
export async function verifyDeviceProof(key,challenge,signature){
 if(!validDeviceKey(key)||typeof signature!=='string'||!/^[A-Za-z0-9_-]{86}$/.test(signature))return false;
 try{
  const publicKey=await crypto.subtle.importKey('jwk',key,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const raw=Uint8Array.from(atob(signature.replaceAll('-','+').replaceAll('_','/')+'=='),c=>c.charCodeAt(0));
  return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,raw,new TextEncoder().encode(challenge));
 }catch{return false;}
}

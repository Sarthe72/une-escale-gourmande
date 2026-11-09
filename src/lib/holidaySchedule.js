export function scheduledFlag(flag,opensAt,now=Date.now()){
 if(flag!=='true')return false;
 if(!opensAt)return true; // Local fixtures and explicit immediate operation.
 const opening=Date.parse(opensAt);
 return Number.isFinite(opening)&&now>=opening;
}

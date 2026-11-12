export function scheduledFlag(flag,opensAt,now=Date.now()){
 if(flag!=='true')return false;
 if(!opensAt)return true; // Local fixtures and explicit immediate operation.
 const opening=Date.parse(opensAt);
 return Number.isFinite(opening)&&now>=opening;
}

export const HOLIDAY_BANNER_END_AT='2026-12-29T00:01:00+01:00';
export function holidayBannerVisible(flag,opensAt,now=Date.now()){
 return scheduledFlag(flag,opensAt,now)&&now<Date.parse(HOLIDAY_BANNER_END_AT);
}

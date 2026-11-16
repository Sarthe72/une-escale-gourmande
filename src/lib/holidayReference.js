// Display reference only: the full identifier remains the database/API key.
export function holidayReference(id,sequence){
 if(Number.isSafeInteger(sequence)&&sequence>0)return 'NOEL-'+String(sequence+25).padStart(4,'0');
 const value=String(id||'');
 return /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(value)?'NOEL-'+value.replaceAll('-','').slice(0,10).toUpperCase():value;
}

// Display reference only: the full identifier remains the database/API key.
export function holidayReference(id){
 const value=String(id||'');
 return /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(value)?'NOEL-'+value.replaceAll('-','').slice(0,10).toUpperCase():value;
}

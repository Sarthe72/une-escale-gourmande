let pending,expires=0;
export function holidayCatalog(){
 const now=Date.now();
 if(!pending||now>=expires){expires=now-now%60000+60000;pending=fetch('/api/holiday/catalog',{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Catalogue indisponible');return response.json();}).catch(error=>{pending=undefined;throw error;});}
 return pending;
}

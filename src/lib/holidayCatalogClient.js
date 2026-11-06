let pending;
export function holidayCatalog(){
 if(!pending)pending=fetch('/api/holiday/catalog').then(async response=>{if(!response.ok)throw new Error('Catalogue indisponible');return response.json();});
 return pending;
}

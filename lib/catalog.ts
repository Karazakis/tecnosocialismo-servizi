export const serviceCategories=[
  {id:"tecnico",name:"Servizi tecnici",mark:"TC",copy:"Casa, riparazioni, digitale e mobilità",color:"#62b4ff",subcategories:["Casa e impianti","Riparazioni","Assistenza digitale","Mobilità","Artigianato"]},
  {id:"salute",name:"Salute",mark:"SL",copy:"Prevenzione e professioni sanitarie verificate",color:"#6ee7b1",subcategories:["Fisioterapia","Psicologia","Nutrizione","Infermieristica","Prevenzione"]},
  {id:"cura",name:"Cura",mark:"CR",copy:"Supporto quotidiano, autonomia e accompagnamento",color:"#f3a6cb",subcategories:["Anziani","Infanzia","Autonomia","Accompagnamento","Animali"]},
  {id:"didattica",name:"Didattica",mark:"DI",copy:"Lezioni, tutoraggio e saperi tra pari",color:"#b09cff",subcategories:["Scuola e università","Lingue","Tecnologia","Arti","Competenze pratiche"]},
] as const;
export type ServiceCategory=typeof serviceCategories[number]["id"];
export function categoryInfo(id:string){return serviceCategories.find((item)=>item.id===id)??serviceCategories[0]}

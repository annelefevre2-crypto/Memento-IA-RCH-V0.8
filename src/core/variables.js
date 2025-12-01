export function buildVariablesUI(container, fiche){
  container.innerHTML="";
  fiche.prompt.variables.forEach(v=>{
    const div=document.createElement("div");
    div.className="var-field";
    const label=document.createElement("label");
    label.textContent=v.label;
    div.appendChild(label);
    const input=document.createElement("input");
    input.dataset.id=v.id;
    div.appendChild(input);
    container.appendChild(div);
  });
}
export function getValues(fiche){
  const vals={};
  fiche.prompt.variables.forEach(v=>{
    const el=document.querySelector(`[data-id="${v.id}"]`);
    vals[v.id]=el?el.value:"";
  });
  return vals;
}
export function generatePrompt(fiche,vals){
  let p=fiche.prompt.base;
  Object.keys(vals).forEach(k=>{
    p=p.replaceAll(`{{${k}}}`,vals[k]);
  });
  return p;
}

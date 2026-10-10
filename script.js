const starterRecipes = [
  {id:1,title:"Gratin de pâtes",category:"Plat",time:35,emoji:"🧀",description:"Un gratin fondant, doré sur le dessus et facile à partager.",ingredients:["300 g de pâtes","20 cl de crème fraîche","150 g de fromage râpé","1 oignon","Sel et poivre"],steps:["Préchauffer le four à 200 °C.","Faire cuire les pâtes selon les indications du paquet, puis les égoutter.","Faire revenir l'oignon émincé, puis mélanger avec la crème et les pâtes.","Verser dans un plat, ajouter le fromage râpé et enfourner 15 à 20 minutes."]},
  {id:2,title:"Cookies maison",category:"Dessert",time:25,emoji:"🍪",description:"Des cookies moelleux au centre et légèrement croustillants.",ingredients:["250 g de farine","125 g de beurre mou","100 g de sucre","1 œuf","150 g de pépites de chocolat","1/2 sachet de levure"],steps:["Préchauffer le four à 180 °C.","Mélanger le beurre mou et le sucre, puis ajouter l'œuf.","Incorporer la farine et la levure, puis les pépites de chocolat.","Former des boules sur une plaque et cuire 10 à 12 minutes."]},
  {id:3,title:"Curry de pois chiches",category:"Végétarien",time:30,emoji:"🍛",description:"Un curry parfumé et réconfortant, parfait avec du riz.",ingredients:["400 g de pois chiches cuits","200 ml de lait de coco","200 g de tomates concassées","1 oignon","1 c. à soupe de curry","150 g de riz"],steps:["Faire cuire le riz selon les instructions du paquet.","Faire revenir l'oignon émincé avec le curry dans une poêle.","Ajouter les tomates et le lait de coco, puis laisser mijoter 10 minutes.","Ajouter les pois chiches et réchauffer 5 à 10 minutes. Servir avec le riz."]},
  {id:4,title:"Pancakes du dimanche",category:"Dessert",time:20,emoji:"🥞",description:"Une pile de pancakes simples pour un petit-déjeuner gourmand.",ingredients:["200 g de farine","2 œufs","25 cl de lait","1 sachet de levure","2 c. à soupe de sucre"],steps:["Mélanger la farine, la levure et le sucre.","Ajouter les œufs puis le lait progressivement.","Verser de petites louches dans une poêle chaude légèrement huilée.","Retourner quand des bulles apparaissent et cuire l'autre côté."]},
  {id:5,title:"Salade méditerranéenne",category:"Végétarien",time:15,emoji:"🥗",description:"Une salade fraîche, colorée et prête en quelques minutes.",ingredients:["1 concombre","250 g de tomates cerises","150 g de feta","1 poignée d'olives","2 c. à soupe d'huile d'olive","Origan"],steps:["Laver et couper les légumes.","Émietter la feta et ajouter les olives.","Assaisonner avec l'huile d'olive et l'origan, puis mélanger."]},
  {id:6,title:"Fondant au chocolat",category:"Dessert",time:30,emoji:"🍫",description:"Un dessert au chocolat intense avec un cœur délicieusement fondant.",ingredients:["200 g de chocolat noir","100 g de beurre","3 œufs","80 g de sucre","50 g de farine"],steps:["Préchauffer le four à 180 °C.","Faire fondre le chocolat avec le beurre.","Fouetter les œufs et le sucre, puis incorporer le chocolat fondu et la farine.","Verser dans un moule beurré et cuire environ 12 à 15 minutes selon le fondant souhaité."]}
];

let recipes = [...starterRecipes];
try {
  const saved = JSON.parse(localStorage.getItem("grimoire-recipes") || "[]");
  recipes = [...recipes, ...saved];
} catch {}
let currentRecipe = null;
let shoppingItems = [];
try { shoppingItems = JSON.parse(localStorage.getItem("grimoire-shopping-list") || "[]"); } catch {}


const grid = document.querySelector("#recipe-grid");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const dialog = document.querySelector("#recipe-dialog");
const dialogContent = document.querySelector("#dialog-content");
const toast = document.querySelector("#toast");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function getVisibleRecipes() {
  const term = searchInput.value.trim().toLocaleLowerCase("fr");
  const category = categoryFilter.value;
  return recipes.filter(r => (category === "Toutes" || r.category === category) &&
    (r.title.toLocaleLowerCase("fr").includes(term) || r.ingredients.some(i => i.toLocaleLowerCase("fr").includes(term))));
}
function saveShoppingItems() {
  try { localStorage.setItem("grimoire-shopping-list", JSON.stringify(shoppingItems)); } catch {}
}
function renderShoppingList() {
  const select = document.querySelector("#shopping-recipe-select");
  const previous = select.value;
  select.innerHTML = recipes.map(r => `<option value="${r.id}">${escapeHTML(r.title)}</option>`).join("");
  if (recipes.some(r => String(r.id) === previous)) select.value = previous;

  const itemsHost = document.querySelector("#shopping-list-items");
  document.querySelector("#shopping-empty").hidden = shoppingItems.length > 0;
  document.querySelector("#shopping-count").textContent = shoppingItems.length;
  itemsHost.innerHTML = shoppingItems.map(item => `
    <div class="shopping-item ${item.atHome ? "is-home" : ""}">
      <span aria-hidden="true">${item.atHome ? "✓" : "🛒"}</span>
      <div class="item-main"><span class="item-name">${escapeHTML(item.name)}</span><span class="item-source">${escapeHTML(item.source || "Ajout manuel")}</span></div>
      <label><input type="checkbox" data-at-home="${item.id}" ${item.atHome ? "checked" : ""}> Déjà à la maison</label>
      <button class="secondary-btn" type="button" data-remove-shopping="${item.id}" aria-label="Supprimer ${escapeHTML(item.name)}">Retirer</button>
    </div>`).join("");
  const toBuy = shoppingItems.filter(item => !item.atHome).length;
  const atHome = shoppingItems.length - toBuy;
  document.querySelector("#shopping-to-buy").textContent = `${toBuy} ${toBuy > 1 ? "ingrédients à acheter" : "ingrédient à acheter"}`;
  document.querySelector("#shopping-at-home").textContent = `${atHome} déjà à la maison`;
}
function addRecipeIngredientsToShopping(recipeId) {
  const recipe = recipes.find(r => r.id === Number(recipeId));
  if (!recipe) return;
  recipe.ingredients.forEach(name => {
    shoppingItems.push({id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name, source: recipe.title, atHome: false});
  });
  saveShoppingItems();
  renderShoppingList();
  showToast(`Ingrédients de « ${recipe.title} » ajoutés à ta liste.`);
}
function renderRecipes() {
  const visible = getVisibleRecipes();
  document.querySelector("#recipe-count").textContent = visible.length;
  document.querySelector("#empty-state").hidden = visible.length !== 0;
  grid.innerHTML = visible.map(r => `
    <article class="recipe-card">
      <div class="food-art" data-category="${escapeHTML(r.category)}"><span class="category-pill">${escapeHTML(r.category)}</span><span>${r.emoji || "🍽️"}</span></div>
      <div class="card-body"><div class="card-meta">◷ ${Number(r.time)} min · ${r.ingredients.length} ingrédients</div>
      <h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description || "Une recette à découvrir dans le grimoire.")}</p>
      <div class="card-actions"><button data-open="${r.id}">Voir la recette ↗</button><button data-shopping="${r.id}">Liste de courses</button></div></div>
    </article>`).join("");
}
function showToast(message) {
  toast.textContent = message; toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}
function openRecipe(id, shopping = false) {
  currentRecipe = recipes.find(r => r.id === Number(id));
  if (!currentRecipe) return;
  const r = currentRecipe;
  dialogContent.innerHTML = `
    <p class="eyebrow">LA RECETTE DU GRIMOIRE</p><h2 class="dialog-title">${escapeHTML(r.title)}</h2>
    <p class="dialog-meta">◷ ${Number(r.time)} minutes · ${escapeHTML(r.category)} · ${r.ingredients.length} ingrédients</p>
    <h3>Les ingrédients</h3><ul class="ingredient-list">${r.ingredients.map(i=>`<li>${escapeHTML(i)}</li>`).join("")}</ul>
    <h3>La préparation</h3><ol class="step-list">${r.steps.map(s=>`<li>${escapeHTML(s)}</li>`).join("")}</ol>
    <div id="shopping-panel" class="shopping-list" ${shopping ? "" : "hidden"}><h3>🛒 Ma liste de courses</h3><p class="dialog-meta">Coche les ingrédients au fur et à mesure.</p>${r.ingredients.map((i,n)=>`<label><input type="checkbox"><span>${escapeHTML(i)}</span></label>`).join("")}
    <div class="dialog-buttons"><button id="copy-shopping">Copier la liste</button><button class="secondary" id="share-shopping">Partager</button></div></div>
    <div class="dialog-buttons"><button id="show-shopping">🛒 Générer la liste de courses</button><button class="secondary" id="add-to-global-shopping">Ajouter à ma liste de courses</button><button class="secondary" id="share-recipe">Partager la recette</button></div>`;
  dialog.showModal();
  document.querySelector("#show-shopping").addEventListener("click", () => {
    document.querySelector("#shopping-panel").hidden = false;
    document.querySelector("#shopping-panel").scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  document.querySelector("#copy-shopping").addEventListener("click", () => copyText(r.ingredients.map(i=>"☐ "+i).join("\n")));
  document.querySelector("#share-shopping").addEventListener("click", () => shareText("Ma liste de courses — "+r.title+"\n"+r.ingredients.map(i=>"☐ "+i).join("\n")));
  document.querySelector("#add-to-global-shopping").addEventListener("click", () => {
    addRecipeIngredientsToShopping(r.id);
    dialog.close();
    document.querySelector("#courses").scrollIntoView({behavior:"smooth"});
  });
  document.querySelector("#share-recipe").addEventListener("click", () => shareText(r.title+"\n\nIngrédients :\n"+r.ingredients.join("\n")+"\n\nPréparation :\n"+r.steps.map((s,i)=>(i+1)+". "+s).join("\n")));
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); showToast("Copié dans le presse-papiers !"); }
  catch { window.prompt("Copie le texte ci-dessous :", text); }
}
async function shareText(text) {
  if (navigator.share) { try { await navigator.share({title:"Mon Grimoire Gourmand",text}); } catch {} }
  else copyText(text);
}
document.querySelector("#search-form").addEventListener("submit", e => {e.preventDefault(); renderRecipes(); document.querySelector("#recettes").scrollIntoView({behavior:"smooth"});});
document.querySelector("#add-recipe-to-shopping").addEventListener("click", () => {
  addRecipeIngredientsToShopping(document.querySelector("#shopping-recipe-select").value);
});
document.querySelector("#shopping-list-items").addEventListener("change", e => {
  const checkbox = e.target.closest("[data-at-home]");
  if (!checkbox) return;
  const item = shoppingItems.find(i => String(i.id) === checkbox.dataset.atHome);
  if (item) { item.atHome = checkbox.checked; saveShoppingItems(); renderShoppingList(); }
});
document.querySelector("#shopping-list-items").addEventListener("click", e => {
  const remove = e.target.closest("[data-remove-shopping]");
  if (!remove) return;
  shoppingItems = shoppingItems.filter(i => String(i.id) !== remove.dataset.removeShopping);
  saveShoppingItems(); renderShoppingList();
});
document.querySelector("#clear-shopping").addEventListener("click", () => {
  if (!shoppingItems.length) return;
  if (confirm("Vider toute la liste de courses ?")) { shoppingItems = []; saveShoppingItems(); renderShoppingList(); }
});
document.querySelector("#copy-shopping-all").addEventListener("click", () => {
  const toBuy = shoppingItems.filter(i => !i.atHome);
  if (!toBuy.length) { showToast("Rien à acheter : tout est coché !"); return; }
  copyText("MA LISTE DE COURSES\n" + toBuy.map(i => "☐ " + i.name + " — " + i.source).join("\n"));
});
searchInput.addEventListener("input", renderRecipes);
categoryFilter.addEventListener("change", renderRecipes);
document.querySelectorAll("[data-search]").forEach(b => b.addEventListener("click", () => {searchInput.value=b.dataset.search;renderRecipes();document.querySelector("#recettes").scrollIntoView({behavior:"smooth"});}));
grid.addEventListener("click", e => {
  const open = e.target.closest("[data-open]");
  const shopping = e.target.closest("[data-shopping]");
  if (open) openRecipe(open.dataset.open);
  if (shopping) openRecipe(shopping.dataset.shopping, true);
});
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", e => { if (e.target === dialog) dialog.close(); });

document.querySelector("#add-form").addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const title = String(form.get("title")).trim();
  const ingredients = String(form.get("ingredients")).split("\n").map(s=>s.trim()).filter(Boolean);
  const steps = String(form.get("steps")).split("\n").map(s=>s.trim()).filter(Boolean);
  if (!title || !ingredients.length || !steps.length) return;
  const added = {id:Date.now(),title,category:String(form.get("category")),time:Math.max(1,Number(form.get("time"))||30),emoji:"🍲",description:"Une recette ajoutée au grimoire.",ingredients,steps};
  const custom = [...recipes.filter(r => !starterRecipes.some(s=>s.id===r.id)), added];
  recipes = [...starterRecipes, ...custom];
  try { localStorage.setItem("grimoire-recipes", JSON.stringify(custom)); } catch {}
  e.currentTarget.reset();
  document.querySelector("#add-feedback").textContent = "Recette ajoutée ! Elle est enregistrée dans ce navigateur.";
  renderRecipes();
  renderShoppingList();
  showToast("La recette a rejoint le grimoire.");
  document.querySelector("#recettes").scrollIntoView({behavior:"smooth"});
});
renderRecipes();
renderShoppingList();

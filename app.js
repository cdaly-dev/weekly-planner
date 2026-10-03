// Weekly Meal Planner - app.js
// Persists recipes, calendar assignments, and shopping list check-offs in localStorage.

const RECIPES_KEY = 'weeklyPlanner.recipes';
const CALENDAR_KEY = 'weeklyPlanner.calendar';
const SHOPPING_KEY = 'weeklyPlanner.shoppingState';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SEED_RECIPES = [
  {
    id: 'seed-1',
    name: 'Spaghetti Bolognese',
    category: 'Pasta',
    ingredients: [
      { quantity: '500', unit: 'g', name: 'minced beef' },
      { quantity: '1', unit: '', name: 'onion, finely chopped' },
      { quantity: '2', unit: 'cloves', name: 'garlic, crushed' },
      { quantity: '400', unit: 'g', name: 'tin of chopped tomatoes' },
      { quantity: '2', unit: 'tbsp', name: 'tomato puree' },
      { quantity: '400', unit: 'g', name: 'spaghetti' },
      { quantity: '50', unit: 'g', name: 'Parmesan cheese, grated' },
      { quantity: '1', unit: 'tbsp', name: 'olive oil' }
    ],
    method: [
      'Heat the olive oil in a large saucepan over a medium heat.',
      'Add the onion and garlic and fry gently until softened.',
      'Add the minced beef and cook until browned all over.',
      'Stir in the chopped tomatoes and tomato puree, then season to taste.',
      'Simmer gently for 25 minutes, stirring occasionally.',
      'Meanwhile, cook the spaghetti in a large pan of salted boiling water until al dente.',
      'Drain the spaghetti and serve topped with the bolognese sauce and grated Parmesan.'
    ],
    notes: '',
    rating: 4
  },
  {
    id: 'seed-2',
    name: 'Chicken Tikka Curry',
    category: 'Meat',
    ingredients: [
      { quantity: '600', unit: 'g', name: 'chicken breast, diced' },
      { quantity: '2', unit: 'tbsp', name: 'tikka curry paste' },
      { quantity: '1', unit: '', name: 'onion, sliced' },
      { quantity: '400', unit: 'ml', name: 'tin of coconut milk' },
      { quantity: '200', unit: 'g', name: 'basmati rice' },
      { quantity: '1', unit: 'tbsp', name: 'vegetable oil' },
      { quantity: '1', unit: 'handful', name: 'fresh coriander, chopped' }
    ],
    method: [
      'Heat the oil in a large pan and fry the onion until softened.',
      'Add the curry paste and cook for one minute until fragrant.',
      'Add the diced chicken and stir until coated and lightly browned.',
      'Pour in the coconut milk and simmer for 20 minutes until the chicken is cooked through.',
      'Meanwhile, cook the basmati rice according to the packet instructions.',
      'Serve the curry over the rice, scattered with fresh coriander.'
    ],
    notes: '',
    rating: 5
  },
  {
    id: 'seed-3',
    name: 'Vegetable Stir Fry',
    category: 'Vegetarian',
    ingredients: [
      { quantity: '1', unit: '', name: 'red pepper, sliced' },
      { quantity: '1', unit: '', name: 'courgette, sliced' },
      { quantity: '150', unit: 'g', name: 'mangetout' },
      { quantity: '150', unit: 'g', name: 'beansprouts' },
      { quantity: '3', unit: 'tbsp', name: 'soy sauce' },
      { quantity: '1', unit: 'tbsp', name: 'sesame oil' },
      { quantity: '250', unit: 'g', name: 'egg noodles' },
      { quantity: '2', unit: 'cloves', name: 'garlic, crushed' }
    ],
    method: [
      'Cook the egg noodles according to the packet instructions, then drain and set aside.',
      'Heat the sesame oil in a wok or large frying pan over a high heat.',
      'Add the garlic, pepper and courgette and stir-fry for 3-4 minutes.',
      'Add the mangetout and beansprouts and stir-fry for a further 2 minutes.',
      'Stir in the cooked noodles and soy sauce, tossing well to combine.',
      'Serve immediately while hot.'
    ],
    notes: '',
    rating: 3
  },
  {
    id: 'seed-4',
    name: 'Baked Salmon with New Potatoes',
    category: 'Fish',
    ingredients: [
      { quantity: '4', unit: '', name: 'salmon fillets' },
      { quantity: '600', unit: 'g', name: 'new potatoes, halved' },
      { quantity: '200', unit: 'g', name: 'green beans' },
      { quantity: '1', unit: '', name: 'lemon, sliced' },
      { quantity: '2', unit: 'tbsp', name: 'olive oil' },
      { quantity: '1', unit: 'tsp', name: 'dried dill' }
    ],
    method: [
      'Preheat the oven to 200C (fan 180C).',
      'Boil the new potatoes in salted water for 15-18 minutes until tender, then drain.',
      'Place the salmon fillets on a baking tray, drizzle with olive oil and top with lemon slices and dill.',
      'Bake the salmon for 12-15 minutes until cooked through and flaking easily.',
      'Steam the green beans for 4-5 minutes until just tender.',
      'Serve the salmon with the new potatoes and green beans.'
    ],
    notes: '',
    rating: 4
  }
];

let recipes = [];
let calendar = {};
let shoppingState = {};
let currentWeekStart = getMonday(new Date());
let editingRecipeId = null;
let pendingDayKey = null;
let confirmCallback = null;

function loadRecipes() {
  const stored = localStorage.getItem(RECIPES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        recipes = parsed.map(normalizeRecipe).filter(Boolean);
        saveRecipes();
        return;
      }
    } catch (e) {
      recipes = [];
    }
  }

  recipes = SEED_RECIPES.map(normalizeRecipe);
  saveRecipes();
}

function saveRecipes() {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

function loadCalendar() {
  const stored = localStorage.getItem(CALENDAR_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      calendar = parsed && typeof parsed === 'object' ? parsed : {};
      return;
    } catch (e) {
      calendar = {};
    }
  }
  calendar = {};
}

function saveCalendar() {
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(calendar));
}

function loadShoppingState() {
  const stored = localStorage.getItem(SHOPPING_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      shoppingState = parsed && typeof parsed === 'object' ? parsed : {};
      return;
    } catch (e) {
      shoppingState = {};
    }
  }
  shoppingState = {};
}

function saveShoppingState() {
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(shoppingState));
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function weekRangeLabel() {
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return `${formatDisplayDate(currentWeekStart)} - ${formatDisplayDate(weekEnd)}`;
}

function currentWeekKey() {
  return formatDateKey(currentWeekStart);
}

function initTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(btn.dataset.tab);
      panel.classList.add('active');

      if (btn.dataset.tab === 'recipes') renderRecipeList();
      if (btn.dataset.tab === 'shopping') renderShoppingList();
      if (btn.dataset.tab === 'add-recipe' && !editingRecipeId) resetForm();
    });
  });
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  document.getElementById('weekLabel').textContent = weekRangeLabel();

  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    const key = formatDateKey(date);

    const card = document.createElement('div');
    card.className = 'day-card';

    const heading = document.createElement('h3');
    heading.textContent = DAY_NAMES[i];
    card.appendChild(heading);

    const dateLabel = document.createElement('div');
    dateLabel.className = 'day-date';
    dateLabel.textContent = formatDisplayDate(date);
    card.appendChild(dateLabel);

    const mealBox = document.createElement('div');
    mealBox.className = 'day-meal';

    const recipeId = calendar[key];
    const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;

    if (recipe) {
      const mealName = document.createElement('div');
      mealName.className = 'meal-name';
      mealName.textContent = recipe.name;
      mealName.addEventListener('click', () => openRecipeModal(recipe.id));
      mealBox.appendChild(mealName);
    } else {
      mealBox.textContent = 'No meal planned';
    }
    card.appendChild(mealBox);

    const chooseBtn = document.createElement('button');
    chooseBtn.className = 'btn btn-primary';
    chooseBtn.textContent = recipe ? 'Change meal' : 'Choose a recipe';
    chooseBtn.addEventListener('click', () => openDayPicker(key, DAY_NAMES[i]));
    card.appendChild(chooseBtn);

    if (recipe) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'btn btn-secondary';
      clearBtn.textContent = 'Clear';
      clearBtn.addEventListener('click', () => {
        delete calendar[key];
        saveCalendar();
        renderCalendar();
        renderShoppingList();
      });
      card.appendChild(clearBtn);
    }

    grid.appendChild(card);
  }

  renderShoppingList();
}

function updateWeekBy(days) {
  currentWeekStart.setDate(currentWeekStart.getDate() + days);
  renderCalendar();
}

function initWeekNav() {
  document.getElementById('prevWeek').addEventListener('click', () => updateWeekBy(-7));
  document.getElementById('nextWeek').addEventListener('click', () => updateWeekBy(7));
  document.getElementById('shoppingPrevWeek').addEventListener('click', () => updateWeekBy(-7));
  document.getElementById('shoppingNextWeek').addEventListener('click', () => updateWeekBy(7));
}

function openDayPicker(dayKey, dayName) {
  pendingDayKey = dayKey;
  document.getElementById('dayPickerTitle').textContent = `Choose a recipe for ${dayName}`;
  document.getElementById('dayPickerSearch').value = '';
  renderDayPickerList('');
  document.getElementById('dayPickerModal').classList.remove('hidden');
}

function renderDayPickerList(filterText) {
  const list = document.getElementById('dayPickerList');
  list.innerHTML = '';
  const filtered = filterRecipes(filterText, '');

  if (filtered.length === 0) {
    list.innerHTML = '<p class="no-results">No recipes found. Add one from the "Add a Recipe" tab.</p>';
    return;
  }

  filtered.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `<span class="category-tag">${escapeHtml(recipe.category)}</span><h3>${escapeHtml(recipe.name)}</h3>${renderRatingBadge(recipe.rating)}`;
    card.addEventListener('click', () => {
      calendar[pendingDayKey] = recipe.id;
      saveCalendar();
      document.getElementById('dayPickerModal').classList.add('hidden');
      renderCalendar();
    });
    list.appendChild(card);
  });
}

function initDayPicker() {
  document.getElementById('closeDayPicker').addEventListener('click', () => {
    document.getElementById('dayPickerModal').classList.add('hidden');
  });
  document.getElementById('dayPickerSearch').addEventListener('input', e => {
    renderDayPickerList(e.target.value);
  });
}

function filterRecipes(searchText, category) {
  const text = searchText.trim().toLowerCase();
  return recipes.filter(recipe => {
    const matchesCategory = !category || recipe.category === category;
    if (!matchesCategory) return false;
    if (!text) return true;
    const nameMatch = recipe.name.toLowerCase().includes(text);
    const ingredientMatch = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(text));
    return nameMatch || ingredientMatch;
  });
}

function populateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  const current = select.value;
  const categories = Array.from(new Set(recipes.map(r => r.category))).sort();
  select.innerHTML = '<option value="">All categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  select.value = current;
}

function renderRecipeList() {
  populateCategoryFilter();
  const searchText = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const list = document.getElementById('recipeList');
  list.innerHTML = '';

  const filtered = filterRecipes(searchText, category);

  if (filtered.length === 0) {
    list.innerHTML = '<p class="no-results">No recipes found.</p>';
    return;
  }

  filtered.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <span class="category-tag">${escapeHtml(recipe.category)}</span>
      <h3>${escapeHtml(recipe.name)}</h3>
      ${renderRatingBadge(recipe.rating)}
    `;
    card.addEventListener('click', () => openRecipeModal(recipe.id));
    list.appendChild(card);
  });
}

function initSearchAndFilter() {
  document.getElementById('searchInput').addEventListener('input', renderRecipeList);
  document.getElementById('categoryFilter').addEventListener('change', renderRecipeList);
}

function openRecipeModal(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  document.getElementById('modalTitle').textContent = recipe.name;
  document.getElementById('modalCategory').textContent = recipe.category;
  document.getElementById('modalRating').textContent = recipe.rating > 0 ? `Rating: ${stars(recipe.rating)} (${recipe.rating}/5)` : 'Rating: Not rated';
  document.getElementById('modalNotes').textContent = recipe.notes ? recipe.notes : 'No notes yet.';

  const ingredientsList = document.getElementById('modalIngredients');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(ing => {
    const li = document.createElement('li');
    li.textContent = ingredientDisplayText(ing);
    ingredientsList.appendChild(li);
  });

  const methodList = document.getElementById('modalMethod');
  methodList.innerHTML = '';
  recipe.method.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  document.getElementById('modalEdit').onclick = () => {
    document.getElementById('recipeModal').classList.add('hidden');
    editRecipe(recipe.id);
  };
  document.getElementById('modalDelete').onclick = () => {
    showConfirm(`Are you sure you want to delete "${recipe.name}"?`, () => {
      deleteRecipe(recipe.id);
      document.getElementById('recipeModal').classList.add('hidden');
    });
  };

  document.getElementById('recipeModal').classList.remove('hidden');
}

function initRecipeModal() {
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('recipeModal').classList.add('hidden');
  });
}

function showConfirm(message, onYes) {
  document.getElementById('confirmMessage').textContent = message;
  confirmCallback = onYes;
  document.getElementById('confirmModal').classList.remove('hidden');
}

function initConfirmModal() {
  document.getElementById('confirmYes').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.add('hidden');
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
  });
  document.getElementById('confirmNo').addEventListener('click', () => {
    document.getElementById('confirmModal').classList.add('hidden');
    confirmCallback = null;
  });
}

function addIngredientRow(quantity = '', unit = '', name = '') {
  const container = document.getElementById('ingredientRows');
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = `
    <input type="text" class="ing-quantity" placeholder="Quantity" value="${escapeHtml(quantity)}">
    <input type="text" class="ing-unit" placeholder="Unit (g, ml, tbsp...)" value="${escapeHtml(unit)}">
    <input type="text" class="ing-name" placeholder="Ingredient" value="${escapeHtml(name)}">
    <button type="button" class="btn btn-secondary remove-ingredient">Remove</button>
  `;
  row.querySelector('.remove-ingredient').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function resetForm() {
  editingRecipeId = null;
  document.getElementById('formTitle').textContent = 'Add a New Dinner Recipe';
  document.getElementById('recipeForm').reset();
  document.getElementById('recipeId').value = '';
  document.getElementById('recipeRating').value = '0';
  document.getElementById('recipeNotes').value = '';
  document.getElementById('formError').textContent = '';
  document.getElementById('ingredientRows').innerHTML = '';
  document.getElementById('cancelEdit').style.display = 'none';
  addIngredientRow();
}

function editRecipe(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  editingRecipeId = recipeId;
  document.getElementById('formTitle').textContent = 'Edit Recipe';
  document.getElementById('recipeId').value = recipe.id;
  document.getElementById('recipeName').value = recipe.name;
  document.getElementById('recipeCategory').value = recipe.category;
  document.getElementById('recipeMethod').value = recipe.method.join('\n');
  document.getElementById('recipeRating').value = String(recipe.rating || 0);
  document.getElementById('recipeNotes').value = recipe.notes || '';
  document.getElementById('formError').textContent = '';
  document.getElementById('cancelEdit').style.display = 'inline-block';

  document.getElementById('ingredientRows').innerHTML = '';
  recipe.ingredients.forEach(ing => addIngredientRow(ing.quantity, ing.unit, ing.name));

  document.querySelector('.tab-button[data-tab="add-recipe"]').click();
}

function deleteRecipe(recipeId) {
  recipes = recipes.filter(r => r.id !== recipeId);
  saveRecipes();

  Object.keys(calendar).forEach(key => {
    if (calendar[key] === recipeId) delete calendar[key];
  });
  saveCalendar();

  renderRecipeList();
  renderCalendar();
}

function initRecipeForm() {
  document.getElementById('addIngredientRow').addEventListener('click', () => addIngredientRow());
  document.getElementById('cancelEdit').addEventListener('click', resetForm);

  document.getElementById('recipeForm').addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('recipeName').value.trim();
    const category = document.getElementById('recipeCategory').value;
    const methodText = document.getElementById('recipeMethod').value.trim();
    const notes = document.getElementById('recipeNotes').value.trim();
    const rating = parseInt(document.getElementById('recipeRating').value, 10) || 0;
    const errorEl = document.getElementById('formError');

    if (!name) {
      errorEl.textContent = 'Please enter a recipe name.';
      return;
    }
    if (!category) {
      errorEl.textContent = 'Please select a category.';
      return;
    }
    if (!methodText) {
      errorEl.textContent = 'Please describe the method.';
      return;
    }

    const ingredientRows = document.querySelectorAll('#ingredientRows .ingredient-row');
    const ingredients = [];
    ingredientRows.forEach(row => {
      const quantity = row.querySelector('.ing-quantity').value.trim();
      const unit = row.querySelector('.ing-unit').value.trim();
      const ingName = row.querySelector('.ing-name').value.trim();
      if (ingName) ingredients.push({ quantity, unit, name: ingName });
    });

    if (ingredients.length === 0) {
      errorEl.textContent = 'Please add at least one ingredient.';
      return;
    }

    errorEl.textContent = '';
    const method = methodText.split('\n').map(s => s.trim()).filter(Boolean);

    if (editingRecipeId) {
      const recipe = recipes.find(r => r.id === editingRecipeId);
      recipe.name = name;
      recipe.category = category;
      recipe.ingredients = ingredients;
      recipe.method = method;
      recipe.notes = notes;
      recipe.rating = Math.max(0, Math.min(5, rating));
    } else {
      recipes.push(
        normalizeRecipe({
          id: 'r-' + Date.now(),
          name,
          category,
          ingredients,
          method,
          notes,
          rating
        })
      );
    }

    saveRecipes();
    resetForm();
    renderCalendar();
    document.querySelector('.tab-button[data-tab="recipes"]').click();
  });
}

function initImportExport() {
  const exportBtn = document.getElementById('exportRecipes');
  const importBtn = document.getElementById('importRecipes');
  const importInput = document.getElementById('importRecipesFile');

  exportBtn.addEventListener('click', () => {
    const payload = JSON.stringify(recipes, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weekly-recipes-${currentWeekKey()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => importInput.click());

  importInput.addEventListener('change', () => {
    const file = importInput.files && importInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = String(event.target.result || '');
        const parsed = JSON.parse(text);
        const source = Array.isArray(parsed) ? parsed : parsed.recipes;

        if (!Array.isArray(source)) {
          throw new Error('JSON must be an array of recipes or an object with a recipes array.');
        }

        const imported = source.map(normalizeRecipe).filter(Boolean);
        if (imported.length === 0) {
          throw new Error('No valid recipes were found in the selected file.');
        }

        const mergePlan = buildMergedRecipes(recipes, imported);
        if (mergePlan.addedCount === 0) {
          throw new Error('All imported recipes are already present. Nothing new to import.');
        }

        const skippedText = mergePlan.skippedCount > 0
          ? ` ${mergePlan.skippedCount} duplicate recipe(s) will be skipped.`
          : '';

        showConfirm(`Import ${mergePlan.addedCount} new recipe(s)? Existing recipes will be kept.${skippedText}`, () => {
          recipes = mergePlan.mergedRecipes;
          saveRecipes();
          renderRecipeList();
          renderCalendar();
        });
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };

    reader.readAsText(file);
    importInput.value = '';
  });
}

function removeInvalidCalendarAssignments() {
  const validRecipeIds = new Set(recipes.map(r => r.id));
  Object.keys(calendar).forEach(key => {
    if (!validRecipeIds.has(calendar[key])) delete calendar[key];
  });
  saveCalendar();
}

function buildMergedRecipes(existingRecipes, importedRecipes) {
  const mergedRecipes = existingRecipes.map(cloneRecipe);
  const existingIds = new Set(mergedRecipes.map(recipe => recipe.id));
  const existingSignatures = new Set(mergedRecipes.map(recipeSignature));
  let addedCount = 0;
  let skippedCount = 0;

  importedRecipes.forEach(recipe => {
    const candidate = cloneRecipe(recipe);
    const signature = recipeSignature(candidate);

    if (existingSignatures.has(signature)) {
      skippedCount += 1;
      return;
    }

    let id = candidate.id;
    if (!id || existingIds.has(id)) {
      id = generateUniqueRecipeId(existingIds);
    }

    candidate.id = id;
    mergedRecipes.push(candidate);
    existingIds.add(id);
    existingSignatures.add(signature);
    addedCount += 1;
  });

  return { mergedRecipes, addedCount, skippedCount };
}

function cloneRecipe(recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients.map(ing => ({
      quantity: ing.quantity,
      unit: ing.unit,
      name: ing.name
    })),
    method: recipe.method.slice(),
    notes: recipe.notes,
    rating: recipe.rating
  };
}

function recipeSignature(recipe) {
  const ingredientsSig = recipe.ingredients
    .map(ing => `${normalizeIngredientName(ing.name)}|${String(ing.quantity).trim().toLowerCase()}|${String(ing.unit).trim().toLowerCase()}`)
    .sort()
    .join('~');
  const methodSig = recipe.method.map(step => step.trim().toLowerCase()).join('|');
  const notesSig = String(recipe.notes || '').trim().toLowerCase();
  const ratingSig = String(clampRating(recipe.rating));

  return [
    recipe.name.trim().toLowerCase(),
    recipe.category.trim().toLowerCase(),
    ingredientsSig,
    methodSig,
    notesSig,
    ratingSig
  ].join('::');
}

function generateUniqueRecipeId(existingIds) {
  let id;
  do {
    id = `r-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  } while (existingIds.has(id));
  return id;
}

function getWeekMeals() {
  const meals = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    const recipeId = calendar[formatDateKey(date)];
    if (!recipeId) continue;
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) meals.push(recipe);
  }
  return meals;
}

function renderShoppingList() {
  document.getElementById('shoppingWeekLabel').textContent = `Shopping List: ${weekRangeLabel()}`;

  const listEl = document.getElementById('shoppingList');
  listEl.innerHTML = '';

  const aggregated = aggregateIngredients(getWeekMeals());
  if (aggregated.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'no-results';
    empty.textContent = 'No planned meals for this week yet.';
    listEl.appendChild(empty);
    return;
  }

  const weekKey = currentWeekKey();
  if (!shoppingState[weekKey]) shoppingState[weekKey] = {};

  aggregated.forEach(item => {
    const li = document.createElement('li');
    li.className = 'shopping-item';

    const isNotNeeded = !!shoppingState[weekKey][item.key];
    if (isNotNeeded) li.classList.add('not-needed');

    li.textContent = item.label;
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-pressed', isNotNeeded ? 'true' : 'false');

    const toggle = () => {
      shoppingState[weekKey][item.key] = !shoppingState[weekKey][item.key];
      if (!shoppingState[weekKey][item.key]) delete shoppingState[weekKey][item.key];
      saveShoppingState();
      renderShoppingList();
    };

    li.addEventListener('click', toggle);
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    listEl.appendChild(li);
  });
}

function aggregateIngredients(weekRecipes) {
  const map = new Map();

  weekRecipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const normalizedName = normalizeIngredientName(ingredient.name);
      const unit = String(ingredient.unit || '').trim();
      const qty = String(ingredient.quantity || '').trim();
      const key = `${normalizedName}|${unit.toLowerCase()}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: ingredient.name.trim(),
          unit,
          numericTotal: 0,
          hasNumeric: false,
          nonNumericParts: []
        });
      }

      const entry = map.get(key);
      const numeric = parseNumericQuantity(qty);

      if (numeric !== null) {
        entry.numericTotal += numeric;
        entry.hasNumeric = true;
      } else if (qty) {
        entry.nonNumericParts.push(qty);
      } else {
        entry.nonNumericParts.push('');
      }
    });
  });

  return Array.from(map.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'en-GB'))
    .map(entry => {
      const label = buildShoppingLabel(entry);
      return { key: entry.key, label };
    });
}

function parseNumericQuantity(quantity) {
  if (!quantity) return null;
  if (!/^\d+(\.\d+)?$/.test(quantity)) return null;
  const value = Number.parseFloat(quantity);
  return Number.isFinite(value) ? value : null;
}

function buildShoppingLabel(entry) {
  const unitPart = entry.unit ? `${entry.unit} ` : '';
  const extras = entry.nonNumericParts.filter(Boolean);

  if (entry.hasNumeric && extras.length === 0) {
    return `${formatQuantity(entry.numericTotal)} ${unitPart}${entry.name}`.replace(/\s+/g, ' ').trim();
  }

  if (entry.hasNumeric && extras.length > 0) {
    const extraLabel = extras.join(' + ');
    return `${formatQuantity(entry.numericTotal)} ${unitPart}${entry.name} (plus ${extraLabel})`.replace(/\s+/g, ' ').trim();
  }

  if (extras.length > 1) {
    return `${extras.join(' + ')} ${unitPart}${entry.name}`.replace(/\s+/g, ' ').trim();
  }

  if (extras.length === 1) {
    return `${extras[0]} ${unitPart}${entry.name}`.replace(/\s+/g, ' ').trim();
  }

  return `${unitPart}${entry.name}`.replace(/\s+/g, ' ').trim();
}

function formatQuantity(num) {
  const rounded = Math.round(num * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function normalizeIngredientName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeRecipe(recipe) {
  if (!recipe || typeof recipe !== 'object') return null;

  const safeName = String(recipe.name || '').trim();
  const safeCategory = String(recipe.category || '').trim();
  const safeIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
        .map(ing => ({
          quantity: String((ing && ing.quantity) || '').trim(),
          unit: String((ing && ing.unit) || '').trim(),
          name: String((ing && ing.name) || '').trim()
        }))
        .filter(ing => ing.name)
    : [];
  const safeMethod = Array.isArray(recipe.method)
    ? recipe.method.map(step => String(step || '').trim()).filter(Boolean)
    : String(recipe.method || '')
        .split('\n')
        .map(step => step.trim())
        .filter(Boolean);

  if (!safeName || !safeCategory || safeIngredients.length === 0 || safeMethod.length === 0) {
    return null;
  }

  return {
    id: String(recipe.id || `r-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: safeName,
    category: safeCategory,
    ingredients: safeIngredients,
    method: safeMethod,
    notes: String(recipe.notes || '').trim(),
    rating: clampRating(recipe.rating)
  };
}

function clampRating(value) {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(5, parsed));
}

function renderRatingBadge(rating) {
  if (!rating) return '<p class="modal-rating">Not rated</p>';
  return `<p class="modal-rating">${escapeHtml(stars(rating))} (${rating}/5)</p>`;
}

function stars(rating) {
  const safe = clampRating(rating);
  if (safe === 0) return 'No stars';
  return `${'★'.repeat(safe)}${'☆'.repeat(5 - safe)}`;
}

function ingredientDisplayText(ing) {
  return `${ing.quantity} ${ing.unit} ${ing.name}`.replace(/\s+/g, ' ').trim();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str || '');
  return div.innerHTML;
}

function init() {
  loadRecipes();
  loadCalendar();
  loadShoppingState();
  initTabs();
  initWeekNav();
  initDayPicker();
  initSearchAndFilter();
  initRecipeModal();
  initConfirmModal();
  initRecipeForm();
  initImportExport();
  resetForm();
  renderCalendar();
  renderRecipeList();
  renderShoppingList();
}

document.addEventListener('DOMContentLoaded', init);

import * as api from './api.js';
import { renderCategories } from './categories.js';

let currentEditingItemId = null;
let categoriesMap = {};
let currentCategoryFilter = 'all'; // 'all' | 'uncategorized' | categoryId

export function setCategoriesMap(categories) {
  categoriesMap = {};
  categories.forEach((cat) => {
    categoriesMap[cat._id] = cat;
  });
}

function getPriorityFires(priority) {
  const n = Math.min(5, Math.max(1, Number(priority) || 1));
  return '🔥'.repeat(n);
}

export function setCategoryFilter(filter) {
  currentCategoryFilter = filter;
}

export function getCategoryFilter() {
  return currentCategoryFilter;
}

export function updateSidebarCounts(allItems) {
  const allCount = allItems.length;
  const uncategorizedCount = allItems.filter((i) => !i.categoryId).length;

  const allBtn = document.querySelector('.sidebar-filter[data-filter="all"]');
  const uncatBtn = document.querySelector('.sidebar-filter[data-filter="uncategorized"]');
  const setCount = (btn, count) => {
    const countEl = btn?.querySelector('.sidebar-category-count');
    if (countEl) countEl.textContent = count;
  };
  setCount(allBtn, allCount);
  setCount(uncatBtn, uncategorizedCount);
}

function sortCategoriesByName(categories) {
  return [...categories].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  );
}

export function renderSidebarCategories(categories, allItems = []) {
  const list = document.getElementById('sidebarCategoriesList');
  if (!list) return;

  if (categories.length === 0) {
    list.innerHTML = '<span class="sidebar-empty">No categories yet</span>';
    return;
  }

  const sorted = sortCategoriesByName(categories);
  list.innerHTML = sorted
    .map((cat) => {
      const count = allItems.filter((i) => i.categoryId === cat._id).length;
      return `
        <button type="button" class="sidebar-category" data-filter="${cat._id}">
          <span class="sidebar-category-name">${cat.name}</span>
          <span class="sidebar-category-count">${count}</span>
        </button>
      `;
    })
    .join('');
}

function updateItemsSectionHeader(categories) {
  const titleEl = document.getElementById('itemsSectionTitle');
  const descEl = document.getElementById('itemsSectionDescription');
  if (!titleEl || !descEl) return;

  if (currentCategoryFilter === 'all') {
    titleEl.textContent = 'All Wishlist Items';
    descEl.textContent = '';
    descEl.style.display = 'none';
    descEl.setAttribute('aria-hidden', 'true');
  } else if (currentCategoryFilter === 'uncategorized') {
    titleEl.textContent = 'Uncategorized Wishlist Items';
    descEl.textContent = '';
    descEl.style.display = 'none';
    descEl.setAttribute('aria-hidden', 'true');
  } else {
    const category = categoriesMap[currentCategoryFilter] || categories.find((c) => c._id === currentCategoryFilter);
    const name = category?.name || 'Category';
    titleEl.textContent = `Wishlist: ${name}`;
    if (category?.description && category.description.trim()) {
      descEl.textContent = category.description.trim();
      descEl.style.display = 'block';
      descEl.setAttribute('aria-hidden', 'false');
    } else {
      descEl.textContent = '';
      descEl.style.display = 'none';
      descEl.setAttribute('aria-hidden', 'true');
    }
  }
}

export async function renderItems(items, categories) {
  setCategoriesMap(categories);
  updateItemsSectionHeader(categories);
  const container = document.getElementById('itemsContainer');
  const itemCount = document.getElementById('itemCount');

  itemCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No items found. Add your first wishlist item!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items
    .map((item) => {
      const categoryName = item.categoryId
        ? categoriesMap[item.categoryId]?.name || 'Unknown'
        : null;
      const linkDisplay = item.link
        ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="item-link-view">View↗</a>`
        : '';
      const priceDisplay = item.price != null && item.price !== ''
        ? `$${Number(item.price).toFixed(2)}`
        : '';
      const priorityFires = getPriorityFires(item.priority);
      const showArchive = item.status !== 'archived';

      return `
        <div class="item-card" data-item-id="${item._id}">
          <div class="item-card-top">
            <h3 class="item-title">${item.title}</h3>
            <span class="item-card-priority" aria-label="Priority ${item.priority}">${priorityFires}</span>
          </div>
          <div class="item-meta">
            <span class="status-badge status-${item.status}">${item.status}</span>
            ${categoryName ? `<span class="item-category-inline">${categoryName}</span>` : ''}
          </div>
          ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
          <div class="item-card-sep"></div>
          <div class="item-card-bottom">
            <div class="item-card-details">
              ${priceDisplay ? `<span class="item-price">${priceDisplay}</span>` : ''}
              ${linkDisplay ? `<span>${linkDisplay}</span>` : ''}
            </div>
            <div class="item-actions">
              <button type="button" class="button button-edit" onclick="window.itemsModule.editItem('${item._id}')" title="Edit">Edit</button>
              ${showArchive ? `<button type="button" class="button button-archive" onclick="window.itemsModule.archiveItem('${item._id}')" title="Archive">Archive</button>` : ''}
              <button type="button" class="button button-danger" onclick="window.itemsModule.deleteItem('${item._id}')" title="Delete">Delete</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function filterItemsByCategory(allItems) {
  if (currentCategoryFilter === 'all') return allItems;
  if (currentCategoryFilter === 'uncategorized') {
    return allItems.filter((item) => !item.categoryId);
  }
  return allItems.filter((item) => item.categoryId === currentCategoryFilter);
}

export async function loadItems() {
  try {
    const statusEl = document.getElementById('statusFilter');
    const sortByEl = document.getElementById('sortBy');
    const sortOrderEl = document.getElementById('sortOrder');
    const statusFilter = statusEl ? statusEl.value : '';
    const sortBy = sortByEl ? sortByEl.value : 'priority';
    const sortOrder = sortOrderEl ? sortOrderEl.value : 'desc';

    const [items, categories] = await Promise.all([
      api.fetchItems(statusFilter, sortBy, sortOrder),
      api.fetchCategories(),
    ]);

    const filtered = filterItemsByCategory(items);
    updateSidebarCounts(items);
    renderSidebarCategories(categories, items);
    updateSidebarActiveState();
    await renderItems(filtered, categories);
  } catch (error) {
    console.error('Error loading items:', error);
    alert('Failed to load items. Please try again.');
  }
}

function updateSidebarActiveState() {
  const filters = document.querySelectorAll('.sidebar-filter, .sidebar-category');
  filters.forEach((el) => {
    const filterVal = el.getAttribute('data-filter');
    el.classList.toggle('active', filterVal === currentCategoryFilter);
  });
}

export function openItemModal(itemId = null) {
  currentEditingItemId = itemId;
  const modal = document.getElementById('itemModal');
  const form = document.getElementById('itemForm');
  const title = document.getElementById('itemModalTitle');
  const submitBtn = document.getElementById('itemSubmitBtn');

  if (itemId) {
    title.textContent = 'Edit Item';
    submitBtn.textContent = 'Save Item';
    loadItemForEdit(itemId);
  } else {
    title.textContent = 'Add New Item';
    submitBtn.textContent = 'Add Item';
    form.reset();
    document.getElementById('itemPriority').value = '3';
    document.getElementById('itemStatus').value = 'considering';
  }

  populateCategorySelect();
  modal.classList.add('active');
}

export async function loadItemForEdit(itemId) {
  try {
    const item = await api.fetchItem(itemId);
    document.getElementById('itemTitle').value = item.title || '';
    document.getElementById('itemLink').value = item.link || '';
    document.getElementById('itemPrice').value = item.price || '';
    document.getElementById('itemPriority').value = item.priority || '3';
    document.getElementById('itemStatus').value = item.status || 'considering';
    document.getElementById('itemCategory').value = item.categoryId || '';
    document.getElementById('itemNotes').value = item.notes || '';
  } catch (error) {
    console.error('Error loading item:', error);
    alert('Failed to load item. Please try again.');
  }
}

export async function populateCategorySelect() {
  try {
    const categories = await api.fetchCategories();
    const select = document.getElementById('itemCategory');
    const currentValue = select.value;

    select.innerHTML = '<option value="">Uncategorized</option>';
    categories.forEach((category) => {
      const option = document.createElement('option');
      option.value = category._id;
      option.textContent = category.name;
      select.appendChild(option);
    });

    if (currentValue) {
      select.value = currentValue;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

export async function saveItem(event) {
  event.preventDefault();

  const formData = {
    title: document.getElementById('itemTitle').value.trim(),
    link: document.getElementById('itemLink').value.trim() || null,
    price: document.getElementById('itemPrice').value || null,
    priority: parseInt(document.getElementById('itemPriority').value),
    status: document.getElementById('itemStatus').value,
    categoryId: document.getElementById('itemCategory').value || null,
    notes: document.getElementById('itemNotes').value.trim() || null,
  };

  try {
    if (currentEditingItemId) {
      await api.updateItem(currentEditingItemId, formData);
    } else {
      await api.createItem(formData);
    }

    closeItemModal();
    await loadItems();
    await renderCategories();
  } catch (error) {
    console.error('Error saving item:', error);
    alert(error.message || 'Failed to save item. Please try again.');
  }
}

export function closeItemModal() {
  const modal = document.getElementById('itemModal');
  modal.classList.remove('active');
  currentEditingItemId = null;
  document.getElementById('itemForm').reset();
}

export async function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }

  try {
    await api.deleteItem(itemId);
    await loadItems();
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Failed to delete item. Please try again.');
  }
}

export function editItem(itemId) {
  openItemModal(itemId);
}

export async function archiveItem(itemId) {
  try {
    const item = await api.fetchItem(itemId);
    await api.updateItem(itemId, {
      title: item.title,
      link: item.link || null,
      price: item.price != null ? item.price : null,
      priority: item.priority,
      status: 'archived',
      categoryId: item.categoryId || null,
      notes: item.notes || null,
    });
    await loadItems();
  } catch (error) {
    console.error('Error archiving item:', error);
    alert('Failed to archive item. Please try again.');
  }
}

window.itemsModule = {
  editItem,
  deleteItem,
  archiveItem,
};

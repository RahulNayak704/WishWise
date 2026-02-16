import * as api from './api.js';
import { renderCategories } from './categories.js';

let currentEditingItemId = null;
let categoriesMap = {};

export function setCategoriesMap(categories) {
  categoriesMap = {};
  categories.forEach((cat) => {
    categoriesMap[cat._id] = cat;
  });
}

export async function renderItems(items, categories) {
  setCategoriesMap(categories);
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
      const priceDisplay = item.price ? `$${item.price.toFixed(2)}` : '';
      const linkDisplay = item.link
        ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">View Product</a>`
        : '';

      return `
        <div class="item-card" data-item-id="${item._id}">
          <div class="item-header">
            <div>
              <div class="item-title">
                ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>` : item.title}
              </div>
              ${categoryName ? `<span style="font-size: 0.85rem; color: #666;">Category: ${categoryName}</span>` : ''}
            </div>
            <div class="item-actions">
              <button type="button" class="button button-edit" onclick="window.itemsModule.editItem('${item._id}')">
                Edit
              </button>
              <button type="button" class="button button-danger" onclick="window.itemsModule.deleteItem('${item._id}')">
                Delete
              </button>
            </div>
          </div>
          <div class="item-meta">
            <span class="priority-badge priority-${item.priority}">
              Priority: ${item.priority}
            </span>
            <span class="status-badge status-${item.status}">
              ${item.status}
            </span>
            ${priceDisplay ? `<span><strong>Price:</strong> ${priceDisplay}</span>` : ''}
            ${linkDisplay ? `<span>${linkDisplay}</span>` : ''}
          </div>
          ${item.notes ? `<div class="item-notes"><strong>Notes:</strong> ${item.notes}</div>` : ''}
        </div>
      `;
    })
    .join('');
}

export async function loadItems() {
  try {
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const sortOrder = document.getElementById('sortOrder').value;

    const [items, categories] = await Promise.all([
      api.fetchItems(statusFilter, sortBy, sortOrder),
      api.fetchCategories(),
    ]);

    await renderItems(items, categories);
  } catch (error) {
    console.error('Error loading items:', error);
    alert('Failed to load items. Please try again.');
  }
}

export function openItemModal(itemId = null) {
  currentEditingItemId = itemId;
  const modal = document.getElementById('itemModal');
  const form = document.getElementById('itemForm');
  const title = document.getElementById('itemModalTitle');

  if (itemId) {
    title.textContent = 'Edit Wishlist Item';
    loadItemForEdit(itemId);
  } else {
    title.textContent = 'Add Wishlist Item';
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

window.itemsModule = {
  editItem,
  deleteItem,
};

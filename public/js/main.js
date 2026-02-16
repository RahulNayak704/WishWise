import { loadItems } from './items.js';
import { renderCategories } from './categories.js';
import {
  openItemModal,
  closeItemModal,
  saveItem,
  populateCategorySelect,
} from './items.js';
import {
  openCategoryModal,
  closeCategoryModal,
  saveCategory,
} from './categories.js';

document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  renderCategories();

  document.getElementById('addItemBtn').addEventListener('click', () => {
    openItemModal();
  });

  document.getElementById('itemForm').addEventListener('submit', saveItem);
  document.getElementById('closeItemModal').addEventListener('click', closeItemModal);
  document.getElementById('cancelItemBtn').addEventListener('click', closeItemModal);

  document.getElementById('addCategoryBtn').addEventListener('click', () => {
    openCategoryModal();
  });

  document.getElementById('categoryForm').addEventListener('submit', saveCategory);
  document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);

  document.getElementById('statusFilter').addEventListener('change', loadItems);
  document.getElementById('sortBy').addEventListener('change', loadItems);
  document.getElementById('sortOrder').addEventListener('change', loadItems);

  document.getElementById('itemModal').addEventListener('click', (e) => {
    if (e.target.id === 'itemModal') {
      closeItemModal();
    }
  });

  document.getElementById('categoryModal').addEventListener('click', (e) => {
    if (e.target.id === 'categoryModal') {
      closeCategoryModal();
    }
  });
});

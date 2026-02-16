import * as api from './api.js';
import { loadItems } from './items.js';

let currentEditingCategoryId = null;

export async function renderCategories() {
  try {
    const categories = await api.fetchCategories();
    const container = document.getElementById('categoriesContainer');

    if (categories.length === 0) {
      container.innerHTML = `
        <div class="empty-categories">
          <p>No categories yet. Create one to organize your items!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = categories
      .map((category) => {
        return `
          <div class="category-card" data-category-id="${category._id}">
            <div class="category-info">
              <div class="category-name">${category.name}</div>
              ${category.description ? `<div class="category-description">${category.description}</div>` : ''}
            </div>
            <div class="category-actions">
              <button type="button" class="button button-edit" onclick="window.categoriesModule.editCategory('${category._id}')">
                Edit
              </button>
              <button type="button" class="button button-danger" onclick="window.categoriesModule.deleteCategory('${category._id}')">
                Delete
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (error) {
    console.error('Error rendering categories:', error);
  }
}

export function openCategoryModal(categoryId = null) {
  currentEditingCategoryId = categoryId;
  const modal = document.getElementById('categoryModal');
  const form = document.getElementById('categoryForm');
  const title = document.getElementById('categoryModalTitle');

  if (categoryId) {
    title.textContent = 'Edit Category';
    loadCategoryForEdit(categoryId);
  } else {
    title.textContent = 'Add Category';
    form.reset();
  }

  modal.classList.add('active');
}

export async function loadCategoryForEdit(categoryId) {
  try {
    const category = await api.fetchCategory(categoryId);
    document.getElementById('categoryName').value = category.name || '';
    document.getElementById('categoryDescription').value = category.description || '';
  } catch (error) {
    console.error('Error loading category:', error);
    alert('Failed to load category. Please try again.');
  }
}

export async function saveCategory(event) {
  event.preventDefault();

  const formData = {
    name: document.getElementById('categoryName').value.trim(),
    description: document.getElementById('categoryDescription').value.trim() || null,
  };

  try {
    if (currentEditingCategoryId) {
      await api.updateCategory(currentEditingCategoryId, formData);
    } else {
      await api.createCategory(formData);
    }

    closeCategoryModal();
    await renderCategories();
    await loadItems();
  } catch (error) {
    console.error('Error saving category:', error);
    alert(error.message || 'Failed to save category. Please try again.');
  }
}

export function closeCategoryModal() {
  const modal = document.getElementById('categoryModal');
  modal.classList.remove('active');
  currentEditingCategoryId = null;
  document.getElementById('categoryForm').reset();
}

export async function deleteCategory(categoryId) {
  if (!confirm('Are you sure you want to delete this category? Items in this category will become uncategorized.')) {
    return;
  }

  try {
    await api.deleteCategory(categoryId);
    await renderCategories();
    await loadItems();
  } catch (error) {
    console.error('Error deleting category:', error);
    alert('Failed to delete category. Please try again.');
  }
}

export function editCategory(categoryId) {
  openCategoryModal(categoryId);
}

window.categoriesModule = {
  editCategory,
  deleteCategory,
};

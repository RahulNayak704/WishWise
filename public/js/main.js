import { loadItems } from './items.js';
import { renderCategories } from './categories.js';
import {
  openItemModal,
  closeItemModal,
  saveItem,
  setCategoryFilter,
} from './items.js';
import {
  openCategoryModal,
  closeCategoryModal,
  saveCategory,
} from './categories.js';

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-page') === pageId);
  });

  if (pageId === 'categories-page') {
    renderCategories();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadItems();

  document.getElementById('headerAddItemBtn').addEventListener('click', () => {
    openItemModal();
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) showPage(page === 'wishlist' ? 'wishlist-page' : 'categories-page');
    });
  });

  document.getElementById('itemForm').addEventListener('submit', saveItem);
  document.getElementById('closeItemModal').addEventListener('click', closeItemModal);
  document.getElementById('cancelItemBtn').addEventListener('click', closeItemModal);

  document.getElementById('sidebarAddCategoryBtn').addEventListener('click', () => {
    openCategoryModal();
  });

  document.getElementById('categoriesPageAddCategoryBtn').addEventListener('click', () => {
    openCategoryModal();
  });

  document.getElementById('categoryForm').addEventListener('submit', saveCategory);
  document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
  document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);

  const statusFilter = document.getElementById('statusFilter');
  const sortBy = document.getElementById('sortBy');
  const sortOrder = document.getElementById('sortOrder');
  if (statusFilter) statusFilter.addEventListener('change', loadItems);
  if (sortBy) sortBy.addEventListener('change', loadItems);
  if (sortOrder) sortOrder.addEventListener('change', loadItems);

  document.getElementById('itemModal').addEventListener('click', (e) => {
    if (e.target.id === 'itemModal') closeItemModal();
  });

  document.getElementById('categoryModal').addEventListener('click', (e) => {
    if (e.target.id === 'categoryModal') closeCategoryModal();
  });

  document.querySelectorAll('.sidebar-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setCategoryFilter(filter);
      loadItems();
    });
  });

  document.getElementById('sidebarCategoriesList').addEventListener('click', (e) => {
    const btn = e.target.closest('.sidebar-category');
    if (!btn) return;
    const filter = btn.getAttribute('data-filter');
    setCategoryFilter(filter);
    loadItems();
  });

  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });
    scrollToTopBtn.addEventListener('click', function () {
      window.scrollTo(0, 0);
    });
  }
});

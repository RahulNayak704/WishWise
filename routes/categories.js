import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('categories');

    const categories = await collection
      .find({})
      .sort({ name: 1 })
      .collation({ locale: 'en', strength: 2 })
      .toArray();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('categories');

    const category = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('categories');

    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const existing = await collection.findOne({
      name: name.trim(),
    });

    if (existing) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const newCategory = {
      name: name.trim(),
      description: description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newCategory);
    const insertedCategory = await collection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json(insertedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('categories');

    const { name, description } = req.body;

    const updateData = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Category name cannot be empty' });
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) updateData.description = description || null;

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const categoriesCollection = db.collection('categories');
    const itemsCollection = db.collection('items');

    const categoryId = req.params.id;

    const category = await categoriesCollection.findOne({
      _id: new ObjectId(categoryId),
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await categoriesCollection.deleteOne({
      _id: new ObjectId(categoryId),
    });

    await itemsCollection.updateMany(
      { categoryId: categoryId },
      { $set: { categoryId: null, updatedAt: new Date() } }
    );

    res.json({ message: 'Category deleted successfully. Items are now uncategorized.' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;

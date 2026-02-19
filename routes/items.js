import express from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../database/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('items');

    const { status, sortBy = 'priority', sortOrder = 'desc' } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    if (sortBy === 'priority') {
      sortOptions.priority = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'title') {
      sortOptions.title = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'desc' ? -1 : 1;
      sortOptions._id = 1;
    } else if (sortBy === 'date') {
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    const items = await collection.find(query).sort(sortOptions).toArray();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('items');

    const item = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('items');

    const { title, link, price, priority, status, categoryId, notes } =
      req.body;

    if (!title || !priority || !status) {
      return res
        .status(400)
        .json({ error: 'Title, priority, and status are required' });
    }

    if (priority < 1 || priority > 5) {
      return res
        .status(400)
        .json({ error: 'Priority must be between 1 and 5' });
    }

    const validStatuses = ['considering', 'want', 'bought', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const newItem = {
      title,
      link: link || null,
      price: price ? parseFloat(price) : null,
      priority: parseInt(priority),
      status,
      categoryId: categoryId || null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newItem);
    const insertedItem = await collection.findOne({ _id: result.insertedId });

    res.status(201).json(insertedItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('items');

    const { title, link, price, priority, status, categoryId, notes } =
      req.body;

    const updateData = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (link !== undefined) updateData.link = link || null;
    if (price !== undefined)
      updateData.price = price ? parseFloat(price) : null;
    if (priority !== undefined) {
      if (priority < 1 || priority > 5) {
        return res
          .status(400)
          .json({ error: 'Priority must be between 1 and 5' });
      }
      updateData.priority = parseInt(priority);
    }
    if (status !== undefined) {
      const validStatuses = ['considering', 'want', 'bought', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = status;
    }
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (notes !== undefined) updateData.notes = notes || null;

    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedItem = await collection.findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const collection = db.collection('items');

    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;

// pages/api/notifications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db('myAppDB');
  const notifications = db.collection('notifications');

  if (req.method === 'POST') {
    const { type, userId, blockId } = req.body;

    if (!type || !userId) {
      return res.status(400).json({ error: 'Missing type or userId' });
    }

    const notification = {
      type,               // "register", "login", or "reminder"
      userId,             // the user who triggered it
      createdAt: new Date(),
      ...(type === 'reminder' && { blockId }), // only add blockId if type is "reminder"
    };

    const result = await notifications.insertOne(notification);
    return res.status(201).json({ success: true, id: result.insertedId });
  }

  if (req.method === 'GET') {
    const allNotifications = await notifications.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(allNotifications);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

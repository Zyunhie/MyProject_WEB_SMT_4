// src/app/events/[id]/page.tsx

import EventPage from '../../components/EventPage';
import dbConnect from '../../../utils/db';
import Event from '../../../models/event';
import { notFound } from 'next/navigation';

interface EventDetailPageProps {
  params: { id: string };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  await dbConnect();                      // koneksi MongoDB

  const event = await Event.findById(params.id).lean();
  if (!event) notFound();                 // 404 kalau tak ketemu

  return <EventPage event={JSON.parse(JSON.stringify(event))} />;
}

import React from "react";

interface Event {
  id: number;
  title: string;
  date: string;
}

interface EventListProps {
  events: Event[];
  onDelete: (id: number) => void;
  onEdit: (event: Event) => void;
  editingEventId: number | null;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onDelete,
  onEdit,
  editingEventId,
}) => {
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".");
    return `${day}.${month}.${year}`;
  };

  if (events.length === 0) {
    return <p className="no-events">Нет мероприятий</p>;
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <div
          key={event.id}
          className={`event-item ${editingEventId === event.id ? "editing" : ""}`}
        >
          <div className="event-info">
            <div className="event-title">{event.title}</div>
            <div className="event-date">{formatDate(event.date)}</div>
          </div>
          <div className="event-actions">
            <button onClick={() => onEdit(event)}>Редактировать</button>
            <button onClick={() => onDelete(event.id)}>Удалить</button>
          </div>
        </div>
      ))}
    </div>
  );
};

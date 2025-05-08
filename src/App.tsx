import React, { useState, useEffect } from "react";
import { EventForm } from "./components/EventForm";
import { EventList } from "./components/EventList";
import "./styles.css";

interface Event {
  id: number;
  title: string;
  date: string;
}

function App() {
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleAddEvent = (event: Omit<Event, "id">) => {
    if (editingEvent) {
      setEvents(
        events.map((e) =>
          e.id === editingEvent.id ? { ...event, id: editingEvent.id } : e
        )
      );
      setEditingEvent(null);
    } else {
      setEvents([...events, { ...event, id: Date.now() }]);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id));
    if (editingEvent?.id === id) {
      setEditingEvent(null);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Список мероприятий</h1>
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title={theme === "light" ? "Включить темную тему" : "Включить светлую тему"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
      <EventForm
        onSubmit={handleAddEvent}
        initialData={editingEvent || undefined}
        onCancel={() => setEditingEvent(null)}
        events={events}
        onEdit={handleEditEvent}
      />
      <EventList
        events={events}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        editingEventId={editingEvent?.id || null}
      />
    </div>
  );
}

export default App;

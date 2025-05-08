import React, { useState, useEffect, useRef } from "react";

interface Event {
  id: number;
  title: string;
  date: string;
}

interface EventFormProps {
  onSubmit: (event: Omit<Event, "id">) => void;
  initialData?: Event;
  onCancel?: () => void;
  events: Event[];
  onEdit: (event: Event) => void;
}

const DatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value.split(".").reverse().join("-")) : null
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setShowCalendar(false);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Добавляем пустые ячейки для выравнивания
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      days.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? "selected" : ""} ${
            isToday ? "today" : ""
          } ${isPast ? "past" : ""}`}
          onClick={() => !isPast && handleDateSelect(date)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="date-picker" ref={calendarRef}>
      <div className="date-input-container">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="дд.мм.гггг"
          maxLength={10}
        />
        <button
          type="button"
          className="calendar-button"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          📅
        </button>
      </div>
      {error && <span className="error">{error}</span>}
      {showCalendar && (
        <div className="calendar">
          <div className="calendar-header">
            <button type="button" onClick={handlePrevMonth}>
              ←
            </button>
            <span>
              {currentDate.toLocaleString("ru", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button type="button" onClick={handleNextMonth}>
              →
            </button>
          </div>
          <div className="calendar-weekdays">
            <div>Пн</div>
            <div>Вт</div>
            <div>Ср</div>
            <div>Чт</div>
            <div>Пт</div>
            <div>Сб</div>
            <div>Вс</div>
          </div>
          <div className="calendar-days">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
};

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  events,
  onEdit,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [date, setDate] = useState(initialData?.date || "");
  const [errors, setErrors] = useState<{ title?: string; date?: string; edit?: string }>(
    {}
  );
  const [showEventList, setShowEventList] = useState(false);
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
    } else {
      setTitle("");
      setDate("");
    }
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editContainerRef.current &&
        !editContainerRef.current.contains(event.target as Node)
      ) {
        setShowEventList(false);
      }
    };

    if (showEventList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEventList]);

  const validateDate = (dateStr: string): boolean => {
    // Проверяем формат даты (дд.мм.гггг)
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!dateRegex.test(dateStr)) {
      setErrors((prev) => ({ ...prev, date: "Дата должна быть в формате дд.мм.гггг" }));
      return false;
    }

    const [, day, month, year] = dateStr.match(dateRegex) || [];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Проверяем валидность даты
    if (
      date.getDate() !== parseInt(day) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getFullYear() !== parseInt(year)
    ) {
      setErrors((prev) => ({ ...prev, date: "Введена некорректная дата" }));
      return false;
    }

    // Проверяем, что год не меньше текущего
    const currentYear = new Date().getFullYear();
    if (parseInt(year) < currentYear) {
      setErrors((prev) => ({ ...prev, date: `Год не может быть меньше ${currentYear}` }));
      return false;
    }

    return true;
  };

  const validateForm = () => {
    const newErrors: { title?: string; date?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Название обязательно";
    }

    if (!date) {
      newErrors.date = "Дата обязательна";
    } else if (!validateDate(date)) {
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({ title, date });
      if (!initialData) {
        setTitle("");
        setDate("");
      }
    }
  };

  const handleEditClick = () => {
    if (events.length === 0) {
      setErrors({ ...errors, edit: "Нет доступных мероприятий для редактирования" });
    } else {
      setShowEventList(!showEventList);
    }
  };

  const handleDateChange = (value: string) => {
    // Удаляем все нецифровые символы
    const numbersOnly = value.replace(/\D/g, "");

    // Форматируем дату в формат дд.мм.гггг
    let formattedDate = "";
    if (numbersOnly.length > 0) {
      if (numbersOnly.length <= 2) {
        formattedDate = numbersOnly;
      } else if (numbersOnly.length <= 4) {
        formattedDate = `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(2)}`;
      } else {
        formattedDate = `${numbersOnly.slice(0, 2)}.${numbersOnly.slice(
          2,
          4
        )}.${numbersOnly.slice(4, 8)}`;
      }
    }

    setDate(formattedDate);
    // Очищаем ошибку даты при вводе
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`event-form ${initialData ? "editing" : ""}`}
    >
      <div>
        <label htmlFor="title">Название:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div>
        <label htmlFor="date">Дата:</label>
        <DatePicker value={date} onChange={handleDateChange} error={errors.date} />
      </div>

      <div className="button-group">
        <button type="submit">{initialData ? "Сохранить" : "Добавить"}</button>
        {initialData && onCancel && (
          <button type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
        {!initialData && (
          <div className="edit-button-container" ref={editContainerRef}>
            <button
              type="button"
              onClick={handleEditClick}
              className={events.length === 0 ? "disabled" : ""}
            >
              Редактировать
            </button>
            {showEventList && events.length > 0 && (
              <div className="event-list-popup">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="event-list-item"
                    onClick={() => {
                      onEdit(event);
                      setShowEventList(false);
                    }}
                  >
                    <span>{event.title}</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
            {errors.edit && <span className="error popup-error">{errors.edit}</span>}
          </div>
        )}
      </div>
    </form>
  );
};

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const myEventsList = [
    {
      title: 'Volunteer Reading Session',
      start: new Date(new Date().setHours(10, 0, 0, 0)),
      end: new Date(new Date().setHours(12, 0, 0, 0)),
    },
    {
        title: 'Elderly Check-out (Arthur)',
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2)),
    }
];

const CalendarWidget = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6 w-full overflow-hidden">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Master Schedule</h2>
            <div className="overflow-x-auto">
                <div style={{ height: '450px', minWidth: '700px' }}>
                    <Calendar
                        localizer={localizer}
                        events={myEventsList}
                        startAccessor="start"
                        endAccessor="end"
                        views={['month', 'agenda']}
                        defaultView='month'
                        className="rounded-xl"
                    />
                </div>
            </div>
        </div>
    );
}

export default CalendarWidget;

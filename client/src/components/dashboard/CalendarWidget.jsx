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
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs w-full overflow-hidden">
            <h2 className="text-base font-bold text-[#0F172A] mb-4">Master Schedule</h2>
            <div className="overflow-x-auto">
                <div style={{ height: '380px', minWidth: '650px' }}>
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

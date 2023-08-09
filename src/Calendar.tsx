import { useState, useEffect } from 'react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';

export interface CalendarEvent {
    creator: string;
    start: Date;
    end: Date;
}

interface CalendarProps {
    events: CalendarEvent[];
}

export default function Calendar({ events }: CalendarProps) {
    const [fullCalEvents, setfullCalEvents] = useState<any[]>([]);

    useEffect(() => {
        var newFullCalEvents: any[] = [];
        events.forEach((e: CalendarEvent) => {
            newFullCalEvents.push({
                title: e.creator,
                color: stringToColor(e.creator),
                textColor: tectColorforColor(stringToColor(e.creator)),
                allDay: true,
                start: new Date(e.start),
                end: new Date(e.end)
            });
        });
        setfullCalEvents(newFullCalEvents);
      }, [events]);

    function stringToColor(str: string): (string) {
        var hash = 0;
        str.split('').forEach(char => {
            hash = char.charCodeAt(0) + ((hash << 5) - hash)
        })
        let color = '#'
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff
            color += value.toString(16).padStart(2, '0')
        }
        return color
    }

    function tectColorforColor(bgColor: string): string {
        var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
        var r = parseInt(color.substring(0, 2), 16); // hexToR
        var g = parseInt(color.substring(2, 4), 16); // hexToG
        var b = parseInt(color.substring(4, 6), 16); // hexToB
        return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
            "#000" : "#fff";
    }

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin]}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
            }}
            initialView='dayGridMonth'
            themeSystem='bootstrap5'
            dayMaxEvents={true}
            events={fullCalEvents}
        />
    );
}

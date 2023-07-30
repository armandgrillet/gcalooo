import React, { useState, ChangeEvent } from 'react';
import './App.css';
import { useGoogleLogin } from '@react-oauth/google';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { calendar_v3 } from 'googleapis';

import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  const emailsRegex = /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4},?)+$/;
  var accessToken = "";

  const parseTextarea = (textarea: ChangeEvent<HTMLTextAreaElement>) => {
    if (emailsRegex.test(textarea.target.value)) {
      document.getElementById('apply')!.className = 'btn btn-primary';
    } else {
      document.getElementById('apply')!.className = 'btn btn-primary disabled';
    }
  }

  const LoginButton: React.FC = () => {
    const signIn = useGoogleLogin({
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      onSuccess: async (resp) => {
        setIsLoggedIn(true);
        accessToken = resp.access_token;
        fetchAndApplyCalendars();
      },
      onError: (error) => {
        console.error('Login failed:', error);
        // Handle error, such as displaying an error message
      },
    });

    return (
      <button onClick={() => signIn()}>
        Login with Google
      </button>
    );
  };

  const fetchAndApplyCalendars = async () => {
    const date = new Date();

    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
      {
        params: {
          'eventTypes': ['outOfOffice'],
          'timeMin': date.toISOString(),
          'timeMax': new Date(date.setMonth(date.getMonth() + 1)).toISOString(),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const events = response.data.items;
    var newCalendarEvents: any[] = [];
    events.forEach((e: calendar_v3.Schema$Event) => {
      console.log(e);
      if (e.eventType! === "outOfOffice" && e.start != null) {
        const realDate = new Date(e.start?.dateTime!);
        console.log(realDate.toISOString().split('T')[0])
        newCalendarEvents.push({
          title: e.creator?.email!,
          allDay: true,
          start: realDate,
        });
      }
    });
    console.log(newCalendarEvents);
    setCalendarEvents(newCalendarEvents);
  }

  const applyEmails = () => {

  }

  return (
    <div className="App">
      <div className="container px-4 py-5">
        <h2 className="pb-2 border-bottom">Columns with icons</h2>
        {!isLoggedIn ? (
          <LoginButton />
        ) : (
          <>
            <div className="input-group">
              <span className="input-group-text">List of emails</span>
              <textarea className="form-control" aria-label="With textarea" placeholder='alice@example.com, bob@example.com' onChange={parseTextarea}></textarea>
              <button className="btn btn-primary" type="button" id="apply" onClick={applyEmails}>Apply</button>
            </div>
            <br></br>
            <div className='demo-app-main'>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, bootstrap5Plugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                }}
                initialView='dayGridMonth'
                themeSystem='bootstrap5'
                dayMaxEvents={true}
                events={calendarEvents}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

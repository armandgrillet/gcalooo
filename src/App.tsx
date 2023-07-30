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

        const date = new Date();

        const response = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
          {
            params: {
              'eventType': 'outOfOffice',
              'timeMin': date.toISOString(),
              'timeMax': new Date(date.setMonth(date.getMonth() + 1)).toISOString(),
            },
            headers: {
              Authorization: `Bearer ${resp.access_token}`,
            },
          }
        );

        const events = response.data.items;
        console.log(events)
        events.forEach((e: calendar_v3.Schema$Event) => {
          console.log(e);
          if (e.start != null) {
            const realDate = new Date(e.start?.dateTime!);
            console.log(realDate.toISOString().split('T')[0])
            setCalendarEvents([{
              title: e.summary,
              start: realDate.toISOString().split('T')[0],
            }]);
          }

        });
        // Fetch calendar events from the Google Calendar API using the credentialResponse
        // and set them to the calendarEvents state.
        // You will need to implement the logic to fetch events from the API here.
        // For simplicity, I'm setting an empty array for now.
        // setCalendarEvents([
        //   {
        //     title: 'All Day Event',
        //     start: '2023-08-01',
        //   }
        // ]);
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

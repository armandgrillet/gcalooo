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

  const timerangeEnv = process.env.REACT_APP_TIMERANGE_MONTHS ?? "3";
  const timerange = parseInt(timerangeEnv);
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + timerange);

  const queryParameters = new URLSearchParams(window.location.search)
  var emails = queryParameters.get("emails") ?? "";
  console.log(emails)
  const emailsRegex = /^([\w+-.%]+@[\w-.]+\.[A-Za-z]{2,4}?)+$/;

  var accessToken = "";

  const parseTextarea = (textarea: ChangeEvent<HTMLTextAreaElement>) => {
    if (emailsRegex.test(textarea.target.value)) {
      emails = textarea.target.value;
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
      <div className="text-center">
        <button className="btn btn-primary" onClick={() => signIn()}>
          Login with Google
        </button>
      </div>
    );
  };

  const fetchAndApplyCalendars = async () => {
    var calendars: string[] = [];
    if (emails === "") {
      calendars = ["primary"]
    } else {
      calendars = emails.split(",");
      calendars.push("primary");
    }

    console.log(calendars)
    var newCalendarEvents: any[] = [];

    for await (const calendar of calendars) {
      console.log(calendar)
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${calendar}/events`,
        {
          params: {
            'eventTypes': ['outOfOffice'],
            'timeMin': now.toISOString(),
            'timeMax': future.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ).catch(function (error) {
        console.log(error.toJSON());
      });;

      if (typeof response !== 'undefined') {
        const events = response!.data.items;
        events.forEach((e: calendar_v3.Schema$Event) => {
          if (e.eventType! === "outOfOffice" && e.start != null) {
            console.log(e)
            newCalendarEvents.push({
              title: e.creator?.email!,
              allDay: true,
              start: new Date(e.start?.dateTime!),
              end: new Date(e.end?.dateTime!)
            });
          }
      });
    }
    }
    setCalendarEvents(newCalendarEvents);
    queryParameters.set("emails", emails);
  }

  return (
    <div className="App">
      <div className="container px-4 py-5">
        <h2 className="pb-2 border-bottom">{process.env.REACT_APP_TITLE}</h2>
        {!isLoggedIn ? (
          <LoginButton />
        ) : (
          <>
            <div className="input-group">
              <span className="input-group-text">List of emails</span>
              <textarea className="form-control" id="emails" aria-label="With textarea" placeholder='alice@example.com, bob@example.com' onChange={parseTextarea}></textarea>
              <button className="btn btn-primary" type="button" id="apply" onClick={fetchAndApplyCalendars}>Apply</button>
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

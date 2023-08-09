import React, { useState } from 'react';

import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { calendar_v3 } from 'googleapis';

import Emails from './Emails';
import Calendar, { CalendarEvent } from './Calendar';

export default function App() {
    const queryParameters = new URLSearchParams(window.location.search);
    const emails = queryParameters.get("emails") ?? "";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    var accessToken = "";

    async function fetchEmails(newEmails: string) {
        var calendars: string[] = [];

        if (newEmails === "") {
            calendars = ["primary"];
        } else {
            calendars = newEmails.split(",");
        }

        var uniqueCalendars = calendars.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        const timerangeEnv = process.env.REACT_APP_TIMERANGE_MONTHS ?? "3";
        const timerange = parseInt(timerangeEnv);
        const now = new Date();
        const future = new Date();
        future.setMonth(future.getMonth() + timerange);

        var newCalendarEvents: CalendarEvent[] = [];
        for await (const calendar of uniqueCalendars) {
            if (calendar === "primary" || calendar.includes(process.env.REACT_APP_EMAIL_DOMAIN ?? "")) {
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
                });

                if (typeof response !== 'undefined') {
                    const events = response!.data.items;
                    events.forEach((e: calendar_v3.Schema$Event) => {
                        if (e.eventType! === "outOfOffice" && e.start != null) {
                            newCalendarEvents.push({
                                creator: e.creator?.email || '',
                                start: new Date(e.start!.dateTime!),
                                end: new Date(e.end!.dateTime!),
                            });
                        }
                    });
                }
            }
        }
        setEvents(newCalendarEvents);
    }

    const LoginButton: React.FC = () => {
        const signIn = useGoogleLogin({
            scope: 'https://www.googleapis.com/auth/calendar.readonly',
            onSuccess: async (resp) => {
                setIsLoggedIn(true);
                accessToken = resp.access_token;
                fetchEmails(emails);
            },
            onError: (error) => {
                console.error('Login failed:', error);
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

    return (
        <div className="App">
            <div className="container px-4 py-5">
                <h2 className="pb-2 border-bottom">{process.env.REACT_APP_TITLE}</h2>
                {!isLoggedIn ? (
                    <LoginButton />
                ) : (
                    <>
                        <Emails initialList={emails} updateParent={fetchEmails} />
                        <br></br>
                        <Calendar events={events} />
                    </>
                )}
            </div>
        </div>
    );
}

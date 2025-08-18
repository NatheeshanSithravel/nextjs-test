"use client";

import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


const EventCalendar: React.FC = () => {



    let eventData = [
        {
            title:"asd",
            start:"2025-01-29",
            end:"2025-01-29",
            id:"123213"
        }
    ]


    let events = [
        {
            title: "BA Test ss ",
            start: "2025-01-29",
            id: "2025-01-29 12:00:00-BA Test "
        },
        {
            title: "Test 12443",
            start: "2025-01-30",
            id: "2025-01-30 12:00:00-Test 12443"
        }
    ]

  return (
    <div>
      <div className="flex w-full px-10 justify-start items-start gap-8">
        
        <div className="w-9/12 mt-8">
          <FullCalendar
            height={"85vh"}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Initialize calendar with required plugins.
            initialView="dayGridMonth" // Initial view mode of the calendar.
            editable={false} // Allow events to be edited.
            selectable={false} // Allow dates to be selectable.
            selectMirror={false} // Mirror selections visually.
            dayMaxEvents={false} // Limit the number of events displayed per day.
            initialEvents={events} // Initial events loaded from local storage.
          />
        </div>
      </div>
    </div>
  );
};

export default EventCalendar; // Export the Calendar component for use in other parts of the application.
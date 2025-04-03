"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid/index.js";
import timeGridPlugin from "@fullcalendar/timegrid/index.js";
import interactionPlugin from "@fullcalendar/interaction/index.js";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core/index.js";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { useAlert } from "@/context/AlertContext";
import axiosInstance from "@/lib/axiosInstance";

const Calendar = () => {
  const { showAlert, alertTypes } = useAlert();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [eventDetails, setEventDetails] = useState({});
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const { isOpen, openModal, closeModal } = useModal();
  
  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  // Helper function to determine event level based on assignment status
  const getEventLevel = (assignment) => {
    if (assignment.submitted) {
      return assignment.grade !== null ? "Success" : "Primary"; // Submitted and graded vs submitted but not graded
    } else {
      // For upcoming deadlines, use Warning for those due within 2 days, Danger for past due
      const now = new Date();
      const deadline = new Date(assignment.deadline);
      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(now.getDate() + 2);

      if (deadline < now) {
        return "Danger"; // Past due
      } else if (deadline <= twoDaysFromNow) {
        return "Warning"; // Due soon
      } else {
        return "Primary"; // Due later
      }
    }
  };

  useEffect(() => {
    // Initialize with assignments from API
    const getDeadlines = async () => {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const response = await axiosInstance.get(
          `${BACKEND_URL}/assignments/user/deadlines`
        );
        
        if (response.data && response.data.assignments) {
          const assignmentEvents = response.data.assignments.map(assignment => {
            const eventLevel = getEventLevel(assignment);
            
            // Create an event object based on the assignment
            return {
              id: assignment._id,
              title: assignment.title,
              start: new Date(assignment.deadline).toISOString().split("T")[0],
              extendedProps: { 
                calendar: eventLevel,
                moduleName: assignment.moduleName,
                submitted: assignment.submitted,
                submissionDate: assignment.submissionDate,
                grade: assignment.grade,
                isAssignment: true // Flag to identify assignment events
              },
            };
          });
          
          setEvents(assignmentEvents);
          showAlert('Deadlines loaded successfully', alertTypes.SUCCESS);
        }
      } catch (error) {
        console.error('Error fetching deadlines', error);
        showAlert(
          error.response?.data?.message || 'Failed to get deadlines',
          alertTypes.ERROR
        );
        
        // Load sample events if API fails
        setEvents([
          {
            id: "1",
            title: "Event Conf.",
            start: new Date().toISOString().split("T")[0],
            extendedProps: { calendar: "Danger" },
          },
          {
            id: "2",
            title: "Meeting",
            start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            extendedProps: { calendar: "Success" },
          },
          {
            id: "3",
            title: "Workshop",
            start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
            end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
            extendedProps: { calendar: "Primary" },
          },
        ]);
      }
    };

    getDeadlines();
  }, []);

  const handleDateSelect = (selectInfo) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar);
    
    // Store additional details for assignments
    if (event.extendedProps.isAssignment) {
      setEventDetails({
        moduleName: event.extendedProps.moduleName,
        submitted: event.extendedProps.submitted,
        submissionDate: event.extendedProps.submissionDate,
        grade: event.extendedProps.grade,
        isAssignment: true
      });
    } else {
      setEventDetails({});
    }
    
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (selectedEvent) {
      // Update existing event
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { 
                  ...event.extendedProps,
                  calendar: eventLevel 
                },
              }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
    setEventDetails({});
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: openModal,
            },
          }}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? (eventDetails.isAssignment ? "Assignment Details" : "Edit Event") : "Add Event"}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {eventDetails.isAssignment 
                ? `This assignment is for ${eventDetails.moduleName}`
                : "Plan your next big moment: schedule or edit an event to stay on track"}
            </p>
          </div>
          <div className="mt-8">
            <div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  {eventDetails.isAssignment ? "Assignment Title" : "Event Title"}
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  readOnly={eventDetails.isAssignment}
                />
              </div>
            </div>
            
            {eventDetails.isAssignment && (
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Status
                </label>
                <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Submitted:</span>
                    <span className={`text-sm font-medium ${eventDetails.submitted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {eventDetails.submitted ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  {eventDetails.submitted && (
                    <>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Submission Date:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {new Date(eventDetails.submissionDate).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Grade:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {eventDetails.grade !== null ? `${eventDetails.grade}` : 'Not graded yet'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {!eventDetails.isAssignment && (
              <div className="mt-6">
                <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Event Color
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                  {Object.entries(calendarsEvents).map(([key, value]) => (
                    <div key={key} className="n-chk">
                      <div
                        className={`form-check form-check-${value} form-check-inline`}
                      >
                        <label
                          className="flex items-center text-sm text-gray-700 form-check-label dark:text-gray-400"
                          htmlFor={`modal${key}`}
                        >
                          <span className="relative">
                            <input
                              className="sr-only form-check-input"
                              type="radio"
                              name="event-level"
                              value={key}
                              id={`modal${key}`}
                              checked={eventLevel === key}
                              onChange={() => setEventLevel(key)}
                            />
                            <span className="flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full box dark:border-gray-700">
                              <span
                                className={`h-2 w-2 rounded-full bg-white ${
                                  eventLevel === key ? "block" : "hidden"
                                }`}  
                              ></span>
                            </span>
                          </span>
                          {key}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {eventDetails.isAssignment ? "Deadline Date" : "Start Date"}
              </label>
              <div className="relative">
                <input
                  id="event-start-date"
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  readOnly={eventDetails.isAssignment}
                />
              </div>
            </div>

            {!eventDetails.isAssignment && (
              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  End Date
                </label>
                <div className="relative">
                  <input
                    id="event-end-date"
                    type="date"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Close
            </button>
            {!eventDetails.isAssignment && (
              <button
                onClick={handleAddOrUpdateEvent}
                type="button"
                className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
              >
                {selectedEvent ? "Update Changes" : "Add Event"}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  const isAssignment = eventInfo.event.extendedProps.isAssignment;
  
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm ${isAssignment ? 'font-medium' : ''}`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;